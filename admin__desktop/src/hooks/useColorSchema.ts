import { ColorSchemaContext } from '@app/context/ColorSchemaContext'
import { useContext } from 'react'

export function useColorSchema() {
  const { isDarkSchema, schema, updateSchema } = useContext(ColorSchemaContext)

  return {
    isDarkSchema,
    schema,
    setSchema: updateSchema,
  }
}
