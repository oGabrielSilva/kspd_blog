import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from 'react'

interface IProps {
  label: string
  value: string
  id?: string
  placeholder?: string
  iconLeft?: IconProp
  iconRight?: IconProp
  isDanger?: boolean
  helper?: {
    label: string
    design?: 'danger' | 'success' | 'info' | 'warning' | 'normal'
    isVisible: boolean
  }
  onImputed?: (value: string, input: HTMLTextAreaElement) => void
  extra?: DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>
  rows?: number
}

export const UITextarea = forwardRef<HTMLTextAreaElement, IProps>(function UITextarea(props, ref) {
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
        <textarea
          ref={ref}
          id={id}
          className={props.isDanger ? 'is-danger textarea input' : 'textarea input'}
          placeholder={props.placeholder}
          value={props.value}
          onInput={(evt) =>
            props.onImputed ? props.onImputed(evt.currentTarget.value, evt.currentTarget) : void 0
          }
          {...(props.extra ? props.extra : {})}
          rows={props.rows ?? 5}
        />
        {props.iconLeft ? (
          <span style={{ paddingTop: '0.5em' }} className="icon is-small is-left">
            <FontAwesomeIcon className={props.isDanger ? 'has-text-danger' : ''} icon={props.iconLeft} />
          </span>
        ) : (
          void 0
        )}
        {props.iconRight ? (
          <span style={{ paddingTop: '0.5em' }} className="icon is-small is-right">
            <FontAwesomeIcon className={props.isDanger ? 'has-text-danger' : ''} icon={props.iconRight} />
          </span>
        ) : (
          void 0
        )}
      </div>
      {props.helper && props.helper.isVisible ? (
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
