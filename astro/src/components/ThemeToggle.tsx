import React, { useEffect, useState } from 'react'

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark'
  } else {
    delete document.documentElement.dataset.theme
  }
  localStorage.setItem('theme', theme)
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored ?? (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  return (
    <button
      type="button"
      className="button-pop rounded-full border border-black/10 px-3 py-1 text-xs text-slate-600"
      onClick={toggle}
      aria-label="切换主题"
    >
      {theme === 'dark' ? '深色' : '浅色'}
    </button>
  )
}
