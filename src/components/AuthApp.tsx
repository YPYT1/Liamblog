import React, { useEffect, useState } from 'react'

type User = { id: string; email: string; role: 'admin' | 'user'; display_name?: string | null; avatar_url?: string | null }
type MyComment = {
  id: string
  content: string
  created_at: string
  target_type: string
  target_id: string
  target_title?: string
  target_slug?: string
}

export default function AuthApp() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetAccount, setResetAccount] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [myComments, setMyComments] = useState<MyComment[]>([])
  const [loadingUser, setLoadingUser] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)

  const loadUser = async () => {
    const res = await fetch('/api/me', { credentials: 'include' })
    const data = await res.json()
    setUser(data.user)
    setLoadingUser(false)
    if (data.user) loadMyComments()
    if (data.user) {
      setDisplayName(data.user.display_name || '')
      setAvatarUrl(data.user.avatar_url || '')
    }
  }

  const loadMyComments = async () => {
    const res = await fetch('/api/comments?mine=1', { credentials: 'include' })
    if (res.ok) {
      const data = await res.json()
      setMyComments(data.items || [])
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const refreshPage = () => {
    window.location.reload()
  }

  const readError = async (res: Response) => {
    try {
      const data = await res.json()
      return data?.error ? String(data.error) : '操作失败'
    } catch {
      return '操作失败'
    }
  }

  const login = async () => {
    setMessage('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ account, password }),
    })
    if (!res.ok) {
      setMessage(await readError(res))
      return
    }
    setMessage('登录成功')
    await loadUser()
    refreshPage()
  }

  const signup = async () => {
    setMessage('')
    const normalized = account.trim()
    if (!normalized) {
      setMessage('请输入邮箱或用户名')
      return
    }
    const isEmail = /\S+@\S+\.\S+/.test(normalized)
    if (!isEmail && normalized.length < 5) {
      setMessage('用户名至少5位')
      return
    }
    if (password !== confirmPassword) {
      setMessage('两次密码不一致')
      return
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ account, password, confirmPassword }),
    })
    if (!res.ok) {
      setMessage(await readError(res))
      return
    }
    setMessage('注册成功')
    await loadUser()
    refreshPage()
  }

  const resetLocal = async () => {
    setMessage('')
    const normalized = resetAccount.trim()
    if (!normalized) {
      setMessage('请输入邮箱或用户名')
      return
    }
    const isEmail = /\S+@\S+\.\S+/.test(normalized)
    if (!isEmail && normalized.length < 5) {
      setMessage('用户名至少5位')
      return
    }
    if (resetPassword !== resetConfirm) {
      setMessage('两次密码不一致')
      return
    }
    const res = await fetch('/api/auth/reset-local', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ account: resetAccount, password: resetPassword, confirmPassword: resetConfirm }),
    })
    if (!res.ok) {
      setMessage(await readError(res))
      return
    }
    setMessage('密码已重置，请登录')
    setShowReset(false)
    setResetAccount('')
    setResetPassword('')
    setResetConfirm('')
    setMode('login')
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    setMyComments([])
    setMode('login')
    setMessage('已退出登录')
  }

  const updateProfile = async (override?: { displayName?: string; avatarUrl?: string }) => {
    setMessage('')
    const payload = {
      displayName: override?.displayName ?? displayName,
      avatarUrl: override?.avatarUrl ?? avatarUrl,
    }
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    setMessage(res.ok ? '资料已更新' : '更新失败')
    if (res.ok) {
      await loadUser()
      refreshPage()
    }
  }

  const changePassword = async () => {
    setMessage('')
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setMessage(res.ok ? '密码已更新' : '更新失败')
    if (res.ok) {
      setCurrentPassword('')
      setNewPassword('')
    }
  }

  const uploadAvatar = async (file: File) => {
    if (file.type !== 'image/png') {
      setMessage('仅支持 PNG 格式头像')
      return
    }
    setAvatarUploading(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) {
        setMessage(await readError(res))
        return
      }
      const data = await res.json()
      const url = data.url as string
      setAvatarUrl(url)
      await updateProfile({ avatarUrl: url })
    } finally {
      setAvatarUploading(false)
    }
  }

  if (loadingUser) {
    return <div className="glass-card mx-auto max-w-md p-6 text-sm text-slate-600">加载中...</div>
  }

  if (user) {
    return (
      <div className="glass-card mx-auto max-w-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">账号状态</div>
            <div className="mt-2 flex items-center gap-3 text-lg font-semibold text-slate-900">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="h-10 w-10 rounded-full object-cover ring-1 ring-black/10" />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {(user.display_name || user.email || 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              <span>{user.display_name || user.email}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">角色：{user.role === 'admin' ? '管理员' : '用户'}</div>
            <div className="mt-1 text-xs text-slate-500">邮箱：{user.email}</div>
            <div className="mt-1 text-xs text-slate-500">用户 ID：{user.id}</div>
          </div>
          <div className="flex gap-2">
            {user.role === 'admin' && (
              <a className="button-pop rounded-md border border-black/10 px-3 py-2 text-sm" href="/Liam/admin">
                管理后台
              </a>
            )}
            <button className="button-pop rounded-md bg-black px-3 py-2 text-sm text-white" onClick={logout}>
              退出登录
            </button>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">个人资料</h3>
            <div className="mt-3 space-y-2">
              <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="显示名称"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10" />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {(displayName || user.email || 'U').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <label className="button-pop cursor-pointer rounded-md border border-black/10 px-3 py-2 text-sm">
                  {avatarUploading ? '上传中...' : '上传 PNG 头像'}
                  <input
                    className="hidden"
                    type="file"
                    accept="image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadAvatar(file)
                      e.currentTarget.value = ''
                    }}
                  />
                </label>
              </div>
              <button className="button-pop rounded-md bg-black px-3 py-2 text-sm text-white" onClick={updateProfile}>
                更新资料
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">修改密码</h3>
            <div className="mt-3 space-y-2">
              <input
                className="w-full rounded-md border px-3 py-2"
                type="password"
                placeholder="当前密码"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                className="w-full rounded-md border px-3 py-2"
                type="password"
                placeholder="新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button className="button-pop rounded-md bg-black px-3 py-2 text-sm text-white" onClick={changePassword}>
                更新密码
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700">我的评论</h3>
          <div className="mt-3 space-y-2">
            {myComments.map((item) => (
              <div key={item.id} className="rounded-lg border border-black/5 bg-white/70 p-3 text-sm text-slate-700">
                <div className="text-xs text-slate-400">{item.created_at}</div>
                <div className="mt-1">{item.content}</div>
                <div className="mt-2 text-xs text-slate-400">
                  {item.target_slug ? (
                    <a
                      className="underline"
                      href={
                        item.target_type === 'post'
                          ? `/blog/${item.target_slug}`
                          : item.target_type === 'doc'
                            ? `/docs/${item.target_slug}`
                            : '/guestbook'
                      }
                    >
                      {item.target_title || item.target_type}
                    </a>
                  ) : (
                    `${item.target_type}/${item.target_id}`
                  )}
                </div>
              </div>
            ))}
            {myComments.length === 0 && <div className="text-sm text-slate-500">你还没有发表评论。</div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card mx-auto max-w-md p-6">
      <div className="flex gap-2">
        <button
          className={`button-pop rounded-md px-3 py-2 text-sm ${mode === 'login' ? 'bg-black text-white' : 'bg-black/5'}`}
          onClick={() => setMode('login')}
        >
          登录
        </button>
        <button
          className={`button-pop rounded-md px-3 py-2 text-sm ${mode === 'signup' ? 'bg-black text-white' : 'bg-black/5'}`}
          onClick={() => setMode('signup')}
        >
          注册
        </button>
        <button
          className={`button-pop rounded-md px-3 py-2 text-sm ${showReset ? 'bg-black text-white' : 'bg-black/5'}`}
          onClick={() => setShowReset((prev) => !prev)}
        >
          找回密码
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      {!showReset ? (
        <div className="mt-4 space-y-3">
          <div>
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="邮箱或用户名"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">用户名至少 5 位且不能重复，也可用邮箱注册/登录。</p>
          </div>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            placeholder="密码（字母+数字，>=6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'signup' && (
            <input
              className="w-full rounded-md border px-3 py-2"
              type="password"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          <button
            className="button-pop w-full rounded-md bg-black px-3 py-2 text-white"
            onClick={mode === 'login' ? login : signup}
          >
            {mode === 'login' ? '登录' : '注册'}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="邮箱或用户名"
            value={resetAccount}
            onChange={(e) => setResetAccount(e.target.value)}
          />
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            placeholder="新密码（字母+数字，>=6位）"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            placeholder="确认新密码"
            value={resetConfirm}
            onChange={(e) => setResetConfirm(e.target.value)}
          />
          <button className="button-pop w-full rounded-md bg-black px-3 py-2 text-white" onClick={resetLocal}>
            重置密码
          </button>
          <p className="text-xs text-slate-500">本地找回密码不发送邮件，仅用于本地环境。</p>
        </div>
      )}
    </div>
  )
}
