import { useAuth } from '@app/hooks/useAuth'
import avatarPlaceholder from '@resources/img/user-placeholder.jpg'
import { useEffect, useState } from 'react'
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

  const [url, setURL] = useState<string>(avatarPlaceholder)
  const [isSkeleton, setSkeleton] = useState(true)

  useEffect(() => {
    if (props.url) setURL(props.url)
  }, [props])

  useEffect(() => {
    if (!props.url) {
      auth.handler.onReady(() => {
        setURL(auth.user?.photoURL ? auth.user.photoURL : avatarPlaceholder)
      })
    }
  }, [auth, props])

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
        src={url}
        alt={'Avatar' + auth.user ? ` do usuário ${auth.user?.displayName}` : ''}
        title={props.basicTooltip}
        onClick={(e) => {
          if (props.onClick) props.onClick(e.currentTarget)
          if (props.linkToProfile) nav('/user')
        }}
        className={isSkeleton ? 'is-skeleton' : ''}
        onLoad={() => setSkeleton(false)}
      />
    </figure>
  )
}
