/**
 * Bexalta WOW Effects v2.1.0 — Premium Bundle
 * "Claridad Radical" visual system
 *
 * Single entry point orchestrating all effects.
 * GSAP + ScrollTrigger loaded externally from Webflow header.
 * Three.js bundled here. Native scroll (no Lenis).
 */

import * as THREE from 'three';

import { Preloader } from './effects/Preloader.js';
import { ParticleOrchestrator } from './effects/ParticleOrchestrator.js';
import { ChromaticTransition } from './effects/ChromaticTransition.js';
import { ChromaticSpine } from './effects/ChromaticSpine.js';
import { GreenNodes } from './effects/GreenNodes.js';
import { ScrollAnimations } from './effects/ScrollAnimations.js';
import { TopographyOverlay } from './effects/TopographyOverlay.js';
import { generateChaosPositions, generateGridPositions } from './utils/generators.js';
import { sampleSVG } from './utils/SVGSampler.js';
import { sampleText } from './utils/TextSampler.js';
import { BEXALTA_SVG, FOUNDTECH_SVG } from './assets/logos.js';

// Global namespace
window.BexaltaWOW = { version: '3.0.0-beta' };

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
/**
 * Safe accessor for ScrollTrigger
 */
function getScrollTrigger() {
    return window.ScrollTrigger || (window.gsap && window.gsap.ScrollTrigger);
}

async function init() {
    console.log('[BexaltaWOW] v3.0.0 — Particle Orchestrator Enabled');

    // --- 0. WAIT FOR GSAP (async loaded by Webflow header) ---
    await waitForGSAP();

    const ST = getScrollTrigger();
    if (window.gsap && ST) {
        window.gsap.registerPlugin(ST);
        console.log('[BexaltaWOW] GSAP registered');
    } else {
        console.warn('[BexaltaWOW] ScrollTrigger not found, some effects will be disabled');
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
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.z = 5;

    // --- 3. EFFECTS ---

    // A. Particle Orchestrator (Replaces NeuralFlow)
    const orchestrator = new ParticleOrchestrator(scene, camera, renderer, 25000);

    // 3.1 Sample Hero Assets
    console.log('[BexaltaWOW] Sampling hero assets...');
    const [posBexalta, posFoundtech, posBexaltaOS] = await Promise.all([
        sampleSVG(BEXALTA_SVG, 25000),
        sampleSVG(FOUNDTECH_SVG, 25000),
        sampleText('BEXALTA OS', 25000, { fontSize: 100, fontFamily: 'sans-serif', bold: true })
    ]);

    // 3.2 Define States
    // Hero Sequence: Bexalta -> Foundtech -> Bexalta OS -> Chaos
    orchestrator.addState('bexalta-logo', posBexalta, [1, 1, 1]); // White
    orchestrator.addState('foundtech-logo', posFoundtech, [0.63, 0.77, 0.17]); // #a1c52d (Foundtech Lime)
    orchestrator.addState('bexalta-os', posBexaltaOS, [1, 1, 1]); // White text
    orchestrator.addState('chaos', generateChaosPositions(25000), [0.2, 0.2, 0.2]); // Dark grey chaos
    orchestrator.addState('neural', generateGridPositions(25000), [0.0, 1.0, 0.5]); // Teal grid

    // 3.3 Define Transitions (Scroll range 0.0 - 1.0)
    // S1 Hero: 0.0 - 0.3
    orchestrator.transitionTo('foundtech-logo', 0.00, 0.10); // Morph to Foundtech
    orchestrator.transitionTo('bexalta-os', 0.10, 0.20); // Morph to Bexalta OS
    orchestrator.transitionTo('chaos', 0.20, 0.30); // Explode to chaos
    // S2 Problem: 0.3 - 0.5
    orchestrator.transitionTo('neural', 0.30, 0.50); // Reassemble to grid

    // B. Chromatic Transition — Background color evolution
    if (getScrollTrigger()) new ChromaticTransition();

    // C. Chromatic Spine — Left edge progress
    new ChromaticSpine();

    // D. Green Nodes — Glow markers
    new GreenNodes();

    // E. Scroll Animations — GSAP triggers
    if (getScrollTrigger()) new ScrollAnimations();

    // F. Topography Overlay — Industrial contours (S1-S2)
    const topoUrl = document.body.dataset.topoAsset || null;
    if (topoUrl) {
        new TopographyOverlay(topoUrl);
    }

    // --- 4. RENDER LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        const time = clock.getElapsedTime();
        if (orchestrator) orchestrator.update(time);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // --- 5. RESIZE HANDLER ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (orchestrator) orchestrator.resize();
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
