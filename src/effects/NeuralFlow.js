/**
 * NeuralFlow — 3D Particle Background
 * Chaos → Clarity transition with scroll
 * GLSL shaders: simplex noise → parametric sine waves
 * Mouse repulsion, color evolution (grey → white → green)
 */

import * as THREE from 'three';
import vertexShader from '../shaders/neuralVertex.glsl?raw';
import fragmentShader from '../shaders/neuralFragment.glsl?raw';
import { isMobile } from '../utils/dom.js';

export class NeuralFlow {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Responsive particle count
        this.count = isMobile() ? 1500 : 4000;

        this.init();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.count * 3);
        const randoms = new Float32Array(this.count * 3);

        for (let i = 0; i < this.count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 1.5;
            positions[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight * 1.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

            randoms[i * 3] = Math.random();
            randoms[i * 3 + 1] = Math.random();
            randoms[i * 3 + 2] = Math.random();
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

        this.uniforms = {
            uTime: { value: 0 },
            uScrollProgress: { value: 0 },
            uMouse: { value: new THREE.Vector2(-9999, -9999) },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        };

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: this.uniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);

        this.bindEvents();
    }

    bindEvents() {
        // Mouse interaction (desktop only)
        if (!isMobile()) {
            window.addEventListener('mousemove', (e) => {
                const x = e.clientX - window.innerWidth / 2;
                const y = -(e.clientY - window.innerHeight / 2);
                this.uniforms.uMouse.value.set(x, y);
            });
        }

        // Scroll progress
        window.addEventListener('wow-scroll', (e) => {
            if (e.detail) {
                this.uniforms.uScrollProgress.value = e.detail.progress;
            }
        });

        // Resize
        window.addEventListener('resize', () => {
            this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        });
    }

    update(time) {
        this.uniforms.uTime.value = time;
    }
}
