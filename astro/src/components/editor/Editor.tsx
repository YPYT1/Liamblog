import React, { useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

interface EditorProps {
  value: string
  onChange: (html: string) => void
  onUploadImage?: (file: File) => Promise<string>
}

export default function Editor({ value, onChange, onUploadImage }: EditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: '开始写作吧…' }),
    ],
    content: value,
    onUpdate({ editor: instance }) {
      onChange(instance.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  const addImage = async (file: File) => {
    if (!onUploadImage || !editor) return
    const url = await onUploadImage(file)
    editor.chain().focus().setImage({ src: url }).run()
  }

  const addAttachment = async (file: File) => {
    if (!onUploadImage || !editor) return
    const url = await onUploadImage(file)
    const safeName = file.name.replace(/[&<>"]/g, (char) => {
      const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
      return map[char] || char
    })
    editor
      .chain()
      .focus()
      .insertContent(`<a href="${url}" target="_blank" rel="noopener noreferrer">${safeName}</a>`)
      .run()
  }

  return (
    <div className="editor-shell">
      <div className="editor-toolbar mb-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>
          加粗
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          斜体
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          标题
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          列表
        </button>
        <button type="button" onClick={() => inputRef.current?.click()}>
          上传图片
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          上传附件
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) await addImage(file)
            if (inputRef.current) inputRef.current.value = ''
          }}
        />
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) await addAttachment(file)
            if (fileRef.current) fileRef.current.value = ''
          }}
        />
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  )
}
