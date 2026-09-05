/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      colors: {
        // App Layout
        background: '#F7F8FA',
        card: '#FFFFFF',
        border: '#E5E7EB',
        
        // Typography
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
        },
        
        // Semantic Actions & Status
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#0EA5E9',
        disabled: '#D1D5DB',
      },
      borderRadius: {
        DEFAULT: '10px',
        md: '12px',
        lg: '14px',
      },
      boxShadow: {
        'sm-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}