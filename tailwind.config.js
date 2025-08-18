/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,js}", // Memindai semua file .js di dalam src
      "./index.html"         // Memindai file index.html
    ],
    theme: {
      extend: {
         // Definisikan warna kustom agar bisa digunakan di tempat lain
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