
import * as THREE from 'three';

export class DepthLax {
    constructor(containerId, imgPath, depthPath) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.imgPath = imgPath;
        this.depthPath = depthPath;

        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();

        this.init();
    }

    async init() {
        // Scene Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
        this.camera.position.z = 2; // Fixed distance

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Perf cap
        this.container.appendChild(this.renderer.domElement);

        // Load Textures
        const loader = new THREE.TextureLoader();
        try {
            const [tex, depth] = await Promise.all([
                new Promise(r => loader.load(this.imgPath, r)),
                new Promise(r => loader.load(this.depthPath, r))
            ]);

            this.createMesh(tex, depth);
            this.bindEvents();
            this.animate();
        } catch (e) {
            console.error('DepthLax: Failed to load textures', e);
        }
    }

    createMesh(tex, depth) {
        // Shader Material for Displacement
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: tex },
                uDepth: { value: depth },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uResolution: { value: new THREE.Vector2(this.width, this.height) },
                uImageRes: { value: new THREE.Vector2(tex.image.width, tex.image.height) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture;
                uniform sampler2D uDepth;
                uniform vec2 uMouse;
                uniform vec2 uResolution;
                uniform vec2 uImageRes;
                varying vec2 vUv;

                vec2 cover(vec2 uv, vec2 resolution, vec2 imageRes) {
                    vec2 ratio = resolution / imageRes;
                    float minRatio = max(ratio.x, ratio.y);
                    vec2 newSize = imageRes * minRatio;
                    vec2 offset = (newSize - resolution) / 2.0;
                    return (uv * resolution + offset) / newSize;
                }

                void main() {
                    vec2 uv = cover(vUv, uResolution, uImageRes);
                    float depth = texture2D(uDepth, uv).r;
                    
                    // Mouse parallax
                    vec2 parallax = uMouse * depth * 0.03; // Subtle 3% movement
                    
                    gl_FragColor = texture2D(uTexture, uv + parallax);
                }
            `
        });

        // Fullscreen Quad attached to Camera
        const geometry = new THREE.PlaneGeometry(1, 1);

        // Fit plane to camera view
        // Visible height at z=0 is 2 * tan(fov/2) * dist
        const dist = this.camera.position.z;
        const vH = 2 * Math.tan((Math.PI / 180) * this.camera.fov / 2) * dist;
        const vW = vH * (this.width / this.height);

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(vW, vH), material);
        this.scene.add(plane);
        this.material = material;
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            // Normalize mouse -1 to 1
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.width = this.container.offsetWidth;
            this.height = this.container.offsetHeight;
            this.renderer.setSize(this.width, this.height);
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            if (this.material) {
                this.material.uniforms.uResolution.value.set(this.width, this.height);
            }
        });
    }

    animate() {
        // Smooth lerp
        this.mouse.lerp(this.targetMouse, 0.05);

        if (this.material) {
            this.material.uniforms.uMouse.value.copy(this.mouse);
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate.bind(this));
    }
}
