import { Auth } from '@app/lib/firebase/auth/Auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimationKassiopeiaTool, ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const anim = AnimationKassiopeiaTool.fast

export function UIOffcanvasAppNavigation() {
  const nav = useNavigate()

  const [open, setOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState(false)

  const container = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)

  const updateState = useCallback(() => {
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
  }, [pendingAction])

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

  return (
    <div>
      <button
        type="button"
        className={'navbar-burger'.concat(open ? ' is-active' : '')}
        style={{ width: '2rem', height: '2rem' }}
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
                  <FontAwesomeIcon icon="door-open" />
                </span>
                <span>Sair</span>
              </button>
            </div>
            <p className="menu-label">General</p>
            <ul className="menu-list">
              <li>
                <a>Dashboard</a>
              </li>
              <li>
                <a>Customers</a>
              </li>
            </ul>
            <p className="menu-label">Administration</p>
          </aside>
        </nav>
      </div>
    </div>
  )
}
