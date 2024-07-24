import { UIOffcanvasAppNavigation } from '@app/components/home/UIOffcanvasAppNavigation'
import { UIColorSchemeSelector } from '@app/components/shared/UIColorSchemeSelector'
import { UIAvatar } from '@app/components/user/UIAvatar'
import { useAuth } from '@app/hooks/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { appWindow } from '@tauri-apps/api/window'
import { useLocation, useNavigate } from 'react-router-dom'

const routesExcludedGoBack = ['/session', '/']

export function UITopAppBar() {
  const auth = useAuth()
  const location = useLocation()
  const nav = useNavigate()

  return (
    <div className="px-3" style={{ height: 50, width: '100vw' }}>
      <header
        className="is-flex is-justify-content-space-between is-align-items-center"
        data-tauri-drag-region
        style={{ height: '100%' }}
      >
        <div className="is-flex is-align-items-center gap-3">
          {!auth.isAnonymous ? (
            <div>
              <UIOffcanvasAppNavigation />
            </div>
          ) : (
            void 0
          )}
          <h1 className="is-unselectable is-family-monospace" data-tauri-drag-region>
            Kassiopeia Admin
          </h1>
        </div>

        <div className="is-flex is-align-items-center gap-3">
          {routesExcludedGoBack.includes(location.pathname) ? (
            void 0
          ) : (
            <div>
              <button onClick={() => nav(-1)} type="button" className="button is-text px-3 py-1">
                <span className="icon is-small">
                  <FontAwesomeIcon className="has-text-link" icon="arrow-left" />
                </span>
              </button>
            </div>
          )}
          <div>
            <UIColorSchemeSelector />
          </div>
          {auth.isAnonymous || location.pathname === '/user' ? (
            void 0
          ) : (
            <div className="mr-5">
              <UIAvatar basicTooltip="Edite seu perfil" linkToProfile />
            </div>
          )}
          <div>
            <button
              className="has-background-warning mr-3"
              style={{
                height: 14,
                width: 14,
                borderRadius: '100%',
              }}
              type="button"
              onClick={() => appWindow.minimize()}
            />

            <button
              className="has-background-danger"
              onClick={() => appWindow.close()}
              style={{ height: 14, width: 14, borderRadius: '100%' }}
              type="button"
              data-close
            />
          </div>
        </div>
      </header>
    </div>
  )
}
