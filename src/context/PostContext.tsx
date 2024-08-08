import { createContext, Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

import { useAuth } from '@app/hooks/useAuth'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { Storage } from '@app/lib/firebase/storage/Storage'
import { Store } from '@app/lib/tauri-plugin-store/Store'
import properties from '@resources/config/properties.json'
import { listen } from '@tauri-apps/api/event'
import { Timestamp } from 'firebase/firestore'

interface IPostContext {
  posts: IPost[]
  editPostID: string | null
  setEditPostID: Dispatch<SetStateAction<string | null>>
  update(newState: IPost[], onComplete?: () => void): void
  reloadPosts(onComplete?: (state: IPost[]) => void): void
  deletePost(postId: string, onSuccess?: () => void, onFailure?: () => void): Promise<string>
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
  const [editPostID, setEditPostID] = useState<string | null>(null)

  const auth = useAuth()

  const update = useCallback<IPostContext['update']>((state, onComplete?: () => void) => {
    $setPostState(state)
    setPosts(state)

    if (onComplete) onComplete()
  }, [])

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

  const deletePost = useCallback<IPostContext['deletePost']>(
    (postId, onSuccess, onFailure) => {
      return new Promise((resolve, reject) => {
        reloadPosts((posts) => {
          const post = posts.find((p) => p.uid === postId)
          if (!post) return reject(new Error('Post não encontrado'))
          const fn = () => {
            Firestore.fast
              .delete('post', postId)
              .then(() => {
                resolve('Sucesso')
                update(posts.filter((p) => p.uid !== postId))
                if (onSuccess) onSuccess()
              })
              .catch((e) => {
                console.log(e)
                reject('Erro ao apagar o documento (Console)')
                if (onFailure) onFailure()
              })
          }

          if (post.mediaImage) {
            Storage.fast
              .deleteAll('post', postId)
              .then((res) => {
                if (res) fn()
              })
              .catch((e) => {
                console.log(e)
                reject('Erro ao apagar a imagem de mídia principal (Console)')
              })
          } else fn()
        })
      })
    },
    [reloadPosts, update],
  )

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

    return () => {
      unlisten.then((ul) => ul())
    }
  }, [])

  return (
    <PostContext.Provider
      value={{
        posts,
        update,
        reloadPosts,
        editPostID,
        setEditPostID,
        deletePost,
      }}
    >
      {children}
    </PostContext.Provider>
  )
}
