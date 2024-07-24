import { Auth } from '@app/lib/firebase/auth/Auth'
import { FirebaseApp } from '@app/lib/firebase/FirebaseApp'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'

interface IObserver {
  id: string
  cb: (data: IUser | null) => void
}

export class Firestore {
  private static inst: Firestore

  private readonly app = FirebaseApp.fast
  private readonly firestore = getFirestore(this.app.app)
  private userObservers: IObserver[] = []

  private constructor() {}

  public addUserObserver(id: string, observer: IObserver['cb']) {
    const index = this.userObservers.findIndex((ob) => ob.id === id)
    if (index === -1) {
      this.userObservers.push({ cb: observer, id })
    } else this.userObservers[index].cb = observer
  }

  public removeUserObserver(id: string) {
    this.userObservers = this.userObservers.filter((ob) => ob.id !== id)
  }

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
          this.userObservers.forEach((ob) => ob.cb(data))
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
      return info.exists() ? (info.data() as IUser) : ({ bio: '', social: [], pseudonym: '' } as IUser)
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
