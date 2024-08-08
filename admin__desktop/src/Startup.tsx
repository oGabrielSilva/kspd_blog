import { version } from '@app/../package.json'
import AuthContextProvider from '@app/context/AuthContext'
import ColorSchemaContextProvider from '@app/context/ColorSchemaContext'
import StackContextProvider from '@app/context/StackContext'
import { Router } from '@app/router/Router'
import PostContextProvider from './context/PostContext'

const Version = () => (
  <div style={{ position: 'fixed', bottom: '0.5rem', left: '0.5rem' }}>
    <small style={{ fontSize: '0.65em' }} title={`Versão do sistema: ${version}`} className="is-unselectable">
      {version}
    </small>
  </div>
)

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

      <Version />
    </div>
  )
}
