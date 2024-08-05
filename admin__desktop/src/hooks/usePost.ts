import { PostContext } from '@app/context/PostContext'
import { useContext } from 'react'

export function usePosts() {
  const { posts, reloadPosts, update, editPostID, setEditPostID } = useContext(PostContext)

  return { posts, reloadPosts, update, editPostID, setEditPostID }
}
