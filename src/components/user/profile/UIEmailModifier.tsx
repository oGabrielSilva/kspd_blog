import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { useColorSchema } from '@app/hooks/useColorSchema'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { Auth } from '@app/lib/firebase/auth/Auth'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { updateEmail } from 'firebase/auth'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useEffect, useRef, useState } from 'react'

export function UIEmailModifier() {
  const { isDarkSchema } = useColorSchema()

  const [pending, setPending] = useState(true)
  const [email, setEmail] = useState(Auth.fast.user?.email ?? '')
  const [originalEmail, setOriginalEmail] = useState(Auth.fast.user?.email ?? '')
  const [isEmailValid, setEmailValidation] = useState(ValidationKassiopeiaTool.fast.isEmailValid(email))

  const [password, setPassword] = useState('')
  const [isPasswordValid, setPasswordValid] = useState(false)

  const emailContainer = useRef<HTMLDivElement>(null)
  const passwordContainer = useRef<HTMLDivElement>(null)

  useEffect(() => setEmailValidation(ValidationKassiopeiaTool.fast.isEmailValid(email)), [email])
  useEffect(() => setPasswordValid(ValidationKassiopeiaTool.fast.isPasswordValid(password)), [password])

  useEffect(() => {
    Auth.fast.onReady(() => {
      setEmail(Auth.fast.user?.email ?? '')
      setOriginalEmail(Auth.fast.user?.email ?? '')
      setPending(false)
    })
  }, [])

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (!isEmailValid) {
      toasterKT.danger('Informe um e-mail válido')
      toasterKT.animationTool.shakeX(emailContainer.current!)
      return
    }
    if (email === originalEmail) return
    openModal('UI__confirm-email')
  }

  const confirmChange: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!isPasswordValid) {
      toasterKT.danger('Sua senha não está válida')
      toasterKT.animationTool.shakeX(passwordContainer.current!)
      return
    }
    await Auth.fast.reAuthentication(password)
    ScreenLockerKassiopeiaTool.fast.lock()

    try {
      await updateEmail(Auth.fast.user!, email)
      toasterKT.success(`Sucesso! O e-mail ${email} agora está vinculado a sua conta`)
      closeModal('UI__confirm-email')
      setPassword('')
    } catch (error) {
      console.log(error)
      toasterKT.danger()
    } finally {
      ScreenLockerKassiopeiaTool.fast.unlock()
    }
  }

  return (
    <>
      <form onSubmit={confirmChange}>
        <UIModal
          id="UI__confirm-email"
          title={`Modificar email`}
          primaryButton={{ label: 'Confirmar', design: 'warning', type: 'submit' }}
          secondaryButton={{ label: 'Voltar', design: 'none' }}
        >
          <div>
            <p>
              <strong>Você precisa confirmar esta operação com sua senha</strong>
            </p>
            <div className="pt-3" ref={passwordContainer}>
              <UIInput
                label="Senha"
                value={password}
                iconLeft="lock"
                onImputed={(pass) => setPassword(pass)}
                isDanger={password.length > 0 && !isPasswordValid}
                placeholder="Mínimo de 8 caracteres"
                id="confirm__user-pass"
                type="password"
                helper={{
                  label: 'Mínimo de 8 caracteres, pelo menos uma letra minúscula e uma maiúscula',
                  isVisible: password.length > 0 && !isPasswordValid,
                  design: 'danger',
                }}
              />
            </div>
          </div>
        </UIModal>
      </form>
      <form onSubmit={submit}>
        <div>
          <div style={{ width: '100%' }} ref={emailContainer}>
            <UIInput
              label="E-mail"
              value={email}
              id="modifier-user-email"
              iconLeft="at"
              placeholder={Auth.fast.user?.email ? Auth.fast.user.email : 'doflaming@kassiopeia.dev'}
              helper={{
                isVisible: email.length > 0 && !isEmailValid,
                label: 'Seu novo e-mail precisa ser válido',
                design: 'danger',
              }}
              onImputed={(eml) => setEmail(eml)}
              isDanger={email.length > 0 && !isEmailValid}
              extra={{
                disabled: pending,
              }}
            />
          </div>
          {originalEmail !== email && (
            <div className="buttons ">
              <button type="submit" className="button is-small has-text-primary is-ghost px-1 py-1 my-2 mx-0">
                Atualizar
              </button>
              <button
                type="button"
                onClick={() => setEmail(originalEmail)}
                className={'button is-small is-ghost px-1 py-1 my-2 mx-0'.concat(
                  isDarkSchema ? ' has-text-grey-light' : ' has-text-grey-darker',
                )}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </form>
    </>
  )
}
