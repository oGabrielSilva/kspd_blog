import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { UITopAppBar } from '@app/components/shared/UITopAppBar'
import { useAuth } from '@app/hooks/useAuth'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { AuthenticationError } from '@app/lib/firebase/constants/AuthenticationError'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const locker = ScreenLockerKassiopeiaTool.fast
const validation = ValidationKassiopeiaTool.fast

export function SessionPage() {
  const auth = useAuth()
  const nav = useNavigate()

  const [payload, setPayload] = useState({ email: '', password: '', emailForgotPasswordModal: '' })
  const [payloadValidation, setPayloadValidation] = useState({
    email: false,
    password: false,
    emailForgotPasswordModal: false,
  })

  const emailContainerRef = useRef<HTMLDivElement>(null)
  const emailForgotContainerRef = useRef<HTMLDivElement>(null)
  const passwordContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!auth.isAnonymous) nav('/')
  }, [auth, nav])

  function isPayloadValid() {
    if (!payloadValidation.email) {
      toasterKT.warn('Informe um e-mail válido')
      if (emailContainerRef.current) toasterKT.animationTool.shakeX(emailContainerRef.current)
      return false
    }
    if (!payloadValidation.password) {
      toasterKT.warn('Digite uma senha válida')
      if (passwordContainerRef.current) toasterKT.animationTool.shakeX(passwordContainerRef.current)
      return false
    }
    return true
  }

  async function signUp(email: string, password: string) {
    locker.lock()
    try {
      const result = await createUserWithEmailAndPassword(auth.handler.auth, email, password)

      if (!result.user) {
        toasterKT.danger('Oopss... não foi possível fazer login')
        return
      }

      const profile = await Firestore.fast.setUserData({ bio: '', social: [], username: '' })
      if (profile) auth.setProfile(profile)
    } catch (error) {
      const { code } = error as FirebaseError
      if (code) {
        toasterKT.danger(AuthenticationError.messages[code])
        return
      }
      toasterKT.danger()
      console.log(error)
    } finally {
      locker.unlock()
    }
  }

  async function signIn(email: string, password: string) {
    locker.lock()
    try {
      const result = await signInWithEmailAndPassword(auth.handler.auth, email, password)

      if (!result.user) {
        toasterKT.danger('Oopss... não foi possível fazer login')
        return
      }

      const profile = await Firestore.fast.getUserData()
      if (profile) auth.setProfile(profile)
    } catch (error) {
      const { code } = error as FirebaseError
      if (code) {
        toasterKT.danger(AuthenticationError.messages[code])
        return
      }
      toasterKT.danger()
      console.log(error)
    } finally {
      locker.unlock()
    }
  }

  async function forgotPassword() {
    if (!payloadValidation.emailForgotPasswordModal) {
      toasterKT.warn('Você deve informar seu e-mail válido primeiro')
      if (emailForgotContainerRef.current) toasterKT.animationTool.shakeX(emailForgotContainerRef.current)
      return
    }
    locker.lock()
    try {
      await sendPasswordResetEmail(auth.handler.auth, payload.emailForgotPasswordModal)
      closeModal('m', () => toasterKT.success('Sucesso! Um link foi enviado ao seu e-mail'))
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') return toasterKT.danger('Usuário não foi encontrado')
      }
      console.log(error)
      toasterKT.danger('Oopss... impossível enviar pedido')
    } finally {
      locker.unlock()
    }
  }

  return (
    <div>
      <UITopAppBar />
      <main
        style={{ height: 'calc(100vh - 50px)' }}
        className="container p-5 is-flex is-flex-direction-column is-align-items-center is-justify-content-center"
      >
        <h1 className="title">Faça login para continuar</h1>
        <p>Área Restrita da Kassiopeia: Entre com as credenciais adequadas e acesse o poder</p>
        <form onSubmit={(e) => e.preventDefault()} className="pb-3 py-5" style={{ width: '60%' }}>
          <div className="pb-2" ref={emailContainerRef}>
            <UIInput
              label="E-mail"
              type="email"
              value={payload.email}
              iconLeft="at"
              placeholder="nicorobin@kassiopeia.dev"
              onImputed={(email) => {
                setPayload((v) => ({ ...v, email }))
                setPayloadValidation((v) => ({
                  ...v,
                  email: validation.isEmailValid(email),
                }))
              }}
              helper={{
                design: 'danger',
                isVisible: payload.email.length > 0 && !payloadValidation.email,
                label: 'Você precisa informar um e-mail válido',
              }}
              isDanger={payload.email.length > 0 && !payloadValidation.email}
            />
          </div>
          <div className="pb-2" ref={passwordContainerRef}>
            <UIInput
              label="Senha"
              type="password"
              value={payload.password}
              iconLeft="key"
              placeholder="Mínimo de 8 caracteres"
              onImputed={(password) => {
                setPayload((v) => ({ ...v, password }))
                setPayloadValidation((v) => ({
                  ...v,
                  password: validation.isPasswordValid(password),
                }))
              }}
              helper={{
                design: 'danger',
                isVisible: payload.password.length > 0 && !payloadValidation.password,
                label: 'Mínimo de 8 caracteres, um símbolo, pelo menos uma letra maiúscula e uma minúscula',
              }}
              isDanger={payload.password.length > 0 && !payloadValidation.password}
            />
          </div>
          <div className="is-flex is-justify-content-flex-end">
            <button onClick={() => openModal('m')} className="button is-ghost p-0" type="button">
              Esqueceu a senha?
            </button>
            <UIModal
              id="m"
              title="Recupere sua senha"
              primaryButton={{ label: 'Solicitar recuperação', onClick: forgotPassword }}
              secondaryButton={{ label: 'Cancelar' }}
            >
              <div>
                <p>Por favor, digite seu e-mail para que possamos enviar um link de recuperação de senha.</p>
                <div className="pt-5" ref={emailForgotContainerRef}>
                  <UIInput
                    label="E-mail"
                    type="email"
                    value={payload.emailForgotPasswordModal}
                    iconLeft="envelope"
                    placeholder="Recupere sua senha"
                    onImputed={(emailForgotPasswordModal) => {
                      setPayload((v) => ({ ...v, emailForgotPasswordModal }))
                      setPayloadValidation((v) => ({
                        ...v,
                        emailForgotPasswordModal: validation.isEmailValid(emailForgotPasswordModal),
                      }))
                    }}
                    helper={{
                      design: 'danger',
                      isVisible:
                        payload.emailForgotPasswordModal.length > 0 &&
                        !payloadValidation.emailForgotPasswordModal,
                      label: 'Digite um e-mail válido primeiro',
                    }}
                    isDanger={
                      payload.emailForgotPasswordModal.length > 0 &&
                      !payloadValidation.emailForgotPasswordModal
                    }
                  />
                </div>
              </div>
            </UIModal>
          </div>
          <div className="is-flex gap-3 my-3">
            <button
              onClick={() => (isPayloadValid() ? signUp(payload.email, payload.password) : void 0)}
              className="is-fullwidth button"
              type="button"
            >
              Cadastrar
            </button>
            <button
              onClick={() => (isPayloadValid() ? signIn(payload.email, payload.password) : void 0)}
              className="is-fullwidth button is-primary"
              type="submit"
            >
              Entrar
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
