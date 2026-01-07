import React, { useEffect, useState } from 'react'

type CommentItem = {
  id: string
  content: string
  created_at: string
  author_email: string
  author_name?: string | null
  author_avatar?: string | null
  parent_id?: string | null
  images?: string | null
}

type User = { id: string; email: string; role: 'admin' | 'user' }

interface Props {
  targetType: 'post' | 'doc' | 'guestbook'
  targetId: string
}

const parseImages = (raw?: string | null) => {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default function Comments({ targetType, targetId }: Props) {
  const [items, setItems] = useState<CommentItem[]>([])
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadUser = async () => {
    const res = await fetch('/api/me', { credentials: 'include' })
    const data = await res.json()
    setUser(data.user)
  }

  const loadComments = async () => {
    const res = await fetch(`/api/comments?targetType=${targetType}&targetId=${targetId}&page=${page}`)
    if (res.ok) {
      const data = await res.json()
      setItems(data.items || [])
      setTotalPages(data.totalPages || 1)
    }
  }

  useEffect(() => {
    loadUser()
    loadComments()
  }, [targetId, page])

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    if (!res.ok) throw new Error('upload failed')
    const data = await res.json()
    return data.url as string
  }

  const addImages = async (files: FileList | null) => {
    if (!files) return
    const list = Array.from(files).slice(0, 6 - images.length)
    const uploaded: string[] = []
    for (const file of list) {
      const url = await uploadImage(file)
      uploaded.push(url)
    }
    setImages((prev) => [...prev, ...uploaded])
  }

  const submit = async () => {
    if (!content.trim() && images.length === 0) return
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ targetType, targetId, content, parentId: replyTo?.id ?? null, images }),
    })
    if (res.ok) {
      setContent('')
      setImages([])
      setReplyTo(null)
      loadComments()
    }
  }

  const roots = items.filter((item) => !item.parent_id)
  const replies = items.reduce<Record<string, CommentItem[]>>((acc, item) => {
    if (!item.parent_id) return acc
    acc[item.parent_id] = acc[item.parent_id] || []
    acc[item.parent_id].push(item)
    return acc
  }, {})

  return (
    <section className="mt-10">
      <h3 className="text-lg font-semibold">评论</h3>
      {user ? (
        <div className="mt-3">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-md border border-black/10 bg-black/5 px-3 py-2 text-xs text-slate-600">
              <span>回复：{replyTo.author_name || replyTo.author_email}</span>
              <button className="text-slate-500" onClick={() => setReplyTo(null)}>
                取消
              </button>
            </div>
          )}
          <textarea
            className="w-full rounded-md border px-3 py-2"
            rows={4}
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="button-pop rounded-md bg-black/5 px-3 py-2 text-xs">
              添加图片
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addImages(e.target.files)}
              />
            </label>
            {images.map((url) => (
              <div key={url} className="flex items-center gap-2 rounded-md border border-black/10 px-2 py-1 text-xs">
                <span className="truncate">{url}</span>
                <button onClick={() => setImages((prev) => prev.filter((item) => item !== url))}>移除</button>
              </div>
            ))}
          </div>
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
        {roots.map((item) => {
          const imageList = parseImages(item.images)
          return (
            <div key={item.id} className="glass-card p-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{item.author_name || item.author_email}</span>
                <button className="text-xs" onClick={() => setReplyTo(item)}>
                  回复
                </button>
              </div>
              <p className="mt-2 text-sm">{item.content}</p>
              {imageList.length > 0 && (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {imageList.map((url: string) => (
                    <img key={url} src={url} alt="comment" className="h-32 w-full rounded-md object-cover" />
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-slate-400">{item.created_at}</div>

              {replies[item.id]?.length ? (
                <div className="mt-4 space-y-2 border-l border-black/10 pl-3">
                  {replies[item.id].map((reply) => {
                    const replyImages = parseImages(reply.images)
                    return (
                      <div key={reply.id} className="rounded-md border border-black/5 bg-white/60 p-3 text-sm">
                        <div className="text-xs text-slate-500">{reply.author_name || reply.author_email}</div>
                        <div className="mt-1">{reply.content}</div>
                        {replyImages.length > 0 && (
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {replyImages.map((url: string) => (
                              <img key={url} src={url} alt="reply" className="h-28 w-full rounded-md object-cover" />
                            ))}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-slate-400">{reply.created_at}</div>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
        {items.length === 0 && <div className="text-sm text-slate-500">还没有评论，留下第一句话吧。</div>}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            上一页
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            下一页
          </button>
        </div>
      )}
    </section>
  )
}
