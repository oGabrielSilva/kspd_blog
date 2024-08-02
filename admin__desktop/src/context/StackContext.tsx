import { createContext, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

import { useAuth } from '@app/hooks/useAuth'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { Store } from '@app/lib/tauri-plugin-store/Store'
import properties from '@resources/config/properties.json'
import { listen } from '@tauri-apps/api/event'

interface IStackContext {
  stacks: IStack[]
  editStack: IStack | null
  setEditStack: Dispatch<SetStateAction<IStack | null>>
  update: (newState: IStack[], onComplete?: () => void) => void
  reloadStacks: (onComplete?: (stacks: IStack[]) => void) => void
}

export const reloadStackEventId = 'reload-stacks-from-local'

const $recoveryStacksState = async () => {
  // const data = localStorage.getItem(properties.storage.stack.storageKey)
  // if (!data) return []
  // const final = JSON.parse(data) as IStack[]
  // return Array.isArray(final) ? final : []
  const data = await Store.get<IStack[]>(properties.storage.stack.storageKey)
  console.log({ data })
  if (!data) return []
  return Array.isArray(data) ? data : []
}

const $setStacksState = async (state: IStack[]) => {
  // localStorage.setItem(properties.storage.stack.storageKey, JSON.stringify(state))
  await Store.save(state, properties.storage.stack.storageKey)
}

export const StackContext = createContext({} as IStackContext)

export default function StackContextProvider({ children }: IChildren) {
  const [loaded, setLoaded] = useState(false)
  const [stacks, setStacks] = useState<IStack[]>([])
  const [editStack, setEditStack] = useState<IStack | null>(null)

  const auth = useAuth()

  const reloadStacks = useCallback<IStackContext['reloadStacks']>((onLoad) => {
    let sts = [] as IStack[]
    Firestore.fast
      .getDocs('stacks')
      .then((data) => {
        if (data) {
          sts = data.map((d) => d.data() as IStack)
          setStacks(sts)
          $setStacksState(sts)
        }
      })
      .catch(() => setStacks([]))
      .finally(() => {
        if (onLoad) onLoad(sts)
      })
  }, [])

  useEffect(() => {
    if (!loaded) {
      setLoaded(true)
      $recoveryStacksState().then((s) => setStacks(s))
    }
  }, [loaded])

  useEffect(() => {
    const obID = 'stacks__ctx__observerid'
    auth.handler.addObserver(obID, (user) => {
      if (!user) Store.remove(properties.storage.stack.storageKey)
    })

    return () => auth.handler.removeObserver(obID)
  }, [auth])

  useEffect(() => {
    const unlisten = listen(reloadStackEventId, async () => {
      setStacks(await $recoveryStacksState())
    })

    return () =>
      (() => {
        unlisten.then((ul) => ul())
      })()
  }, [])

  return (
    <StackContext.Provider
      value={{
        stacks,
        editStack,
        setEditStack,
        update: (state, onComplete?: () => void) => {
          $setStacksState(state)
          setStacks(state)

          if (onComplete) onComplete()
        },
        reloadStacks,
      }}
    >
      {children}
    </StackContext.Provider>
  )
}
