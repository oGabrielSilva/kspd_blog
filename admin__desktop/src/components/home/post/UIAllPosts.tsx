import { HomeContext } from '@app/context/HomeContext'
import { useAuth } from '@app/hooks/useAuth'
import { usePosts } from '@app/hooks/usePost'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'
import { UIPostCard } from './UIPostCard'

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
            return <UIPostCard post={post} key={index} />
          })
        )}
      </div>
    </div>
  )
}
