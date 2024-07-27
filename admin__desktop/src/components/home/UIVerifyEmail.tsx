import { Auth } from '@app/lib/firebase/auth/Auth'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { sendEmailVerification } from 'firebase/auth'
import { ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'

const locker = ScreenLockerKassiopeiaTool.fast

async function sendLink() {
  locker.lock()
  try {
    await sendEmailVerification(Auth.fast.user!)
    toasterKT.success('Acabamos de enviar um link de confirmação para o email ' + Auth.fast.user?.email)
  } catch (error) {
    console.log(error)
    toasterKT.danger('Algo de errado aconteceu')
  } finally {
    locker.unlock()
  }
}

async function confirm() {
  locker.lock()
  try {
    await Auth.fast.user?.reload()

    if (!Auth.fast.user?.emailVerified) toasterKT.danger('Seu e-mail não foi confirmado ainda')
    else toasterKT.info('Acesso liberado!')
  } catch (error) {
    console.log(error)
    toasterKT.danger('Algo de errado aconteceu')
  } finally {
    locker.unlock()
  }
}

export function UIVerifyEmail() {
  return (
    <>
      <section className="p-5 content h-100 is-flex is-justify-content-center is-flex-direction-column is-align-items-center">
        <h1 className="title">Oopss...</h1>
        <p>Precisamos que você verifique seu e-mail para poder utilizar a plataforma</p>
        <button
          onClick={sendLink}
          type="button"
          className="button is-link is-outlined"
          style={{ marginBottom: 50 }}
        >
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon="envelope" />
          </span>
          <span>Me envie o link de confirmação</span>
        </button>

        <button
          onClick={confirm}
          type="button"
          className="button is-small is-success is-outlined"
          style={{ position: 'absolute', bottom: '5vh', left: '50%', transform: 'translateX(-50%)' }}
        >
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon="check-double" className="" />
          </span>
          <span>Já confirmei</span>
        </button>
      </section>
    </>
  )
}
