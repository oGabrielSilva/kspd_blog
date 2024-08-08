import { createContext, Dispatch, SetStateAction, useState } from 'react'

export type TScreen =
  | 'DASHBOARD'
  | 'ALL_POSTS'
  | 'NEW_POST'
  | 'USER_POSTS'
  | 'USER_POSTS_PUBLISHED'
  | 'UNPUBLISHED_USER_POSTS'
  | 'POST_EDITION'
  | 'NEW_STACK'
  | 'EDIT_STACK'
  | 'ALL_STACKS'

interface IHomeContext {
  screen: TScreen
  setScreen: Dispatch<SetStateAction<TScreen>>
}

interface IProviderProps extends IChildren {}

export const HomeContext = createContext({} as IHomeContext)

export default function HomeContextProvider({ children }: IProviderProps) {
  const [screen, setScreen] = useState<TScreen>('ALL_POSTS')

  return <HomeContext.Provider value={{ screen, setScreen }}>{children}</HomeContext.Provider>
}
