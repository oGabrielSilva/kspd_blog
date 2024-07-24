import { UIFormProfile } from '@app/components/user/UIFormProfile'
import { UISocialProfile } from '@app/components/user/UISocialProfile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimationKassiopeiaTool } from 'kassiopeia-tools'
import { useState } from 'react'

export function UserPage() {
  const [tab, setTab] = useState<'PROFILE' | 'SOCIAL'>('PROFILE')

  return (
    <div>
      <section className="p-6">
        <div className="tabs is-right is-boxed">
          <ul>
            <li className={tab === 'SOCIAL' ? 'is-active' : ''}>
              <a role="button" onClick={() => setTab('SOCIAL')}>
                <span className="icon is-small">
                  <FontAwesomeIcon icon="network-wired" />
                </span>
                <span>Social</span>
              </a>
            </li>

            <li className={tab === 'PROFILE' ? 'is-active' : ''}>
              <a role="button" onClick={() => setTab('PROFILE')}>
                <span className="icon is-small">
                  <FontAwesomeIcon icon="user-tie" />
                </span>
                <span>Perfil</span>
              </a>
            </li>
          </ul>
        </div>

        {(tab === 'PROFILE' && <UIFormProfile />) ||
          (tab === 'SOCIAL' && (
            <UISocialProfile
              toUserTab={() => {
                setTab('PROFILE')
                setTimeout(() => {
                  const input = document.querySelector<HTMLInputElement>('#modifier-user-email')
                  if (input) AnimationKassiopeiaTool.fast.shakeX(input)
                }, 400)
              }}
            />
          ))}
      </section>
    </div>
  )
}
