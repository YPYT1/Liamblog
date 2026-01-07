/**
 * Liquid Glass Design Tokens
 * 液态玻璃设计系统 - 设计令牌配置
 */

export const tokens = {
  // Color Palette (4 colors for fluid animation)
  colors: {
    primary: '#6366F1',    // Indigo - 主色
    secondary: '#8B5CF6',  // Violet - 辅助色
    accent: '#EC4899',     // Pink - 强调色
    highlight: '#06B6D4',  // Cyan - 高亮色

    // Neutral colors
    background: {
      light: '#FAFAFA',
      dark: '#0A0A0A',
    },
    text: {
      primary: {
        light: '#0F172A',  // slate-900
        dark: '#F8FAFC',   // slate-50
      },
      secondary: {
        light: '#475569',  // slate-600
        dark: '#94A3B8',   // slate-400
      },
    },
    border: {
      light: 'rgba(0, 0, 0, 0.08)',
      dark: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Glass Effect
  glass: {
    background: {
      light: 'rgba(255, 255, 255, 0.8)',
      dark: 'rgba(10, 10, 10, 0.8)',
    },
    blur: '12px',
    border: {
      light: 'rgba(0, 0, 0, 0.05)',
      dark: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Typography (MiSans - 非衬线字体)
  typography: {
    fontFamily: '"MiSans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing (高留白)
  spacing: {
    page: {
      x: '1.5rem',
      y: '2rem',
    },
    section: '4rem',
    card: '1.5rem',
  },

  // Border (极其细腻)
  border: {
    width: '1px',
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
  },

  // Transitions
  transition: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
} as const

// Fluid animation colors array
export const fluidColors = [
  tokens.colors.primary,
  tokens.colors.secondary,
  tokens.colors.accent,
  tokens.colors.highlight,
]

export type Tokens = typeof tokens
