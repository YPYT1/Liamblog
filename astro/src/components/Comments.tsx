import React, { useEffect, useState } from 'react'

type CommentItem = {
  id: string
  content: string
  created_at: string
  author_email: string
}

type User = { id: string; email: string; role: 'admin' | 'user' }

interface Props {
  targetType: 'post' | 'doc' | 'guestbook'
  targetId: string
}

export default function Comments({ targetType, targetId }: Props) {
  const [items, setItems] = useState<CommentItem[]>([])
  const [content, setContent] = useState('')
  const [user, setUser] = useState<User | null>(null)

  const loadUser = async () => {
    const res = await fetch('/api/me', { credentials: 'include' })
    const data = await res.json()
    setUser(data.user)
  }

  const loadComments = async () => {
    const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}`)
    if (res.ok) {
      const data = await res.json()
      setItems(data.items || [])
    }
  }

  useEffect(() => {
    loadUser()
    loadComments()
  }, [targetId])

  const submit = async () => {
    if (!content.trim()) return
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ targetType, targetId, content }),
    })
    if (res.ok) {
      setContent('')
      loadComments()
    }
  }

  return (
    <section className="mt-10">
      <h3 className="text-lg font-semibold">评论</h3>
      {user ? (
        <div className="mt-3">
          <textarea
            className="w-full rounded-md border px-3 py-2"
            rows={4}
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="button-pop mt-2 rounded-md bg-black px-3 py-2 text-sm text-white" onClick={submit}>
            发布评论
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          发表评论需要 <a className="underline" href="/auth">登录/注册</a>
        </p>
      )}

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="glass-card p-4">
            <div className="text-xs text-slate-500">{item.author_email}</div>
            <p className="mt-2 text-sm">{item.content}</p>
            <div className="mt-2 text-xs text-slate-400">{item.created_at}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-slate-500">还没有评论，留下第一句话吧。</div>}
      </div>
    </section>
  )
}
