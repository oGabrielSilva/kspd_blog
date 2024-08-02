import { UIModal } from '@app/components/shared/UIModal'
import { useStacks } from '@app/hooks/useStacks'
import { openModal } from '@app/lib/bulma/modals'
import { generateWinw } from '@app/utils/generateWinw'
import { minimizeText } from '@app/utils/minimizeText'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import { Dispatch, SetStateAction } from 'react'

interface IProps {
  openUP?: boolean
  id: string
  selectedStacks: IStack[]
  setSelectedStacks: Dispatch<SetStateAction<IStack[]>>
}

export function UIStackPick(props: IProps) {
  const { reloadStacks, stacks } = useStacks()

  return (
    <div>
      <button
        type="button"
        className="button is-link"
        style={{ width: '100%' }}
        onClick={() => openModal('uiModal__' + props.id)}
      >
        <span>Editar Stacks</span>
        <span className="icon is-small">
          <FontAwesomeIcon aria-hidden icon="cubes-stacked" />
        </span>
      </button>
      <UIModal
        id={'uiModal__' + props.id}
        title="Selecione as Stacks"
        primaryButton={{
          label: 'Salvar Stacks',
          closeModalOnClick: true,
          design: 'link',
        }}
      >
        <div>
          <div className="pb-5 is-flex is-align-items-center gap-3">
            <button
              className="button"
              style={{ width: '100%' }}
              type="button"
              onClick={() => {
                ScreenLockerKassiopeiaTool.fast.lock()
                reloadStacks(() => {
                  ScreenLockerKassiopeiaTool.fast.unlock()
                })
              }}
            >
              <span>Atualizar lista de Stacks</span>
              <span className="icon is-small">
                <FontAwesomeIcon aria-hidden icon="rotate" />
              </span>
            </button>
            <button
              className="button is-primary is-outlined"
              onMouseEnter={({ currentTarget }) => currentTarget.classList.remove('is-outlined')}
              onMouseLeave={({ currentTarget }) => currentTarget.classList.add('is-outlined')}
              style={{ width: '100%' }}
              type="button"
              onClick={() => {
                generateWinw('/new-stack').then((winw) => {
                  winw.setFocus()
                })
              }}
            >
              <span>Adicionar nova Stack</span>
              <span className="icon is-small">
                <FontAwesomeIcon aria-hidden icon="store" />
              </span>
            </button>
          </div>
          <div className="buttons">
            {stacks.map((stack, index) => {
              return (
                <button
                  style={{ whiteSpace: 'wrap' }}
                  type="button"
                  key={index}
                  className={'button is-dark'.concat(
                    props.selectedStacks.find((st) => st.uid === stack.uid) ? ' is-info is-inverted' : '',
                  )}
                  onClick={() => {
                    const find = props.selectedStacks.find((st) => st.uid === stack.uid)
                    props.setSelectedStacks((st) =>
                      find ? st.filter(({ uid }) => uid !== stack.uid) : [...st, stack],
                    )
                  }}
                >
                  <span>
                    <strong>{stack.name}: </strong>
                    <small>{minimizeText(stack.metaDescription, 160)}</small>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </UIModal>
    </div>
  )
}
