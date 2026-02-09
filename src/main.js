/**
 * Bexalta WOW Effects v2.0.2 — Premium Bundle
 * "Claridad Radical" visual system
 *
 * Single entry point orchestrating all effects.
 * GSAP + ScrollTrigger loaded externally from Webflow header.
 * Three.js bundled here. Native scroll (no Lenis).
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Preloader } from './effects/Preloader.js';
import { NeuralFlow } from './effects/NeuralFlow.js';
import { ChromaticTransition } from './effects/ChromaticTransition.js';
import { ChromaticSpine } from './effects/ChromaticSpine.js';
import { GreenNodes } from './effects/GreenNodes.js';
import { ScrollAnimations } from './effects/ScrollAnimations.js';
import { TopographyOverlay } from './effects/TopographyOverlay.js';

// Global namespace
window.BexaltaWOW = { version: '2.0.2' };

/**
 * Wait for GSAP + ScrollTrigger globals (loaded async by Webflow header).
 * Resolves immediately if already available, otherwise polls every 50ms.
 * Times out after 5s to avoid infinite wait.
 */
function waitForGSAP() {
    return new Promise((resolve) => {
        if (window.gsap && window.ScrollTrigger) {
            resolve();
            return;
        }
        console.log('[BexaltaWOW] Waiting for GSAP + ScrollTrigger...');
        const check = setInterval(() => {
            if (window.gsap && window.ScrollTrigger) {
                clearInterval(check);
                console.log('[BexaltaWOW] GSAP + ScrollTrigger ready');
                resolve();
            }
        }, 50);
        setTimeout(() => {
            clearInterval(check);
            console.warn('[BexaltaWOW] GSAP wait timeout — proceeding anyway');
            resolve();
        }, 5000);
    });
}

async function init() {
    console.log('[BexaltaWOW] v2.0.2 — Claridad Radical');

    // --- 0. WAIT FOR GSAP (async loaded by Webflow header) ---
    await waitForGSAP();

    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- 1. PRELOADER ---
    const preloader = new Preloader();
    await preloader.run();

    // --- 2. THREE.JS RENDERER (Single WebGL Context) ---
    const canvas = document.createElement('canvas');
    canvas.id = 'wow-webgl-canvas';
    Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '1',
        pointerEvents: 'none'
    });
    document.body.prepend(canvas);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.z = 500;

    // --- 3. EFFECTS ---

    // A. NeuralFlow — 3D particle background
    const neuralFlow = new NeuralFlow(scene, camera, renderer);

    // B. Chromatic Transition — Background color evolution
    new ChromaticTransition();

    // C. Chromatic Spine — Left edge progress
    new ChromaticSpine();

    // D. Green Nodes — Glow markers
    new GreenNodes();

    // E. Scroll Animations — GSAP triggers
    new ScrollAnimations();

    // F. Topography Overlay — Industrial contours (S1-S2)
    const topoUrl = document.body.dataset.topoAsset || null;
    if (topoUrl) {
        new TopographyOverlay(topoUrl);
    }

    // --- 4. RENDER LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        const time = clock.getElapsedTime();
        if (neuralFlow) neuralFlow.update(time);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // --- 5. RESIZE HANDLER ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- 6. SCROLL EVENT DISPATCH (native scroll) ---
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
        window.dispatchEvent(new CustomEvent('wow-scroll', {
            detail: { progress, scrollTop }
        }));
    }, { passive: true });

    console.log('[BexaltaWOW] All effects initialized');
}

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
