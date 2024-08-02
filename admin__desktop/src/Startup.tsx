import AuthContextProvider from '@app/context/AuthContext'
import ColorSchemaContextProvider from '@app/context/ColorSchemaContext'
import StackContextProvider from '@app/context/StackContext'
import { Router } from '@app/router/Router'
import PostContextProvider from './context/PostContext'

export function Startup() {
  return (
    <div>
      <ColorSchemaContextProvider>
        <AuthContextProvider>
          <StackContextProvider>
            <PostContextProvider>
              <Router />
            </PostContextProvider>
          </StackContextProvider>
        </AuthContextProvider>
      </ColorSchemaContextProvider>
    </div>
  )
}
