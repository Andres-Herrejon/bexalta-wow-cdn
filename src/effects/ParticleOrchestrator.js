import * as THREE from 'three';
import vertexShader from '../shaders/orchestratorVertex.glsl?raw';
import fragmentShader from '../shaders/orchestratorFragment.glsl?raw';

export class ParticleOrchestrator {
    constructor(scene, camera, renderer, count = 25000) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.count = count;

        this.states = new Map();
        this.transitions = [];
        this.activeTransitionIndex = -1;
        this.currentStateName = 'initial'; // Default fallback

        // Initialize particles
        this.initParticles();

        // Events
        this.boundHandleScroll = this.handleScroll.bind(this);
        this.boundHandleMouseMove = this.handleMouseMove.bind(this);
        window.addEventListener('wow-scroll', this.boundHandleScroll);
        window.addEventListener('mousemove', this.boundHandleMouseMove);
    }

    initParticles() {
        const geometry = new THREE.BufferGeometry();

        // Attributes
        const positions = new Float32Array(this.count * 3); // Position used for frustum culling
        const targetA = new Float32Array(this.count * 3);   // Current state positions
        const targetB = new Float32Array(this.count * 3);   // Next state positions
        const indices = new Float32Array(this.count);
        const randoms = new Float32Array(this.count * 3);

        for (let i = 0; i < this.count; i++) {
            indices[i] = i;

            // Random vector for noise dispersal
            randoms[i * 3 + 0] = (Math.random() - 0.5) * 2;
            randoms[i * 3 + 1] = (Math.random() - 0.5) * 2;
            randoms[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aTargetA', new THREE.BufferAttribute(targetA, 3));
        geometry.setAttribute('aTargetB', new THREE.BufferAttribute(targetB, 3));
        geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));
        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));

        // Material
        this.uniforms = {
            uTime: { value: 0 },
            uTransition: { value: 0 },
            uNoiseStrength: { value: 1.0 }, // Peak noise intensity
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uPointer: { value: new THREE.Vector3(0, 0, 0) },
            // Colors
            uColorA: { value: new THREE.Color('#ffffff') },
            uColorB: { value: new THREE.Color('#ffffff') }
        };

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertexShader || `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
            fragmentShader: fragmentShader || `void main() { gl_FragColor = vec4(1.0); }`,
            uniforms: this.uniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.points = new THREE.Points(geometry, this.material);
        this.points.frustumCulled = false; // Always render
        this.scene.add(this.points);
    }

    destroy() {
        window.removeEventListener('wow-scroll', this.boundHandleScroll);
        window.removeEventListener('mousemove', this.boundHandleMouseMove);
        this.scene.remove(this.points);
        this.points.geometry.dispose();
        this.points.material.dispose();
    }

    /**
     * Add a state configuration
     * @param {string} name - State identifier
     * @param {Float32Array} positions - Particle positions (count * 3)
     * @param {Array|THREE.Color} color - [r, g, b] 0-1 or Hex string
     */
    addState(name, positions, color) {
        if (positions.length < this.count * 3) {
            console.warn(`[ParticleOrchestrator] State '${name}' has fewer particles (${positions.length / 3}) than system count (${this.count}). Filling with 0.`);
            const newPos = new Float32Array(this.count * 3);
            newPos.set(positions);
            positions = newPos;
        }

        const colorObj = new THREE.Color(Array.isArray(color) ? new THREE.Color(color[0], color[1], color[2]) : color);

        this.states.set(name, {
            positions: positions,
            color: colorObj
        });

        // specific logic for initial state
        if (this.states.size === 1) {
            this.setInitialState(name);
        }
    }

    setInitialState(name) {
        const state = this.states.get(name);
        if (!state) return;

        this.currentStateName = name;
        this.activeTransitionIndex = -1;

        // Update attributes manually
        const attrA = this.points.geometry.attributes.aTargetA;
        attrA.set(state.positions);
        attrA.needsUpdate = true;

        const attrB = this.points.geometry.attributes.aTargetB;
        attrB.set(state.positions);
        attrB.needsUpdate = true;

        this.uniforms.uColorA.value.copy(state.color);
        this.uniforms.uColorB.value.copy(state.color);
        this.uniforms.uTransition.value = 0;
    }

    /**
     * Define a transition trigger based on scroll progress
     * @param {string} targetState - Name of state to transition TO
     * @param {number} start - Scroll progress (0-1) start
     * @param {number} end - Scroll progress (0-1) end
     */
    transitionTo(targetState, start, end) {
        this.transitions.push({
            targetState,
            start,
            end
        });
        // Sort by start time
        this.transitions.sort((a, b) => a.start - b.start);

        // Re-calculate 'from' states linking
        this.linkTransitions();
    }

    linkTransitions() {
        // Assume first added state is initial
        let currentState = this.states.keys().next().value || 'initial';

        for (let i = 0; i < this.transitions.length; i++) {
            this.transitions[i].fromState = currentState;
            // The next transition will start FROM this target
            currentState = this.transitions[i].targetState;
        }
    }

    handleScroll(e) {
        const progress = e.detail.progress; // 0 to 1

        // Find if we are inside a transition window
        let activeIndex = -1;
        for (let i = 0; i < this.transitions.length; i++) {
            if (progress >= this.transitions[i].start && progress <= this.transitions[i].end) {
                activeIndex = i;
                break;
            }
        }

        if (activeIndex !== -1) {
            // --- INSIDE TRANSITION ---
            const t = this.transitions[activeIndex];

            // Check if we need to load buffers (entering this transition)
            if (this.activeTransitionIndex !== activeIndex) {
                // console.log(`[Orchestrator] Entering transition: ${t.fromState} -> ${t.targetState}`);
                this.setupBuffers(t.fromState, t.targetState);
                this.activeTransitionIndex = activeIndex;
                this.currentStateName = t.fromState; // Technically transitioning out of this
            }

            // Update mix factor
            const mix = (progress - t.start) / (t.end - t.start);
            this.uniforms.uTransition.value = mix;

        } else {
            // --- OUTSIDE TRANSITION (STATIC GAP) ---
            this.activeTransitionIndex = -1;

            // Determine which state to hold
            let holdStateName = this.states.keys().next().value; // Default initial

            if (this.transitions.length > 0) {
                if (progress < this.transitions[0].start) {
                    // Before first transition
                    holdStateName = this.transitions[0].fromState;
                } else {
                    // Find the last completed transition
                    for (let i = 0; i < this.transitions.length; i++) {
                        if (progress > this.transitions[i].end) {
                            holdStateName = this.transitions[i].targetState;
                        }
                    }
                }
            }

            // Apply hold state if needed
            if (this.currentStateName !== holdStateName || this.uniforms.uTransition.value !== 0) {
                // Only snap if we aren't already there or if we have lingering transition value
                // console.log(`[Orchestrator] Snapping/Holding: ${holdStateName}`);
                this.snapToState(holdStateName);
            }
        }
    }

    setupBuffers(fromName, toName) {
        const fromState = this.states.get(fromName);
        const toState = this.states.get(toName);

        if (!fromState || !toState) return;

        const attrA = this.points.geometry.attributes.aTargetA;
        attrA.set(fromState.positions);
        attrA.needsUpdate = true;

        const attrB = this.points.geometry.attributes.aTargetB;
        attrB.set(toState.positions);
        attrB.needsUpdate = true;

        this.uniforms.uColorA.value.copy(fromState.color);
        this.uniforms.uColorB.value.copy(toState.color);
    }

    snapToState(stateName) {
        const state = this.states.get(stateName);
        if (!state) return;

        this.currentStateName = stateName;

        // Set both A and B to target state
        const attrA = this.points.geometry.attributes.aTargetA;
        attrA.set(state.positions);
        attrA.needsUpdate = true;

        const attrB = this.points.geometry.attributes.aTargetB;
        attrB.set(state.positions);
        attrB.needsUpdate = true;

        this.uniforms.uColorA.value.copy(state.color);
        this.uniforms.uColorB.value.copy(state.color);
        this.uniforms.uTransition.value = 0;
    }

    handleMouseMove(e) {
        // Normalized device coordinates
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Project to z=0 plane properties
        // FOV 60, Z=5.
        // Height at z=0 = 2 * 5 * tan(30deg) = 10 * 0.577 = 5.77
        const visibleHeight = 2 * Math.tan((Math.PI / 180) * this.camera.fov / 2) * this.camera.position.z;
        const visibleWidth = visibleHeight * this.camera.aspect;

        this.uniforms.uPointer.value.set(
            x * (visibleWidth / 2),
            y * (visibleHeight / 2),
            0
        );
    }

    update(time) {
        this.uniforms.uTime.value = time;
    }

    resize() {
        this.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }
}
