/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Noto Sans TC"', '"Zen Maru Gothic"', 'sans-serif'],
                rounded: ['"Zen Maru Gothic"', '"Noto Sans TC"', 'sans-serif'],
            },
            colors: {
                cream: '#FFFBF0',
                paper: '#FFFFFF',
                primary: '#FFB7B2',
                secondary: '#B5EAD7',
                accent: '#E2F0CB',
                highlight: '#FFDAC1',
                text: '#4A4A4A',
                subtext: '#888888',
                danger: '#FF9AA2',
            },
            boxShadow: {
                soft: '0 4px 20px -2px rgba(200, 200, 200, 0.25)',
                cute: '3px 3px 0px 0px rgba(74, 74, 74, 0.1)',
                'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            },
        },
    },
    plugins: [],
}
