import { useColorSchema } from '@app/hooks/useColorSchema'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Editor } from '@tiptap/react'
import { ColorPicker } from 'primereact/colorpicker'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { UIDropdownFontFamily } from './UIDropdownFontFamily'

interface IProps {
  editor: Editor | null
  font: string
  setFont: Dispatch<SetStateAction<string>>
}

export function BasicMenuBar({ editor, font, setFont }: IProps) {
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
    <div className="bar">
      <div className="buttons gap are-small">
        <button
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

        <UIDropdownFontFamily
          font={font}
          onChange={(f) => {
            setFont(f)
          }}
        />
        <button
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
        <button
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
        <div>
          <button
            className={'button is-text'}
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
            className={'button is-text'}
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

        <div>
          <button
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
            className={'indent px-2 mr-1 button is-text'}
            type="button"
            onClick={() => {
              editor.chain().focus().indent().run()
            }}
          >
            <FontAwesomeIcon aria-hidden icon={'indent'} />
          </button>
          <button
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
          className={'link button is-text'.concat(editor.isActive('link') ? ' has-text-link' : '')}
          type="button"
          onClick={setLink}
        >
          <FontAwesomeIcon aria-hidden icon={'link'} />
        </button>

        <button
          className={'code button is-text'.concat(editor.isActive('codeBlock') ? ' has-text-link' : '')}
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <FontAwesomeIcon aria-hidden icon={'code'} />
        </button>

        <div>
          <button
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
            className={'rendo px-2 button is-text'}
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
          className={'button is-text'}
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
