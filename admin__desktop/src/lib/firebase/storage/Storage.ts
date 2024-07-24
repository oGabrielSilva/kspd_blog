import { Auth } from '@app/lib/firebase/auth/Auth'
import { AuthenticationError } from '@app/lib/firebase/constants/AuthenticationError'
import { FirebaseApp } from '@app/lib/firebase/FirebaseApp'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FirebaseError } from 'firebase/app'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

export class Storage {
  private static inst: Storage

  private app = FirebaseApp.fast
  private storage = getStorage(this.app.app)

  public async uploadBlob(blob: Blob, path: string, metadata?: Record<string, string>) {
    const user = Auth.fast.user
    if (!user) {
      toasterKT.danger('Usuário desconhecido')
      return
    }
    try {
      const r = ref(this.storage, path)
      const result = await uploadBytes(r, blob, {
        customMetadata: metadata ? { ...metadata, owner: user.uid } : {},
        contentType: blob.type,
      })
      const url = await getDownloadURL(result.ref)
      return (
        url +
        '?serial='.concat(encodeURIComponent(Date.now() + Date.now().toString(36) + Math.random().toString()))
      )
    } catch (error) {
      console.log(error)
      if (error instanceof FirebaseError) toasterKT.danger(AuthenticationError.messages[error.code])
      else toasterKT.danger('Oopss... algum erro ocorreu ao salvar a imagem')
      return null
    }
  }

  public async uploadAvatar(blob: Blob, metadata?: Record<string, string>) {
    const user = Auth.fast.user
    if (!user) {
      toasterKT.danger('Usuário desconhecido')
      return
    }
    return await this.uploadBlob(blob, 'avatar/' + user.uid, metadata)
  }

  public static get fast() {
    if (!Storage.inst) {
      Storage.inst = new Storage()
    }

    return Storage.inst
  }
}
