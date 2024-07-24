import { TSocialIcon } from '@app/utils/socialIcons'

export declare global {
  interface IChildren {
    children: JSX.Element
  }

  interface ISocial {
    id: number
    name: string
    url: string
    icon: TSocialIcon
  }

  interface IUser {
    pseudonym: string
    bio: string
    social: ISocial[]
  }

  interface IButton {
    design?: 'success' | 'danger' | 'warning' | 'link' | 'ghost' | 'none' | 'primary' | 'info'
    label: string
    type?: 'button' | 'submit' | 'reset' | undefined | null
    isOutlined?: boolean
    icon?: IconProp
    onClick?: (button: HTMLButtonElement) => void
  }
}
