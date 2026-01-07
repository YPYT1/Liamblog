import React, { useEffect, useRef, useState } from 'react'
import Editor from '@/components/editor/Editor'

type User = { id: string; email: string; role: 'admin' | 'user'; display_name?: string | null; avatar_url?: string | null }
type UserItem = { id: string; email: string; role: 'admin' | 'user'; verified?: number; created_at?: string; display_name?: string | null; avatar_url?: string | null }

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
  views?: number
  withdrawn_at?: string | null
}

type CommentItem = {
  id: string
  content: string
  created_at: string
  status: string
  target_type: string
  target_id: string
  author_email: string
  author_name?: string | null
  author_avatar?: string | null
  parent_id?: string | null
  images?: string | null
  target_title?: string
  target_slug?: string
}

type MediaItem = {
  id: string
  key: string
  url: string
  mime_type: string
  size: number
  created_at: string
  user_id: string
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

const parseImages = (raw?: string | null) => {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [view, setView] = useState<'content' | 'comments' | 'users' | 'media' | 'taxonomy' | 'stats' | 'backup'>('content')
  const [active, setActive] = useState<ContentType>('post')
  const [items, setItems] = useState<ContentItem[]>([])
  const [contentPage, setContentPage] = useState(1)
  const [contentTotalPages, setContentTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [comments, setComments] = useState<CommentItem[]>([])
  const [commentsPage, setCommentsPage] = useState(1)
  const [commentsTotalPages, setCommentsTotalPages] = useState(1)
  const [commentStatusFilter, setCommentStatusFilter] = useState('all')
  const [users, setUsers] = useState<UserItem[]>([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [mediaPage, setMediaPage] = useState(1)
  const [mediaTotalPages, setMediaTotalPages] = useState(1)
  const [mediaQuery, setMediaQuery] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [taxonomyType, setTaxonomyType] = useState<'tag' | 'category' | 'series'>('tag')
  const [taxonomyScope, setTaxonomyScope] = useState<'post' | 'doc' | 'all'>('all')
  const [taxonomyItems, setTaxonomyItems] = useState<{ name: string; count: number }[]>([])
  const [renameFrom, setRenameFrom] = useState('')
  const [renameTo, setRenameTo] = useState('')
  const [revisions, setRevisions] = useState<any[]>([])
  const [revisionsLoading, setRevisionsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const coverInputRef = useRef<HTMLInputElement>(null)

  const loadUser = async () => {
    const res = await fetch('/api/me', { credentials: 'include' })
    const data = await res.json()
    setUser(data.user)
  }

  const loadItems = async () => {
    const params = new URLSearchParams()
    params.set('all', '1')
    params.set('page', String(contentPage))
    params.set('pageSize', '10')
    if (statusFilter !== 'all') params.set('status', statusFilter)
    const res = await fetch(`/api/${active === 'post' ? 'posts' : 'docs'}?${params.toString()}`, {
      credentials: 'include',
    })
    if (res.ok) {
      const data = await res.json()
      setItems(data.items || [])
      setContentTotalPages(data.totalPages || 1)
    }
  }

  const loadComments = async () => {
    const params = new URLSearchParams()
    params.set('all', '1')
    params.set('page', String(commentsPage))
    if (commentStatusFilter !== 'all') params.set('status', commentStatusFilter)
    const res = await fetch(`/api/comments?${params.toString()}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setComments(data.items || [])
      setCommentsTotalPages(data.totalPages || 1)
    }
  }

  const loadUsers = async () => {
    const res = await fetch(`/api/users?page=${usersPage}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setUsers(data.items || [])
      setUsersTotalPages(data.totalPages || 1)
    }
  }

  const loadMedia = async () => {
    const params = new URLSearchParams()
    params.set('page', String(mediaPage))
    if (mediaQuery.trim()) params.set('q', mediaQuery.trim())
    const res = await fetch(`/api/media?${params.toString()}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setMediaItems(data.items || [])
      setMediaTotalPages(data.totalPages || 1)
    }
  }

  const loadStats = async () => {
    const res = await fetch('/api/admin/stats', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }

  const loadTaxonomy = async () => {
    const res = await fetch(`/api/taxonomy?type=${taxonomyType}&scope=${taxonomyScope}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setTaxonomyItems(data.items || [])
    }
  }

  const loadRevisions = async (postId: string) => {
    setRevisionsLoading(true)
    const res = await fetch(`/api/post-revisions?postId=${postId}`, { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setRevisions(data.items || [])
    }
    setRevisionsLoading(false)
  }

  useEffect(() => {
    loadUser().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    setContentPage(1)
    setEditingId(null)
    setForm({ ...emptyForm })
    setRevisions([])
  }, [active, statusFilter])

  useEffect(() => {
    setCommentsPage(1)
  }, [commentStatusFilter])

  useEffect(() => {
    setMediaPage(1)
  }, [mediaQuery])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    if (view === 'content') loadItems()
    if (view === 'comments') loadComments()
    if (view === 'users') loadUsers()
    if (view === 'media') loadMedia()
    if (view === 'taxonomy') loadTaxonomy()
    if (view === 'stats') loadStats()
  }, [
    active,
    user,
    view,
    contentPage,
    statusFilter,
    commentsPage,
    commentStatusFilter,
    usersPage,
    mediaPage,
    mediaQuery,
    taxonomyType,
    taxonomyScope,
  ])

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
    setRevisions([])
    loadItems()
  }

  const updateStatus = async (id: string, status: string) => {
    const endpoint = `/api/${active === 'post' ? 'posts' : 'docs'}/${id}`
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    if (res.ok) loadItems()
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
    if (active === 'post') {
      loadRevisions(item.id)
    } else {
      setRevisions([])
    }
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

  const updateCommentStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    if (res.ok) loadComments()
  }

  const removeUser = async (id: string) => {
    if (!confirm('确定删除该用户？这会同时删除其评论与会话。')) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) loadUsers()
  }

  const removeMedia = async (id: string) => {
    if (!confirm('确定删除该媒体文件？')) return
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE', credentials: 'include' })
    if (res.ok) loadMedia()
  }

  const renameTaxonomy = async () => {
    if (!renameFrom.trim() || !renameTo.trim()) return
    const res = await fetch('/api/taxonomy/rename', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type: taxonomyType, scope: taxonomyScope, from: renameFrom, to: renameTo }),
    })
    if (res.ok) {
      setRenameFrom('')
      setRenameTo('')
      loadTaxonomy()
    }
  }

  const deleteTaxonomy = async (name: string) => {
    if (!confirm(`确定删除 ${name} 吗？`)) return
    const res = await fetch('/api/taxonomy/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ type: taxonomyType, scope: taxonomyScope, name }),
    })
    if (res.ok) loadTaxonomy()
  }

  const restoreRevision = async (id: string) => {
    const res = await fetch(`/api/post-revisions/${id}`, { method: 'POST', credentials: 'include' })
    if (res.ok && editingId) {
      loadRevisions(editingId)
      loadItems()
    }
  }

  const downloadExport = async (scope: string) => {
    const res = await fetch(`/api/admin/export?scope=${scope}`, { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `liam-blog-${scope}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
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
          <button
            className={`button-pop rounded-md px-3 py-2 text-sm ${view === 'media' ? 'bg-black text-white' : 'bg-black/5'}`}
            onClick={() => setView('media')}
          >
            媒体库
          </button>
          <button
            className={`button-pop rounded-md px-3 py-2 text-sm ${view === 'taxonomy' ? 'bg-black text-white' : 'bg-black/5'}`}
            onClick={() => setView('taxonomy')}
          >
            分类标签
          </button>
          <button
            className={`button-pop rounded-md px-3 py-2 text-sm ${view === 'stats' ? 'bg-black text-white' : 'bg-black/5'}`}
            onClick={() => setView('stats')}
          >
            统计
          </button>
          <button
            className={`button-pop rounded-md px-3 py-2 text-sm ${view === 'backup' ? 'bg-black text-white' : 'bg-black/5'}`}
            onClick={() => setView('backup')}
          >
            备份
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
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="withdrawn">已撤稿</option>
              <option value="deleted">已删除</option>
            </select>
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
                        setRevisions([])
                      }}
                    >
                      取消
                    </button>
                  )}
                </div>

                {editingId && active === 'post' && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-700">修订记录</h3>
                    {revisionsLoading && <div className="mt-2 text-sm text-slate-500">加载中...</div>}
                    {!revisionsLoading && (
                      <div className="mt-3 space-y-2">
                        {revisions.map((rev) => (
                          <div key={rev.id} className="flex items-center justify-between rounded-md border border-black/10 px-3 py-2 text-xs">
                            <div>
                              <div className="font-medium text-slate-700">{rev.title}</div>
                              <div className="text-slate-400">{rev.created_at}</div>
                            </div>
                            <button className="rounded-md bg-black/5 px-2 py-1" onClick={() => restoreRevision(rev.id)}>
                              恢复
                            </button>
                          </div>
                        ))}
                        {revisions.length === 0 && <div className="text-xs text-slate-500">暂无修订记录</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">内容列表</h2>
              <div className="mt-4 space-y-2">
                {items.map((item) => {
                  const base = active === 'post' ? '/blog' : '/docs'
                  const previewUrl = `${base}/${item.slug}${item.status !== 'published' ? '?preview=1' : ''}`
                  const statusLabel =
                    item.status === 'draft'
                      ? '草稿'
                      : item.status === 'published'
                        ? '已发布'
                        : item.status === 'withdrawn'
                          ? '已撤稿'
                          : item.status === 'deleted'
                            ? '已删除'
                            : item.status
                  return (
                    <div key={item.id} className="glass-card w-full p-4 text-left">
                      <div className="flex items-center justify-between">
                        <button className="text-left" onClick={() => handleEdit(item)}>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-slate-500">/{active}/{item.slug}</div>
                        </button>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-full bg-black/5 px-2 py-1 text-slate-500">{statusLabel}</span>
                          {typeof item.views === 'number' && (
                            <span className="rounded-full bg-black/5 px-2 py-1 text-slate-500">阅读 {item.views}</span>
                          )}
                          <a
                            className="rounded-full border border-black/10 px-2 py-1 text-slate-500 transition hover:text-slate-900"
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            预览
                          </a>
                          {item.status === 'published' && active === 'post' && (
                            <button
                              className="rounded-full border border-black/10 px-2 py-1 text-slate-500 transition hover:bg-amber-50"
                              onClick={() => updateStatus(item.id, 'withdrawn')}
                            >
                              撤稿
                            </button>
                          )}
                          {item.status !== 'published' && item.status !== 'deleted' && (
                            <button
                              className="rounded-full border border-black/10 px-2 py-1 text-slate-500 transition hover:bg-emerald-50"
                              onClick={() => updateStatus(item.id, 'published')}
                            >
                              发布
                            </button>
                          )}
                          {item.status === 'deleted' && (
                            <button
                              className="rounded-full border border-black/10 px-2 py-1 text-slate-500 transition hover:bg-emerald-50"
                              onClick={() => updateStatus(item.id, 'draft')}
                            >
                              恢复
                            </button>
                          )}
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
              {contentTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <button disabled={contentPage <= 1} onClick={() => setContentPage((p) => Math.max(1, p - 1))}>
                    上一页
                  </button>
                  <span>
                    {contentPage} / {contentTotalPages}
                  </span>
                  <button
                    disabled={contentPage >= contentTotalPages}
                    onClick={() => setContentPage((p) => Math.min(contentTotalPages, p + 1))}
                  >
                    下一页
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'comments' && (
        <div className="mt-8 space-y-3">
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={commentStatusFilter}
              onChange={(e) => setCommentStatusFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="visible">可见</option>
              <option value="hidden">隐藏</option>
              <option value="deleted">已删除</option>
            </select>
          </div>
          {comments.map((comment) => (
            <div key={comment.id} className="glass-card flex items-start justify-between gap-4 p-4">
              <div>
                <div className="text-xs text-slate-500">{comment.author_name || comment.author_email}</div>
                <div className="mt-2 text-sm text-slate-700">{comment.content}</div>
                {parseImages(comment.images).length > 0 && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {parseImages(comment.images).map((url: string) => (
                      <img key={url} src={url} alt="comment" className="h-24 w-full rounded-md object-cover" />
                    ))}
                  </div>
                )}
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
                  {comment.parent_id && <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5">回复</span>}
                  <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5">{comment.status}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {comment.status !== 'visible' && (
                  <button
                    className="rounded-md bg-black/5 px-3 py-1 text-xs"
                    onClick={() => updateCommentStatus(comment.id, 'visible')}
                  >
                    显示
                  </button>
                )}
                {comment.status === 'visible' && (
                  <button
                    className="rounded-md bg-black/5 px-3 py-1 text-xs"
                    onClick={() => updateCommentStatus(comment.id, 'hidden')}
                  >
                    隐藏
                  </button>
                )}
                <button
                  className="rounded-md bg-black/5 px-3 py-1 text-xs"
                  onClick={() => removeComment(comment.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
          {comments.length === 0 && <div className="text-sm text-slate-500">暂无评论</div>}
          {commentsTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <button disabled={commentsPage <= 1} onClick={() => setCommentsPage((p) => Math.max(1, p - 1))}>
                上一页
              </button>
              <span>
                {commentsPage} / {commentsTotalPages}
              </span>
              <button
                disabled={commentsPage >= commentsTotalPages}
                onClick={() => setCommentsPage((p) => Math.min(commentsTotalPages, p + 1))}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'users' && (
        <div className="mt-8 space-y-3">
          {users.map((member) => (
            <div key={member.id} className="glass-card flex items-center justify-between gap-4 p-4">
              <div>
                <div className="text-sm font-medium text-slate-800">{member.display_name || member.email}</div>
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
          {usersTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <button disabled={usersPage <= 1} onClick={() => setUsersPage((p) => Math.max(1, p - 1))}>
                上一页
              </button>
              <span>
                {usersPage} / {usersTotalPages}
              </span>
              <button
                disabled={usersPage >= usersTotalPages}
                onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'media' && (
        <div className="mt-8 space-y-3">
          <div className="flex gap-2">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="搜索媒体 key/URL"
              value={mediaQuery}
              onChange={(e) => setMediaQuery(e.target.value)}
            />
            <button className="button-pop rounded-md bg-black px-3 py-2 text-sm text-white" onClick={loadMedia}>
              搜索
            </button>
          </div>
          {mediaItems.map((item) => (
            <div key={item.id} className="glass-card flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                {item.mime_type.startsWith('image/') ? (
                  <img src={item.url} alt={item.key} className="h-12 w-12 rounded-md object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-black/5" />
                )}
                <div>
                  <div className="text-sm font-medium text-slate-800">{item.key}</div>
                  <div className="text-xs text-slate-500">{item.created_at}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <a className="rounded-md border border-black/10 px-2 py-1" href={item.url} target="_blank" rel="noreferrer">
                  打开
                </a>
                <button className="rounded-md bg-rose-50 px-3 py-1 text-rose-500" onClick={() => removeMedia(item.id)}>
                  删除
                </button>
              </div>
            </div>
          ))}
          {mediaItems.length === 0 && <div className="text-sm text-slate-500">暂无媒体</div>}
          {mediaTotalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <button disabled={mediaPage <= 1} onClick={() => setMediaPage((p) => Math.max(1, p - 1))}>
                上一页
              </button>
              <span>
                {mediaPage} / {mediaTotalPages}
              </span>
              <button
                disabled={mediaPage >= mediaTotalPages}
                onClick={() => setMediaPage((p) => Math.min(mediaTotalPages, p + 1))}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'taxonomy' && (
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={taxonomyType}
              onChange={(e) => setTaxonomyType(e.target.value as 'tag' | 'category' | 'series')}
            >
              <option value="tag">标签</option>
              <option value="category">分类</option>
              <option value="series">系列</option>
            </select>
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={taxonomyScope}
              onChange={(e) => setTaxonomyScope(e.target.value as 'post' | 'doc' | 'all')}
            >
              <option value="all">全部内容</option>
              <option value="post">博客</option>
              <option value="doc">文档</option>
            </select>
          </div>

          <div className="glass-card p-4">
            <div className="text-sm font-semibold">重命名</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="原名称"
                value={renameFrom}
                onChange={(e) => setRenameFrom(e.target.value)}
              />
              <input
                className="rounded-md border px-3 py-2 text-sm"
                placeholder="新名称"
                value={renameTo}
                onChange={(e) => setRenameTo(e.target.value)}
              />
              <button className="button-pop rounded-md bg-black px-3 py-2 text-sm text-white" onClick={renameTaxonomy}>
                执行
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {taxonomyItems.map((item) => (
              <div key={item.name} className="glass-card flex items-center justify-between gap-4 p-3">
                <div className="text-sm">{item.name}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-black/5 px-2 py-1">{item.count}</span>
                  <button className="rounded-md bg-rose-50 px-2 py-1 text-rose-500" onClick={() => deleteTaxonomy(item.name)}>
                    删除
                  </button>
                </div>
              </div>
            ))}
            {taxonomyItems.length === 0 && <div className="text-sm text-slate-500">暂无数据</div>}
          </div>
        </div>
      )}

      {view === 'stats' && (
        <div className="mt-8 space-y-4">
          {!stats && <div className="text-sm text-slate-500">加载中...</div>}
          {stats && (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="glass-card p-4 text-sm">博客：{stats.posts?.published} 已发布 / {stats.posts?.draft} 草稿 / {stats.posts?.withdrawn} 撤稿</div>
                <div className="glass-card p-4 text-sm">文档：{stats.docs?.published} 已发布 / {stats.docs?.draft} 草稿</div>
                <div className="glass-card p-4 text-sm">评论：{stats.comments?.visible} 可见 / {stats.comments?.hidden} 隐藏</div>
                <div className="glass-card p-4 text-sm">阅读量：博客 {stats.views?.posts} / 文档 {stats.views?.docs}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm font-semibold">热门博客</div>
                <div className="mt-3 space-y-2 text-sm">
                  {(stats.topPosts || []).map((post: any) => (
                    <div key={post.id} className="flex items-center justify-between">
                      <span>{post.title}</span>
                      <span className="text-xs text-slate-500">{post.views} 阅读</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm font-semibold">热门文档</div>
                <div className="mt-3 space-y-2 text-sm">
                  {(stats.topDocs || []).map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <span>{doc.title}</span>
                      <span className="text-xs text-slate-500">{doc.views} 阅读</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'backup' && (
        <div className="mt-8 space-y-3">
          <div className="glass-card p-4">
            <div className="text-sm font-semibold">导出与备份</div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <button className="rounded-md bg-black px-3 py-2 text-white" onClick={() => downloadExport('all')}>
                导出全部
              </button>
              <button className="rounded-md bg-black/5 px-3 py-2" onClick={() => downloadExport('posts')}>
                导出博客
              </button>
              <button className="rounded-md bg-black/5 px-3 py-2" onClick={() => downloadExport('docs')}>
                导出文档
              </button>
              <button className="rounded-md bg-black/5 px-3 py-2" onClick={() => downloadExport('comments')}>
                导出评论
              </button>
              <button className="rounded-md bg-black/5 px-3 py-2" onClick={() => downloadExport('post_revisions')}>
                导出修订记录
              </button>
              <button className="rounded-md bg-black/5 px-3 py-2" onClick={() => downloadExport('media')}>
                导出媒体
              </button>
              <button className="rounded-md bg-black/5 px-3 py-2" onClick={() => downloadExport('users')}>
                导出用户
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
