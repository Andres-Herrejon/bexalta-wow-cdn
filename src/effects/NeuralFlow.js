/**
 * NeuralFlow v2 — 25K Particle Data Flow
 * Ported from neural-data-flow R3F prototype
 *
 * Behavior: 25K particles start in chaos sphere,
 * organize into traveling sine wave with scroll.
 * Progressive reveal (10K→25K), mouse repulsion,
 * Foundtech color narrative (black→gray→green).
 *
 * Coordinate system: camera at z=5, fov 60, unit scale.
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

        const mobile = isMobile();
        this.count = mobile ? 8000 : 25000;
        this.cols = mobile ? 200 : 500;
        this.rows = mobile ? 40 : 50;

        // Viewport dimensions at z=0 for mouse→world conversion
        const fovRad = (this.camera.fov * Math.PI) / 180;
        this.viewportHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
        this.viewportWidth = this.viewportHeight * this.camera.aspect;

        this.init();
    }

    init() {
        const geometry = new THREE.BufferGeometry();
        const count = this.count;

        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count * 3);
        const targets = new Float32Array(count * 3);
        const indices = new Float32Array(count);

        // Grid dimensions for organized wave state
        const width = 20.0;   // X spread
        const depth = 6.0;    // Z spread
        const cols = this.cols;
        const rows = this.rows;

        for (let i = 0; i < count; i++) {
            indices[i] = i;

            // --- Chaos positions: uniform random sphere (radius 5) ---
            const r = 5.0 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const rx = r * Math.sin(phi) * Math.cos(theta);
            const ry = r * Math.sin(phi) * Math.sin(theta);
            const rz = r * Math.cos(phi);

            randoms[i * 3] = rx;
            randoms[i * 3 + 1] = ry;
            randoms[i * 3 + 2] = rz;

            // Initial positions = chaos
            positions[i * 3] = rx;
            positions[i * 3 + 1] = ry;
            positions[i * 3 + 2] = rz;

            // --- Target positions: structured grid plane ---
            const col = i % cols;
            const row = Math.floor(i / cols);

            const u = col / cols;
            const v = row / rows;

            const tx = (u - 0.5) * width;
            const tz = (v - 0.5) * depth;
            const ty = 0; // Y displaced by shader wave function

            targets[i * 3] = tx;
            targets[i * 3 + 1] = ty;
            targets[i * 3 + 2] = tz;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
        geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3));
        geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));

        this.uniforms = {
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uPointer: { value: new THREE.Vector3(100, 100, 0) }
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
        // Mouse → world space conversion (desktop only)
        if (!isMobile()) {
            window.addEventListener('mousemove', (e) => {
                // Normalized device coordinates (-1 to 1)
                const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
                const ndcY = -((e.clientY / window.innerHeight) * 2 - 1);

                // Convert to world space at z=0
                const worldX = (ndcX * this.viewportWidth) / 2;
                const worldY = (ndcY * this.viewportHeight) / 2;

                this.uniforms.uPointer.value.set(worldX, worldY, 0);
            });
        }

        // Scroll progress via wow-scroll custom event
        window.addEventListener('wow-scroll', (e) => {
            if (e.detail) {
                this.uniforms.uScroll.value = e.detail.progress;
            }
        });

        // Resize — update viewport dimensions and pixel ratio
        window.addEventListener('resize', () => {
            const fovRad = (this.camera.fov * Math.PI) / 180;
            this.viewportHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
            this.viewportWidth = this.viewportHeight * this.camera.aspect;
            this.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
        });
    }

    update(time) {
        this.uniforms.uTime.value = time;
    }
}
