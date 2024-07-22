import { FirebaseApp } from '@app/lib/firebase/FirebaseApp'
import { generateWinw } from '@app/utils/generateWinw'
import properties from '@resources/config/properties.json'
import { listen } from '@tauri-apps/api/event'
import { WebviewWindow } from '@tauri-apps/api/window'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth'

interface IObserver {
  id: string
  cb: (user: User | null, ctx: Auth) => void
}

export class Auth {
  private static instance: Auth

  private readonly firebase = FirebaseApp.fast
  private isReady = false
  private $user: User | null = null
  private observers: IObserver[] = []

  public readonly auth = getAuth(this.firebase.app)

  public addObserver(id: string, observer: IObserver['cb']) {
    const index = this.observers.findIndex((ob) => ob.id === id)
    if (index === -1) {
      this.observers.push({ cb: observer, id })
    } else this.observers[index].cb = observer
  }

  public removeObserver(id: string) {
    this.observers = this.observers.filter((ob) => ob.id !== id)
  }

  public reauthenticate() {
    return new Promise((resolve, reject) => {
      const user = this.$user

      if (user?.providerData.find((provider) => provider.providerId === 'google.com')) {
        const provider = new GoogleAuthProvider()
        signInWithPopup(this.auth, provider)
          .then(() => resolve(true))
          .catch(() => reject(false))
        return
      }
      const label = 'label-reauth00'
      const windAlreadyExists = WebviewWindow.getByLabel(label)
      if (windAlreadyExists !== null) {
        windAlreadyExists.setFocus()
        reject(false)
      }
      generateWinw('/reauth', {
        center: true,
        decorations: false,
        focus: true,
        height: 600,
        hiddenTitle: true,
        width: 580,
      })
        .then((wind) => {
          wind.setFocus()

          const unlisten = listen(properties.sessionUpdatedEventKey, () => {
            resolve(true)
            unlisten.then((unl) => unl())
          })
        })
        .catch((err) => {
          console.log(err)
          reject(false)
        })
    })
  }

  public async signOut() {
    await signOut(this.auth)
    await this.auth.signOut()
  }

  public get isLoggedIn() {
    return new Promise<boolean>((resolve) => {
      if (this.isReady) return resolve(this.$user !== null)

      this.auth.authStateReady().then(() => {
        this.isReady = true
        setTimeout(() => {
          resolve(this.$user !== null)
        }, 500)
      })
    })
    // return this.$user !== null
  }

  public get user() {
    return this.$user
  }

  public static get fast() {
    if (!Auth.instance) {
      Auth.instance = new Auth()

      Auth.instance.auth.onIdTokenChanged((user) => {
        Auth.instance.$user = user
        Auth.instance.observers.forEach((ob) => {
          ob.cb(user, Auth.instance)
        })
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).Auth = Auth
    }

    return Auth.instance
  }
}
