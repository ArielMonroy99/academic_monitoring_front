/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        "bg-color": "#F9F9F9",
        "primary": "#0C2348",
        "active": "#159DFF",
        "selected": "#438ABE" 
      },
      screens: {
       
      },
      gridTemplateColumns: {
        '2A': '3fr 1fr',
        'navbar': '3rem 1fr',
        'sidebar': '10vw 90vw',
        'main': '1fr',
      },
    }
  },
  plugins: [
    require("flowbite/plugin")
  ],
}