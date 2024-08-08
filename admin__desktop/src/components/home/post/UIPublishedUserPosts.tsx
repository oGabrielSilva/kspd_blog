import { UIIcon } from '@app/components/shared/UIIcon'
import { HomeContext } from '@app/context/HomeContext'
import { useAuth } from '@app/hooks/useAuth'
import { usePosts } from '@app/hooks/usePost'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { useContext } from 'react'
import { UIPostCard } from './UIPostCard'

export function UIPublishedUserPosts() {
  const auth = useAuth()
  const { reloadPosts, ...hook } = usePosts()
  const { setScreen } = useContext(HomeContext)

  const reload = () => {
    locker.lock()
    reloadPosts((state) => {
      locker.unlock()
      if (state.length <= 0) toasterKT.danger('Nenhuma postagem encontrada')
    })
  }

  const posts = hook.posts.filter((posts) => posts.authorID === auth.user?.uid && posts.isPublished)

  return (
    <div className="py-5">
      <div className="is-flex is-align-items-center is-justify-content-space-between gap-7 pb-5">
        <div>
          <h1 className="title p-0 m-0">Suas postagens (Publicadas)</h1>
          <p className="pt-3">
            Aqui estão todas as suas postagens publicadas, organizadas para fácil acesso. Navegue pelos seus
            artigos, revise o conteúdo e acompanhe o desempenho de cada publicação. Atualize e aperfeiçoe o
            conteúdo sempre que necessário para manter a relevância e a qualidade do seu blog
          </p>
        </div>
        <button onClick={() => setScreen('NEW_POST')} type="button" className="button is-small is-link">
          <UIIcon name={'add'} />
          <span>Escreva um novo artigo</span>
        </button>
      </div>

      <div className="py-5">
        {posts.length > 0 && (
          <div className="pb-3 is-flex is-justify-content-end">
            <button className="button is-ghost px-0 is-small" type="button" onClick={reload}>
              <UIIcon name={'rotate'} />
              <span>Recarregar</span>
            </button>
          </div>
        )}
        {posts.length <= 0 ? (
          <div className="is-flex is-justify-content-space-between gap-3 is-align-items-center">
            <p>Nenhuma postagem encontrada</p>
            <button className="button is-ghost px-0 mx-0" type="button" onClick={reload}>
              <span className="icon is-small">
                <UIIcon name={'rotate'} />
              </span>
              <span>Recarregar</span>
            </button>
          </div>
        ) : (
          posts.map((post, index) => {
            return <UIPostCard key={index} post={post} />
          })
        )}
      </div>
    </div>
  )
}
