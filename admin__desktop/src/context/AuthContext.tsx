import { Auth } from '@app/lib/firebase/auth/Auth'
import { User } from 'firebase/auth'
import { createContext, useEffect, useMemo, useState } from 'react'

interface IAuthContext {
  user: User | null
}

export const AuthContext = createContext({} as IAuthContext)

export default function AuthContextProvider({ children }: IChildren) {
  const [user, setUser] = useState<User | null>(null)

  const value = useMemo<IAuthContext>(() => {
    return { user }
  }, [user])

  useEffect(() => {
    Auth.fast.addObserver('on:auth_state__changed', (user) => {
      setUser(user)
    })

    return () => Auth.fast.removeObserver('on:auth_state__changed')
  }, [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
