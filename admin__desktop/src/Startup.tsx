import AuthContextProvider from '@app/context/AuthContext'
import ColorSchemaContextProvider from '@app/context/ColorSchemaContext'
import StackContextProvider from '@app/context/StackContext'
import { Router } from '@app/router/Router'

export function Startup() {
  return (
    <div>
      <ColorSchemaContextProvider>
        <AuthContextProvider>
          <StackContextProvider>
            <Router />
          </StackContextProvider>
        </AuthContextProvider>
      </ColorSchemaContextProvider>
    </div>
  )
}
