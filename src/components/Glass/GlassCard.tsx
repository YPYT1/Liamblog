import React from 'react'
import clsx from 'clsx'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  hover?: boolean
}

export function GlassCard({
  children,
  className,
  as: Component = 'div',
  hover = true,
}: GlassCardProps) {
  return (
    <Component
      className={clsx(
        'glass-card',
        'bg-[var(--glass-bg)]',
        'backdrop-blur-[var(--glass-blur)]',
        'border border-[var(--glass-border)]',
        'rounded-lg-md',
        'shadow-glass',
        'transition-shadow duration-200',
        hover && 'hover:shadow-lg cursor-pointer',
        className,
      )}
    >
      {children}
    </Component>
  )
}

export default GlassCard
