/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,js}", 
      "./index.html"         
    ],
    theme: {
      extend: {
        colors: {
          'brand-green': '#16A34A',
          'brand-dark': '#1F2937',
          'brand-gray': '#6B7280',
        }
      },
    },
    plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
  }