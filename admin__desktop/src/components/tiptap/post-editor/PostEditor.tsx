import { Editor, EditorContent, useEditor } from '@tiptap/react'
import { Dispatch, SetStateAction, useEffect, useRef } from 'react'
import { PostEditorMenuBar } from './PostEditorMenuBar'
import { extensions } from './extensions'

interface IProps {
  content: string
  font: IFontName
  post: IPost
  onUpdateContent: (html: string) => void
  onUpdateFont: Dispatch<SetStateAction<IFontName>>
  onRequireImage: () => void
  setEditor?: Dispatch<SetStateAction<Editor | undefined>>
}

export function PostEditor({
  content,
  onUpdateContent,
  font: fontFamily,
  onUpdateFont,
  onRequireImage,
  setEditor,
}: IProps) {
  const container = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor: ed }) => {
      onUpdateContent(ed.getHTML())
    },
  })

  useEffect(() => {
    const fn = (e: Event) => {
      if (
        e instanceof KeyboardEvent &&
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

    editor?.view.root.addEventListener('keydown', fn)
    return () => editor?.view.root.removeEventListener('keydown', fn)
  }, [editor])

  useEffect(() => {
    if (setEditor && editor) setEditor(editor)
  }, [editor, setEditor])

  return (
    <div
      ref={container}
      data-tiptap-editor
      data-tiptap-post-editor
      className="pb-3"
      style={{ fontFamily, height: '100%', borderRadius: 0, border: 'none' }}
    >
      <PostEditorMenuBar
        font={fontFamily}
        setFont={onUpdateFont}
        editor={editor}
        onRequireImage={onRequireImage}
      />
      <EditorContent
        editor={editor}
        style={{
          padding: '0.25rem 1rem',
          border: '1px solid var(--bulma-border-weak)',
          borderTop: 'none',
        }}
      />
    </div>
  )
}
