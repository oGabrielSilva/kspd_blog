import '@resources/css/bulma/bulma.min.css'
import '@resources/css/global.css'

import { Startup } from '@app/Startup'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { closeAllModals } from './lib/bulma/modals'

library.add(fas, fab, far)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Startup />
  </React.StrictMode>,
)

document.addEventListener('keydown', (event) => {
  if (event.key.toLocaleLowerCase() === 'escape') {
    closeAllModals()
  }
})
