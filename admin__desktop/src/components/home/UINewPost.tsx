import imgPlaceholder from '@resources/img/blog_placeholder.webp'
import { ValidationKassiopeiaTool } from 'kassiopeia-tools'
import { useEffect, useRef, useState } from 'react'
import { UIInput } from '../shared/UIInput'
import { UITextarea } from '../shared/UITextarea'
import { BasicEditor } from '../tiptap/basic/BasicEditor'
import { UIPostFormPickCoverIMG } from './post/UIPostFormPickCoverIMG'

export interface IIMG {
  src: string
  description: string
  figcaption: string
  blob: Blob | null
}

const validation = ValidationKassiopeiaTool.fast

export function UINewPost() {
  const [img, setIMG] = useState<IIMG>({
    src: imgPlaceholder,
    blob: null as Blob | null,
    description: '',
    figcaption: '',
  })
  const [title, setTitle] = useState('')
  const [isTitleValid, setTitleValid] = useState(false)

  const [description, setDescription] = useState('')
  const [metaDscription, setMetaDescription] = useState('')

  const titleInputContainerRef = useRef<HTMLDivElement>(null)
  const descriptionInputContainerRef = useRef<HTMLDivElement>(null)
  const metaDescriptionInputContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => setTitleValid(validation.isNameValid(title)), [title])

  return (
    <div>
      <h1 className="title">Crie algo incrível</h1>
      <p>Tem algo interessante em mente? Um novo post é perfeito para compartilhar suas ideias</p>
      <form className="py-3">
        <UIPostFormPickCoverIMG img={img} changeIMG={setIMG} />

        <div ref={titleInputContainerRef}>
          <UIInput
            label="Título"
            value={title}
            onImputed={(title) => setTitle(title)}
            isDanger={!isTitleValid}
            helper={{ isVisible: !isTitleValid, label: 'Adicione um título válido', design: 'danger' }}
            placeholder="Exemplo: Por que o Crocodile poderia ser a mãe do Luffy?"
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
            value={metaDscription}
            onImputed={(meta) => setMetaDescription(meta)}
            helper={{
              isVisible: true,
              label: `A melhor recomendação sobre o tamanho de uma meta descrição é mantê-la entre 150 e 160 caracteres. Se for maior que isso, o Google, por exemplo, cortará a meta descrição. Tamanho atual: ${metaDscription.length}`,
              design: 'warning',
            }}
          />
        </div>
      </form>
    </div>
  )
}
