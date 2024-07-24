import { useAuth } from '@app/hooks/useAuth'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { socialIcons, TSocialIcon } from '@app/utils/socialIcons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useEffect, useRef, useState } from 'react'
import { UIInput } from '../shared/UIInput'
import { UIModal } from '../shared/UIModal'
import { UIIconDropdown } from './profile/UIIconDropdown'
import { UISocialTableItem } from './profile/UISocialTableItem'

interface IProps {
  toUserTab: () => void
}

const validation = ValidationKassiopeiaTool.fast
const locker = ScreenLockerKassiopeiaTool.fast
const anim = toasterKT.animationTool
const modalId = 'add__newURL____profile_' + Date.now().toString(36)

export function UISocialProfile({ toUserTab }: IProps) {
  const { user, profile } = useAuth()

  const [urlName, setURLName] = useState('')
  const [isURLNameValid, setURLNameValid] = useState(false)
  const [url, setURL] = useState('')
  const [isURLValid, setURLValid] = useState(false)
  const [icon, setIcon] = useState<TSocialIcon>('default')

  const urlNameInputContainer = useRef<HTMLDivElement>(null)
  const urlInputContainer = useRef<HTMLDivElement>(null)

  useEffect(() => setURLNameValid(validation.isNameValid(urlName)), [urlName])
  useEffect(() => setURLValid(validation.isURLValid(url)), [url])

  const submitSocialLink: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!isURLNameValid) {
      anim.shakeX(urlNameInputContainer.current!)
      toasterKT.danger('Digite um nome um pouco maior aqui')
      return
    }
    const linkByName = profile.social.find((link) => link.name === urlName)
    if (linkByName) {
      anim.shakeX(urlNameInputContainer.current!)
      toasterKT.danger(`Você já declarou uma URL com este nome; sua URL: ${linkByName.url}`)
      return
    }
    if (!isURLValid) {
      anim.shakeX(urlInputContainer.current!)
      toasterKT.danger('Digite uma URL válida')
      return
    }

    locker.lock()
    try {
      await Firestore.fast.setUserData({
        ...profile,
        social: [...profile.social, { id: Date.now() + profile.social.length, name: urlName, url, icon }],
      })
      setURL('')
      setURLName('')
      setIcon('default')
      closeModal(modalId)
      toasterKT.success('URL adicionada ao seu perfil')
    } catch (error) {
      console.log(error)
      toasterKT.danger('Algo deu errado')
    } finally {
      locker.unlock()
    }
  }

  return (
    <div>
      <div className="is-flex is-justify-content-space-between is-align-content-center pb-3">
        <h1 className="title p-0 m-0">Edite seus links</h1>
        <button onClick={() => openModal(modalId)} className="button is-link is-small" type="button">
          <span className="icon is-small">
            <FontAwesomeIcon icon={'add'} />
          </span>
          <span>Adicionar</span>
        </button>
      </div>
      <p className="pb-5">
        Todos os links adicionados aqui serão públicos e os leitores poderão vê-los no seu perfil
      </p>
      <div className="table-container py-3 has-text-centered">
        <table className="table is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th className="has-text-centered">
                <abbr title="Ícone">#</abbr>
              </th>
              <th className="has-text-centered">Nome</th>
              <th className="has-text-centered">URL</th>
              <th className="has-text-centered">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="has-text-centered">
                <FontAwesomeIcon icon={socialIcons.email.icon as IconProp} />
              </th>
              <td>E-mail</td>
              <td>
                <a href={'mailto:' + (user?.email ?? '')} target="_blank" rel="noopener noreferrer">
                  {user?.email ?? ''}
                </a>
              </td>
              <td>
                <button type="button" onClick={toUserTab} className="button is-small is-warning">
                  <FontAwesomeIcon icon={'pen-to-square'} />
                </button>
              </td>
            </tr>
            {profile.social.map((social, index) => (
              <UISocialTableItem key={index} social={social} profile={profile} />
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={submitSocialLink}>
        <UIModal
          title="Adcione um novo link ao seu perfil"
          id={modalId}
          primaryButton={{ label: 'Adicionar', design: 'warning', type: 'submit' }}
          secondaryButton={{ label: 'Cancelar' }}
        >
          <div>
            <p>
              As URLs cadastradas serão públicas. Leitores e administradores poderão visualizar em seu perfil
            </p>

            <div className="pt-3" ref={urlNameInputContainer}>
              <UIInput
                label="Nome"
                value={urlName}
                onImputed={(name) => setURLName(name)}
                placeholder="Meu perfil do Instagram"
                isDanger={urlName.length > 0 && !isURLNameValid}
                helper={{
                  isVisible: urlName.length > 0 && !isURLNameValid,
                  label: 'O nome precisa ser um pouco maior',
                  design: 'danger',
                }}
              />
            </div>
            <div className="pt-3" ref={urlInputContainer}>
              <UIInput
                label="URL"
                value={url}
                onImputed={(url) => setURL(url)}
                placeholder="https://kassiopeia.dev"
                isDanger={url.length > 0 && !isURLValid}
                helper={{
                  isVisible: url.length > 0 && !isURLValid,
                  label: 'Digite um link',
                  design: 'danger',
                }}
                type="url"
              />
            </div>
            <div className="pt-3">
              <label className="label">Selecione um ícone</label>
              <UIIconDropdown selected={icon} onSelect={(iconName) => setIcon(iconName)} />
            </div>
          </div>
        </UIModal>
      </form>
    </div>
  )
}
