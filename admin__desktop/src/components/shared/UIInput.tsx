import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DetailedHTMLProps, forwardRef, HTMLInputTypeAttribute, InputHTMLAttributes } from 'react'

interface IProps {
  label: string
  value: string
  id?: string
  placeholder?: string
  type?: HTMLInputTypeAttribute
  iconLeft?: IconProp
  iconRight?: IconProp
  isDanger?: boolean
  helper?: {
    label: string
    design?: 'danger' | 'success' | 'info' | 'warning' | 'normal'
    isVisible: boolean
  }
  onImputed?: (value: string, input: HTMLInputElement) => void
  extra?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
}

export const UIInput = forwardRef<HTMLInputElement, IProps>(function UIInput(props, ref) {
  const id = props.id
    ? props.id
    : Date.now().toString(36) + '___' + Math.random().toString().replace('.', '___')

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {props.label}
      </label>
      <div
        className={`control ${props.iconLeft ? 'has-icons-left' : ''} ${props.iconRight ? 'has-icons-right' : ''}`}
      >
        <input
          ref={ref}
          id={id}
          className={props.isDanger && props.value.length > 0 ? 'is-danger input' : 'input'}
          type={props.type ?? 'text'}
          placeholder={props.placeholder}
          value={props.value}
          onInput={(evt) =>
            props.onImputed ? props.onImputed(evt.currentTarget.value, evt.currentTarget) : void 0
          }
          {...(props.extra ? props.extra : {})}
        />
        {props.iconLeft ? (
          <span className="icon is-small is-left">
            <FontAwesomeIcon className={props.isDanger ? 'has-text-danger' : ''} icon={props.iconLeft} />
          </span>
        ) : (
          void 0
        )}
        {props.iconRight ? (
          <span className="icon is-small is-right">
            <FontAwesomeIcon className={props.isDanger ? 'has-text-danger' : ''} icon={props.iconRight} />
          </span>
        ) : (
          void 0
        )}
      </div>
      {props.helper && props.helper.isVisible && props.value.length > 0 ? (
        <p
          className={`help ${props.helper.design && props.helper.design !== 'normal' ? 'is-' + props.helper.design : ''}`}
        >
          {props.helper.label}
        </p>
      ) : (
        void 0
      )}
    </div>
  )
})
