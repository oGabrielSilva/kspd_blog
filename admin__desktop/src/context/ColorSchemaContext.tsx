import properties from '@resources/config/properties.json'
import { createContext, useEffect, useState } from 'react'

type TColorSchema = 'SYSTEM' | 'DARK' | 'LIGHT'
interface IColorSchemaContext {
  schema: TColorSchema
  isDarkSchema: boolean
  updateSchema: React.Dispatch<React.SetStateAction<TColorSchema>>
}

export const ColorSchemaContext = createContext({} as IColorSchemaContext)

export default function ColorSchemaContextProvider({ children }: IChildren) {
  const [schema, setSchema] = useState<TColorSchema>(
    (localStorage.getItem(properties.storage.colorSchema.key) as TColorSchema) ?? 'SYSTEM',
  )
  const [isDarkSchema, setDarkSchema] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = schema.toLocaleLowerCase()
    localStorage.setItem(properties.storage.colorSchema.key, schema)

    setDarkSchema(
      schema === 'DARK' || (schema === 'SYSTEM' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    )
  }, [schema])

  return (
    <ColorSchemaContext.Provider value={{ isDarkSchema, schema, updateSchema: setSchema }}>
      {children}
    </ColorSchemaContext.Provider>
  )
}
