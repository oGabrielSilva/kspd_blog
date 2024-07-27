import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { Auth } from '@app/lib/firebase/auth/Auth'
import { AuthenticationError } from '@app/lib/firebase/constants/AuthenticationError'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FirebaseError } from 'firebase/app'
import { updatePassword } from 'firebase/auth'
import KassiopeiaTools, { ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useEffect, useRef, useState } from 'react'

const locker = ScreenLockerKassiopeiaTool.fast
const validation = KassiopeiaTools.ValidationKassiopeiaTool.fast

export function UIPasswordModifier() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [isCurrentPasswordValid, setCurrentPasswordValid] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [isNewPasswordValid, setNewPasswordValid] = useState(false)
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isConfirmNewPasswordValid, setConfirmNewPasswordValid] = useState(false)

  const currentPasswordContainer = useRef<HTMLDivElement>(null)
  const newPasswordContainer = useRef<HTMLDivElement>(null)
  const confirmNewPasswordContainer = useRef<HTMLDivElement>(null)

  useEffect(() => setCurrentPasswordValid(validation.isPasswordValid(currentPassword)), [currentPassword])
  useEffect(
    () => setNewPasswordValid(validation.isPasswordValid(newPassword) && newPassword !== currentPassword),
    [newPassword, currentPassword],
  )
  useEffect(() => {
    const equals = confirmNewPassword === newPassword
    const isValid = validation.isPasswordValid(confirmNewPassword)
    setConfirmNewPasswordValid(equals && isValid)
  }, [confirmNewPassword, newPassword])

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (!isCurrentPasswordValid) {
      toasterKT.warn('Você precisa informar sua senha atual antes')
      toasterKT.animationTool.shakeY(currentPasswordContainer.current!)
      return
    }
    if (!isNewPasswordValid) {
      toasterKT.warn('Você precisa informar uma nova senha válida')
      toasterKT.animationTool.shakeY(newPasswordContainer.current!)
      return
    }
    if (!isConfirmNewPasswordValid) {
      toasterKT.warn('Confirme a nova senha. Elas não batem')
      toasterKT.animationTool.shakeY(confirmNewPasswordContainer.current!)
      return
    }

    tryChange()
  }

  async function tryChange() {
    locker.lock()
    const auth = Auth.fast

    try {
      const success = await auth.reAuthentication(currentPassword)
      if (success) {
        await updatePassword(auth.user!, newPassword)
        toasterKT.success('Senha atualizada')
        closeModal('modal__password_modifier')
        setNewPassword('')
        setConfirmNewPassword('')
        setCurrentPassword('')
      }
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

  return (
    <div>
      <button onClick={() => openModal('modal__password_modifier')} className="button is-ghost px-0">
        <span className="icon is-small">
          <FontAwesomeIcon aria-hidden icon="gear" />
        </span>
        <span>Quero trocar minha senha</span>
      </button>
      <form onSubmit={submit}>
        <UIModal
          id="modal__password_modifier"
          title="Alterar sua senha?"
          primaryButton={{ label: 'Trocar senha', design: 'info', type: 'submit' }}
          secondaryButton={{ label: 'Cancelar' }}
        >
          <div>
            <p className="pb-3">É necessário que você confirme sua senha antes de alterar</p>
            <div className="pt-3" ref={currentPasswordContainer}>
              <UIInput
                label="Confirme sua senha"
                value={currentPassword}
                onImputed={(pass) => setCurrentPassword(pass)}
                type="password"
                iconLeft="key"
                placeholder="Mínimo de 8 caracteres"
                helper={{
                  isVisible: currentPassword.length > 0 && !isCurrentPasswordValid,
                  label: 'Senha inválida. Mínimo de 8 caracteres, uma letra minúscula e uma maiúscula',
                  design: 'danger',
                }}
                isDanger={currentPassword.length > 0 && !isCurrentPasswordValid}
              />
            </div>
            <div className="pt-3" ref={newPasswordContainer}>
              <UIInput
                label="Qual a nova senha?"
                value={newPassword}
                onImputed={(pass) => setNewPassword(pass)}
                type="password"
                iconLeft="lock"
                placeholder="Mínimo de 8 caracteres"
                helper={{
                  isVisible: newPassword.length > 0 && !isNewPasswordValid,
                  label: 'Senha inválida. Mínimo de 8 caracteres, uma letra minúscula e uma maiúscula',
                  design: 'danger',
                }}
                isDanger={newPassword.length > 0 && !isNewPasswordValid}
              />
            </div>
            <div className="pt-3" ref={confirmNewPasswordContainer}>
              <UIInput
                label="Confirme a nova senha"
                value={confirmNewPassword}
                onImputed={(pass) => setConfirmNewPassword(pass)}
                type="password"
                iconLeft="unlock"
                placeholder="Mínimo de 8 caracteres"
                helper={{
                  isVisible: confirmNewPassword.length > 0 && !isConfirmNewPasswordValid,
                  label: 'Sua nova senha não bate',
                  design: 'danger',
                }}
                isDanger={confirmNewPassword.length > 0 && !isConfirmNewPasswordValid}
              />
            </div>
          </div>
        </UIModal>
      </form>
    </div>
  )
}
