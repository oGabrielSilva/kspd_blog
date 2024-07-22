import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import properties from '@resources/config/properties.json'
import { useEffect, useRef, useState } from 'react'

type TColorSchema = 'SYSTEM' | 'DARK' | 'LIGHT'

export function UIColorSchemeSelector() {
  const [isActive, setActive] = useState(false)
  const [schema, setSchema] = useState<TColorSchema>(
    (localStorage.getItem(properties.storage.colorSchema.key) as TColorSchema) ?? 'SYSTEM',
  )

  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const func = (e: MouseEvent) => {
      console.log(e.target)
      if (button.current && !button.current.contains(e.target as Node)) {
        setActive(false)
      }
    }

    document.addEventListener('click', func)

    return () => document.removeEventListener('click', func)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = schema.toLocaleLowerCase()
    localStorage.setItem(properties.storage.colorSchema.key, schema)
  }, [schema])

  return (
    <div className={'dropdown is-right' + (isActive ? ' is-active' : '')}>
      <div className="dropdown-trigger">
        <button
          ref={button}
          onClick={() => setActive((v) => !v)}
          aria-haspopup="true"
          aria-controls="dropdown-menu-color-schema"
          className="button is-text px-3 py-1"
        >
          <span
            className={'icon is-small '.concat(
              (schema === 'SYSTEM' && 'has-text-primary') ||
                (schema === 'DARK' && 'has-text-link') ||
                'has-text-warning',
            )}
          >
            <FontAwesomeIcon
              size="1x"
              icon={schema === 'SYSTEM' ? 'laptop' : schema === 'DARK' ? 'moon' : 'sun'}
            />
          </span>

          <span className="icon is-small">
            <FontAwesomeIcon style={{ fontSize: '0.7em' }} icon={'angle-down'} />
          </span>
        </button>
      </div>
      <div
        style={{ minWidth: 'fit-content' }}
        className="dropdown-menu"
        id="dropdown-menu-color-schema"
        role="menu"
      >
        <div className="dropdown-content p-2">
          <button
            onClick={() => setSchema('SYSTEM')}
            className="is-flex is-align-items-center gap-3 mb-1 has-text-primary dropdown-item"
            style={{ borderRadius: 4 }}
          >
            <span className="icon is-small">
              <FontAwesomeIcon size="1x" icon="laptop" />
            </span>
            <span>Sistema</span>
          </button>
          <button
            onClick={() => setSchema('LIGHT')}
            className="is-flex is-align-items-center gap-3 mb-1 has-text-warning dropdown-item"
            style={{ borderRadius: 4 }}
          >
            <span className="icon is-small">
              <FontAwesomeIcon size="1x" icon="sun" />
            </span>
            <span>Claro</span>
          </button>
          <button
            onClick={() => setSchema('DARK')}
            className="is-flex is-align-items-center gap-3 dropdown-item has-text-link"
            style={{ borderRadius: 4 }}
          >
            <span className="icon is-small">
              <FontAwesomeIcon size="1x" icon="moon" />
            </span>
            <span>Escuro</span>
          </button>
        </div>
      </div>
    </div>
  )
}
