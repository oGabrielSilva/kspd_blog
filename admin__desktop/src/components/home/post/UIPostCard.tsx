import { useAuth } from '@app/hooks/useAuth'
import { usePosts } from '@app/hooks/usePost'
import { formatDate } from '@app/utils/formatDate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IProps {
  post: IPost
}

export function UIPostCard({ post }: IProps) {
  const postHook = usePosts()
  const auth = useAuth()

  return (
    <div className="card">
      {post.mediaImage && post.mediaImage.type === 'IMAGE' ? (
        <div className="card-image">
          <figure className="image is-3by1 ">
            <img
              src={post.mediaImage.src}
              loading="eager"
              style={{
                objectFit: 'cover',
                width: '100%',
                height: 'auto',
                position: 'unset',
                maxHeight: 300,
              }}
              alt={post.mediaImage.description}
              title={post.mediaImage.description}
              aria-label={post.mediaImage.description}
            />
            <figcaption>{post.mediaImage.figcaption}</figcaption>
          </figure>
          <button
            style={{ position: 'absolute', right: '5%', top: '5%', cursor: 'default' }}
            type="button"
            disabled
            className={'button is-rounded'.concat(post.isLocked ? ' is-danger' : '')}
            title={post.isLocked ? 'Postagem bloqueada' : 'Postagem desbloqueada'}
            aria-label={
              post.isLocked
                ? 'Este ícone indica que sua postagem está bloqueada'
                : 'Este ícone indica que sua postagem está desbloqueada'
            }
          >
            <FontAwesomeIcon aria-hidden icon={post.isLocked ? 'lock' : 'unlock'} />
          </button>
        </div>
      ) : (
        void 0
      )}
      <div className="card-content">
        <div className="media">
          <div className="media-content">
            <div className="pb-3 is-flex is-justify-content-space-between is-align-items-baseline gap-3">
              <h1 className="title is-4 m-0">{post.title}</h1>
              {post.authorID === auth.user?.uid ? (
                <button
                  onClick={() => postHook.putToEdition(post)}
                  type="button"
                  className="button is-ghost p-0 m-0"
                >
                  Editar
                </button>
              ) : (
                void 0
              )}
            </div>
            {post.description ? (
              <p
                dangerouslySetInnerHTML={{ __html: post.description.content ?? '' }}
                style={{ fontFamily: post.description.font ?? '' }}
              />
            ) : (
              <p>
                <small>
                  <i>{'[Nenhuma descrição adicionada]'}</i>
                </small>
              </p>
            )}
          </div>
        </div>

        <div className="content">
          <div className="tags">
            {post.keywords.map((key, index) => {
              return (
                <span className="tag" key={index}>
                  {key}
                </span>
              )
            })}
          </div>
          <p>
            <time dateTime={post.updatedAt.toDate().toISOString()}>
              {formatDate(post.updatedAt.toDate())}
            </time>
          </p>
          <p
            title={post.isPublished ? 'Publicado' : 'Não publicado'}
            aria-label={post.isPublished ? 'Postagem publicada' : 'Postagem não publicada'}
            className={'is-unselectable ' + (post.isPublished ? 'has-text-primary' : 'has-text-danger')}
            style={{ cursor: 'default' }}
          >
            {post.isPublished ? 'On-line' : 'Off-line'}
          </p>
        </div>
      </div>
    </div>
  )
}
