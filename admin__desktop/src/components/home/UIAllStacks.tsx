import { HomeContext } from '@app/context/HomeContext'
import { useStacks } from '@app/hooks/useStacks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'
import { UIStackTableItem } from './stack/UIStackTableItem'

export function UIAllStacks() {
  const { stacks } = useStacks()
  const { setScreen } = useContext(HomeContext)

  return (
    <div className="py-5">
      <div className="is-flex is-align-items-center is-justify-content-space-between gap-7 pb-5">
        <div>
          <h1 className="title p-0 m-0">Stacks</h1>
          <p>
            Visualize todas as Stacks. Cada Stack agrupa temas relacionados e pode conter várias postagens.
          </p>
        </div>
        <button onClick={() => setScreen('NEW_STACK')} type="button" className="button is-small is-link">
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon="add" />
          </span>
          <span>Adicionar</span>
        </button>
      </div>

      <div>
        <div className="table-container py-3 has-text-centered">
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
                  <td colSpan={5}>
                    <div className="is-flex is-align-items-center gap-1">
                      Não há Stacks cadastradas ainda.{' '}
                      <button
                        className="button is-ghost p-0 m-0"
                        type="button"
                        onClick={() => setScreen('NEW_STACK')}
                      >
                        Cadastre a primeira
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                stacks.map((stack, index) => {
                  return <UIStackTableItem stack={stack} index={index} key={index} />
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
