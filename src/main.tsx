import '@resources/css/bulma/bulma.min.css'
import '@resources/css/global.css'

import '@resources/sass/global.sass'

import { closeAllModals } from '@app/lib/bulma/modals'
import { Auth } from '@app/lib/firebase/auth/Auth'
import { Store } from '@app/lib/tauri-plugin-store/Store'
import { Startup } from '@app/Startup'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import React from 'react'
import ReactDOM from 'react-dom/client'

Array.prototype.pickRandom = function <T>(): T | null {
  if (this.length === 0) return null
  const item = this[Math.floor(Math.random() * this.length)]
  return item ? item : null
}

globalThis.locker = ScreenLockerKassiopeiaTool.fast

library.add(fas, fab, far)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Startup />
  </React.StrictMode>,
)

document.addEventListener('keydown', (event) => {
  if (event && event.key && event.key.toLocaleLowerCase() === 'escape') {
    closeAllModals()
  }
})

Auth.fast.addObserver('ob__user_for_store', (user) => {
  if (!user) {
    Store.clearStore().then(() => console.log('Store clear'))
  }
})
