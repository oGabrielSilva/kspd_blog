import { AuthContext } from '@app/context/AuthContext'
import { Auth } from '@app/lib/firebase/auth/Auth'
import { useContext, useEffect, useState } from 'react'

const auth = Auth.fast

export function useAuth() {
  const { user } = useContext(AuthContext)

  const [isAnonymous, setIsAnonymous] = useState(user === null)
  const [profile, setProfile] = useState<IUser>({ bio: '', social: [], username: '' })

  useEffect(() => {
    setIsAnonymous(user === null)
  }, [user])

  return { user: user, isAnonymous, handler: auth, profile, setProfile }
}
