import { UIInput } from '@app/components/shared/UIInput'
import { UITextarea } from '@app/components/shared/UITextarea'
import { BasicEditor } from '@app/components/tiptap/basic/BasicEditor'
import { defaultFont, UIDropdownFontFamily } from '@app/components/tiptap/basic/UIDropdownFontFamily'
import { HomeContext } from '@app/context/HomeContext'
import { useAuth } from '@app/hooks/useAuth'
import { usePosts } from '@app/hooks/usePost'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { Storage } from '@app/lib/firebase/storage/Storage'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { uuidv4 } from '@app/utils/uuidv4'
import imgPlaceholder from '@resources/img/blog_placeholder.webp'
import { Timestamp } from 'firebase/firestore'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useContext, useEffect, useRef, useState } from 'react'
import { UIStackPick } from '../stack/UIStackPick'
import { UIStackTableView } from '../stack/UIStackTableView'
import { UIPostFormKeywordsView } from './UIPostFormKeywordsView'
import { UIPostFormPickCoverIMG } from './UIPostFormPickCoverIMG'

export interface IIMG {
  src: string
  description: string
  figcaption: string
  blob: Blob | null
}

const validation = ValidationKassiopeiaTool.fast

export function UINewPost() {
  const auth = useAuth()
  const { update: updatePostState, posts: savedPosts } = usePosts()
  const homeCtx = useContext(HomeContext)

  const [img, setIMG] = useState<IIMG>({
    src: imgPlaceholder,
    blob: null as Blob | null,
    description: '',
    figcaption: '',
  })
  const [font, setFont] = useState<IFontName>(defaultFont)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState(validation.slugify(title))

  const [description, setDescription] = useState({ font: defaultFont, content: '' })
  const [metaDescription, setMetaDescription] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [stacks, setStacks] = useState<IStack[]>([])

  const titleInputContainerRef = useRef<HTMLDivElement>(null)
  const descriptionInputContainerRef = useRef<HTMLDivElement>(null)
  const metaDescriptionInputContainerRef = useRef<HTMLDivElement>(null)
  const keywordInputContainerRef = useRef<HTMLInputElement>(null)

  useEffect(() => setSlug(validation.slugify(title)), [title])

  const addKeyword = () => {
    if (keywordInputContainerRef.current) {
      const key = keywordInputContainerRef.current.value.trim()
      if (!key) {
        toasterKT.info('Informe uma palavra-chave. Exemplo: "Testes automatizados"')
        return toasterKT.animationTool.shakeX(keywordInputContainerRef.current.parentElement!.parentElement!)
      }
      if (keywords.includes(key)) {
        toasterKT.animationTool.shakeX(document.querySelector(`[data-keyword="${key}"]`)!, false)
        return toasterKT.warn('Palavra-chave já adicionada')
      }
      keywordInputContainerRef.current.value = ''
      setKeywords((keys) => [...keys, key])
    }
  }

  const submit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!auth.user) {
      toasterKT.danger('Nenhum usuário logado')
      return
    }

    if (!title || title.length < 5) {
      toasterKT.warn('Aumente um pouco o título provisório. Deixe pelo menos 5 caracteres')
      toasterKT.animationTool.shakeX(titleInputContainerRef.current!)
      return
    }

    const locker = ScreenLockerKassiopeiaTool.fast

    locker.lock()

    const uid = await uuidv4()
    const now = Timestamp.now()
    const payload: IPost = {
      uid,
      authorID: auth.user.uid,
      mediaImage: null,
      title: title.trim(),
      slug,
      htmlContent: '',
      description,
      metaDescription: metaDescription.trim(),
      keywords,
      stacks: stacks.map((stack) => {
        const { uid, name, description } = stack
        return { uid, name, description }
      }),
      views: 0,
      font,
      isPublished: false,
      isLocked: false,
      createdAt: now,
      updatedAt: now,
    }

    if (img.blob) {
      try {
        const res = await Storage.fast.uploadBlob(img.blob, `post/${uid}/media.webp`, {
          post: uid,
          user: auth.user.uid,
        })
        if (!res) toasterKT.warn('Não foi possível processar a imagem que você selecionou (Desconhecido)')
        else
          payload.mediaImage = {
            src: res,
            description: img.description,
            figcaption: img.figcaption,
            type: 'IMAGE',
            loadType: 'eager',
          }
      } catch (error) {
        console.log(error)
        toasterKT.warn('Não foi possível processar a imagem que você selecionou')
      }
    }

    try {
      const data = await Firestore.fast.upload(payload, 'post', uid)
      if (data) {
        updatePostState([...savedPosts, data as IPost], () => homeCtx.setScreen('ALL_POSTS'))
      }
    } catch (error) {
      console.log(error)
      toasterKT.danger('Erro ao criar nova postagem (Desconhecido)')
    } finally {
      locker.unlock()
    }
  }

  return (
    <div>
      <h1 className="title">Crie algo incrível</h1>
      <p>Tem algo interessante em mente? Um novo post é perfeito para compartilhar suas ideias</p>
      <form className="py-3" onSubmit={submit}>
        <UIPostFormPickCoverIMG img={img} changeIMG={setIMG} />

        <div ref={titleInputContainerRef}>
          <UIInput
            label="Título"
            value={title}
            onImputed={(title) => setTitle(title)}
            placeholder="Exemplo: Por que o Crocodile poderia ser a mãe do Luffy?"
            iconLeft="file-signature"
          />
        </div>
        {slug && (
          <div>
            <small>
              <strong>Slug</strong>: <span>{slug}</span>
            </small>
          </div>
        )}

        <div ref={descriptionInputContainerRef} className="py-3">
          <label className="label">Descrição</label>
          <BasicEditor
            content={description.content}
            onUpdate={(content, font) => setDescription({ content, font })}
          />
        </div>

        <div ref={metaDescriptionInputContainerRef}>
          <UITextarea
            label="Meta descrição"
            value={metaDescription}
            onImputed={(meta) => setMetaDescription(meta)}
            helper={{
              isVisible: true,
              label: `A melhor recomendação sobre o tamanho de uma meta descrição é mantê-la entre 150 e 160 caracteres. Se for maior que isso, o Google, por exemplo, cortará a meta descrição. Tamanho atual: ${metaDescription.length}`,
              design: 'warning',
            }}
          />
        </div>

        <div className="pt-3">
          <label className="label">Palavras-chave</label>
          <div className="field has-addons pb-1 mb-0">
            <div className="control" style={{ width: '100%' }}>
              <input
                onKeyDown={(e) => {
                  if (e.key.toLocaleLowerCase() === 'enter') {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
                ref={keywordInputContainerRef}
                className="input"
                type="text"
                placeholder="Keywords"
              />
            </div>
            <div className="control">
              <button type="button" className="button is-primary" onClick={addKeyword}>
                Adicionar
              </button>
            </div>
          </div>
          <p className="help pb-3 pt-0 mt-0">
            Digite palavras relacionadas ao tema aqui. Exemplo: Desenvolvimento web
          </p>
          <UIPostFormKeywordsView keywords={keywords} setKeywords={setKeywords} />
        </div>

        <div className="pt-3">
          <div className="is-flex is-justify-content-space-between is-align-items-center">
            <UIStackPick selectedStacks={stacks} setSelectedStacks={setStacks} id="ui__stackpick" />
          </div>

          <UIStackTableView stacks={stacks} onClickDeleteButton={setStacks} />
        </div>

        <div className="pt-3">
          <label className="label p-0 m-0">Escolha uma fonte para iniciar</label>
          <div className="pt-3">
            <UIDropdownFontFamily
              openUP
              id="menu__dropdown_fm"
              font={font}
              onChange={(font) => setFont(font)}
            />
          </div>
        </div>

        <div className="py-6">
          <button className="button is-primary" type="submit">
            Criar novo post
          </button>
        </div>
      </form>
    </div>
  )
}
