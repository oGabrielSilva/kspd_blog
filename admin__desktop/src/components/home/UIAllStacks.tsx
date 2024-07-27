import { HomeContext } from '@app/context/HomeContext'
import { useStacks } from '@app/hooks/useStacks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'

export function UIAllStacks() {
  const { stacks } = useStacks()
  const { setScreen } = useContext(HomeContext)

  return (
    <div className="py-5">
      <div className="is-flex is-align-items-center is-justify-content-space-between gap-7">
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
    </div>
  )
}
