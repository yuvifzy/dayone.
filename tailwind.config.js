/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './index.html',
        './index.tsx',
        './App.tsx',
        './components/**/*.{ts,tsx,js,jsx}',
        './pages/**/*.{ts,tsx,js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                oled: {
                    DEFAULT: '#000000',
                    surface: '#050505',
                    card: '#0b0b0b',
                    border: '#1a1a1a',
                },
            },
        },
    },
    plugins: [],
};
