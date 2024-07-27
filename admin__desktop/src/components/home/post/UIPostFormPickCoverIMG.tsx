import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ImageKassiopeiaProcessingTool, ScreenLockerKassiopeiaTool } from 'kassiopeia-tools'
import { Dispatch, SetStateAction, useRef, useState } from 'react'
import type { IIMG } from '../UINewPost'

interface IProps {
  img: IIMG
  changeIMG: Dispatch<SetStateAction<IIMG>>
}

const imgModalId = '___IDModal_cover__img'
const anim = toasterKT.animationTool

export function UIPostFormPickCoverIMG({ img, changeIMG }: IProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLInputElement>(null)
  const figcaptionInputRef = useRef<HTMLInputElement>(null)

  const [description, setDescription] = useState('')
  const [figcaption, setFigcaption] = useState('')

  function isValid() {
    if (figcaption.length < 5) {
      toasterKT.warn('Digite um figcaption um pouco maior')
      anim.shakeX(figcaptionInputRef.current!)
      return false
    }
    if (description.length < 5) {
      toasterKT.warn('Digite uma descrição um pouco maior')
      anim.shakeX(descriptionInputRef.current!)
      return false
    }
    return true
  }

  async function onInputFile() {
    if (imageInputRef.current && imageInputRef.current.files && imageInputRef.current.files[0]) {
      ScreenLockerKassiopeiaTool.fast.lock()
      try {
        const blob = await ImageKassiopeiaProcessingTool.fast.convertFileToWebpBlobWithoutClipping(
          imageInputRef.current.files[0],
        )

        closeModal(imgModalId)

        changeIMG((v) => {
          if (v.blob) URL.revokeObjectURL(v.src)
          return { blob, src: URL.createObjectURL(blob), description, figcaption }
        })
      } catch (error) {
        console.log(error)
        toasterKT.danger('Erro ao processar a imagem')
      } finally {
        ScreenLockerKassiopeiaTool.fast.unlock()
      }
    }
  }

  return (
    <div>
      <label className="label">Imagem de capa</label>
      <img
        style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
        role="button"
        className="image is-3by1 is-clickable pb-4"
        src={img.src}
        alt="strings.postImgAlt"
        onClick={() => openModal(imgModalId)}
      />

      <div>
        <UIModal id={imgModalId} title="Imagem de capa" secondaryButton={{ label: 'Cancelar' }}>
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

            <div className="file is-boxed pt-3">
              <div
                onClick={() => {
                  if (isValid()) {
                    imageInputRef.current?.click()
                  }
                }}
                className="file-label"
                style={{ width: '100%' }}
              >
                <input
                  ref={imageInputRef}
                  type="file"
                  className="is-hidden"
                  accept="image/jpeg, image/png, image/webp"
                  onInput={onInputFile}
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
        </UIModal>
      </div>
    </div>
  )
}
