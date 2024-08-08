import { HomeContext, type TScreen } from '@app/context/HomeContext'
import { Auth } from '@app/lib/firebase/auth/Auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimationKassiopeiaTool, ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const anim = AnimationKassiopeiaTool.fast

export function UIOffcanvasAppNavigation() {
  const nav = useNavigate()
  const { screen, setScreen } = useContext(HomeContext)

  const [open, setOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(false)

  const container = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)

  function toScreen(sc: TScreen) {
    setScreen(sc)
    updateState()
  }

  useEffect(() => {
    const func = (e: MouseEvent) => {
      if (
        container.current &&
        !container.current.contains(e.target as Node) &&
        menu.current &&
        !menu.current.contains(e.target as Node) &&
        open
      ) {
        updateState()
      }
    }
    document.addEventListener('click', func)

    return () => document.removeEventListener('click', func)
  }, [open, updateState])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function updateState() {
    if (pendingAction) return
    setPendingAction(true)
    setOpen((v) => {
      if (container.current && menu.current) {
        const c = container.current
        const m = menu.current

        if (!v) {
          c.classList.remove('is-hidden')
          anim.otherAnimationByName(c, 'fadeIn', false, 150).addEventOnCompletion(() => {
            anim.otherAnimationByName(m, 'slideInUp', true, 200).addEventOnCompletion(() => {
              anim.clean(m)
              anim.clean(c)
              setPendingAction(false)
            })
            setTimeout(() => m.classList.remove('is-hidden'), 10)
          })
        } else {
          anim.otherAnimationByName(m, 'slideOutLeft', true, 200).addEventOnCompletion(() => {
            m.classList.add('is-hidden')
            anim.otherAnimationByName(c, 'fadeOut', false, 100).addEventOnCompletion(() => {
              c.classList.add('is-hidden')
              anim.clean(m)
              anim.clean(c)
              setPendingAction(false)
            })
          })
        }
      }

      return !v
    })
  }

  return (
    <div>
      <button
        type="button"
        className={'navbar-burger'.concat(open ? ' is-active' : '')}
        style={{ width: '2rem', height: '2rem', display: 'inline-flex' }}
        role="button"
        aria-label="menu"
        aria-expanded="false"
        onClick={updateState}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      <div
        style={{
          height: `calc(100vh - 50px)`,
          width: '100vw',
          position: 'fixed',
          top: 50,
          left: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10,
        }}
        className={'is-hidden'}
        ref={container}
        onClick={(e) => {
          if (!menu.current?.contains(e.target as Node)) updateState()
        }}
      >
        <nav>
          <aside
            ref={menu}
            className="menu p-3 is-hidden"
            style={{
              width: 300,
              height: 'calc(100vh - 50px)',
              overflow: 'auto',
              background: 'var(--bulma-body-background-color)',
              borderTop: '1px solid var(--bulma-border)',
            }}
          >
            <div>
              <button
                className="button is-danger is-outlined is-small"
                type="button"
                onClick={async () => {
                  ScreenLockerKassiopeiaTool.fast.lock()

                  Auth.fast.signOut().finally(() => {
                    ScreenLockerKassiopeiaTool.fast.unlock()
                    nav('/session', { replace: true })
                  })
                }}
              >
                <span className="icon is-small">
                  <FontAwesomeIcon aria-hidden icon="door-open" />
                </span>
                <span>Sair</span>
              </button>
            </div>
            <p className="menu-label">Geral</p>
            <ul className="menu-list">
              <li>
                <a
                  className={screen === 'ALL_POSTS' ? 'is-active' : ''}
                  onClick={() => toScreen('ALL_POSTS')}
                  role="button"
                >
                  <span className="icon is-small">
                    <FontAwesomeIcon aria-hidden icon="box-open" />
                  </span>
                  <span>Todas as postagens</span>
                </a>
              </li>
              <li>
                <a
                  className={screen === 'ALL_STACKS' ? 'is-active' : ''}
                  onClick={() => toScreen('ALL_STACKS')}
                  role="button"
                >
                  <span className="icon is-small">
                    <FontAwesomeIcon aria-hidden icon="boxes-stacked" />
                  </span>
                  <span>Todas as stacks</span>
                </a>
              </li>
            </ul>
            <p className="menu-label">Postagens</p>
            <ul className="menu-list">
              <li>
                <a
                  className={screen === 'NEW_POST' ? 'is-active' : ''}
                  onClick={() => toScreen('NEW_POST')}
                  role="button"
                >
                  <span className="icon is-small">
                    <FontAwesomeIcon aria-hidden icon="file-circle-plus" />
                  </span>
                  <span>Nova Postagem</span>
                </a>
              </li>
              <li>
                <a
                  className={screen === 'USER_POSTS' ? 'is-active' : ''}
                  onClick={() => toScreen('USER_POSTS')}
                  role="button"
                >
                  <span className="icon is-small">
                    <FontAwesomeIcon aria-hidden icon="puzzle-piece" />
                  </span>
                  <span>Minhas postagens</span>
                </a>
              </li>
              <li>
                <a
                  className={screen === 'UNPUBLISHED_USER_POSTS' ? 'is-active' : ''}
                  onClick={() => toScreen('UNPUBLISHED_USER_POSTS')}
                  role="button"
                >
                  <span className="icon is-small">
                    <FontAwesomeIcon aria-hidden icon="briefcase" />
                  </span>
                  <span>Não publicadas</span>
                </a>
              </li>
              <li>
                <a
                  className={screen === 'USER_POSTS_PUBLISHED' ? 'is-active' : ''}
                  onClick={() => toScreen('USER_POSTS_PUBLISHED')}
                  role="button"
                >
                  <span className="icon is-small">
                    <FontAwesomeIcon aria-hidden icon="upload" />
                  </span>
                  <span>Publicadas</span>
                </a>
              </li>
            </ul>
            <p className="menu-label">Stacks</p>
            <ul className="menu-list">
              <li>
                <a
                  className={screen === 'NEW_STACK' ? 'is-active' : ''}
                  onClick={() => toScreen('NEW_STACK')}
                  role="button"
                >
                  <span className="icon is-small">
                    <FontAwesomeIcon aria-hidden icon="layer-group" />
                  </span>
                  <span>Nova Stack</span>
                </a>
              </li>
            </ul>
          </aside>
        </nav>
      </div>
    </div>
  )
}
