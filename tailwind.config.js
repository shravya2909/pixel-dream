/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bubblegum: '#FF6EC7',
        'cyber-blue': '#3DDCFF',
        lime: '#B8FF3D',
        lavender: '#C9A7FF',
        'chrome-silver': '#D9DDE3',
        'win98-grey': '#C0C0C0',
        'win98-navy': '#000080',
        'deep-purple': '#1A0B3D',
      },
      fontFamily: {
        pixel: ['"VT323"', 'monospace'],
        bubbly: ['"Varela Round"', 'sans-serif'],
        chrome: ['"Orbitron"', 'sans-serif'],
      },
      animation: {
        holographic: 'holographic-shift 20s ease-in-out infinite',
        float: 'float-bob 4s ease-in-out infinite',
        twinkle: 'twinkle 2.5s ease-in-out infinite',
        drift: 'drift 18s linear infinite',
      },
      keyframes: {
        'holographic-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float-bob': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.2, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(30px, -40px)' },
        },
      },
      boxShadow: {
        win98out:
          'inset -1px -1px 0 #000, inset 1px 1px 0 #fff, inset -2px -2px 0 #808080, inset 2px 2px 0 #dfdfdf',
        win98in:
          'inset 1px 1px 0 #000, inset -1px -1px 0 #fff, inset 2px 2px 0 #808080, inset -2px -2px 0 #dfdfdf',
      },
    },
  },
  plugins: [],
}
