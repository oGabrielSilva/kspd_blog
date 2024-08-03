import { HomeContext } from '@app/context/HomeContext'
import { PostContext } from '@app/context/PostContext'
import { useContext } from 'react'

export function usePosts() {
  const { setScreen } = useContext(HomeContext)
  const { posts, reloadPosts, update, postEditing, setPostEditing } = useContext(PostContext)

  const putToEdition = (post: IPost) => {
    setPostEditing((p) => (p !== null && p.uid === post.uid ? p : post))
    setScreen('POST_EDITION')
  }

  return { posts, reloadPosts, update, postEditing, putToEdition }
}
