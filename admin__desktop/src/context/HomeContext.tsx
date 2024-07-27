import { createContext, Dispatch, SetStateAction, useState } from 'react'

export type TScreen =
  | 'DASHBOARD'
  | 'GLOBAL_POSTS'
  | 'NEW_POST'
  | 'USER_POSTS'
  | 'NEW_STACK'
  | 'ALL_STACKS'
  | 'MANAGE_POSTS'
  | 'MANAGE_USERS'
  | 'MANAGE_STACKS'

interface IHomeContext {
  screen: TScreen
  setScreen: Dispatch<SetStateAction<TScreen>>
}

export const HomeContext = createContext({} as IHomeContext)

export default function HomeContextProvider({ children }: IChildren) {
  const [screen, setScreen] = useState<TScreen>('ALL_STACKS')

  return <HomeContext.Provider value={{ screen, setScreen }}>{children}</HomeContext.Provider>
}
