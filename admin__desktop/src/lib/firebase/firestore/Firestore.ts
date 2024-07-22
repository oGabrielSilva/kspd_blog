import { Auth } from '@app/lib/firebase/auth/Auth'
import { FirebaseApp } from '@app/lib/firebase/FirebaseApp'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'

export class Firestore {
  private static inst: Firestore

  private readonly app = FirebaseApp.fast
  private readonly firestore = getFirestore(this.app.app)

  private constructor() {}

  public setUserData(data: IUser) {
    const user = Auth.fast.user
    return new Promise<IUser>((resolve, reject) => {
      try {
        if (!user) {
          toasterKT.danger('Permissão negada. Usuário não definido')
          return reject(null)
        }
        setDoc(doc(this.firestore, 'users', user.uid), data).then(() => {
          resolve(data)
        })
      } catch (error) {
        console.log(error)
        toasterKT.danger()
        reject(error)
      }
    })
  }

  public async getUserData() {
    try {
      const user = Auth.fast.user
      if (!user) {
        toasterKT.danger('Permissão negada. Usuário não definido')
        return null
      }

      const info = await getDoc(doc(this.firestore, 'users', user.uid))
      return info.exists() ? (info.data() as IUser) : ({ bio: '', social: [], username: '' } as IUser)
    } catch (error) {
      console.log(error)
      toasterKT.danger()
    }
  }

  public static get fast() {
    if (!Firestore.inst) {
      Firestore.inst = new Firestore()
    }
    return Firestore.inst
  }
}
