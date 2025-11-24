import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Futuristic neon color palette
        primary: '#0df259',
        'neon-green': '#0df259',
        'neon-cyan': '#00f6ff',
        'neon-purple': '#b537f2',
        'neon-blue': '#0066ff',
        'neon-pink': '#ff006e',
        'neon-orange': '#ff6b35',
        'background-light': '#f5f8f6',
        'background-dark': '#0a0e0d',
        'glass-light': 'rgba(255, 255, 255, 0.05)',
        'glass-medium': 'rgba(255, 255, 255, 0.1)',
        'glass-strong': 'rgba(255, 255, 255, 0.15)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      // Futuristic box shadows with neon glow effects
      boxShadow: {
        'glow-sm': '0 0 10px rgba(13, 242, 89, 0.3)',
        'glow-md': '0 0 20px rgba(13, 242, 89, 0.4)',
        'glow-lg': '0 0 30px rgba(13, 242, 89, 0.5)',
        'glow-xl': '0 0 40px rgba(13, 242, 89, 0.6)',
        'glow-cyan': '0 0 20px rgba(0, 246, 255, 0.4)',
        'glow-purple': '0 0 20px rgba(181, 55, 242, 0.4)',
        'glow-blue': '0 0 20px rgba(0, 102, 255, 0.4)',
        'neon-border': 'inset 0 0 10px rgba(13, 242, 89, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      // Advanced backdrop blur for glass morphism
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
        '5xl': '96px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Futuristic animations
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(13, 242, 89, 0.4)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(13, 242, 89, 0.8)',
            opacity: '0.8',
          },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '10%': { opacity: '0.9' },
          '20%': { opacity: '1' },
          '30%': { opacity: '0.95' },
          '40%': { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'slide-left': 'slide-left 0.5s ease-out',
        'slide-right': 'slide-right 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'neon-flicker': 'neon-flicker 1.5s infinite',
      },
      // Custom gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #0df259 0%, #00f6ff 50%, #b537f2 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #00f6ff 0%, #0066ff 50%, #b537f2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0a0e0d 0%, #1a1f1e 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent, rgba(13, 242, 89, 0.3), transparent)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-animate')],
};
export default config;
