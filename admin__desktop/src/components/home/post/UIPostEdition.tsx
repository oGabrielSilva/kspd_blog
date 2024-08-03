import { PostEditor } from '@app/components/tiptap/post-editor/PostEditor'
import { AppBarContext } from '@app/context/AppBarContext'
import { HomeContext } from '@app/context/HomeContext'
import { usePosts } from '@app/hooks/usePost'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { useContext, useEffect, useState } from 'react'

const Edition = () => {
  const appBar = useContext(AppBarContext)

  const postHook = usePosts()

  const post = postHook.postEditing!

  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [content, setContent] = useState(post.htmlContent)
  const [font, setFont] = useState(post.font)

  useEffect(() => setSlug(ValidationKassiopeiaTool.fast.slugify(title)), [title])

  useEffect(() => {
    appBar.setCloseButtonVisibility(false)
    appBar.setGoBackButtonVisibility(false)
    appBar.setMenuOffCanvasVisibility(false)
    appBar.setProfileVisibility(false)

    return () => appBar.reset()
  }, [appBar])

  return (
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
                }}
                placeholder="Defina um título para a postagem"
              />
            </div>
            <p className="help">{slug}</p>
          </div>
        </div>
      </div>

      <div className="py-3">
        <PostEditor
          content={content}
          font={font}
          post={post}
          disabled={false}
          onUpdate={(c, f) => {
            setContent(c)
            setFont(f)
          }}
        />
      </div>
    </div>
  )
}

export function UIPostEdition() {
  const post = usePosts()
  const { setScreen } = useContext(HomeContext)

  return post.postEditing ? (
    <>
      <div>
        <div className="pb-3">
          <button
            type="button"
            className="button is-ghost is-small p-0 has-text-warning"
            onClick={() => {
              setScreen('USER_POSTS')
            }}
          >
            Voltar
          </button>
        </div>
        <div className="pb-5 is-flex is-justify-content-space-between is-align-items-center gap-3">
          <p>
            Edição do post <strong>{post.postEditing.uid}</strong>
          </p>
          <button type="button" className="button is-ghost p-0 m-0 is-small">
            Metadados
          </button>
        </div>
        <div className="pb-5">
          <Edition />
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: '5vh', right: '5vw' }}>
        <button className="button" type="button">
          <FontAwesomeIcon aria-hidden icon={'arrow-up'} />
        </button>
      </div>
    </>
  ) : (
    void 0
  )
}
