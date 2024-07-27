import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { UITextarea } from '@app/components/shared/UITextarea'
import { BasicEditor } from '@app/components/tiptap/basic/BasicEditor'
import { HomeContext } from '@app/context/HomeContext'
import { StackContext } from '@app/context/StackContext'
import { useAuth } from '@app/hooks/useAuth'
import { useStacks } from '@app/hooks/useStacks'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { formatDate } from '@app/utils/formatDate'
import { Timestamp } from 'firebase/firestore'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useContext, useEffect, useRef, useState } from 'react'

export interface IIMG {
  src: string
  description: string
  figcaption: string
  blob: Blob | null
}

const validation = ValidationKassiopeiaTool.fast
const anim = toasterKT.animationTool

export function UIEditStack() {
  const auth = useAuth()
  const { setScreen } = useContext(HomeContext)
  const { editStack, setEditStack, stacks } = useContext(StackContext)

  const { reloadStacks, update: updateStacks } = useStacks()

  const [title, setTitle] = useState(editStack?.name ?? '')
  const [isTitleValid, setTitleValid] = useState(validation.isNameValid(editStack?.name ?? ''))

  const [description, setDescription] = useState(editStack?.description ?? '')
  const [metaDescription, setMetaDescription] = useState(editStack?.metaDescription ?? '')

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

    if (title !== editStack?.name) {
      reloadStacks((loaded) => {
        const st = loaded.find((st) => st.name === title)
        if (st) {
          toasterKT.info(
            `Stack [${st.name}] foi criada em ${formatDate(new Date(st.createdAt.toDate()), 'pt-BR')}`,
            10000,
          )
          return
        }
        if (metaDescription.length > 160) return openModal('more__160chars_alert')

        saveChages()
      })
      return
    }
    if (metaDescription.length > 160) return openModal('more__160chars_alert')

    saveChages()
  }

  async function saveChages() {
    ScreenLockerKassiopeiaTool.fast.lock()

    try {
      const firestore = Firestore.fast
      const data = await firestore.upload(
        {
          uid: editStack!.uid,
          name: title,
          description,
          metaDescription,
          createdBy: editStack!.createdBy,
          updatedBy: auth.user!.uid,
          createdAt: editStack!.createdAt,
          updatedAt: Timestamp.now(),
        },
        'stacks',
        editStack!.uid,
      )
      if (data) {
        updateStacks([...stacks.filter((st) => st.uid !== editStack!.uid), data as IStack])
        setScreen('ALL_STACKS')
      }
    } catch (error) {
      console.log(error)
      toasterKT.danger('Não foi possível criar a Stack. Algo deu errado (desconhecido)')
    } finally {
      ScreenLockerKassiopeiaTool.fast.unlock()
    }
  }

  return !editStack ? (
    <div />
  ) : (
    <div>
      <h1 className="title">Editar Stack: {editStack.name}</h1>
      <p>
        As Stacks funcionam como categorias que agrupam temas relacionados, facilitando a organização e a
        busca por conteúdo. Aqui você pode editar as informações da Stack, garantindo que ela continue
        relevante e útil para a categorização das postagens.
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
            content={description}
            onUpdate={(descriptionHTML) => setDescription(descriptionHTML)}
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

        <div className="py-5 buttons">
          <button className="button is-primary" type="submit">
            Salvar
          </button>
          <button
            type="button"
            className="button"
            onClick={() => {
              setEditStack(null)
              setScreen('ALL_STACKS')
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
      <UIModal
        title="Meta descrição muito grande"
        id="more__160chars_alert"
        primaryButton={{
          label: 'Salvar mesmo assim',
          closeModalOnClick: true,
          design: 'warning',
          onClick: saveChages,
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
            A meta descrição tem mais de 160 caracteres. <strong>Salvar Stack mesmo assim?</strong>
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
