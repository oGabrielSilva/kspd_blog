export declare global {
  interface IChildren {
    children: JSX.Element
  }

  interface ISocial {
    id: number
    name: string
    url: string
  }

  interface IUser {
    username: string
    bio: string
    social: ISocial[]
  }
}
