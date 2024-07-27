import { TSocialIcon } from '@app/utils/socialIcons'
import { type Timestamp } from 'firebase/firestore'

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

  interface IStack {
    uid: string
    name: string
    description: string | null
    metaDescription: string
    isLocked: boolean
    createdBy: string
    updatedBy: string
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  interface IFont {
    face: string
    generic: string
  }

  interface ILang {
    code: string
    label: string
  }

  interface IPost {
    uid: string
    title: string
    slug: string
    htmlContent: string
    description: string
    metaDescription: string
    keywords: string[]
    views: number
    font: IFont
    lang: ILang
    isPublished: boolean
    isLocked: boolean
    mediaImage: string | null
    authorID: string
    stacks: Pick<IStack, 'name' | 'description'>[]
    createdAt: Timestamp
    updatedAt: Timestamp
  }
}
