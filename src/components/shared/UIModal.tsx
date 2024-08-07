import { closeModal } from '@app/lib/bulma/modals'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { forwardRef, useEffect, useRef } from 'react'

interface IModalButton extends IButton {
  closeModalOnClick?: boolean
}

interface IProps {
  id: string
  children?: JSX.Element
  title: string
  primaryButton?: IModalButton
  secondaryButton?: IModalButton
}

export const UIModal = forwardRef<HTMLDivElement, IProps>(function Modal(props, ref) {
  const modal = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (modal.current) {
      const inp = modal.current.querySelectorAll('input')

      if (inp) {
        const func = (e: KeyboardEvent) => {
          if (e.key.toLocaleLowerCase() === 'enter' && props.primaryButton?.onClick) {
            e.preventDefault()
            props.primaryButton.onClick(modal.current!.querySelector('[data-primary-button]')!)
          }
        }
        inp.forEach((input) => input.addEventListener('keydown', func))

        return () => inp.forEach((input) => input.removeEventListener('keydown', func))
      }
    }
  }, [props])

  return (
    <div ref={modal}>
      <div id={props.id} className="modal" ref={ref}>
        <div className="modal-background" />
        <div className="modal-card p-5" style={{ maxWidth: 620 }}>
          <header
            style={{
              boxShadow: 'unset',
              ...(props.children ? { backgroundColor: 'var(--bulma-modal-card-foot-background-color)' } : {}),
              ...(!props.primaryButton && !props.secondaryButton && !props.children
                ? { borderRadius: '1rem' }
                : {}),
            }}
            className="modal-card-head gap-1"
          >
            <h1 className="modal-card-title" style={{ maxWidth: 'calc(100% - 20px)' }}>
              {props.title}
            </h1>
            <button
              type="button"
              onClick={() => closeModal(props.id)}
              className="delete"
              aria-label="close"
            />
          </header>
          {props.children ? (
            <section
              style={{
                ...(!props.primaryButton && !props.secondaryButton ? { borderRadius: '0 0 1rem 1rem' } : {}),
              }}
              className="modal-card-body"
            >
              {props.children}
            </section>
          ) : (
            void 0
          )}
          {props.primaryButton || props.secondaryButton ? (
            <footer className="modal-card-foot is-justify-content-end">
              <div className="buttons">
                {props.secondaryButton && (
                  <button
                    data-secondary-button
                    type={props.secondaryButton.type ?? 'button'}
                    className={
                      'button is-' +
                      (props.secondaryButton?.design ?? '') +
                      (props.secondaryButton?.isOutlined ? ' is-outlined' : '')
                    }
                    onClick={(e) => {
                      if (props.secondaryButton?.onClick) props.secondaryButton?.onClick(e.currentTarget)
                      if (
                        typeof props.secondaryButton?.closeModalOnClick !== 'boolean' ||
                        props.secondaryButton.closeModalOnClick
                      ) {
                        closeModal(props.id)
                      }
                    }}
                  >
                    {props.secondaryButton.icon && (
                      <span className="icon is-small">
                        <FontAwesomeIcon aria-hidden icon={props.secondaryButton.icon} />
                      </span>
                    )}
                    <span>{props.secondaryButton.label}</span>
                  </button>
                )}

                {props.primaryButton && (
                  <button
                    data-primary-button
                    type={props.primaryButton.type ?? 'button'}
                    className={
                      'button is-' +
                      (props.primaryButton?.design ?? 'primary') +
                      (props.primaryButton?.isOutlined ? ' is-outlined' : '')
                    }
                    onClick={(e) => {
                      if (props.primaryButton?.onClick) props.primaryButton?.onClick(e.currentTarget)
                      if (props.primaryButton?.closeModalOnClick) closeModal(props.id)
                    }}
                  >
                    {props.primaryButton.icon && (
                      <span className="icon is-small">
                        <FontAwesomeIcon aria-hidden icon={props.primaryButton.icon} />
                      </span>
                    )}
                    <span>{props.primaryButton.label}</span>
                  </button>
                )}
              </div>
            </footer>
          ) : (
            void 0
          )}
        </div>
      </div>
    </div>
  )
})
