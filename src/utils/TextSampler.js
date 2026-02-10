/**
 * TextSampler.js — Sample particle positions from text
 *
 * Renders text to an offscreen canvas and converts visible pixels
 * into Float32Array of 3D positions normalized to camera space.
 */

/**
 * Sample particle positions from a text string
 *
 * @param {string} text - Text to sample
 * @param {number} particleCount - Target number of particles (default 25000)
 * @param {object} options - Font configuration
 * @param {number} options.fontSize - Font size in px (default 120)
 * @param {string} options.fontFamily - Font family (default 'gotham, sans-serif')
 * @param {boolean} options.bold - Whether to use bold weight (default true)
 * @returns {Promise<Float32Array>} Float32Array(particleCount * 3) with XYZ positions
 */
export async function sampleText(text, particleCount = 25000, options = {}) {
    try {
        const config = {
            fontSize: options.fontSize || 120,
            fontFamily: options.fontFamily || 'gotham, sans-serif',
            bold: options.bold !== undefined ? options.bold : true
        };

        console.log(`[TextSampler] Sampling text: "${text}" with config:`, config);

        // 1. Create offscreen canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Fixed size as per plan (enough for short headers)
        // For longer text, we might need dynamic sizing, but starting with plan spec
        canvas.width = 1024;
        canvas.height = 256;

        // 2. Configure font
        const fontWeight = config.bold ? 'bold' : 'normal';
        ctx.font = `${fontWeight} ${config.fontSize}px ${config.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 3. Draw text centered
        ctx.fillStyle = '#ffffff';
        // Clear background (transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = canvas.width / 2;
        // Adjust Y slightly if needed, but middle baseline usually works
        const y = canvas.height / 2;

        ctx.fillText(text, x, y);

        // 4. Get image data and collect pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const sampledPoints = [];

        // Scan for pixels with alpha > 128
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                const alpha = pixels[i + 3];

                if (alpha > 128) {
                    sampledPoints.push({
                        x: x / canvas.width,
                        y: y / canvas.height
                    });
                }
            }
        }

        // 5. Sub-sample or over-sample
        const finalPoints = [];

        if (sampledPoints.length === 0) {
            console.warn('[TextSampler] No visible pixels found for text, returning empty array');
            return new Float32Array(particleCount * 3);
        }

        if (sampledPoints.length >= particleCount) {
            // Sub-sample
            const indices = new Set();
            while (indices.size < particleCount) {
                indices.add(Math.floor(Math.random() * sampledPoints.length));
            }
            indices.forEach(i => finalPoints.push(sampledPoints[i]));
        } else {
            // Over-sample with jitter
            for (let i = 0; i < particleCount; i++) {
                const srcPoint = sampledPoints[i % sampledPoints.length];
                const jitterAmount = 0.002;
                finalPoints.push({
                    x: srcPoint.x + (Math.random() - 0.5) * jitterAmount,
                    y: srcPoint.y + (Math.random() - 0.5) * jitterAmount
                });
            }
        }

        // 6. Normalize to camera space [-5, 5]
        const positions = new Float32Array(particleCount * 3);
        const scale = 10; // 10 units range (-5 to 5)

        // Use aspect ratio of the CANVAS to map correctly
        // canvas.width maps to X range [-aspect*5, aspect*5]
        // canvas.height maps to Y range [-5, 5]? 
        // No, SVGSampler mapped Y to [-2.5, 2.5] (height=5 units)
        // because y ranges 0-1. (y-0.5)*10 = -5 to 5. 
        // Wait, SVGSampler: `positions[i * 3 + 1] = -(point.y - 0.5) * scale;`
        // if scale=10, then range is -5 to 5.
        // But logic says fit within fov 60.
        // Let's stick to consistent mapping with SVGSampler.

        const aspect = canvas.width / canvas.height;

        for (let i = 0; i < particleCount; i++) {
            const point = finalPoints[i];

            // Normalize X: -aspect*5 to aspect*5
            positions[i * 3] = (point.x - 0.5) * scale * aspect;
            // Normalize Y: -5 to 5 (flipped)
            positions[i * 3 + 1] = -(point.y - 0.5) * scale;
            positions[i * 3 + 2] = 0;
        }

        console.log(`[TextSampler] Sampled ${particleCount} particles from text "${text}"`);

        return positions;

    } catch (error) {
        console.error('[TextSampler] Error:', error);
        throw error;
    }
}
