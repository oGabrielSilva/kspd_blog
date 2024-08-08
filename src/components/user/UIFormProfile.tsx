import { useAuth } from '@app/hooks/useAuth'
import { Auth } from '@app/lib/firebase/auth/Auth'
import { AuthenticationError } from '@app/lib/firebase/constants/AuthenticationError'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FirebaseError } from 'firebase/app'
import { updateProfile } from 'firebase/auth'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useEffect, useRef, useState } from 'react'
import { UIInput } from '../shared/UIInput'
import { UITextarea } from '../shared/UITextarea'
import { UIAvatarPicker } from './profile/UIAvatarPicker'
import { UIEmailModifier } from './profile/UIEmailModifier'
import { UIPasswordModifier } from './profile/UIPasswordModifier'

export function UIFormProfile() {
  const { profile, user } = useAuth()

  const [name, setName] = useState('')
  const [namePending, setNamePending] = useState(true)
  const [isNameValid, setNameValid] = useState(false)
  const [pseudonym, setPseudonym] = useState('')
  const [isPseudonymValid, setPseudonymValid] = useState(false)
  const [bio, setBio] = useState('')

  const nameInputContainer = useRef<HTMLDivElement>(null)
  const pseudonymInputContainer = useRef<HTMLDivElement>(null)

  useEffect(() => setNameValid(ValidationKassiopeiaTool.fast.isNameValid(name)), [name])
  useEffect(() => setPseudonymValid(ValidationKassiopeiaTool.fast.isNameValid(pseudonym)), [pseudonym])

  useEffect(() => {
    if (namePending) {
      Auth.fast.onReady(() => {
        setName(Auth.fast.user?.displayName ?? '')
        setNamePending(false)
      })
    }
  }, [namePending])

  useEffect(() => {
    setPseudonym(profile.pseudonym)
    setBio(profile.bio)
  }, [profile])

  async function updateName() {
    const locker = ScreenLockerKassiopeiaTool.fast
    locker.lock()
    try {
      await updateProfile(user!, { displayName: name })
      toasterKT.success('Nome atualizado para ' + name)
    } catch (error) {
      console.log(error)
      if (error instanceof FirebaseError) {
        return toasterKT.danger(AuthenticationError.messages[error.code])
      }
      toasterKT.danger()
    } finally {
      locker.unlock()
    }
  }

  const submit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!isNameValid) {
      toasterKT.danger('Não pode deixar este campo em branco. Informe um nome válido')
      toasterKT.animationTool.shakeY(nameInputContainer.current!)
      return
    }
    if (pseudonym.length > 0 && !isPseudonymValid) {
      toasterKT.danger('Pseudônimo precisa ser um pouco maior')
      toasterKT.animationTool.shakeY(pseudonymInputContainer.current!)
      return
    }
    if (name !== user?.displayName) updateName()

    const payload = {} as IUser

    if (bio !== profile.bio) payload.bio = bio
    if (pseudonym !== profile.pseudonym) payload.pseudonym = pseudonym

    if (Object.keys(payload).length > 0) {
      const locker = ScreenLockerKassiopeiaTool.fast
      locker.lock()
      try {
        await Firestore.fast.setUserData({ ...profile, ...payload })
        if (payload.bio) toasterKT.success('Sua bio foi atualizada')
        if (payload.pseudonym) toasterKT.success('Seu pseudônimo foi atualizado para ' + payload.pseudonym)
      } catch (error) {
        console.log(error)
        if (error instanceof FirebaseError) {
          return toasterKT.danger(AuthenticationError.messages[error.code])
        }
        toasterKT.danger()
      } finally {
        locker.unlock()
      }
    }
  }

  return (
    <div>
      <section className="container" style={{ maxWidth: 720 }}>
        <div className="is-flex is-justify-content-space-between">
          <h1 className="title">Edite seu perfil</h1>
          <UIPasswordModifier />
        </div>
        <div>
          <UIAvatarPicker />
        </div>

        <div className="pt-3">
          <UIEmailModifier />
        </div>
        <form onSubmit={submit}>
          <div className="pt-3">
            <div ref={nameInputContainer}>
              <UIInput
                extra={{
                  disabled: namePending,
                }}
                label="Nome"
                value={name}
                isDanger={name.length > 0 && !isNameValid}
                helper={{
                  isVisible: name.length > 0 && !isNameValid,
                  label: 'Digite um nome maior',
                  design: 'danger',
                }}
                iconLeft="signature"
                onImputed={(name) => setName(name)}
                placeholder="Nico Robin"
              />
            </div>
            <p>
              <small>
                Este nome só será visiível ao sistema de administração. É seu nome verdadeiro. Os leitores do
                seu post só verão este nome se você deixar username em branco
              </small>
            </p>
          </div>
          <div className="pt-3">
            <div ref={pseudonymInputContainer}>
              <UIInput
                label="Pseudônimo"
                value={pseudonym}
                onImputed={(u) => setPseudonym(u)}
                helper={{
                  isVisible: pseudonym.length > 0 && !isPseudonymValid,
                  label: 'Digite um pseudônimo maior ou deixe em branco',
                  design: 'warning',
                }}
                iconLeft="user-lock"
                isDanger={pseudonym.length > 0 && !isPseudonymValid}
              />
            </div>
            <p>
              <small>
                Os leitores verão este nome nas suas postagens. Caso deixe em branco, seu nome padrão será
                usado
              </small>
            </p>
          </div>

          <div className="pt-3">
            <div>
              <UITextarea label="Bio" value={bio} onImputed={(u) => setBio(u)} iconLeft="address-book" />
            </div>
            <p>
              <small>
                Os leitores verão este nome nas suas postagens. Caso deixe em branco, seu nome padrão será
                usado
              </small>
            </p>
          </div>

          <div className="buttons pt-5">
            <button type="submit" className="button is-primary">
              Salvar
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
