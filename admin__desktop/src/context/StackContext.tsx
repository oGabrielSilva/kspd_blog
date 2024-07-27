import { createContext, useCallback, useEffect, useState } from 'react'

import { useAuth } from '@app/hooks/useAuth'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import properties from '@resources/config/properties.json'

interface IStackContext {
  stacks: IStack[]
  update: (state: IStack[]) => void
  reloadStacks: (onComplete?: (stacks: IStack[]) => void) => void
}

const $recoveryStacksState = () => {
  const data = localStorage.getItem(properties.storage.stacks.storageKey)
  if (!data) return []
  const final = JSON.parse(data) as IStack[]
  return Array.isArray(final) ? final : []
}

const $setStacksState = (state: IStack[]) =>
  localStorage.setItem(properties.storage.stacks.storageKey, JSON.stringify(state))

export const StackContext = createContext({} as IStackContext)

export default function StackContextProvider({ children }: IChildren) {
  const [stacks, setStacks] = useState<IStack[]>($recoveryStacksState())

  const auth = useAuth()

  const reloadStacks = useCallback<IStackContext['reloadStacks']>((onLoad) => {
    Firestore.fast
      .getDocs('stacks')
      .then((data) => {
        if (data) {
          const sts = data.map((d) => d.data() as IStack)
          setStacks(sts)
          $setStacksState(sts)
          if (onLoad) onLoad(sts)
        }
      })
      .catch(() => setStacks([]))
  }, [])

  useEffect(() => {
    const obID = 'stacks__ctx__observerid'
    auth.handler.addObserver(obID, (user) => {
      if (!user) localStorage.removeItem(properties.storage.stacks.storageKey)
    })

    return () => auth.handler.removeObserver(obID)
  }, [auth])

  return (
    <StackContext.Provider
      value={{
        stacks,
        update: (state) => {
          $setStacksState(state)
          setStacks(state)
        },
        reloadStacks,
      }}
    >
      {children}
    </StackContext.Provider>
  )
}
