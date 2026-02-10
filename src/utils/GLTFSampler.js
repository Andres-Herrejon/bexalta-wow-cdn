import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cache del loader
const loader = new GLTFLoader();

/**
 * Muestrea un modelo GLTF para generar posiciones de particulas.
 * Extrae vertices de todos los meshes encontrados.
 * 
 * @param {string} gltfUrl URL del archivo GLTF/GLB
 * @param {number} particleCount Numero deseado de particulas
 * @returns {Promise<Float32Array>} Array de posiciones (x, y, z) * count
 */
export async function sampleGLTF(gltfUrl, particleCount = 25000) {
    // 1. Cargar modelo
    const gltf = await loader.loadAsync(gltfUrl);

    // 2. Recolectar todos los vertices de todos los meshes
    let allVertices = [];

    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            const geometry = child.geometry;
            const positionAttribute = geometry.attributes.position;

            // Aplicar transformacion local del mesh (matrixWorld)
            // Necesitamos asegurarnos que la matriz este actualizada
            child.updateMatrixWorld(true);
            const matrix = child.matrixWorld;

            for (let i = 0; i < positionAttribute.count; i++) {
                const vec = new THREE.Vector3();
                vec.fromBufferAttribute(positionAttribute, i);

                // Aplicar transformacion del objeto al vertice
                vec.applyMatrix4(matrix);

                allVertices.push(vec);
            }
        }
    });

    if (allVertices.length === 0) {
        console.warn('GLTFSampler: No vertices found in GLTF model');
        return new Float32Array(particleCount * 3);
    }

    // 3. Generar particulas finales
    const positions = new Float32Array(particleCount * 3);

    // Escala manual para ajustar el logo (según ROADMAP es ~0.028 units -> scalar a ~5)
    // Esto deberia ser configurale, pero por ahora hardcodeamos un factor razonable 
    // o normalizamos basado en bounding box.
    // Vamos a normalizar por Bounding Box para ser genericos.

    // Calcular Bounding Box
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

    allVertices.forEach(v => {
        min.min(v);
        max.max(v);
    });

    const size = new THREE.Vector3().subVectors(max, min);
    const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);

    // Escalar para que el mayor eje sea ~5 units (ancho de camara aprox)
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 5.0 / maxDim;

    for (let i = 0; i < particleCount; i++) {
        // Seleccion random de vertice
        // TODO: Implementar Surface Sampling (interpolacion en triangulos) para mejor distribucion
        // Por ahora Vertex Sampling es suficiente si la malla es densa.
        const vertex = allVertices[Math.floor(Math.random() * allVertices.length)];

        let x = (vertex.x - center.x) * scaleFactor;
        let y = (vertex.y - center.y) * scaleFactor;
        let z = (vertex.z - center.z) * scaleFactor;

        // Jitter minimo para evitar superposicion exacta
        if (particleCount > allVertices.length) {
            const jitter = 0.05;
            x += (Math.random() - 0.5) * jitter;
            y += (Math.random() - 0.5) * jitter;
            z += (Math.random() - 0.5) * jitter;
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    return positions;
}
