import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { socialIcons, TSocialIcon } from '@app/utils/socialIcons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { useEffect, useRef, useState } from 'react'
import { UIIconDropdown } from './UIIconDropdown'

interface IProps {
  social: ISocial
  profile: IUser
}

const locker = ScreenLockerKassiopeiaTool.fast
const validation = ValidationKassiopeiaTool.fast
const anim = toasterKT.animationTool

export function UISocialTableItem({ social, profile }: IProps) {
  const [modalDeleteId] = useState(Date.now().toString(36).concat('___', social.id.toString()))
  const [modalUpdateId] = useState(
    Date.now()
      .toString(36)
      .concat('___', social.id.toString(), Math.random().toString(36).replace('.', '__')),
  )

  const [urlName, setURLName] = useState(social.name)
  const [isURLNameValid, setURLNameValid] = useState(validation.isNameValid(social.name))
  const [url, setURL] = useState(social.url)
  const [isURLValid, setURLValid] = useState(validation.isURLValid(social.url))
  const [icon, setIcon] = useState<TSocialIcon>(social.icon)

  const urlNameInputContainer = useRef<HTMLDivElement>(null)
  const urlInputContainer = useRef<HTMLDivElement>(null)

  useEffect(() => setURLNameValid(validation.isNameValid(urlName)), [urlName])
  useEffect(() => setURLValid(validation.isURLValid(url)), [url])

  async function deleteFn() {
    locker.lock()
    try {
      await Firestore.fast.setUserData({
        ...profile,
        social: profile.social.filter((sc) => sc.id !== social.id),
      })
      toasterKT.success(`URL social removida (${social.url})`)
    } catch (error) {
      console.log(error)
      toasterKT.danger('Erro ao tentar apagar a URL ' + social.name)
    } finally {
      locker.unlock()
    }
  }

  async function updateFn() {
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
        social: [
          ...profile.social.map((sc) => {
            if (sc.id !== social.id) return sc
            sc.icon = icon
            sc.name = urlName
            sc.url = url
            return sc
          }),
        ],
      })
      setURL('')
      setURLName('')
      setIcon('default')
      closeModal(modalUpdateId)
      toasterKT.success('URL atualizada')
    } catch (error) {
      console.log(error)
      toasterKT.danger('Algo deu errado')
    } finally {
      locker.unlock()
    }
  }

  return (
    <tr>
      <th className="has-text-centered">
        <FontAwesomeIcon aria-hidden icon={socialIcons[social.icon].icon as IconProp} />
      </th>
      <td>{social.name}</td>
      <td>
        <a href={social.url} target="_blank" rel="noopener noreferrer">
          {social.url}
        </a>
      </td>
      <td>
        <div className="buttons is-justify-content-center">
          <button
            onClick={() => openModal(modalUpdateId)}
            type="button"
            className="button is-small is-warning"
          >
            <FontAwesomeIcon aria-hidden icon={'pen-to-square'} />
          </button>
          <button
            onClick={() => openModal(modalDeleteId)}
            type="button"
            className="button is-small is-danger"
          >
            <FontAwesomeIcon aria-hidden icon={'trash'} />
          </button>

          <div className="has-text-left">
            <UIModal
              id={modalUpdateId}
              title={'Edite a URL social'}
              primaryButton={{
                label: 'Salvar',
                design: 'success',
                onClick: updateFn,
              }}
              secondaryButton={{ label: 'Cancelar' }}
            >
              <div>
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

            <UIModal
              id={modalDeleteId}
              title={'Remover a URL social?'}
              primaryButton={{
                label: 'Sim, remover',
                design: 'warning',
                closeModalOnClick: true,
                onClick: deleteFn,
              }}
              secondaryButton={{ label: 'Cancelar', design: 'link' }}
            >
              <div>
                <p>
                  <strong>Nome</strong>: <span>{social.name}</span>
                </p>
                <p>
                  <strong>Ícone</strong>:{' '}
                  <span className="icon is-small">
                    <FontAwesomeIcon aria-hidden icon={socialIcons[social.icon].icon as IconProp} />
                  </span>
                </p>
                <p>
                  <strong>URL</strong>:{' '}
                  <a href={social.url} target="_blank" rel="noopener noreferrer">
                    {social.url}
                  </a>
                </p>
              </div>
            </UIModal>
          </div>
        </div>
      </td>
    </tr>
  )
}
