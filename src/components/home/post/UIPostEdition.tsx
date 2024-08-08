import { UIIcon } from '@app/components/shared/UIIcon'
import { UIModal } from '@app/components/shared/UIModal'
import { UITextarea } from '@app/components/shared/UITextarea'
import { BasicEditor } from '@app/components/tiptap/basic/BasicEditor'
import { PostEditor } from '@app/components/tiptap/post-editor/PostEditor'
import { AppBarContext } from '@app/context/AppBarContext'
import { HomeContext } from '@app/context/HomeContext'
import { PostContext } from '@app/context/PostContext'
import { useAuth } from '@app/hooks/useAuth'
import { usePosts } from '@app/hooks/usePost'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { Storage } from '@app/lib/firebase/storage/Storage'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { formatDate } from '@app/utils/formatDate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import imgPlaceholder from '@resources/img/blog_placeholder.webp'
import { Editor } from '@tiptap/react'
import { Timestamp } from 'firebase/firestore'
import { ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { UIStackForPostTableView } from '../stack/UIStackForPostTableView'
import { UIStackPickForPost } from '../stack/UIStackPickForPost'
import { IIMG } from './UINewPost'
import { UIPostFormKeywordsView } from './UIPostFormKeywordsView'
import { UIPostFormPickCoverIMG } from './UIPostFormPickCoverIMG'
import { UIPostImagePicker } from './UIPostImagePicker'

const editionHasChangesModalId = 'id__modal-has-edition-changes'
const imageModalId = 'id__modal-postEdition_IMG_PICK'
const deletePostModalId = 'id__modal-post-delete___alert'

const Edition = () => {
  const auth = useAuth()
  const { setScreen } = useContext(HomeContext)
  const { deletePost } = useContext(PostContext)
  const appBar = useContext(AppBarContext)

  const postHook = usePosts()
  const post = postHook.posts.find((p) => p.uid === postHook.editPostID)!

  const [editor, setEditor] = useState<Editor>()

  const [hasChanges, setHasChanges] = useState(false)
  const [metadata, setMetadata] = useState(false)
  const [isMetadataOptionVisible, setMetadataOptionsVisibility] = useState(false)

  const [img, setIMG] = useState<IIMG>({
    src: post.mediaImage?.src ?? imgPlaceholder,
    blob: null as Blob | null,
    description: post.mediaImage?.description ?? '',
    figcaption: post.mediaImage?.figcaption ?? '',
  })
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [font, setFont] = useState(post.font)
  const [content, setContent] = useState(post.htmlContent)
  const [description, setDescription] = useState({
    font: post.description?.font ?? 'Inter',
    content: post.description?.content ?? '',
  })
  const [metaDescription, setMetaDescription] = useState(post.metaDescription)
  const [keywords, setKeywords] = useState<string[]>(post.keywords)
  const [stacks, setStacks] = useState<TStackForPost[]>(post.stacks)

  const descriptionInputContainerRef = useRef<HTMLDivElement>(null)
  const metaDescriptionInputContainerRef = useRef<HTMLDivElement>(null)
  const keywordInputContainerRef = useRef<HTMLInputElement>(null)

  useEffect(() => setSlug(ValidationKassiopeiaTool.fast.slugify(title)), [title])

  useEffect(() => {
    appBar.setCloseButtonVisibility(false)
    appBar.setGoBackButtonVisibility(false)
    appBar.setMenuOffCanvasVisibility(false)
    appBar.setProfileVisibility(false)

    return () => appBar.reset()
  }, [appBar])

  const goBack = () => {
    setHasChanges(false)
    postHook.setEditPostID(null)
    setScreen('USER_POSTS')
  }

  const tryGoBack = () => {
    if (hasChanges) {
      openModal(editionHasChangesModalId)
      return
    }
    goBack()
  }

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
      setHasChanges(true)
      keywordInputContainerRef.current.value = ''
      setKeywords((keys) => [...keys, key])
    }
  }

  const save = useCallback(() => {
    if (hasChanges) {
      const fn = async () => {
        locker.lock()
        const data = { ...post }
        const uid = data.uid

        if (
          img.src !== data.mediaImage?.src ||
          !!img.blob ||
          img.description !== data.mediaImage.description ||
          img.figcaption !== data.mediaImage.figcaption
        ) {
          let src = data.mediaImage?.src

          if (img.blob) {
            URL.revokeObjectURL(img.src)
            try {
              const result = await Storage.fast.uploadBlob(img.blob, `post/${uid}/media.webp`, {
                post: uid,
                user: auth.user!.uid,
              })
              if (!result)
                toasterKT.warn('Não foi possível processar a imagem que você selecionou (Desconhecido)')
              else src = result
            } catch (error) {
              console.log(error)
              toasterKT.warn('Não foi possível processar a imagem que você selecionou')
            }
          }

          data.mediaImage = {
            src: src ?? '',
            description: img.description,
            figcaption: img.figcaption,
            type: 'IMAGE',
            loadType: 'eager',
          }
        }

        data.title = title
        data.font = font
        data.slug = slug
        data.htmlContent = content
        data.description.content = description.content
        data.description.font = description.font
        data.metaDescription = metaDescription
        data.stacks = stacks
        data.keywords = keywords

        data.createdAt = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds)
        data.updatedAt = Timestamp.now()

        try {
          const result = (await Firestore.fast.upload(data, 'post', post.uid)) as IPost

          postHook.update(
            postHook.posts.map((p) => (p.uid === result.uid ? data : p)),
            () => {
              setHasChanges(false)
            },
          )
        } catch (error) {
          console.log(error)
          toasterKT.danger('Erro ao salvar conteúdo')
        } finally {
          locker.unlock()
        }
      }

      fn()
    }
  }, [
    auth,
    content,
    description,
    font,
    hasChanges,
    img,
    keywords,
    metaDescription,
    post,
    postHook,
    slug,
    stacks,
    title,
  ])

  useEffect(() => {
    function fn(e: KeyboardEvent) {
      if (e.key.toLocaleLowerCase() === 's' && e.ctrlKey) {
        e.preventDefault()
        save()
      }
    }

    document.addEventListener('keydown', fn)

    return () => document.removeEventListener('keydown', fn)
  }, [save])

  useEffect(() => {
    const c = document.querySelector<HTMLElement>('[data-metadata-container]')!
    if (metadata) {
      const fn = [
        'backInRight',
        'backInDown',
        'backInLeft',
        'backInUp',
        'animate__bounceInDown',
        'animate__bounceIn',
        'animate__bounceInLeft',
        'animate__bounceInRight',
        'animate__bounceInUp',
      ].pickRandom()
      toasterKT.animationTool.otherAnimationByName(c, fn!, false).addEventOnCompletion(() => {
        setTimeout(() => (c ? toasterKT.animationTool.clean(c) : void 0), 100)
      })
      setTimeout(() => {
        setMetadataOptionsVisibility(true)
      }, 12)
    } else {
      const fn = [
        'animate__fadeOutLeft',
        'animate__fadeOutRight',
        'animate__backOutDown',
        'animate__backOutLeft',
        'animate__backOutRight',
        'animate__flipOutY',
        'animate__rotateOutDownLeft',
        'animate__rotateOutUpLeft',
      ].pickRandom()

      toasterKT.animationTool.otherAnimationByName(c, fn!, false).addEventOnCompletion(() => {
        setMetadataOptionsVisibility(false)
        setTimeout(() => (c ? toasterKT.animationTool.clean(c) : void 0), 100)
      })
    }
  }, [metadata])

  return (
    <>
      <UIModal
        id={editionHasChangesModalId}
        title="Você não salvou as últimas alterações"
        primaryButton={{
          label: 'Salvar',
          design: 'success',
          icon: 'save',
          closeModalOnClick: true,
          onClick: save,
        }}
        secondaryButton={{
          label: 'Descartar alterações',
          design: 'danger',
          icon: 'cancel',
          onClick: goBack,
        }}
      />
      <UIModal
        id={deletePostModalId}
        title={`Tem certeza que deseja apagar o post [${post.title}]?`}
        primaryButton={{
          label: 'Sim, apagar post',
          design: 'danger',
          icon: 'trash',
          closeModalOnClick: false,
          onClick: async (button) => {
            if (button.classList.contains('is-dark')) {
              closeModal(deletePostModalId)
              locker.lock()

              try {
                const message = await deletePost(post.uid, () => setScreen('USER_POSTS'))
                toasterKT.info(message)
              } catch (error) {
                console.log(error)
                if (typeof error === 'string') toasterKT.danger(error)
              } finally {
                locker.unlock()
              }
            } else {
              button.classList.add('is-dark')
              toasterKT.animationTool.shakeX(button)
              toasterKT.warn('Clique novamente para confirmar')
              setTimeout(() => {
                if (button) button.classList.remove('is-dark')
              }, 3000)
            }
          },
        }}
        secondaryButton={{
          label: 'Cancelar',
          design: 'primary',
          icon: 'arrow-left',
        }}
      >
        <div>
          <p>
            <strong>ID:</strong> {post.uid}
          </p>
          <p>
            <strong>Título:</strong> {post.title}
          </p>
          <p>
            <strong>Slug:</strong> {post.slug}
          </p>
          <p>
            <strong>Criado em:</strong> {formatDate(post.createdAt.toDate())}
          </p>
          <p>
            <strong>Última atualização:</strong> {formatDate(post.updatedAt.toDate())}
          </p>

          <p className="pt-3">
            <code>Atenção:</code> se assim for feito, você perderá todo o conteúdo deste documento.
          </p>
        </div>
      </UIModal>

      <UIPostImagePicker
        modalId={imageModalId}
        onPick={(dataURL, caption, description) => {
          editor
            ?.chain()
            .focus()
            .setFigure({ src: dataURL, caption, title: description, alt: description })
            .insertContent('<p></p>')
            .run()
        }}
      />
      <div>
        <button
          className="button is-ghost is-small p-0 m-0 has-text-warning"
          type="button"
          onClick={tryGoBack}
        >
          Voltar
        </button>
      </div>
      <div className="pb-3 is-flex is-justify-content-space-between is-align-items-center">
        <p>
          Edição do post: <strong>{post.uid}</strong>
        </p>
        <div className="buttons is-flex-direction-column gap-1">
          <button
            onClick={() => setMetadata((v) => !v)}
            className="button is-ghost p-0 is-small"
            type="button"
          >
            {isMetadataOptionVisible ? 'Esconder metadados' : 'Editar metadados'}
          </button>
          <button
            onClick={() => openModal(deletePostModalId)}
            className="button is-ghost p-0 is-small has-text-danger"
            type="button"
          >
            <UIIcon name="trash" />
            <span>Apagar</span>
          </button>
        </div>
      </div>
      <div>
        <div className="py-3">
          <div data-metadata-container style={{ ...(isMetadataOptionVisible ? {} : { display: 'none' }) }}>
            <UIPostFormPickCoverIMG
              img={img}
              changeIMG={(state) => {
                setIMG(state)
                setHasChanges(true)
              }}
            />

            <div className="field is-horizontal">
              <div className="field-label is-normal">
                <label className="label">Título</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.currentTarget.value)
                        setHasChanges(true)
                      }}
                      placeholder="Defina um título para a postagem"
                    />
                  </div>
                  <p className="help">{slug}</p>
                </div>
              </div>
            </div>

            <div ref={metaDescriptionInputContainerRef}>
              <UITextarea
                label="Meta descrição"
                value={metaDescription}
                onImputed={(meta) => {
                  setMetaDescription(meta)
                  setHasChanges(true)
                }}
                helper={{
                  isVisible: true,
                  label: `A melhor recomendação sobre o tamanho de uma meta descrição é mantê-la entre 150 e 160 caracteres. Se for maior que isso, o Google, por exemplo, cortará a meta descrição. Tamanho atual: ${metaDescription.length}`,
                  design: 'warning',
                }}
              />
            </div>

            <div ref={descriptionInputContainerRef} className="py-3">
              <label className="label">Descrição</label>
              <BasicEditor
                content={description.content}
                onUpdate={(content, font) => {
                  setDescription({ content, font })
                  setHasChanges(true)
                }}
              />
            </div>

            <div>
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

            <div className="py-5">
              <div className="is-flex is-justify-content-space-between is-align-items-center">
                <UIStackPickForPost
                  selectedStacks={stacks}
                  setSelectedStacks={(state) => {
                    setStacks(state)
                    setHasChanges(true)
                  }}
                  id="ui__stackpick"
                />
              </div>

              <UIStackForPostTableView
                stacks={stacks}
                onClickDeleteButton={(state) => {
                  setStacks(state)
                  setHasChanges(true)
                }}
              />
            </div>
          </div>

          {/* Content */}

          <div className="pb-3 pt-5">
            <label className="label">Conteúdo da postagem</label>
          </div>

          <PostEditor
            content={post.htmlContent}
            font={post.font}
            post={post}
            onUpdateContent={(c) => {
              setContent(c)
              setHasChanges(true)
            }}
            onUpdateFont={(f) => {
              setHasChanges(true)
              setFont(f)
            }}
            onRequireImage={() => openModal(imageModalId)}
            setEditor={setEditor}
          />

          <div className="buttons py-3">
            <button className="button is-ghost has-text-warning" type="button" onClick={tryGoBack}>
              <span className="icon is-small">
                <FontAwesomeIcon aria-hidden icon="arrow-left" />
              </span>
              <span>Voltar</span>
            </button>
            <button className="button is-info" type="button" onClick={save}>
              <span className="icon is-small">
                <FontAwesomeIcon aria-hidden icon={'save'} />
              </span>
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export function UIPostEdition() {
  const postHook = usePosts()
  const { setScreen } = useContext(HomeContext)

  return postHook.editPostID ? (
    <div>
      <Edition />
      <div style={{ position: 'fixed', bottom: '3vh', right: '1rem' }}>
        <div className="buttons are-small gap-1 is-flex-direction-column">
          <button
            type="button"
            className="button p-0 m-0 is-ghost"
            onClick={() => {
              document
                .querySelector('[data-page-container]')
                ?.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
            }}
          >
            <FontAwesomeIcon aria-hidden icon="arrow-up" />
          </button>
          <button
            type="button"
            className="button p-0 m-0 is-ghost"
            onClick={() => {
              const page = document.querySelector('[data-page-container]')
              if (page) {
                page.scrollTo({
                  top: (page.scrollHeight - innerHeight - 50) / 2,
                  left: 0,
                  behavior: 'smooth',
                })
              }
            }}
          >
            <FontAwesomeIcon aria-hidden icon="minus" />
          </button>
          <button
            type="button"
            className="button p-0 m-0 is-ghost"
            onClick={() => {
              const page = document.querySelector('[data-page-container]')
              if (page) {
                page.scrollTo({ top: page.scrollHeight, left: 0, behavior: 'smooth' })
              }
            }}
          >
            <FontAwesomeIcon aria-hidden icon="arrow-down" />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="is-flex is-justify-content-center is-align-items-center gap-3 is-flex-direction-column-reverse">
      <button
        onClick={() => setScreen('USER_POSTS')}
        type="button"
        className="button is-ghost has-text-warning is-small p-0"
      >
        <span className="icon is-small">
          <FontAwesomeIcon aria-hidden icon="arrow-left" />
        </span>
        <span>Voltar</span>
      </button>
      <p>Nenhuma postagem para editar</p>
    </div>
  )
}
