import { TSocialIcon } from '@app/utils/socialIcons'
import { type Timestamp } from 'firebase/firestore'
import { ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'

export declare global {
  type IFontName =
    | 'Inter'
    | 'Lato'
    | 'Roboto'
    | 'PT Serif'
    | 'JetBrains Mono'
    | 'Tinos'
    | 'Reddit Mono'
    | 'Reddit Sans'
    | 'IBM Plex Serif'
    | 'IBM Plex Mono'

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

  interface IMedia {
    src: string
    description: string
    figcaption: string
    loadType: 'eager' | 'lazy'
    type: 'IMAGE'
  }

  interface IStack {
    uid: string
    name: string
    description: { content: string | null; font: IFontName | null }
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

  interface IPost {
    uid: string
    title: string
    slug: string
    htmlContent: string
    description: { content: string | null; font: IFontName | null }
    metaDescription: string
    keywords: string[]
    views: number
    font: IFontName
    isPublished: boolean
    isLocked: boolean
    mediaImage: IMedia | null
    contentMedia: IMedia[] | null | undefined
    authorID: string
    stacks: Pick<IStack, 'uid' | 'name' | 'description'>[]
    createdAt: Timestamp
    updatedAt: Timestamp
  }

  interface IPostDraft {
    uid: string
    content: string
    font: IFontName
  }

  // eslint-disable-next-line no-var
  var locker: ScreenLockerKassiopeiaTool
}
