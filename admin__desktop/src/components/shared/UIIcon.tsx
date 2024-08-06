import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IProps {
  ariaHidden?: boolean
  name: IconProp
}

export function UIIcon({ name, ariaHidden }: IProps) {
  return (
    <span className="icon is-small">
      <FontAwesomeIcon aria-hidden={Boolean(ariaHidden)} icon={name} />
    </span>
  )
}
