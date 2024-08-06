import { UIModal } from '@app/components/shared/UIModal'
import { PostEditor } from '@app/components/tiptap/post-editor/PostEditor'
import { AppBarContext } from '@app/context/AppBarContext'
import { HomeContext } from '@app/context/HomeContext'
import { usePosts } from '@app/hooks/usePost'
import { openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Editor } from '@tiptap/react'
import { Timestamp } from 'firebase/firestore'
import { ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { useCallback, useContext, useEffect, useState } from 'react'
import { UIPostImagePicker } from './UIPostImagePicker'

const Metadata = () => <div />

const editionHasChangesModalId = 'id__modal-has-edition-changes'
const imageModalId = 'id__modal-postEdition_IMG_PICK'

const Edition = () => {
  const { setScreen } = useContext(HomeContext)
  const appBar = useContext(AppBarContext)

  const postHook = usePosts()
  const post = postHook.posts.find((p) => p.uid === postHook.editPostID)!

  const [autoSave, setAutoSave] = useState(false)
  const [editor, setEditor] = useState<Editor>()

  const [hasChanges, setHasChanges] = useState(false)
  const [editMetadata, setEditMetadata] = useState(false)

  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [font, setFont] = useState(post.font)
  const [content, setContent] = useState(post.htmlContent)

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

  const save = useCallback(() => {
    if (hasChanges) {
      const fn = async () => {
        locker.lock()
        const data = { ...post }

        data.title = title
        data.font = font
        data.slug = slug
        data.htmlContent = content
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
  }, [content, font, hasChanges, post, postHook, slug, title])

  useEffect(() => {
    if (autoSave) {
      save()
      setAutoSave(false)
    }
  }, [autoSave, save])

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
        <button
          onClick={() => setEditMetadata((v) => !v)}
          type="button"
          className="button is-ghost is-small p-0 m-0"
        >
          {editMetadata ? 'Conteúdo' : 'Metadados'}
        </button>
      </div>
      <div>
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

        <div className="py-3">
          {editMetadata ? (
            <Metadata />
          ) : (
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
          )}

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
