import React from 'react'
import clsx from 'clsx'

interface PwaReloadPopupProps {
  onReload: () => void
}

export default function PwaReloadPopup({ onReload }: PwaReloadPopupProps): JSX.Element {
  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 z-50',
        'backdrop-blur-md',
        'bg-white/90 dark:bg-black/90',
        'border border-black/10 dark:border-white/10',
        'rounded-xl shadow-lg',
        'p-4 max-w-sm',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
      )}
    >
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        网站有新版本可用
      </p>
      <button
        type="button"
        onClick={onReload}
        className={clsx(
          'w-full px-4 py-2',
          'bg-primary/10 hover:bg-primary/20',
          'text-primary font-medium text-sm',
          'rounded-lg',
          'transition-colors duration-200',
          'cursor-pointer',
        )}
      >
        刷新
      </button>
    </div>
  )
}
