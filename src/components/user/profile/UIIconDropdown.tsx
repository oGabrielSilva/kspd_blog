import { socialIcons, TSocialIcon } from '@app/utils/socialIcons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

interface IProps {
  selected: TSocialIcon
  onSelect: (name: TSocialIcon) => void
}

const id = Date.now().toString(36) + Math.random().toString(16).replace('.', '____')

export function UIIconDropdown(props: IProps) {
  const [isActive, setIsActive] = useState(false)

  const container = useRef<HTMLDivElement>(null)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        container.current &&
        menu.current &&
        (menu.current.contains(target) || container.current.contains(target))
      )
        return
      setIsActive(false)
    }

    document.addEventListener('click', fn)

    return () => document.removeEventListener('click', fn)
  }, [])

  return (
    <div
      ref={container}
      className={'dropdown'.concat(isActive ? ' is-active' : '')}
      style={{ width: '100%' }}
    >
      <div className="dropdown-trigger" style={{ width: '100%' }}>
        <button
          onClick={() => setIsActive((v) => !v)}
          className="button is-flex is-justify-content-space-between"
          aria-haspopup="true"
          aria-controls={id}
          type="button"
          style={{ width: '100%' }}
        >
          <span>
            <FontAwesomeIcon
              aria-hidden
              icon={socialIcons[props.selected].icon as IconProp}
              className="pr-3"
            />
            <span>{socialIcons[props.selected].name}</span>
          </span>
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon="angle-down" />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" ref={menu} id={id} role="menu" style={{ width: '100%' }}>
        <div
          className="dropdown-content p-1"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.25rem',
          }}
        >
          {(Object.keys(socialIcons) as TSocialIcon[]).map((key, index) => {
            const icon = socialIcons[key]

            return (
              <button
                onClick={() => {
                  props.onSelect(key)
                  setIsActive(false)
                }}
                key={index}
                type="button"
                className={'dropdown-item is-flex gap-2 is-align-items-center'.concat(
                  key === props.selected ? ' is-active' : '',
                )}
                style={{ borderRadius: 4 }}
              >
                <span className="icon is-small">
                  <FontAwesomeIcon aria-hidden icon={icon.icon as IconProp} />
                </span>
                <span>{icon.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
