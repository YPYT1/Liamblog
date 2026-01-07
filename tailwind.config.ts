import svgToDataUri from 'mini-svg-data-uri'
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const { default: flattenColorPalette } = require('tailwindcss/lib/util/flattenColorPalette')

const twConfig: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: 'var(--content-background)',
        card: 'var(--ifm-card-background-color)',
        text: 'var(--ifm-text-color)',
        secondary: 'var(--ifm-secondary-text-color)',
        link: 'var(--ifm-link-color)',
        primary: 'var(--ifm-color-primary)',
        border: 'var(--ifm-border-color)',
        // Liquid Glass Colors
        lg: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          accent: '#EC4899',
          highlight: '#06B6D4',
        },
      },
      fontFamily: {
        misans: ['misans'],
      },
      borderRadius: {
        card: 'var(--ifm-card-border-radius)',
        'lg-sm': '0.5rem',
        'lg-md': '0.75rem',
        'lg-lg': '1rem',
        'lg-xl': '1.5rem',
      },
      boxShadow: {
        blog: 'var(--blog-item-shadow)',
        glass: '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        'marquee': 'marquee var(--duration) linear infinite',
        'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
        'fluid': 'fluid 20s ease infinite',
      },
      keyframes: {
        'marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'marquee-vertical': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
        'fluid': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(10px, -10px) scale(1.05)' },
          '50%': { transform: 'translate(-5px, 15px) scale(0.95)' },
          '75%': { transform: 'translate(-15px, -5px) scale(1.02)' },
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    require('@tailwindcss/typography'),
    plugin(({ matchUtilities, theme, addUtilities }) => {
      matchUtilities(
        {
          'bg-grid': value => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
            )}")`,
          }),
        },
        {
          values: flattenColorPalette(theme('backgroundColor')),
          type: 'color',
        },
      )
      // Glass effect utilities
      addUtilities({
        '.glass': {
          'background': 'var(--glass-bg)',
          'backdrop-filter': 'blur(var(--glass-blur))',
          '-webkit-backdrop-filter': 'blur(var(--glass-blur))',
          'border': '1px solid var(--glass-border)',
        },
        '.glass-card': {
          'background': 'var(--glass-bg)',
          'backdrop-filter': 'blur(var(--glass-blur))',
          '-webkit-backdrop-filter': 'blur(var(--glass-blur))',
          'border': '1px solid var(--glass-border)',
          'border-radius': '0.75rem',
          'box-shadow': '0 4px 30px rgba(0, 0, 0, 0.1)',
        },
      })
    }),
    addVariablesForColors,
  ],
}

export default twConfig

function addVariablesForColors({ addBase, theme }) {
  const allColors = flattenColorPalette(theme('colors'))
  const newVars = Object.fromEntries(Object.entries(allColors).map(([key, val]) => [`--${key}`, val]))

  addBase({
    ':root': newVars,
  })
}
