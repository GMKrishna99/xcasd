/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "custom-blue1": "#00ACC1",
        "custom-pink": "#DA70D6",
        "custom-indigo": "#7986CB",
        "custom-LavenderBlush": "#E6B7D2",
        "custom-Apricot": "#D35400",
        "custom-Apricot": "#D35400",
        "custom-Brown": "#3EB489",
        "custom-yellow": "#f9eb28",
        "custom-red": "#F24F4B",
        "custom-heading": "#667649",
        "custom-blue": "#0021A6",
        "custom-brown": "#632E0F",
        "custom-darkblue": "#00246B",
        "custom-lightblue": "#CADCFC",
        "custom-maroon": "#fafafa",
        "custom-lightbrown": "#C07A50",
        "custom-blue-table": "#003375",
        primary: {
          DEFAULT: "#7E22CE",
          light: "#9333EA",
          dark: "#6B21A8",
        },
      },
      fontSize: {
        xxs: "0.625rem", // 10px
      },
      borderWidth: {
        0.5: "0.5px",
      },
    },
  },
  plugins: [require("tailwindcss-motion")],
};
