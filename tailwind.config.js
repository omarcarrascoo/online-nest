// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,html}',
    './app/**/*.{js,ts,jsx,tsx,html}',   // ← add your “app” directory here
    // if you have components elsewhere, add them too:
    // './components/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f2f8fa',
          100: '#d9edf3',
          200: '#aedce6',
          300: '#82cad9',  // ← no spaces
          400: '#5698bb',
          500: '#063a58',  // your primary
          600: '#05324b',
          700: '#04263a',
          800: '#031a27',
          900: '#020f14',
        },
        accent: {
          light: '#fff5e0',
          DEFAULT: '#ffc157',
          dark:  '#e6a744',
        },
        neutral: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
    },
  },
  plugins: [],
};
