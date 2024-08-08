import { UIModal } from '@app/components/shared/UIModal'
import { closeModal, openModal } from '@app/lib/bulma/modals'
import { toasterKT } from '@app/lib/kassiopeia-tools/toaster'
import { Dispatch, SetStateAction, useState } from 'react'

interface IProps {
  keywords: string[]
  setKeywords: Dispatch<SetStateAction<string[]>>
}

export function UIPostFormKeywordsView({ keywords, setKeywords }: IProps) {
  //Palavra-chave para ser deletada no modal
  const [deleteKeyword, setDeleteKeyword] = useState<string>()

  return (
    <>
      {keywords.length > 0 ? (
        <div className="is-flex gap-1 is-flex-wrap-wrap">
          {keywords.map((keyword, index) => {
            return (
              <div key={index} data-keyword={keyword}>
                <div
                  className="tags has-addons"
                  onClick={() => {
                    setDeleteKeyword(keyword)
                    openModal('modal__keywordToDelete')
                  }}
                >
                  <span className="tag is-hoverable">{keyword}</span>
                  <button className="tag is-delete" type="button" />
                </div>
              </div>
            )
          })}
          <UIModal
            id="modal__keywordToDelete"
            title={`Remover palavra-chave [${deleteKeyword}]?`}
            primaryButton={{
              label: 'Sim, remover',
              design: 'warning',
              onClick: () => {
                closeModal('modal__keywordToDelete', () => {
                  const element = document.querySelector<HTMLElement>(`[data-keyword="${deleteKeyword}"]`)!
                  toasterKT.animationTool.zoomOutEnd(element, false, 500).addEventOnCompletion(() => {
                    setKeywords((keys) => keys.filter((k) => k !== deleteKeyword))
                    toasterKT.animationTool.clean(element)
                    setDeleteKeyword(void 0)
                  })
                })
              },
              closeModalOnClick: false,
            }}
            secondaryButton={{
              label: 'Cancelar',
              onClick: () => closeModal('modal__keywordToDelete', () => setDeleteKeyword(void 0)),
              closeModalOnClick: false,
            }}
          />
        </div>
      ) : (
        void 0
      )}
    </>
  )
}
