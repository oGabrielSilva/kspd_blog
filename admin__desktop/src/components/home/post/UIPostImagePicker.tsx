import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ImageKassiopeiaProcessingTool } from 'kassiopeia-tools'
import { FormEventHandler, useRef, useState } from 'react'

interface IProps {
  modalId: string
  onPick(dataURL: string, caption: string, description: string): void
}

export function UIPostImagePicker({ modalId, onPick }: IProps) {
  const [figcaption, setFigcaption] = useState('')
  const [description, setDescription] = useState('')

  const imageInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLInputElement>(null)
  const figcaptionInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setFigcaption('')
    setDescription('')
  }

  const isValid = () => {
    if (figcaption.length < 5) {
      toasterKT.warn('Digite um figcaption um pouco maior')
      toasterKT.animationTool.shakeX(figcaptionInputRef.current!)
      return false
    }
    if (description.length < 5) {
      toasterKT.warn('Digite uma descrição um pouco maior')
      toasterKT.animationTool.shakeX(descriptionInputRef.current!)
      return false
    }
    return true
  }

  const onImageImputed: FormEventHandler<HTMLInputElement> = async (e) => {
    locker.lock()

    try {
      const blob =
        e.currentTarget.files && e.currentTarget.files[0]
          ? await ImageKassiopeiaProcessingTool.fast.convertFileToWebpBlobWithoutClipping(
              e.currentTarget.files[0],
              0.75,
            )
          : null

      if (!blob) return toasterKT.info('Nenhuma imagem selecionada')

      const dataURL = await ImageKassiopeiaProcessingTool.fast.blobToDataURL(blob, 'webp')

      onPick(dataURL, figcaption, description)
      reset()
    } catch (error) {
      console.log(error)
      toasterKT.danger('Não foi possível submeter sua imagem')
    } finally {
      locker.unlock()
    }
  }

  return (
    <UIModal
      id={modalId}
      title="Selecione uma imagem"
      secondaryButton={{
        label: 'Cancelar',
        closeModalOnClick: true,
        onClick() {
          reset()
        },
      }}
    >
      <>
        <div>
          <div className="pb-3" ref={figcaptionInputRef}>
            <UIInput
              label="Figcaption"
              value={figcaption}
              onImputed={(fig) => setFigcaption(fig)}
              placeholder="Foto de [descreva a imagem]. Por [autor]"
            />
          </div>

          <div className="pb-3" ref={descriptionInputRef}>
            <UIInput
              label="Descrição"
              value={description}
              onImputed={(desc) => setDescription(desc)}
              placeholder="Descreva a imagem"
              helper={{
                isVisible: true,
                label: 'Este campo fornecerá informações de acessibilidade para a imagem',
              }}
            />
          </div>
          <div
            onClick={() => (isValid() ? imageInputRef.current?.click() : void 0)}
            className="file is-boxed pt-3"
          >
            <div className="file-label" style={{ width: '100%' }}>
              <input
                ref={imageInputRef}
                type="file"
                className="is-hidden"
                accept="image/jpeg, image/png, image/webp"
                onInput={onImageImputed}
              />
              <span className="file-cta">
                <span className="file-icon">
                  <FontAwesomeIcon icon="cloud-upload-alt" />
                </span>
                <span className="file-label">Selecione a imagem</span>
              </span>
            </div>
          </div>
        </div>
      </>
    </UIModal>
  )
}
