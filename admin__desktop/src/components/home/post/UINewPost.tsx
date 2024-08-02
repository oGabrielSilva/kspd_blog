import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { UITextarea } from '@app/components/shared/UITextarea'
import { BasicEditor } from '@app/components/tiptap/basic/BasicEditor'
import { defaultFont, UIDropdownFontFamily } from '@app/components/tiptap/basic/UIDropdownFontFamily'
import { HomeContext } from '@app/context/HomeContext'
import { useAuth } from '@app/hooks/useAuth'
import { usePosts } from '@app/hooks/usePost'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { Storage } from '@app/lib/firebase/storage/Storage'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { minimizeText } from '@app/utils/minimizeText'
import { uuidv4 } from '@app/utils/uuidv4'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import imgPlaceholder from '@resources/img/blog_placeholder.webp'
import { Timestamp } from 'firebase/firestore'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useContext, useEffect, useRef, useState } from 'react'
import { UIStackPick } from '../stack/UIStackPick'
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

          <div className="table-container pt-1">
            <table className="table is-fullwidth is-hoverable">
              <thead>
                <tr>
                  <th className="has-text-centered">Stack</th>
                  <th className="has-text-centered">Descrição</th>
                  <th className="has-text-centered">Meta descrição</th>
                  <th className="has-text-centered">Ações</th>
                </tr>
              </thead>
              <tbody>
                {stacks.length < 1 ? (
                  <tr>
                    <td colSpan={5}>Nenhuma Stack adicionada</td>
                  </tr>
                ) : (
                  stacks.map((stack, index) => {
                    return (
                      <tr key={index} data-tr={index}>
                        <th className="has-text-centered">{stack.name}</th>
                        <td>
                          {stack.description ? (
                            <>
                              <button
                                onClick={() => openModal('___stackDesc__stackName_' + index)}
                                type="button"
                                className="button is-ghost p-0 m-0"
                                style={{ fontSize: 14 }}
                              >
                                Ver descrição
                              </button>
                              <div className="has-text-left">
                                <UIModal
                                  title={`Descrição da Stack [${stack.name}]`}
                                  id={'___stackDesc__stackName_' + index}
                                  secondaryButton={{ label: 'Fechar' }}
                                >
                                  <div
                                    dangerouslySetInnerHTML={{ __html: stack.description.content ?? '' }}
                                    className="edited"
                                    style={
                                      (!!stack.description.font && { fontFamily: stack.description.font }) ||
                                      {}
                                    }
                                  />
                                </UIModal>
                              </div>
                            </>
                          ) : (
                            void 0
                          )}
                        </td>
                        <td>{minimizeText(stack.metaDescription)}</td>
                        <td>
                          <div className="buttons is-justify-content-center has-text-left">
                            <button
                              onClick={() => openModal('___stackRM__stackName_' + index)}
                              type="button"
                              className="button is-small is-danger"
                            >
                              <FontAwesomeIcon aria-hidden icon={'trash'} />
                            </button>

                            <UIModal
                              id={'___stackRM__stackName_' + index}
                              title={`Remover a Stack [${stack.name}] do post?`}
                              primaryButton={{
                                label: 'Sim, remover',
                                design: 'warning',
                                closeModalOnClick: false,
                                onClick: () => {
                                  closeModal('___stackRM__stackName_' + index, () => {
                                    const tr = document.querySelector<HTMLTableRowElement>(
                                      `[data-tr="${index}"]`,
                                    )!
                                    toasterKT.animationTool.zoomOutEnd(tr).addEventOnCompletion(() => {
                                      setStacks((s) => s.filter(({ uid }) => uid !== stack.uid))
                                      toasterKT.animationTool.clean(tr)
                                    })
                                  })
                                },
                              }}
                              secondaryButton={{ label: 'Cancelar', design: 'link' }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
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
