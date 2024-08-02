import { UIModal } from '@app/components/shared/UIModal'
import { PostEditor } from '@app/components/tiptap/post-editor/PostEditor'
import { useAuth } from '@app/hooks/useAuth'
import { usePosts } from '@app/hooks/usePost'
import { closeAllModals, closeModal, openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { type Toaster } from 'kassiopeia-tools/dist/modules/toaster/Toaster'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const draftModalId = 'modal__postDraftID'
let deleteDraftToaster: Toaster | null = null
let lastDraft: IPostDraft | null = null

export function EditPostPage() {
  const auth = useAuth()
  const nav = useNavigate()
  const { uid } = useParams()
  const usePostsHook = usePosts()

  const post = usePostsHook.posts.find((p) => p.uid === uid)

  // console.log({ post })

  const [ready, setReady] = useState(false)
  const [content, setContent] = useState(post?.htmlContent ?? '')
  const [font, setFont] = useState<IFontName>()

  const [userVerified, setUserVerified] = useState(auth.user?.emailVerified ?? false)

  const [draftLoaded, setDraftLoaded] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)

  const saveChanges = useCallback(async () => {
    locker.lock()

    try {
      if (!post) return
      if (content === post.htmlContent && font === post.font) return
      const payload = { ...post } as IPost
      payload.htmlContent = content
      payload.font = font ? font : payload.font
      await Firestore.fast.upload(payload, 'post', post.uid)
    } catch (error) {
      console.log(error)
      toasterKT.danger('Erro ao salvar alterações (Desconhecido)')
    } finally {
      locker.unlock()
    }
  }, [content, font, post])

  useEffect(() => {
    if (!userVerified) {
      auth.handler.addObserver('home__email-verified', (user) => {
        setUserVerified(user?.emailVerified ?? false)
      })
      return () => auth.handler.removeObserver('home__email-verified')
    }
  }, [auth, userVerified])

  useEffect(() => {
    if (!auth.ready) {
      auth.handler.onReady(() => {
        if (!auth.handler.isLoggedIn) nav('/session')
      })
    }
  }, [auth, nav])

  useEffect(() => {
    if (post) setFont((f) => (!f ? post.font : f))
  }, [post])

  useEffect(() => {
    if (!draftLoaded && !!post && modalRef.current) {
      setDraftLoaded(true)
      const fn = async () => {
        lastDraft = await usePostsHook.loadDraft(post.uid)
        if (lastDraft && modalRef.current) openModal(modalRef.current)
        else setReady(true)
      }

      fn()
    }
  }, [draftLoaded, post, usePostsHook])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key.toLocaleLowerCase() === 's' && e.ctrlKey) {
        e.preventDefault()
        saveChanges()
      }
    }

    window.addEventListener('keydown', fn)

    return () => window.removeEventListener('keydown', fn)
  }, [saveChanges])

  return !post ? (
    <div className="container p-5">Nenhuma publicação foi selecionada</div>
  ) : auth.isAnonymous ? (
    <div />
  ) : !userVerified ? (
    <div />
  ) : (
    <div style={{ height: '100%' }} className="p-5 container">
      <div className="pb-5">
        <div className="pb-3 is-flex is-align-content-center is-justify-content-space-between gap-3">
          <small>Você está editando:</small>
          <button type="button" className="button is-ghost p-0 m-0 is-small">
            Editar meta dados
          </button>
        </div>
        <h1 className="title m-0">{post.title}</h1>
        <p>
          <strong>Slug: </strong>
          {post.slug}
        </p>
      </div>

      {ready ? (
        <PostEditor
          post={post}
          content={content}
          disabled={false}
          font={font}
          onUpdate={(content, fontName) => {
            setContent(content)
            setFont(fontName)
            usePostsHook.saveDraft({ content, font: fontName, uid: post.uid })
          }}
        />
      ) : (
        void 0
      )}

      <UIModal
        ref={modalRef}
        id={draftModalId}
        title="Há um rascunho salvo para esta postagem. O que fazer?"
        primaryButton={{
          label: 'Continuar no rascunho',
          closeModalOnClick: false,
          design: 'warning',
          onClick: () => {
            if (!lastDraft) {
              toasterKT.danger('Ocorreu um erro ao carregar o rascunho')
              setReady(true)
              return
            }
            setContent(lastDraft.content)
            setFont(lastDraft.font)
            closeModal(modalRef.current!, () => {
              setReady(true)
            })
          },
        }}
        secondaryButton={{
          label: 'Descartar o rascunho',
          design: 'danger',
          closeModalOnClick: false,
          onClick: (button) => {
            if (!button.classList.contains('is-focused')) {
              deleteDraftToaster = toasterKT.warn(
                'Tem certeza que deseja descartar o rascunho? (Clique novamente para descartar)',
              )
              deleteDraftToaster.listeners(void 0, () => {
                button.classList.remove('is-focused')
                deleteDraftToaster = null
              })
              button.classList.add('is-focused')
              toasterKT.animationTool.shakeX(button, false, 400)
              return
            }

            locker.lock()

            usePostsHook.removeDraft(post.uid).then(() => {
              setReady(true)
              closeAllModals()
              if (deleteDraftToaster) deleteDraftToaster.root().destroy()
              setTimeout(() => locker.unlock(), 300)
            })
          },
        }}
      />
    </div>
  )
}
