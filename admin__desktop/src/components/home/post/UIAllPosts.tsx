import { HomeContext } from '@app/context/HomeContext'
import { useAuth } from '@app/hooks/useAuth'
import { usePosts } from '@app/hooks/usePost'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { formatDate } from '@app/utils/formatDate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'

export function UIAllPosts() {
  const auth = useAuth()
  const { posts, reloadPosts } = usePosts()
  const { setScreen } = useContext(HomeContext)

  const reload = () => {
    locker.lock()
    reloadPosts((state) => {
      locker.unlock()
      if (state.length <= 0) toasterKT.danger('Nenhuma postagem encontrada')
    })
  }

  return (
    <div className="py-5">
      <div className="is-flex is-align-items-center is-justify-content-space-between gap-7 pb-5">
        <div>
          <h1 className="title p-0 m-0">Postagens</h1>
          <p>
            Explore todas as postagens. Organize e edite o conteúdo para garantir que cada postagem ofereça
            insights valiosos e relevantes
          </p>
        </div>
        <button onClick={() => setScreen('NEW_POST')} type="button" className="button is-small is-link">
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon="add" />
          </span>
          <span>Escreva um novo</span>
        </button>
      </div>

      <div className="py-5">
        {posts.length <= 0 ? (
          <div className="is-flex is-justify-content-space-between gap-3 is-align-items-center">
            <p>Nenhuma postagem encontrada</p>
            <button className="button is-ghost px-0 mx-0" type="button" onClick={reload}>
              <span className="icon is-small">
                <FontAwesomeIcon aria-hidden icon="rotate" />
              </span>
              <span>Recarregar</span>
            </button>
          </div>
        ) : (
          posts.map((post, index) => {
            return (
              <div className="card" key={index}>
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
                          <button type="button" className="button is-ghost p-0 m-0">
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
                      className={
                        'is-unselectable ' + (post.isPublished ? 'has-text-primary' : 'has-text-danger')
                      }
                      style={{ cursor: 'default' }}
                    >
                      {post.isPublished ? 'On-line' : 'Off-line'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
