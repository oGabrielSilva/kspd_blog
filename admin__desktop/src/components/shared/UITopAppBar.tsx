import { UIColorSchemeSelector } from '@app/components/shared/UIColorSchemeSelector'
import { UIAvatar } from '@app/components/user/UIAvatar'
import { useAuth } from '@app/hooks/useAuth'
import { appWindow } from '@tauri-apps/api/window'

export function UITopAppBar() {
  const auth = useAuth()

  return (
    <div className="px-3" style={{ height: 50, width: '100vw' }}>
      <header
        className="is-flex is-justify-content-space-between is-align-items-center"
        data-tauri-drag-region
        style={{ height: '100%' }}
      >
        <h1 className="is-unselectable is-family-monospace" data-tauri-drag-region>
          Kassiopeia Admin
        </h1>

        <div className="is-flex is-align-items-center gap-3">
          <div>
            <UIColorSchemeSelector />
          </div>
          {auth.isAnonymous ? (
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
