import { Auth } from '@app/lib/firebase/auth/Auth'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { User } from 'firebase/auth'
import { createContext, useCallback, useEffect, useState } from 'react'

import properties from '@resources/config/properties.json'

interface IAuthContext {
  user: User | null
  profile: IUser
  updateProfileState: (state: IUser) => void
}

const $recoveryProfileState = () => {
  const data = localStorage.getItem(properties.storage.user.profileKey)
  if (!data) return { pseudonym: '', bio: '', social: [] }
  const final = JSON.parse(data) as IUser
  return typeof final.bio === 'string' && typeof final.pseudonym === 'string' && Array.isArray(final.social)
    ? final
    : { pseudonym: '', bio: '', social: [] }
}

const $setProfileState = (state: IUser) =>
  localStorage.setItem(properties.storage.user.profileKey, JSON.stringify(state))

export const AuthContext = createContext({} as IAuthContext)

export default function AuthContextProvider({ children }: IChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<IUser>($recoveryProfileState())

  /**
   * @description -> Função usada para atualizar o state do usuário ao fazer login
   */
  const updateProfileState = useCallback((data: IUser) => {
    setProfile(data)
    $setProfileState(data)
  }, [])

  useEffect(() => {
    Auth.fast.addObserver('on:auth_state__changed', (user) => {
      setUser(user)
      if (!user) localStorage.removeItem(properties.storage.user.profileKey)
    })
    Firestore.fast.addUserObserver('on::data__user_changed', (data) => {
      if (data) {
        $setProfileState(data)
        setProfile(data)
      }
    })

    return () => {
      Auth.fast.removeObserver('on:auth_state__changed')
      Firestore.fast.removeUserObserver('on::data__user_changed')
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
