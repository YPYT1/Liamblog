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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [myComments, setMyComments] = useState<MyComment[]>([])
  const [loadingUser, setLoadingUser] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

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

  const sendCode = async () => {
    setMessage('')
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'signup' }),
    })
    if (!res.ok) {
      setMessage('发送失败')
      return
    }
    setMessage('验证码已发送')
  }

  const sendResetCode = async () => {
    setMessage('')
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, purpose: 'reset' }),
    })
    if (!res.ok) {
      setMessage('发送失败')
      return
    }
    setMessage('重置验证码已发送')
  }

  const login = async () => {
    setMessage('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    setMessage(res.ok ? '登录成功' : '登录失败')
    if (res.ok) loadUser()
  }

  const signup = async () => {
    setMessage('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, code }),
    })
    setMessage(res.ok ? '注册成功' : '注册失败')
    if (res.ok) loadUser()
  }

  const resetPwd = async () => {
    setMessage('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, password: resetPassword, code: resetCode }),
    })
    setMessage(res.ok ? '重置成功，请登录' : '重置失败')
    if (res.ok) {
      setShowReset(false)
      setMode('login')
      setResetCode('')
      setResetPassword('')
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    setMyComments([])
    setMode('login')
    setMessage('已退出登录')
  }

  const updateProfile = async () => {
    setMessage('')
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ displayName, avatarUrl }),
    })
    setMessage(res.ok ? '资料已更新' : '更新失败')
    if (res.ok) loadUser()
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

  if (loadingUser) {
    return <div className="glass-card mx-auto max-w-md p-6 text-sm text-slate-600">加载中...</div>
  }

  if (user) {
    return (
      <div className="glass-card mx-auto max-w-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">账号状态</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{user.display_name || user.email}</div>
            <div className="mt-1 text-xs text-slate-500">角色：{user.role === 'admin' ? '管理员' : '用户'}</div>
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
              <input
                className="w-full rounded-md border px-3 py-2"
                placeholder="头像 URL"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
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
          忘记密码
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      {!showReset ? (
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
            placeholder="密码（字母+数字，>=6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'signup' && (
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-md border px-3 py-2"
                placeholder="验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="button-pop rounded-md bg-black/5 px-3" onClick={sendCode}>
                发送
              </button>
            </div>
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
            placeholder="邮箱"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2"
              placeholder="验证码"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
            />
            <button className="button-pop rounded-md bg-black/5 px-3" onClick={sendResetCode}>
              发送
            </button>
          </div>
          <input
            className="w-full rounded-md border px-3 py-2"
            type="password"
            placeholder="新密码"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
          />
          <button className="button-pop w-full rounded-md bg-black px-3 py-2 text-white" onClick={resetPwd}>
            重置密码
          </button>
        </div>
      )}
    </div>
  )
}
