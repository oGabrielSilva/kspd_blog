import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

interface IProps {
  id: string
  font: IFontName
  onChange: (font: IFontName) => void
  openUP?: boolean
  isSmall?: boolean
  borderless?: boolean
}

export const fonts: IFontName[] = [
  'Inter',
  'Lato',
  'Roboto',
  'PT Serif',
  'JetBrains Mono',
  'Tinos',
  'Reddit Mono',
  'Reddit Sans',
  'IBM Plex Serif',
  'IBM Plex Mono',
]

export const defaultFont = fonts[0]

export function UIDropdownFontFamily({ onChange, font, ...props }: IProps) {
  const [isActive, setActive] = useState(false)

  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (button.current && !button.current.contains(e.target as Node)) {
        setActive(false)
      }
    }

    document.addEventListener('click', fn)

    return () => document.removeEventListener('click', fn)
  }, [])

  function isFont(f: string) {
    return f === font
  }

  return (
    <div className={`dropdown${props.openUP ? ' is-up' : ''}`.concat(isActive ? ' is-active' : '')}>
      <div className="dropdown-trigger">
        <button
          ref={button}
          type="button"
          className={'button'.concat(props.isSmall ? 'is-small' : '')}
          aria-haspopup="true"
          aria-controls={props.id}
          style={{ fontFamily: font, ...(props.borderless ? { border: 'none', boxShadow: 'none' } : {}) }}
          onClick={() => setActive((act) => !act)}
        >
          <span>{font}</span>
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon={props.openUP ? 'angle-up' : 'angle-down'} />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id={props.id} role="menu">
        <div
          className="dropdown-content px-1"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}
        >
          {fonts.map((font, index) => {
            return (
              <button
                key={index}
                type="button"
                className={'button dropdown-item'.concat(isFont(font) ? ' is-active' : '')}
                onClick={() => onChange(font)}
                style={{ border: 'none', fontFamily: font }}
              >
                {font}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
