import Blockquote from '@tiptap/extension-blockquote'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Indent from '@weiruo/tiptap-extension-indent'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import dart from 'highlight.js/lib/languages/dart'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.min.css'
import { common, createLowlight } from 'lowlight'
import { useEffect, useRef, useState } from 'react'
import { BasicMenuBar } from './BasicMenuBar'

interface IProps {
  content: string
  onUpdate: (html: string) => void
}

const lowlight = createLowlight(common)
lowlight.register({ html, typescript, javascript, css, cpp, dart, go, json, java, php, python, kotlin })

const extensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: {
      levels: [1, 2, 3],
      HTMLAttributes: {
        class: 'title',
      },
    },
    listItem: false,
    blockquote: false,
  }),
  Typography,
  Underline,
  TextStyle,
  FontFamily.configure({
    types: ['textStyle'],
  }),
  ListItem.configure({
    HTMLAttributes: {},
  }),
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Indent.configure({
    types: ['listItem', 'paragraph'],
    minLevel: 0,
    maxLevel: 8,
  }),
  Blockquote,
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: 'https',
  }),
  Subscript,
  Superscript,
  CodeBlockLowlight.configure({
    lowlight,
    languageClassPrefix: 'language-',
    defaultLanguage: 'typescript',
    exitOnArrowDown: true,
    exitOnTripleEnter: true,
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return 'Informe um título?'
      }

      if (node.type.name === 'paragraph') {
        return 'Escreva algo interessante aqui...'
      }

      if (node.type.name === 'bulletList') {
        return 'Liste suas ideias...'
      }

      if (node.type.name === 'orderedList') {
        return 'Numere suas ideias...'
      }

      if (node.type.name === 'blockquote') {
        return 'Inclua uma citação relevante...'
      }

      if (node.type.name === 'codeBlock') {
        return 'Adicione seu código aqui...'
      }

      return 'Escreva aqui...'
    },
  }),
]

export function BasicEditor({ content, onUpdate }: IProps) {
  const [font, setFont] = useState('Inter')

  const container = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
  })

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (
        container.current &&
        container.current.contains(e.target as Node) &&
        e.key.toLocaleLowerCase() === 'tab' &&
        editor
      ) {
        e.preventDefault()
        if (e.shiftKey) {
          editor.chain().focus().outdent().run()
          return
        }
        editor.chain().focus().indent().run()
      }
    }

    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [editor])

  return (
    <div ref={container} data-tiptap-editor className="pb-3" style={{ fontFamily: font }}>
      <BasicMenuBar font={font} setFont={setFont} editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
