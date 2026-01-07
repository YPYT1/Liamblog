import React, { useEffect, useRef, useState } from 'react'
import Editor from '@/components/editor/Editor'

type User = { id: string; email: string; role: 'admin' | 'user' }
type UserItem = { id: string; email: string; role: 'admin' | 'user'; verified?: number; created_at?: string }

type ContentType = 'post' | 'doc'

type ContentItem = {
  id: string
  title: string
  slug: string
  summary?: string
  cover_image?: string
  content_html: string
  status: string
  tags?: string
  category?: string
  series?: string
  pinned?: number
  order_index?: number
}

type CommentItem = {
  id: string
  content: string
  created_at: string
  status: string
  target_type: string
  target_id: string
  author_email: string
  target_title?: string
  target_slug?: string
}

const emptyForm = {
  title: '',
  slug: '',
  summary: '',
  coverImage: '',
  contentHtml: '',
  tags: '',
  category: '',
  series: '',
  status: 'draft',
  pinned: false,
  orderIndex: 0,
}

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [view, setView] = useState<'content' | 'comments' | 'users'>('content')
  const [active, setActive] = useState<ContentType>('post')
  const [items, setItems] = useState<ContentItem[]>([])
  const [comments, setComments] = useState<CommentItem[]>([])
  const [users, setUsers] = useState<UserItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const coverInputRef = useRef<HTMLInputElement>(null)

  const loadUser = async () => {
    const res = await fetch('/api/me', { credentials: 'include' })
    const data = await res.json()
    setUser(data.user)
  }

  const loadItems = async () => {
    const res = await fetch(`/api/${active === 'post' ? 'posts' : 'docs'}?all=1`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setItems(data.items || [])
    }
  }

  const loadComments = async () => {
    const res = await fetch('/api/comments?all=1', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setComments(data.items || [])
    }
  }

  const loadUsers = async () => {
    const res = await fetch('/api/users', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setUsers(data.items || [])
    }
  }

  useEffect(() => {
    loadUser().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    if (view === 'content') loadItems()
    if (view === 'comments') loadComments()
    if (view === 'users') loadUsers()
  }, [active, user, view])

  const handleLogin = async () => {
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      setError('登录失败')
      return
    }
    await loadUser()
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  const handleSave = async () => {
    setError('')
    const payload: Record<string, unknown> = {
      title: form.title,
      slug: form.slug,
      summary: form.summary || null,
      contentHtml: form.contentHtml,
      status: form.status,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      category: form.category || null,
      series: form.series || null,
    }
    if (active === 'post') {
      payload.pinned = form.pinned
      payload.coverImage = form.coverImage || null
    }
    if (active === 'doc') payload.orderIndex = Number(form.orderIndex) || 0

    const endpoint = editingId
      ? `/api/${active === 'post' ? 'posts' : 'docs'}/${editingId}`
      : `/api/${active === 'post' ? 'posts' : 'docs'}`

    const res = await fetch(endpoint, {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      setError('保存失败')
      return
    }

    setForm({ ...emptyForm })
    setEditingId(null)
    loadItems()
  }

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      slug: item.slug,
      summary: item.summary || '',
      coverImage: item.cover_image || '',
      contentHtml: item.content_html || '',
      tags: item.tags || '',
      category: item.category || '',
      series: item.series || '',
      status: item.status || 'draft',
      pinned: Boolean(item.pinned),
      orderIndex: item.order_index || 0,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条内容吗？')) return
    const res = await fetch(`/api/${active === 'post' ? 'posts' : 'docs'}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok) loadItems()
  }

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

  const uploadCover = async (file: File) => {
    const url = await uploadImage(file)
    setForm((prev) => ({ ...prev, coverImage: url }))
  }

  const removeComment = async (id: string) => {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) loadComments()
  }

  const removeUser = async (id: string) => {
    if (!confirm('确定删除该用户？这会同时删除其评论与会话。')) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) loadUsers()
  }

  if (loading) return <div className="p-6">加载中...</div>
  if (!user) {
    return (
      <div className="glass-card mx-auto mt-10 max-w-md p-6">
        <h2 className="text-lg font-semibold">管理员登录</h2>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="button-pop w-full rounded-md bg-black px-3 py-2 text-white" onClick={handleLogin}>
            登录
          </button>
        </div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return <div className="p-6">无权限访问。</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">内容管理</h1>
          <p className="text-sm text-slate-600">登录账号：{user.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`button-pop rounded-md px-3 py-2 text-sm ${view === 'content' ? 'bg-black text-white' : 'bg-black/5'}`}
            onClick={() => setView('content')}
          >
            内容
          </button>
          <button
            className={`button-pop rounded-md px-3 py-2 text-sm ${view === 'comments' ? 'bg-black text-white' : 'bg-black/5'}`}
            onClick={() => setView('comments')}
          >
            评论
          </button>
          <button
            className={`button-pop rounded-md px-3 py-2 text-sm ${view === 'users' ? 'bg-black text-white' : 'bg-black/5'}`}
            onClick={() => setView('users')}
          >
            用户
          </button>
          <button className="button-pop rounded-md bg-black/5 px-3 py-2 text-sm" onClick={handleLogout}>
            退出
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {view === 'content' && (
        <div>
          <div className="mt-6 flex gap-2">
            <button
              className={`rounded-md px-3 py-2 text-sm ${active === 'post' ? 'bg-black text-white' : 'bg-black/5'}`}
              onClick={() => setActive('post')}
            >
              博客
            </button>
            <button
              className={`rounded-md px-3 py-2 text-sm ${active === 'doc' ? 'bg-black text-white' : 'bg-black/5'}`}
              onClick={() => setActive('doc')}
            >
              文档
            </button>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-lg font-semibold">{editingId ? '编辑内容' : '新建内容'}</h2>
              <div className="mt-4 space-y-3">
                <input
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="标题"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <input
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="Slug（如 hello-world）"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
                <textarea
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="摘要"
                  rows={3}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
                {active === 'post' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-md border px-3 py-2"
                        placeholder="封面图 URL"
                        value={form.coverImage}
                        onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                      />
                      <button
                        type="button"
                        className="button-pop rounded-md bg-black/5 px-3 text-sm"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        上传封面
                      </button>
                    </div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) await uploadCover(file)
                        if (coverInputRef.current) coverInputRef.current.value = ''
                      }}
                    />
                    {form.coverImage && (
                      <div className="overflow-hidden rounded-xl border border-black/5">
                        <img src={form.coverImage} alt="cover" className="h-36 w-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
                <Editor value={form.contentHtml} onChange={(html) => setForm({ ...form, contentHtml: html })} onUploadImage={uploadImage} />

                <input
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="标签（逗号分隔）"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="分类"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                  <input
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="系列"
                    value={form.series}
                    onChange={(e) => setForm({ ...form, series: e.target.value })}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    className="w-full rounded-md border px-3 py-2"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="draft">草稿</option>
                    <option value="published">发布</option>
                  </select>
                  {active === 'post' && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.pinned}
                        onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                      />
                      置顶
                    </label>
                  )}
                  {active === 'doc' && (
                    <input
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="排序"
                      type="number"
                      value={form.orderIndex}
                      onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="button-pop rounded-md bg-black px-4 py-2 text-sm text-white" onClick={handleSave}>
                    保存
                  </button>
                  {editingId && (
                    <button
                      className="button-pop rounded-md bg-black/5 px-4 py-2 text-sm"
                      onClick={() => {
                        setEditingId(null)
                        setForm({ ...emptyForm })
                      }}
                    >
                      取消
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">内容列表</h2>
              <div className="mt-4 space-y-2">
                {items.map((item) => {
                  const base = active === 'post' ? '/blog' : '/docs'
                  const previewUrl = `${base}/${item.slug}${item.status === 'draft' ? '?preview=1' : ''}`
                  return (
                    <div key={item.id} className="glass-card w-full p-4 text-left">
                      <div className="flex items-center justify-between">
                        <button className="text-left" onClick={() => handleEdit(item)}>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-slate-500">/{active}/{item.slug}</div>
                        </button>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-full bg-black/5 px-2 py-1 text-slate-500">
                            {item.status === 'draft' ? '草稿' : '已发布'}
                          </span>
                          <a
                            className="rounded-full border border-black/10 px-2 py-1 text-slate-500 transition hover:text-slate-900"
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            预览
                          </a>
                          <button
                            className="rounded-full border border-black/10 px-2 py-1 text-rose-500 transition hover:bg-rose-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {items.length === 0 && <div className="text-sm text-slate-500">暂无内容</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'comments' && (
        <div className="mt-8 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="glass-card flex items-start justify-between gap-4 p-4">
              <div>
                <div className="text-xs text-slate-500">{comment.author_email}</div>
                <div className="mt-2 text-sm text-slate-700">{comment.content}</div>
                <div className="mt-2 text-xs text-slate-400">
                  {comment.created_at} ·{' '}
                  {comment.target_slug ? (
                    <a
                      className="underline"
                      href={
                        comment.target_type === 'post'
                          ? `/blog/${comment.target_slug}`
                          : comment.target_type === 'doc'
                            ? `/docs/${comment.target_slug}`
                            : '/guestbook'
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {comment.target_title || comment.target_type}
                    </a>
                  ) : (
                    `${comment.target_type}/${comment.target_id}`
                  )}
                </div>
              </div>
              <button
                className="rounded-md bg-black/5 px-3 py-1 text-xs"
                onClick={() => removeComment(comment.id)}
              >
                删除
              </button>
            </div>
          ))}
          {comments.length === 0 && <div className="text-sm text-slate-500">暂无评论</div>}
        </div>
      )}

      {view === 'users' && (
        <div className="mt-8 space-y-3">
          {users.map((member) => (
            <div key={member.id} className="glass-card flex items-center justify-between gap-4 p-4">
              <div>
                <div className="text-sm font-medium text-slate-800">{member.email}</div>
                <div className="mt-1 text-xs text-slate-500">
                  角色：{member.role} {member.created_at ? `· ${member.created_at}` : ''}
                </div>
              </div>
              {member.role !== 'admin' && (
                <button
                  className="rounded-md bg-rose-50 px-3 py-1 text-xs text-rose-500"
                  onClick={() => removeUser(member.id)}
                >
                  删除用户
                </button>
              )}
            </div>
          ))}
          {users.length === 0 && <div className="text-sm text-slate-500">暂无用户</div>}
        </div>
      )}
    </div>
  )
}
