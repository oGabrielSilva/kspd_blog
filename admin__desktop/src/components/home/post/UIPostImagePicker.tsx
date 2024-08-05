import { UIInput } from '@app/components/shared/UIInput'
import { UIModal } from '@app/components/shared/UIModal'
import { closeModal } from '@app/lib/bulma/modals'
import { Storage } from '@app/lib/firebase/storage/Storage'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { minimizeText } from '@app/utils/minimizeText'
import { uuidv4 } from '@app/utils/uuidv4'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { type User } from 'firebase/auth'
import { ImageKassiopeiaProcessingTool } from 'kassiopeia-tools'
import { FormEventHandler, useEffect, useRef, useState } from 'react'

interface IProps {
  modalId: string
  medias: IMedia[]
  post: IPost
  user: User
  addMedia: (media: IMedia) => void
  onPick: (medias: IMedia[]) => void
}

export function UIPostImagePicker({ medias, modalId, post, user, addMedia, onPick }: IProps) {
  const [selectedMedia, setSelectedMedia] = useState<IMedia[]>([])

  const [upload, setUpload] = useState(false)
  const [isDelete, setDelete] = useState(false)

  const [figcaption, setFigcaption] = useState('')
  const [description, setDescription] = useState('')

  const imageInputRef = useRef<HTMLInputElement>(null)
  const descriptionInputRef = useRef<HTMLInputElement>(null)
  const figcaptionInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setFigcaption('')
    setDescription('')
    setSelectedMedia([])
  }

  useEffect(() => {
    if (!upload || !isDelete) reset()
  }, [isDelete, upload])

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
    const blob =
      e.currentTarget.files && e.currentTarget.files[0]
        ? await ImageKassiopeiaProcessingTool.fast.convertFileToWebpBlobWithoutClipping(
            e.currentTarget.files[0],
            0.75,
          )
        : null

    if (!blob) return toasterKT.info('Nenhuma imagem selecionada')
    locker.lock()

    try {
      const id = await uuidv4()
      const result = await Storage.fast.uploadBlob(
        blob,
        `post/${post.uid}/${id}.webp`,
        { post: post.uid, user: user.uid, id },
        false,
      )

      if (!result) {
        toasterKT.danger('Erro ao salvar sua imagem (Desconhecido)')
        return
      }

      addMedia({ description, figcaption, loadType: 'lazy', src: result, type: 'IMAGE' })
      setUpload(false)
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
      primaryButton={{
        label: 'Selecionar',
        design: 'link',
        icon: 'add',
        closeModalOnClick: true,
        onClick: () => {
          onPick(upload || isDelete ? [] : selectedMedia)
          setDelete(false)
          setUpload(false)
        },
      }}
      secondaryButton={{
        label: 'Cancelar',
        closeModalOnClick: false,
        onClick() {
          if (upload || isDelete) {
            setUpload(false)
            setDelete(false)
          } else {
            closeModal(modalId)
            reset()
          }
        },
      }}
    >
      {upload ? (
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
      ) : isDelete ? (
        <div />
      ) : (
        <div>
          <div className="pb-3 is-flex is-justify-content-center is-align-items-center gap-3">
            <button
              type="button"
              className="button is-small is-outlined is-link"
              style={{ width: '100%' }}
              onClick={() => setUpload(true)}
            >
              <span className="icon is-small">
                <FontAwesomeIcon aria-hidden icon="cloud-arrow-up" />
              </span>
              <span>Fazer upload</span>
            </button>
            <button
              type="button"
              className="button is-small is-outlined is-danger"
              style={{ width: '100%' }}
              onClick={() => setDelete(true)}
            >
              <span className="icon is-small">
                <FontAwesomeIcon aria-hidden icon="trash" />
              </span>
              <span>Remover</span>
            </button>
          </div>
          {medias.length < 1 ? (
            <div>
              <p>Nenhuma mídia encontrada</p>
            </div>
          ) : (
            <ul data-ui-post-image-picker className="is-flex is-flex-direction-column gap-3">
              {medias
                .filter((m) => m.type === 'IMAGE')
                .map((media, index) => {
                  return (
                    <li
                      role="button"
                      data-url={media.src}
                      key={index}
                      className={'button is-align-items-flex-start gap-3 is-clickable is-justify-content-flex-start p-3'.concat(
                        selectedMedia.find((s) => s.src === media.src) ? ' is-dark' : '',
                      )}
                      onClick={() => {
                        setSelectedMedia((v) => {
                          const isSelected = v.find((s) => s.src === media.src)
                          return isSelected ? v.filter((m) => m.src !== media.src) : [...v, media]
                        })
                      }}
                    >
                      <img
                        src={media.src}
                        alt={media.description}
                        title={media.description}
                        loading={media.loadType}
                        style={{ maxWidth: 100, objectFit: 'cover', borderRadius: 4 }}
                      />
                      <p
                        style={{ whiteSpace: 'wrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                        className="has-text-left"
                      >
                        <small style={{ fontSize: '0.75rem' }}>
                          <strong>Caption:</strong> {minimizeText(media.figcaption, 100)}
                        </small>
                      </p>
                    </li>
                  )
                })}
            </ul>
          )}
        </div>
      )}
    </UIModal>
  )
}
