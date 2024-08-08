import { AnimationKassiopeiaTool } from 'kassiopeia-tools'

export function openModal(modal: HTMLElement | string) {
  const $el =
    typeof modal === 'string'
      ? document.querySelector<HTMLElement>(modal.startsWith('#') ? modal : '#' + modal)
      : modal
  if ($el) {
    const card = $el.querySelector<HTMLElement>('.modal-card')!
    card.style.display = 'none'
    AnimationKassiopeiaTool.fast
      .otherAnimationByName($el, 'animate__fadeIn', true, 200)
      .addEventOnCompletion(() => {
        card.style.display = ''
        AnimationKassiopeiaTool.fast.otherAnimationByName(card, 'animate__bounceInDown')
        setTimeout(() => $el.classList.add('is-active'), 10)
      })
  }
}

export function closeModal(modal: HTMLElement | string, onComplete?: () => void) {
  const $el =
    typeof modal === 'string'
      ? document.querySelector<HTMLElement>(modal.startsWith('#') ? modal : '#' + modal)
      : modal
  const anim = AnimationKassiopeiaTool.fast

  if ($el) {
    const card = $el.querySelector<HTMLElement>('.modal-card')!
    anim.otherAnimationByName(card, 'animate__bounceOutUp').addEventOnCompletion(() => {
      anim.otherAnimationByName($el, 'fadeOut', false, 200).addEventOnCompletion(() => {
        $el.classList.remove('is-active')
        if (onComplete) onComplete()
      })
    })
  }
}

export function closeAllModals() {
  ;(document.querySelectorAll<HTMLElement>('.modal') || []).forEach(($modal) => {
    closeModal($modal)
  })
}
