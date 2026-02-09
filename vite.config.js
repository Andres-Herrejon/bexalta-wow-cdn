import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/main.js',
            name: 'BexaltaWOW',
            fileName: 'wow-bundle',
            formats: ['iife']
        },
        rollupOptions: {
            external: ['gsap', 'gsap/ScrollTrigger'],
            output: {
                globals: {
                    'gsap': 'gsap',
                    'gsap/ScrollTrigger': 'ScrollTrigger'
                },
                assetFileNames: 'wow-style.[ext]'
            }
        },
        outDir: 'dist',
        minify: 'terser'
    },
    assetsInclude: ['**/*.glsl']
});
