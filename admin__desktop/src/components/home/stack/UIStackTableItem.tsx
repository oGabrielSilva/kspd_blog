import { UIModal } from '@app/components/shared/UIModal'
import { HomeContext } from '@app/context/HomeContext'
import { StackContext } from '@app/context/StackContext'
import { openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { minimizeText } from '@app/utils/minimizeText'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import { useContext } from 'react'

interface IProps {
  stack: IStack
  index: number
}

export function UIStackTableItem({ stack, index }: IProps) {
  const { update, stacks, setEditStack } = useContext(StackContext)
  const { setScreen } = useContext(HomeContext)

  const modalDeleteId = '___stackDelete__stackName_' + index

  async function deleteFn() {
    const locker = ScreenLockerKassiopeiaTool.fast

    locker.lock()
    try {
      const result = await Firestore.fast.delete('stacks', stack.uid)
      if (result) {
        toasterKT.success(`Sucesso. Stack [${stack.name}] apagada`)
        update(stacks.filter((st) => st.name !== stack.name))
      } else toasterKT.danger('Algo deu errado ao deletar a Stack')
    } catch (error) {
      console.log(error)
      toasterKT.danger(`Erro ao apagar a Stack [${stack.name}]`)
    } finally {
      locker.unlock()
    }
  }

  function toEdit() {
    setEditStack(stack)
    setScreen('EDIT_STACK')
  }

  return (
    <tr>
      <th className="has-text-centered">{stack.name}</th>
      <td>
        {stack.description ? (
          <>
            <button
              onClick={() => openModal('___stackDesc__stackName_' + index)}
              type="button"
              className="button is-ghost p-0 m-0"
              style={{ fontSize: 14 }}
            >
              Ver descrição
            </button>
            <div className="has-text-left">
              <UIModal
                title={`Descrição da Stack [${stack.name}]`}
                id={'___stackDesc__stackName_' + index}
                secondaryButton={{ label: 'Fechar' }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: stack.description.content ?? '' }}
                  className="edited"
                  style={(!!stack.description.font && { fontFamily: stack.description.font }) || {}}
                />
              </UIModal>
            </div>
          </>
        ) : (
          void 0
        )}
      </td>
      <td>{minimizeText(stack.metaDescription)}</td>
      <td>
        <div className="buttons is-justify-content-center has-text-left">
          <button type="button" className="button is-small is-warning" onClick={toEdit}>
            <FontAwesomeIcon aria-hidden icon={'pen-to-square'} />
          </button>
          <button
            onClick={() => openModal(modalDeleteId)}
            type="button"
            className="button is-small is-danger"
          >
            <FontAwesomeIcon aria-hidden icon={'trash'} />
          </button>
        </div>
        <div className="has-text-left">
          <UIModal
            id={modalDeleteId}
            title={`Remover a Stack [${stack.name}]?`}
            primaryButton={{
              label: 'Sim, remover',
              design: 'warning',
              onClick: deleteFn,
            }}
            secondaryButton={{ label: 'Cancelar', design: 'link' }}
          />
        </div>
      </td>
    </tr>
  )
}
