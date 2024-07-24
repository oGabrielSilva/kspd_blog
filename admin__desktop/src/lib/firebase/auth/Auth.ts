import { FirebaseApp } from '@app/lib/firebase/FirebaseApp'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FirebaseError } from 'firebase/app'
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, signOut, type User } from 'firebase/auth'
import { ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import { AuthenticationError } from '../constants/AuthenticationError'

interface IObserver {
  id: string
  cb: (user: User | null, ctx: Auth) => void
}

const locker = ScreenLockerKassiopeiaTool.fast

export class Auth {
  private static instance: Auth

  private readonly firebase = FirebaseApp.fast
  private $user: User | null = null
  private $ready = false
  private observers: IObserver[] = []
  private readyObservers: Array<() => void> | null = []

  public readonly auth = getAuth(this.firebase.app)

  public onReady(cb: () => void) {
    if (this.$ready) return cb()
    if (!this.readyObservers) return cb()
    this.readyObservers?.push(cb)
  }

  public addObserver(id: string, observer: IObserver['cb']) {
    const index = this.observers.findIndex((ob) => ob.id === id)
    if (index === -1) {
      this.observers.push({ cb: observer, id })
    } else this.observers[index].cb = observer
  }

  public removeObserver(id: string) {
    this.observers = this.observers.filter((ob) => ob.id !== id)
  }

  public async reAuthentication(password: string) {
    const isLocked = locker.isLocked()
    if (!isLocked) locker.lock()
    let result = false
    try {
      const credentials = EmailAuthProvider.credential(this.user?.email ?? '', password)
      const data = await reauthenticateWithCredential(this.user!, credentials)
      if (data.user) result = true
    } catch (error) {
      console.log(error)
      if (error instanceof FirebaseError) {
        toasterKT.danger(AuthenticationError.messages[error.code])
      } else toasterKT.danger()
    } finally {
      if (!isLocked) locker.unlock()
    }

    return result
  }

  public async signOut() {
    await signOut(this.auth)
    await this.auth.signOut()
  }

  public get isLoggedIn() {
    return this.isReady && this.$user !== null
  }

  public get user() {
    return this.$user
  }

  public get isReady() {
    return this.$ready
  }

  public static get fast() {
    if (!Auth.instance) {
      Auth.instance = new Auth()
      Auth.instance.auth.authStateReady().then(() => {
        Auth.instance.$ready = true
        Auth.instance.readyObservers?.forEach((ob) => ob())
        Auth.instance.readyObservers = null
      })

      Auth.instance.auth.onIdTokenChanged((user) => {
        Auth.instance.$user = user
        Auth.instance.observers.forEach((ob) => {
          ob.cb(user, Auth.instance)
        })
      })
    }

    return Auth.instance
  }
}
