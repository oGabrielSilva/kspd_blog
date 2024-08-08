import { UIIcon } from '@app/components/shared/UIIcon'
import { UIModal } from '@app/components/shared/UIModal'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'

interface IProps {
  stacks: TStackForPost[]
  onClickDeleteButton(newState: TStackForPost[]): void
}

export function UIStackForPostTableView({ stacks, onClickDeleteButton }: IProps) {
  return (
    <div className="table-container pt-1">
      <table className="table is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th className="has-text-centered">Stack</th>
            <th className="has-text-centered">Descrição</th>
            <th className="has-text-centered">Ações</th>
          </tr>
        </thead>
        <tbody>
          {stacks.length < 1 ? (
            <tr>
              <td colSpan={5}>Nenhuma Stack adicionada</td>
            </tr>
          ) : (
            stacks.map((stack, index) => {
              return (
                <tr key={index} data-tr={index}>
                  <th className="has-text-centered">{stack.name}</th>
                  <td className="has-text-centered">
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
                              style={
                                (!!stack.description.font && { fontFamily: stack.description.font }) || {}
                              }
                            />
                          </UIModal>
                        </div>
                      </>
                    ) : (
                      void 0
                    )}
                  </td>
                  <td>
                    <div className="buttons is-justify-content-center is-flex-direction-column has-text-left">
                      <button
                        onClick={() => openModal('___stackRM__stackName_' + index)}
                        type="button"
                        className="button is-small is-danger"
                      >
                        <UIIcon name="trash" />
                      </button>

                      <UIModal
                        id={'___stackRM__stackName_' + index}
                        title={`Remover a Stack [${stack.name}] do post?`}
                        primaryButton={{
                          label: 'Sim, remover',
                          design: 'warning',
                          closeModalOnClick: false,
                          onClick: () => {
                            closeModal('___stackRM__stackName_' + index, () => {
                              const tr = document.querySelector<HTMLTableRowElement>(`[data-tr="${index}"]`)!
                              toasterKT.animationTool.zoomOutEnd(tr).addEventOnCompletion(() => {
                                onClickDeleteButton(stacks.filter(({ uid }) => uid !== stack.uid))
                                toasterKT.animationTool.clean(tr)
                              })
                            })
                          },
                        }}
                        secondaryButton={{ label: 'Cancelar', design: 'link' }}
                      />
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
