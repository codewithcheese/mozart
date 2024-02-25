/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter Variable", "sans-serif"],
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
