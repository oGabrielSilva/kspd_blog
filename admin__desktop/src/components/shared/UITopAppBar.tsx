import { UIOffcanvasAppNavigation } from '@app/components/home/UIOffcanvasAppNavigation'
import { UIColorSchemeSelector } from '@app/components/shared/UIColorSchemeSelector'
import { UIAvatar } from '@app/components/user/UIAvatar'
import { AppBarContext } from '@app/context/AppBarContext'
import { useAuth } from '@app/hooks/useAuth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { appWindow } from '@tauri-apps/api/window'
import { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface IProps {
  removeGoBackButton?: boolean
  removeAvatar?: boolean
  removeOffcanvas?: boolean
}

const routesExcludedGoBack = ['/session', '/']

export function UITopAppBar(props: IProps) {
  const appBar = useContext(AppBarContext)
  const auth = useAuth()
  const location = useLocation()
  const nav = useNavigate()

  return (
    <div
      className="px-3"
      style={{ height: 50, width: '100vw', borderBottom: '1px solid var(--bulma-border-weak)' }}
    >
      <header
        className="is-flex is-justify-content-space-between is-align-items-center"
        data-tauri-drag-region
        style={{ height: '100%' }}
      >
        <div className="is-flex is-align-items-center gap-3">
          {!auth.isAnonymous && !props.removeOffcanvas ? (
            <>
              {appBar.menuOffcanvasIsVisible ? (
                <div>
                  <UIOffcanvasAppNavigation />
                </div>
              ) : (
                void 0
              )}
            </>
          ) : (
            void 0
          )}
          <h1 className="is-unselectable is-family-monospace" data-tauri-drag-region>
            Kassiopeia Admin
          </h1>
        </div>

        <div className="is-flex is-align-items-center gap-3">
          {routesExcludedGoBack.includes(location.pathname) || props.removeGoBackButton ? (
            void 0
          ) : (
            <>
              {appBar.goBackButtonIsVisible ? (
                <div>
                  <button onClick={() => nav(-1)} type="button" className="button is-text px-3 py-1">
                    <span className="icon is-small">
                      <FontAwesomeIcon className="has-text-link" icon="arrow-left" />
                    </span>
                  </button>
                </div>
              ) : (
                void 0
              )}
            </>
          )}
          <div>
            <UIColorSchemeSelector />
          </div>
          {auth.isAnonymous || location.pathname === '/user' || props.removeAvatar ? (
            void 0
          ) : (
            <>
              {appBar.profileIsVisible ? (
                <div className="mr-5">
                  <UIAvatar basicTooltip="Edite seu perfil" linkToProfile />
                </div>
              ) : (
                void 0
              )}
            </>
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

            {appBar.closeButtonIsVisible ? (
              <button
                className="has-background-danger"
                onClick={() => appWindow.close()}
                style={{ height: 14, width: 14, borderRadius: '100%' }}
                type="button"
                data-close
              />
            ) : (
              void 0
            )}
          </div>
        </div>
      </header>
    </div>
  )
}
