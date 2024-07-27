import { useAuth } from '@app/hooks/useAuth'
import { useStacks } from '@app/hooks/useStacks'
import { Firestore } from '@app/lib/firebase/firestore/Firestore'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { formatDate } from '@app/utils/formatDate'
import { ScreenLockerKassiopeiaTool, ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { FormEventHandler, useEffect, useRef, useState } from 'react'
import { UIInput } from '../shared/UIInput'
import { UITextarea } from '../shared/UITextarea'
import { BasicEditor } from '../tiptap/basic/BasicEditor'

export interface IIMG {
  src: string
  description: string
  figcaption: string
  blob: Blob | null
}

const validation = ValidationKassiopeiaTool.fast
const anim = toasterKT.animationTool

export function UINewStack() {
  const auth = useAuth()
  const { reloadStacks, update: updateStacks } = useStacks()

  const [title, setTitle] = useState('')
  const [isTitleValid, setTitleValid] = useState(false)

  const [description, setDescription] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  const titleInputContainerRef = useRef<HTMLDivElement>(null)
  const descriptionInputContainerRef = useRef<HTMLDivElement>(null)
  const metaDescriptionInputContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setTitleValid(validation.isNameValid(title)), [title])

  const submit: FormEventHandler<HTMLFormElement> = async (e) => {
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
    reloadStacks(async (stacks) => {
      const st = stacks.find((st) => st.name === title)
      if (st) {
        toasterKT.info(`Stack [${st.name}] já foi criada em ${formatDate(new Date(st.createdAt), 'pt-BR')}`)
        return
      }

      ScreenLockerKassiopeiaTool.fast.lock()

      try {
        const firestore = Firestore.fast
        const data = await firestore.upload(
          {
            name: title,
            description,
            metaDescription,
            createdBy: auth.user?.uid,
            createdAt: new Date(),
            updatedBy: new Date(),
          },
          'stacks',
          title,
        )
        if (data) {
          updateStacks([...stacks, data as IStack])
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

        <div className="py-5">
          <button className="button is-primary" type="submit">
            Salvar
          </button>
        </div>
      </form>
    </div>
  )
}
