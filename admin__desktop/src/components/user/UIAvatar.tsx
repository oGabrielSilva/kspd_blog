import { useAuth } from '@app/hooks/useAuth'
import avatarPlaceholder from '@resources/img/user-placeholder.jpg'
import { useNavigate } from 'react-router-dom'

interface IProps {
  size?: number
  url?: string
  basicTooltip?: string
  linkToProfile?: boolean
  removeCursorPointer?: boolean
  onClick?: (img: HTMLImageElement) => void
}

export function UIAvatar(props: IProps) {
  const auth = useAuth()
  const nav = useNavigate()

  return (
    <figure className="is-rounded">
      <img
        style={{
          width: props.size || '1.5rem',
          height: props.size || '1.5rem',
          objectFit: 'cover',
          borderRadius: '100%',
          ...(props.removeCursorPointer ? {} : { cursor: 'pointer' }),
        }}
        src={
          (props.url && props.url) || auth.isAnonymous
            ? avatarPlaceholder
            : (auth.user?.photoURL ?? avatarPlaceholder)
        }
        alt={'Avatar' + auth.user ? ` do usuário ${auth.user?.displayName}` : ''}
        title={props.basicTooltip}
        onClick={(e) => {
          if (props.onClick) props.onClick(e.currentTarget)
          if (props.linkToProfile) nav('/user')
        }}
      />
    </figure>
  )
}
