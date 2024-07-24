import { UIVerifyEmail } from '@app/components/home/UIVerifyEmail'
import { useAuth } from '@app/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const auth = useAuth()
  const nav = useNavigate()

  const [userVerified, setUserVerified] = useState(auth.user?.emailVerified ?? false)

  useEffect(() => {
    if (!userVerified) {
      auth.handler.addObserver('home__email-verified', (user) => {
        setUserVerified(user?.emailVerified ?? false)
      })
      return () => auth.handler.removeObserver('home__email-verified')
    }
  }, [auth, userVerified])

  useEffect(() => {
    if (auth.isAnonymous) nav('/session')
  }, [auth, nav])

  return (auth.isAnonymous && <div />) || !userVerified ? <UIVerifyEmail /> : <div />
}
