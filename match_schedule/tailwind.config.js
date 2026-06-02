import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                fotmob: {
                    bg: '#0d1117',
                    card: '#161b22',
                    border: '#30363d',
                    accent: '#2ea043',
                    live: '#f85149',
                    muted: '#8b949e',
                },
            },
        },
    },
    plugins: [],
};
