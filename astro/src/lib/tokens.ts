export const tokens = {
  colors: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#EC4899',
    highlight: '#06B6D4',
    background: {
      light: '#FAFAFA',
      dark: '#0A0A0A',
    },
    text: {
      primary: {
        light: '#0F172A',
        dark: '#F8FAFC',
      },
      secondary: {
        light: '#475569',
        dark: '#94A3B8',
      },
    },
    border: {
      light: 'rgba(0, 0, 0, 0.08)',
      dark: 'rgba(255, 255, 255, 0.1)',
    },
  },
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
  typography: {
    fontFamily: '"MiSans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
} as const

export const fluidColors = [
  tokens.colors.primary,
  tokens.colors.secondary,
  tokens.colors.accent,
  tokens.colors.highlight,
]
