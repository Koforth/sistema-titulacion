import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },

            colors: {
                pggl: {
                    50: '#fbf3f3',
                    100: '#f6e4e4',
                    200: '#ecc7c8',
                    300: '#dca3a4',
                    400: '#c47a7c',
                    500: '#a84f51',
                    600: '#8f3a3d',
                    700: '#772d2f',
                    800: '#632627',
                    900: '#4c1f20',
                    950: '#2b1112',
                    DEFAULT: '#772d2f',
                },
            },
        },
    },

    plugins: [forms],
};
