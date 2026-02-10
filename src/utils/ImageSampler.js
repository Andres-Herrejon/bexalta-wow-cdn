import * as THREE from 'three';

/**
 * Muestrea una imagen y un mapa de profundidad para generar posiciones de particulas.
 * 
 * @param {string} imageUrl URL de la imagen principal (RGB)
 * @param {string} depthUrl URL del mapa de profundidad (grayscale)
 * @param {number} particleCount Numero deseado de particulas
 * @returns {Promise<Float32Array>} Array de posiciones (x, y, z) * count
 */
export async function sampleImage(imageUrl, depthUrl, particleCount = 25000) {
    // 1. Cargar ambas imagenes
    const [image, depthImage] = await Promise.all([
        loadImage(imageUrl),
        loadImage(depthUrl)
    ]);

    // 2. Setup canvas offscreen (usamos el tamaño natural de la imagen, max 512px)
    const width = Math.min(image.width, 512);
    const height = Math.floor(width * (image.height / image.width));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // 3. Dibujar imagen principal y obtener data
    ctx.drawImage(image, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 4. Dibujar depth map y obtener data
    // Limpiamos canvas para asegurar pureza
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(depthImage, 0, 0, width, height);
    const depthData = ctx.getImageData(0, 0, width, height).data;

    // 5. Recolectar candidatos validos
    // Un pixel es valido si su brillo es > 30 (no es negro total)
    const candidates = [];
    const aspect = width / height;

    for (let i = 0; i < data.length; i += 4) {
        // Brillo aproximado: (R+G+B)/3
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

        if (brightness > 30) {
            // Coordenadas normalizadas [0, 1]
            const pixelIndex = i / 4;
            const x = (pixelIndex % width) / width;
            const y = Math.floor(pixelIndex / width) / height;

            // Depth value (usamos canal Rojo del depth map)
            // Normalizado [0, 1]
            const z = depthData[i] / 255;

            candidates.push({ x, y, z });
        }
    }

    if (candidates.length === 0) {
        console.warn('ImageSampler: No valid pixels found (image too dark?)');
        return new Float32Array(particleCount * 3);
    }

    // 6. Generar particulas finales (sub-muestreo o sobre-muestreo)
    const positions = new Float32Array(particleCount * 3);

    // Escala para ajustar al FOV de la camara (FOV 60, Z 5 -> altura visible ~5.77)
    // Usamos rango Y [-2.5, 2.5] para dejar margen
    const scaleY = 5.0;
    const scaleX = scaleY * aspect;
    const depthScale = 2.0; // Profundidad maxima en Z

    for (let i = 0; i < particleCount; i++) {
        // Seleccion random de un candidato
        const candidate = candidates[Math.floor(Math.random() * candidates.length)];

        let x = candidate.x;
        let y = candidate.y;
        let z = candidate.z;

        // Jitter para evitar "grid artifacts" cuando duplicamos puntos
        if (particleCount > candidates.length) {
            x += (Math.random() - 0.5) * (1 / width);
            y += (Math.random() - 0.5) * (1 / height);
        }

        // Mapear al espacio de camara
        // X: [0, 1] -> [-scaleX/2, scaleX/2]
        // Y: [0, 1] -> [scaleY/2, -scaleY/2] (invertido porque imagen Y=0 es arriba)
        // Z: [0, 1] -> [-depthScale/2, depthScale/2]

        positions[i * 3] = (x - 0.5) * scaleX;
        positions[i * 3 + 1] = (0.5 - y) * scaleY; // Y invertido
        positions[i * 3 + 2] = (z * depthScale); // Z positivo hacia la camara, depth map blanco = cerca?
        // Nota: En depth maps usualmente blanco=cerca (Z+), negro=lejos (Z- o 0).
        // Aqui asumimos rango Z [0, depthScale]. Ajustar segun necesidad.
    }

    return positions;
}

/**
 * Helper para cargar imagen
 * @param {string} url 
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}
