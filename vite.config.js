import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'tuna.js'),
            name: 'Tuna',
            fileName: 'tuna',
        },
    },
});
