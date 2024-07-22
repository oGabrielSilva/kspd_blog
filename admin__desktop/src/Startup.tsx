import AuthContextProvider from '@app/context/AuthContext'
import { Router } from '@app/router/Router'

export function Startup() {
  return (
    <div>
      <AuthContextProvider>
        <Router />
      </AuthContextProvider>
    </div>
  )
}
