import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored ?? (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  if (!mounted) return <div className="h-8 w-14" /> // 占位符防止闪烁

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative flex h-8 w-14 cursor-pointer items-center rounded-full bg-slate-100 p-1 transition-colors duration-300 dark:bg-zinc-800"
      aria-label="Toggle theme"
    >
      {/* 滑动轨道背景装饰 */}
      <div className="absolute inset-0 flex items-center justify-between px-2 opacity-20">
        <MoonIcon size={12} />
        <SunIcon size={12} />
      </div>

      {/* 滑动圆钮 */}
      <motion.div
        className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
        initial={false}
        animate={{
          x: theme === 'dark' ? 24 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          key={theme}
          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-700 dark:text-amber-400"
        >
          {theme === 'dark' ? <MoonIcon size={14} /> : <SunIcon size={14} />}
        </motion.div>
      </motion.div>
    </button>
  )
}

function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}