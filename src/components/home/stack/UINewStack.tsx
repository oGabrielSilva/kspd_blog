import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { UITextarea } from '@app/components/shared/UITextarea'
import { BasicEditor } from '@app/components/tiptap/basic/BasicEditor'
import { defaultFont } from '@app/components/tiptap/basic/UIDropdownFontFamily'
import { HomeContext } from '@app/context/HomeContext'
import { reloadStackEventId } from '@app/context/StackContext'
import { useAuth } from '@app/hooks/useAuth'
import { useStacks } from '@app/hooks/useStacks'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { formatDate } from '@app/utils/formatDate'
import { uuidv4 } from '@app/utils/uuidv4'
import { emit } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'
import { Timestamp } from 'firebase/firestore'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useContext, useEffect, useRef, useState } from 'react'

export interface IIMG {
  src: string
  description: string
  figcaption: string
  blob: Blob | null
}

interface IProps {
  closeWinwWhenFinished?: boolean
}

const validation = ValidationKassiopeiaTool.fast
const anim = toasterKT.animationTool

export function UINewStack({ closeWinwWhenFinished }: IProps) {
  const auth = useAuth()
  const { setScreen } = useContext(HomeContext)

  const { reloadStacks, update: updateStacks } = useStacks()

  const [title, setTitle] = useState('')
  const [isTitleValid, setTitleValid] = useState(false)

  const [description, setDescription] = useState({ content: '', font: defaultFont })
  const [metaDescription, setMetaDescription] = useState('')

  const titleInputContainerRef = useRef<HTMLDivElement>(null)
  const descriptionInputContainerRef = useRef<HTMLDivElement>(null)
  const metaDescriptionInputContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setTitleValid(validation.isNameValid(title)), [title])

  const submit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (!isTitleValid) {
      anim.shakeX(titleInputContainerRef.current!)
      toasterKT.warn('Você precisa informar um título maior')
      return
    }
    if (metaDescription.length < 50) {
      anim.shakeX(metaDescriptionInputContainerRef.current!).addEventOnCompletion(() => {
        metaDescriptionInputContainerRef.current?.querySelector('textarea')?.focus()
      })
      toasterKT.warn('Você precisa informar uma meta descrição maior. Pelo menos 50 caracteres')
      return
    }
    if (metaDescription.length > 160) return openModal('more__160chars_alert')
    upload()
  }

  async function upload() {
    reloadStacks(async (stacks) => {
      const st = stacks.find((st) => st.name === title)
      if (st) {
        toasterKT.info(
          `Stack [${st.name}] foi criada em ${formatDate(new Date(st.createdAt.toDate()), 'pt-BR')}`,
          10000,
        )
        return
      }

      ScreenLockerKassiopeiaTool.fast.lock()

      try {
        const firestore = Firestore.fast
        const uid = await uuidv4()
        const data = await firestore.upload(
          {
            uid,
            name: title,
            description,
            metaDescription,
            createdBy: auth.user?.uid,
            updatedBy: auth.user?.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
          'stacks',
          uid,
        )
        if (data) {
          updateStacks([...stacks, data as IStack], async () => {
            if (closeWinwWhenFinished) {
              await emit(reloadStackEventId)
              return appWindow.close()
            }
          })

          setScreen('ALL_STACKS')
        }
      } catch (error) {
        console.log(error)
        toasterKT.danger('Não foi possível criar a Stack. Algo deu errado (desconhecido)')
      } finally {
        ScreenLockerKassiopeiaTool.fast.unlock()
      }
    })
  }

  return (
    <div>
      <h1 className="title">Crie uma nova Stack</h1>
      <p>
        As Stacks funcionam como categorias, permitindo que uma postagem pertença a mais de uma Stack. Elas
        servem para agrupar temas relacionados, facilitando a organização e a busca por conteúdo.
      </p>
      <form className="py-3" onSubmit={submit}>
        <div ref={titleInputContainerRef}>
          <UIInput
            label="Título"
            value={title}
            onImputed={(title) => setTitle(title)}
            isDanger={!isTitleValid}
            helper={{ isVisible: !isTitleValid, label: 'Adicione um título válido', design: 'danger' }}
            placeholder="Exemplos: Terror, Aventura, Java, Filmes, Desenvolvimento web, etc..."
            iconLeft="file-signature"
          />
        </div>

        <div ref={descriptionInputContainerRef} className="py-3">
          <label className="label">Descrição</label>
          <BasicEditor
            content={description.content}
            font={description.font}
            onUpdate={(content, font) => setDescription({ content, font })}
          />
        </div>

        <div ref={metaDescriptionInputContainerRef}>
          <UITextarea
            label="Meta descrição"
            value={metaDescription}
            onImputed={(meta) => setMetaDescription(meta)}
            helper={{
              isVisible: true,
              label: `A melhor recomendação sobre o tamanho de uma meta descrição é mantê-la entre 150 e 160 caracteres. Se for maior que isso, o Google, por exemplo, cortará a meta descrição. Tamanho atual: ${metaDescription.length}`,
              design: 'warning',
            }}
          />
        </div>

        <div className="py-5">
          <button className="button is-primary" type="submit">
            Salvar
          </button>
        </div>
      </form>
      <UIModal
        title="Meta descrição muito grande"
        id="more__160chars_alert"
        primaryButton={{
          label: 'Criar Stack mesmo assim',
          closeModalOnClick: true,
          design: 'warning',
          onClick: upload,
        }}
        secondaryButton={{
          label: 'Cancelar',
          design: 'link',
          closeModalOnClick: false,
          onClick: () => {
            closeModal('more__160chars_alert', () => {
              toasterKT.animationTool.shakeX(metaDescriptionInputContainerRef.current!)
              metaDescriptionInputContainerRef.current?.querySelector('textarea')?.focus()
            })
          },
        }}
      >
        <div>
          <p className="pb-3">
            A meta descrição tem mais de 160 caracteres. <strong>Criar Stack mesmo assim?</strong>
          </p>
          <p className="pb-3">
            A melhor recomendação sobre o tamanho de uma meta descrição é mantê-la entre 150 e 160 caracteres.
            Se for maior que isso, o Google, por exemplo, cortará a meta descrição.
          </p>
          <p className="pb-3">
            Tamanho atual: <strong>{metaDescription.length}</strong> caracteres
          </p>
        </div>
      </UIModal>
    </div>
  )
}
