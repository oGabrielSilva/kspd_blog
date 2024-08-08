import { AuthContext } from '@app/context/AuthContext'
import { Auth } from '@app/lib/firebase/auth/Auth'
import { useContext, useEffect, useState } from 'react'

const auth = Auth.fast

export function useAuth() {
  const { user, profile } = useContext(AuthContext)

  const [isAnonymous, setIsAnonymous] = useState(user === null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setIsAnonymous(user === null)
  }, [user])

  useEffect(() => {
    auth.onReady(() => setReady(true))
  }, [])

  return { user: user, isAnonymous, handler: auth, ready, profile }
}
