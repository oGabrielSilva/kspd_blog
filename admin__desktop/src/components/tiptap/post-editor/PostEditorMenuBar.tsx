import { useColorSchema } from '@app/hooks/useColorSchema'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Editor } from '@tiptap/react'
import { ColorPicker } from 'primereact/colorpicker'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { UIDropdownFontFamily } from '../basic/UIDropdownFontFamily'

interface IProps {
  editor: Editor | null
  font: IFontName
  setFont: Dispatch<SetStateAction<IFontName>>
  onRequireImage: () => void
}

export function PostEditorMenuBar({ editor, font, setFont, onRequireImage }: IProps) {
  const { textColor, addObserver, removeObserver } = useColorSchema()

  const [color, setColor] = useState(textColor.current)
  const [colorBackground, setColorBackground] = useState<string>()

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()

      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  useEffect(() => {
    if (editor) {
      const fn = () => {
        const highlight = editor.getAttributes('highlight').color
        if (highlight) setColorBackground(highlight)
        else setColorBackground('')

        const { color } = editor.getAttributes('textStyle')
        if (color) setColor(color)
        else setColor(textColor.current)
      }

      editor.on('selectionUpdate', fn)
      return () => editor.off('selectionUpdate', fn)
    }
    return () => {}
  }, [editor, textColor])

  useEffect(() => {
    const id = addObserver('test__textcolor-BASIC_MENU____BAR', (_schema, _isDark, currentTextColor) => {
      setColor((c) => {
        if ([textColor.dark, textColor.light].includes(c)) return currentTextColor
        return c
      })
    })
    ;() => removeObserver(id)
  }, [addObserver, removeObserver, textColor.dark, textColor.light])

  return !editor ? null : (
    <div className="bar" style={{ borderRadius: 0, border: '1px solid var(--bulma-border-weak)' }}>
      <div className="buttons gap are-small">
        <button
          title="Bold [Ctrl + B]"
          aria-label="Negrito no texto selecionado"
          className={'bold button is-text'.concat(editor.isActive('bold') ? ' has-text-link' : '')}
          type="button"
          onClick={() => {
            editor.chain().focus().toggleBold().run()
          }}
        >
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon={'bold'} />
          </span>
        </button>
        <button
          title="Itálico [Ctrl + i]"
          aria-label="Itálico no texto selecionado"
          className={'italic button is-text'.concat(editor.isActive('italic') ? ' has-text-link' : '')}
          type="button"
          onClick={() => {
            editor.chain().focus().toggleItalic().run()
          }}
        >
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon={'italic'} />
          </span>
        </button>
        <button
          title="Sublinhado [Ctrl + U]"
          aria-label="Sublinhar texto selecionado"
          className={'underline button is-text'.concat(editor.isActive('underline') ? ' has-text-link' : '')}
          type="button"
          onClick={() => {
            editor.chain().focus().toggleUnderline().run()
          }}
        >
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon={'underline'} />
          </span>
        </button>
        <button
          className={'strike button is-text'.concat(editor.isActive('strike') ? ' has-text-link' : '')}
          type="button"
          title="Tachar [Ctrl + Shift + S]"
          aria-label="Tachar texto selecionado"
          onClick={() => {
            editor.chain().focus().toggleStrike().run()
          }}
        >
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon={'strikethrough'} />
          </span>
        </button>

        <div>
          <button
            title="Título [Ctrl + Alt + 1]"
            aria-label="Aplicar título ao texto selecionado"
            className={'h1 px-2 mr-1 button is-text'}
            type="button"
            onClick={() => {
              editor.chain().focus().setHeading({ level: 1 }).run()
            }}
            style={{ textDecoration: 'none', fontFamily: 'JetBrains Mono' }}
          >
            H<sub>1</sub>
          </button>
          <button
            title="Subtítulo [Ctrl + Alt + 2]"
            aria-label="Aplicar subtítulo ao texto selecionado"
            className={'h2 px-2 button is-text'}
            type="button"
            style={{ textDecoration: 'none', fontFamily: 'JetBrains Mono' }}
            onClick={() => {
              editor.chain().focus().setHeading({ level: 2 }).run()
            }}
          >
            H<sub>2</sub>
          </button>
        </div>

        <div title="Fonte do texto" aria-label="Troque a fonte do texto">
          <UIDropdownFontFamily
            id="dp___post_editor_font_pick"
            font={font}
            borderless
            onChange={(f) => setFont(f)}
          />
        </div>

        <button
          title="Lista numerada [Ctrl + Shift + 7]"
          aria-label="Defina uma lista numerada"
          className={'ordenedList button is-text'.concat(
            editor.isActive('orderedList') ? ' has-text-link' : '',
          )}
          type="button"
          onClick={() => {
            editor.chain().focus().toggleOrderedList().run()
          }}
        >
          <FontAwesomeIcon aria-hidden icon={'list-ol'} />
        </button>

        <button
          title="Lista com marcadores [Ctrl + Shift + 8]"
          aria-label="Defina uma lista com marcadores"
          className={'bulletList button is-text'.concat(
            editor.isActive('bulletList') ? ' has-text-link' : '',
          )}
          type="button"
          onClick={() => {
            editor.chain().focus().toggleBulletList().run()
          }}
        >
          <FontAwesomeIcon aria-hidden icon={'list-ul'} />
        </button>

        <div>
          <button
            title="Cor do texto"
            aria-label="Defina uma cor para o texto"
            className={'color button is-text'}
            type="button"
            onClick={(e) => {
              e.currentTarget.parentElement?.querySelector('input')?.click()
            }}
          >
            <span className="icon is-small">
              <FontAwesomeIcon color={color} aria-hidden icon="font" />
            </span>
          </button>
          <ColorPicker
            format="hex"
            value={color}
            onChange={(e) => {
              if (e.value) {
                const c = e.value.toString()
                setColor(c)
                editor
                  .chain()
                  .focus()
                  .setColor('#' + c)
                  .run()
              }
            }}
          />
        </div>

        <div>
          <button
            title="Cor de destaque"
            aria-label="Defina uma cor de destaque para o texto"
            className={'bgColor button is-text'}
            type="button"
            onClick={(e) => {
              e.currentTarget.parentElement?.querySelector('input')?.click()
            }}
          >
            <span className="icon is-small">
              <FontAwesomeIcon color={colorBackground} aria-hidden icon="highlighter" />
            </span>
          </button>
          <ColorPicker
            format="hex"
            value={colorBackground}
            onChange={(e) => {
              if (e.value) {
                const c = e.value.toString()
                setColorBackground(c)
                editor
                  .chain()
                  .focus()
                  .setHighlight({ color: '#' + c })
                  .run()
              }
            }}
          />
        </div>

        <button
          title="Remover cor e destaque do texto"
          aria-label="Use para remover a cor e o destaque do texto"
          className={'clearColorAndHighLight button is-text'}
          type="button"
          onClick={() => editor.chain().focus().unsetColor().unsetHighlight().run()}
        >
          <span className="icon is-small">
            <FontAwesomeIcon aria-hidden icon="droplet-slash" />
          </span>
        </button>

        <div>
          <button
            title="Alinhar à esquerda [Ctrl + Shift + L]"
            aria-label="Alinhar texto à esquerda"
            className={'alignLeft px-2 mr-1 button is-text'.concat(
              editor.isActive({ textAlign: 'left' }) ? ' has-text-link' : '',
            )}
            type="button"
            onClick={() => {
              editor.chain().focus().setTextAlign('left').run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'align-left'} />
          </button>
          <button
            title="Alinhar ao centro [Ctrl + Shift + E]"
            aria-label="Alinhar texto ao centro"
            className={'alignCenter px-2 mr-1 button is-text'.concat(
              editor.isActive({ textAlign: 'center' }) ? ' has-text-link' : '',
            )}
            type="button"
            onClick={() => {
              editor.chain().focus().setTextAlign('center').run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'align-center'} />
          </button>
          <button
            title="Alinhar à direita [Ctrl + Shift + R]"
            aria-label="Alinhar texto à direita"
            className={'alignRight px-2 mr-1 button is-text'.concat(
              editor.isActive({ textAlign: 'right' }) ? ' has-text-link' : '',
            )}
            type="button"
            onClick={() => {
              editor.chain().focus().setTextAlign('right').run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'align-right'} />
          </button>
          <button
            title="Justificar [Ctrl + Shift + J]"
            aria-label="Justificar texto"
            className={'alignJustify px-2 button is-text'.concat(
              editor.isActive({ textAlign: 'justify' }) ? ' has-text-link' : '',
            )}
            type="button"
            onClick={() => {
              editor.chain().focus().setTextAlign('justify').run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'align-justify'} />
          </button>
        </div>

        <div>
          <button
            title="Aumentar recuo [Tab]"
            aria-label="Aumentar recuo do texto"
            className={'indent px-2 mr-1 button is-text'}
            type="button"
            onClick={() => {
              editor.chain().focus().indent().run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'indent'} />
          </button>
          <button
            title="Diminuir recuo [Shift + Tab]"
            aria-label="Diminuir recuo do texto"
            className={'outdent px-2 button is-text'}
            type="button"
            onClick={() => {
              editor.chain().focus().outdent().run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'outdent'} />
          </button>
        </div>

        <button
          title="Citação [Ctrl + Shift + B]"
          aria-label="Aplicar citação ao texto"
          className={'blockquote button is-text'.concat(
            editor.isActive('blockquote') ? ' has-text-link' : '',
          )}
          type="button"
          onClick={() => {
            editor.chain().focus().toggleBlockquote().run()
          }}
        >
          <FontAwesomeIcon aria-hidden icon={'quote-left'} />
        </button>

        <button
          title="Link"
          aria-label="Transforme o texto em um link"
          className={'link button is-text'.concat(editor.isActive('link') ? ' has-text-link' : '')}
          type="button"
          onClick={setLink}
        >
          <FontAwesomeIcon aria-hidden icon={'link'} />
        </button>

        <button
          title="Bloco de código [Ctrl + Alt + C]"
          aria-label="Criar um bloco de código"
          className={'code button is-text'.concat(editor.isActive('codeBlock') ? ' has-text-link' : '')}
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <FontAwesomeIcon aria-hidden icon={'code'} />
        </button>

        <div>
          <button
            title="Subscrito [Ctrl + ,]"
            aria-label="Transformar texto em subscrito"
            className={'subscript px-2 mr-1 button is-text'.concat(
              editor.isActive('subscript') ? ' has-text-link' : '',
            )}
            type="button"
            onClick={() => {
              editor.chain().focus().toggleSubscript().run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'subscript'} />
          </button>
          <button
            title="Sobrescrito [Ctrl + .]"
            aria-label="Transformar texto selecionado em sobrescrito"
            className={'superscript px-2 button is-text'.concat(
              editor.isActive('superscript') ? ' has-text-link' : '',
            )}
            type="button"
            onClick={() => {
              editor.chain().focus().toggleSuperscript().run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'superscript'} />
          </button>
        </div>

        <div>
          <button
            title="Desfazer [Ctrl + Z]"
            aria-label="Desfazer última ação"
            className={'undo px-2 mr-1 button is-text'}
            type="button"
            onClick={() => {
              editor.chain().focus().undo().run()
            }}
            disabled={!editor.can().undo()}
          >
            <FontAwesomeIcon aria-hidden icon={'rotate-left'} />
          </button>
          <button
            title="Refazer [Ctrl + Y]"
            aria-label="Refazer última ação"
            className={'redo px-2 button is-text'}
            type="button"
            onClick={() => {
              editor.chain().focus().redo().run()
            }}
            disabled={!editor.can().redo()}
          >
            <FontAwesomeIcon aria-hidden icon={'rotate-right'} />
          </button>
        </div>

        <button
          title="Imagem"
          aria-label="Adicione uma imagem"
          className={'img button is-text'}
          type="button"
          onClick={onRequireImage}
        >
          <FontAwesomeIcon aria-hidden icon={'image'} />
        </button>

        <button
          title="Remover todas as marcações"
          aria-label="Remover todas as marcações do texto selecionado"
          className={'unsetAllMarks button is-text'}
          type="button"
          onClick={() => {
            editor.commands.unsetAllMarks()
          }}
        >
          <FontAwesomeIcon aria-hidden icon={'text-slash'} />
        </button>
      </div>
    </div>
  )
}
