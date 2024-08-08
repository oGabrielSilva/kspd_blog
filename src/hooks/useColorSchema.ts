import { ColorSchemaContext, textDarkMode, textLightMode } from '@app/context/ColorSchemaContext'
import { useContext, useMemo } from 'react'

export function useColorSchema() {
  const { isDarkSchema, schema, updateSchema, addObserver, removeObserver } = useContext(ColorSchemaContext)

  const textColor = useMemo(
    () => ({
      current: isDarkSchema ? textDarkMode : textLightMode,
      light: textLightMode,
      dark: textDarkMode,
    }),
    [isDarkSchema],
  )

  return {
    isDarkSchema,
    schema,
    setSchema: updateSchema,
    textColor,
    addObserver,
    removeObserver,
  }
}
