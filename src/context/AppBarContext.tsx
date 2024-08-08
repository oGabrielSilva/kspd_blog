import { createContext, Dispatch, SetStateAction, useState } from 'react'

interface IContext {
  menuOffcanvasIsVisible: boolean
  setMenuOffCanvasVisibility: Dispatch<SetStateAction<boolean>>

  goBackButtonIsVisible: boolean
  setGoBackButtonVisibility: Dispatch<SetStateAction<boolean>>

  profileIsVisible: boolean
  setProfileVisibility: Dispatch<SetStateAction<boolean>>

  closeButtonIsVisible: boolean
  setCloseButtonVisibility: Dispatch<SetStateAction<boolean>>

  reset: () => void
}

export const AppBarContext = createContext({} as IContext)

export default function AppBarContextProvider({ children }: IChildren) {
  const [menuOffcanvasIsVisible, setMenuOffCanvasVisibility] = useState(true)
  const [goBackButtonIsVisible, setGoBackButtonVisibility] = useState(true)
  const [profileIsVisible, setProfileVisibility] = useState(true)
  const [closeButtonIsVisible, setCloseButtonVisibility] = useState(true)

  return (
    <AppBarContext.Provider
      value={{
        menuOffcanvasIsVisible,
        setMenuOffCanvasVisibility,
        goBackButtonIsVisible,
        setGoBackButtonVisibility,
        profileIsVisible,
        setProfileVisibility,
        closeButtonIsVisible,
        setCloseButtonVisibility,
        reset: () => {
          setMenuOffCanvasVisibility(true)
          setGoBackButtonVisibility(true)
          setProfileVisibility(true)
          setCloseButtonVisibility(true)
        },
      }}
    >
      {children}
    </AppBarContext.Provider>
  )
}
