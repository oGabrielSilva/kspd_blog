import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

interface IProps {
  font: string
  onChange: (font: string) => void
}

export function UIDropdownFontFamily({ onChange, font }: IProps) {
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
    <div className={'dropdown is-up'.concat(isActive ? ' is-active' : '')}>
      <div className="dropdown-trigger">
        <button
          ref={button}
          type="button"
          className="button is-small"
          aria-haspopup="true"
          aria-controls="menu__dropdown_fm"
          style={{ fontFamily: font, border: 'none', boxShadow: 'none' }}
          onClick={() => setActive((act) => !act)}
        >
          <span>{font}</span>
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon="angle-down" />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="menu__dropdown_fm" role="menu">
        <div
          className="dropdown-content px-1"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}
        >
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('Inter') ? ' is-active' : '')}
            onClick={() => onChange('Inter')}
            style={{ border: 'none', fontFamily: 'Inter' }}
          >
            Inter
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('Lato') ? ' is-active' : '')}
            onClick={() => onChange('Lato')}
            style={{ border: 'none', fontFamily: 'Lato' }}
          >
            Lato
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('Roboto') ? ' is-active' : '')}
            onClick={() => onChange('Roboto')}
            style={{ border: 'none', fontFamily: 'Roboto' }}
          >
            Roboto
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('PT Serif') ? ' is-active' : '')}
            onClick={() => onChange('PT Serif')}
            style={{ border: 'none', fontFamily: 'PT Serif' }}
          >
            PT Serif
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('JetBrains Mono') ? ' is-active' : '')}
            onClick={() => onChange('JetBrains Mono')}
            style={{ border: 'none', fontFamily: 'JetBrains Mono' }}
          >
            JetBrains Mono
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('Tinos') ? ' is-active' : '')}
            onClick={() => onChange('Tinos')}
            style={{ border: 'none', fontFamily: 'Tinos' }}
          >
            Tinos
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('Reddit Mono') ? ' is-active' : '')}
            onClick={() => onChange('Reddit Mono')}
            style={{ border: 'none', fontFamily: 'Reddit Mono' }}
          >
            Reddit Mono
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('Reddit Sans') ? ' is-active' : '')}
            onClick={() => onChange('Reddit Sans')}
            style={{ border: 'none', fontFamily: 'Reddit Sans' }}
          >
            Reddit Sans
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('IBM Plex Serif') ? ' is-active' : '')}
            onClick={() => onChange('IBM Plex Serif')}
            style={{ border: 'none', fontFamily: 'IBM Plex Serif' }}
          >
            IBM Plex Serif
          </button>
          <button
            type="button"
            className={'button dropdown-item'.concat(isFont('IBM Plex Mono') ? ' is-active' : '')}
            onClick={() => onChange('IBM Plex Mono')}
            style={{ border: 'none', fontFamily: 'IBM Plex Mono' }}
          >
            IBM Plex Mono
          </button>
        </div>
      </div>
    </div>
  )
}
