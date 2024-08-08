import properties from '@resources/config/properties.json'
import { createContext, useEffect, useState } from 'react'

type TColorSchema = 'SYSTEM' | 'DARK' | 'LIGHT'

interface IObserver {
  id: string
  cb: (schema: TColorSchema, isDark: boolean, textColor: string) => void
}

interface IColorSchemaContext {
  schema: TColorSchema
  isDarkSchema: boolean
  updateSchema: React.Dispatch<React.SetStateAction<TColorSchema>>
  addObserver: (id: string, observer: IObserver['cb']) => string
  removeObserver: (id: string) => void
}

let listeners: IObserver[] = []
export const textDarkMode = '#abb1bf'
export const textLightMode = '#404654'

export const ColorSchemaContext = createContext({} as IColorSchemaContext)

export default function ColorSchemaContextProvider({ children }: IChildren) {
  const [schema, setSchema] = useState<TColorSchema>(
    (localStorage.getItem(properties.storage.colorSchema.key) as TColorSchema) ?? 'SYSTEM',
  )
  const [isDarkSchema, setDarkSchema] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = schema.toLocaleLowerCase()
    localStorage.setItem(properties.storage.colorSchema.key, schema)

    const isDark =
      schema === 'DARK' || (schema === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkSchema(isDark)
    listeners.forEach((ob) => {
      ob.cb(schema, isDark, isDark ? textDarkMode : textLightMode)
    })
  }, [schema])

  const addObserver: IColorSchemaContext['addObserver'] = (id, observer) => {
    const index = listeners.findIndex((ob) => ob.id === id)
    if (index > -1) {
      listeners[index].cb = observer
      return id
    }
    listeners.push({ id, cb: observer })
    return id
  }

  const removeObserver: IColorSchemaContext['removeObserver'] = (id) => {
    listeners = listeners.filter((ob) => ob.id !== id)
  }

  return (
    <ColorSchemaContext.Provider
      value={{ isDarkSchema, schema, updateSchema: setSchema, addObserver, removeObserver }}
    >
      {children}
    </ColorSchemaContext.Provider>
  )
}
