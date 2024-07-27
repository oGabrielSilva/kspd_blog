import { UIAllStacks } from '@app/components/home/stack/UIAllStacks'
import { UIEditStack } from '@app/components/home/stack/UIEditStack'
import { UINewStack } from '@app/components/home/stack/UINewStack'
import { UINewPost } from '@app/components/home/UINewPost'
import { UIVerifyEmail } from '@app/components/home/UIVerifyEmail'
import { HomeContext } from '@app/context/HomeContext'
import { useAuth } from '@app/hooks/useAuth'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const auth = useAuth()
  const nav = useNavigate()
  const { screen } = useContext(HomeContext)

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

  return (auth.isAnonymous && <div />) || !userVerified ? (
    <UIVerifyEmail />
  ) : (
    <div className="container p-5">
      {(screen === 'NEW_POST' && <UINewPost />) ||
        (screen === 'NEW_STACK' && <UINewStack />) ||
        (screen === 'EDIT_STACK' && <UIEditStack />) ||
        (screen === 'ALL_STACKS' && <UIAllStacks />)}
    </div>
  )
}
