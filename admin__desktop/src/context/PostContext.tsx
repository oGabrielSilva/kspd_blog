import { createContext, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

import { useAuth } from '@app/hooks/useAuth'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { Store } from '@app/lib/tauri-plugin-store/Store'
import properties from '@resources/config/properties.json'
import { listen } from '@tauri-apps/api/event'
import { Timestamp } from 'firebase/firestore'

interface IPostContext {
  posts: IPost[]
  postEditing: IPost | null
  setPostEditing: Dispatch<SetStateAction<IPost | null>>
  update: (newState: IPost[], onComplete?: () => void) => void
  reloadPosts: (onComplete?: (state: IPost[]) => void) => void
}

export const reloadPostEventId = 'reload-post-from-local'

const $recoveryPostState = async () => {
  const data = await Store.get<IPost[]>(properties.storage.post.storageKey)
  if (!data) return []
  return Array.isArray(data)
    ? data.map((d) => ({
        ...d,
        createdAt: new Timestamp(d.createdAt.seconds, d.createdAt.nanoseconds),
        updatedAt: new Timestamp(d.updatedAt.seconds, d.updatedAt.nanoseconds),
      }))
    : []
}

const $setPostState = async (state: IPost[]) => {
  await Store.save(state, properties.storage.post.storageKey)
}

export const PostContext = createContext({} as IPostContext)

export default function PostContextProvider({ children }: IChildren) {
  const [loaded, setLoaded] = useState(false)
  const [posts, setPosts] = useState<IPost[]>([])
  const [postEditing, setPostEditing] = useState<IPost | null>(null)

  const auth = useAuth()

  const reloadPosts = useCallback<IPostContext['reloadPosts']>((onLoad) => {
    let sts = [] as IPost[]
    Firestore.fast
      .getDocs('post')
      .then((data) => {
        if (data) {
          sts = data.map((d) => d.data() as IPost)
          setPosts(sts)
          $setPostState(sts)
        }
      })
      .catch(() => setPosts([]))
      .finally(() => {
        if (onLoad) onLoad(sts)
      })
  }, [])

  useEffect(() => {
    if (!loaded) {
      setLoaded(true)
      $recoveryPostState().then((s) => setPosts(s))
    }
  }, [loaded])

  useEffect(() => {
    const obID = 'posts__ctx__observerID_from_ctx'
    auth.handler.addObserver(obID, (user) => {
      if (!user) Store.remove(properties.storage.post.storageKey)
    })

    return () => auth.handler.removeObserver(obID)
  }, [auth])

  useEffect(() => {
    const unlisten = listen(reloadPostEventId, async () => {
      setPosts(await $recoveryPostState())
    })

    return () =>
      (() => {
        unlisten.then((ul) => ul())
      })()
  }, [])

  return (
    <PostContext.Provider
      value={{
        posts,
        update: (state, onComplete?: () => void) => {
          $setPostState(state)
          setPosts(state)

          if (onComplete) onComplete()
        },
        reloadPosts,
        postEditing,
        setPostEditing,
      }}
    >
      {children}
    </PostContext.Provider>
  )
}
