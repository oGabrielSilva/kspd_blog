import { Auth } from '@app/lib/firebase/auth/Auth'
import { FirebaseApp } from '@app/lib/firebase/FirebaseApp'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  query,
  QueryFieldFilterConstraint,
  setDoc,
  WithFieldValue,
} from 'firebase/firestore'

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

  public async delete(...ref: string[]) {
    try {
      await deleteDoc(doc(this.firestore, ref.join('/')))
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  public upload(data: WithFieldValue<DocumentData>, ...path: string[]) {
    const user = Auth.fast.user
    return new Promise<typeof data>((resolve, reject) => {
      try {
        if (!user) {
          toasterKT.danger('Permissão negada. Usuário não definido')
          return reject(null)
        }
        setDoc(doc(this.firestore, path.join('/')), data).then(() => {
          resolve(data)
        })
      } catch (error) {
        console.log(error)
        toasterKT.danger()
        reject(error)
      }
    })
  }

  public async getDocs(...path: string[]) {
    try {
      const user = Auth.fast.user
      if (!user) {
        toasterKT.danger('Permissão negada. Usuário não definido')
        return null
      }

      const q = query(collection(this.firestore, path.join('/')))

      const querySnapshot = await getDocs(q)
      return querySnapshot.empty ? [] : querySnapshot.docs
    } catch (error) {
      console.log(error)
      toasterKT.danger()
      return null
    }
  }

  public async getDocsWhere(where: QueryFieldFilterConstraint | null, ...path: string[]) {
    try {
      const user = Auth.fast.user
      if (!user) {
        toasterKT.danger('Permissão negada. Usuário não definido')
        return null
      }

      const q = where
        ? query(collection(this.firestore, path.join('/')), where)
        : query(collection(this.firestore, path.join('/')))

      const querySnapshot = await getDocs(q)
      return querySnapshot.empty ? [] : querySnapshot.docs
    } catch (error) {
      console.log(error)
      toasterKT.danger()
      return null
    }
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
      return null
    }
  }

  public static get fast() {
    if (!Firestore.inst) {
      Firestore.inst = new Firestore()
    }
    return Firestore.inst
  }
}
