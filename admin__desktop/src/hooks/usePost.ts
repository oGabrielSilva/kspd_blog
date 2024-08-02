import { PostContext } from '@app/context/PostContext'
import { Store } from '@app/lib/tauri-plugin-store/Store'
import { generateWinw } from '@app/utils/generateWinw'
import properties from '@resources/config/properties.json'
import { useContext } from 'react'

export function usePosts() {
  const { posts, reloadPosts, update } = useContext(PostContext)
  // const nav = useNavigate()

  const editPost = (post: IPost) => {
    const winw = generateWinw('/edit-post/' + post.uid, {
      center: true,
      decorations: false,
      focus: true,
      height: innerHeight,
      width: 1024,
      hiddenTitle: true,
      labelId: 'page__edit',
      transparent: true,
    })

    winw.then((w) => w.maximize())
  }

  const saveDraft = async (draft: IPostDraft) => {
    const instance = await Store.get<IPostDraft[]>(properties.storage.post.draftStorageKey)
    if (!instance || !Array.isArray(instance)) {
      await Store.save<IPostDraft[]>([draft], properties.storage.post.draftStorageKey)
      return
    }
    let finded = false
    const newInstance = instance.map((d) => {
      if (d.uid === draft.uid) {
        finded = true
        return draft
      }
      return d
    })
    if (!finded) newInstance.push(draft)
    await Store.save(newInstance, properties.storage.post.draftStorageKey)
  }

  const removeDraft = async (postUid: string) => {
    const instance = await Store.get<IPostDraft[]>(properties.storage.post.draftStorageKey)
    if (instance)
      await Store.save(
        instance.filter((draft) => draft.uid !== postUid),
        properties.storage.post.draftStorageKey,
      )
  }

  const loadDraft = async (postUid: string) => {
    const instance = await Store.get<IPostDraft[]>(properties.storage.post.draftStorageKey)
    return instance ? (instance.find((draft) => draft.uid === postUid) ?? null) : null
  }

  return { posts, reloadPosts, update, editPost, saveDraft, loadDraft, removeDraft }
}
