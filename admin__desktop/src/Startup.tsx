import AuthContextProvider from '@app/context/AuthContext'
import { Router } from '@app/router/Router'
import ColorSchemaContextProvider from './context/ColorSchemaContext'

export function Startup() {
  return (
    <div>
      <ColorSchemaContextProvider>
        <AuthContextProvider>
          <Router />
        </AuthContextProvider>
      </ColorSchemaContextProvider>
    </div>
  )
}
