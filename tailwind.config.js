/** @type {import('tailwindcss').Config} */

module.exports = {
    content: [
        "./src/pages/**/*.{tsx,ts,jsx,js}",
        "./src/components/**/*.{tsx,ts,jsx,js}",
    ],
    theme: {
        extend: {
            height: {
                visible: "var(--visible-height)"
            },
            minHeight: {
                visible: "var(--visible-height)"
            }
        },
    },
    plugins: [],
}