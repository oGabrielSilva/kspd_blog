import { emit } from '@tauri-apps/api/event'
import { WebviewWindow } from '@tauri-apps/api/window'

interface IWinProps {
  center?: boolean
  height?: number
  width?: number
  focus?: boolean
  hiddenTitle?: boolean
  decorations?: boolean
  transparent?: boolean
  labelId?: string
}

export function generateWinw(url: string, props?: IWinProps): Promise<WebviewWindow> {
  return new Promise((resolve, reject) => {
    const label = props?.labelId
      ? props.labelId
      : 'label-'.concat(Date.now().toString(36)) + Date.now().toString()
    const win = new WebviewWindow(label, {
      center: props?.center ?? true,
      height: props?.height ?? 480,
      width: props?.width ?? 620,
      focus: props?.focus ?? true,
      hiddenTitle: props?.hiddenTitle ?? true,
      decorations: props?.decorations ?? false,
      transparent: props?.transparent ?? true,
      url,
    })

    win.once('tauri://created', () => {
      emit('new-wind', { label })
      resolve(win)
    })

    win.once('tauri://error', (e) => {
      console.log(e)
      reject(e)
    })
  })
}
