/**
 * SVGSampler.js — Sample particle positions from SVG paths
 *
 * Converts SVG graphics into Float32Array of 3D positions normalized
 * to camera space (fov 60, z=5) for use in ParticleOrchestrator.
 */

/**
 * Sample particle positions from an SVG graphic
 *
 * @param {string} svgUrl - URL or data URI of SVG file
 * @param {number} particleCount - Target number of particles (default 25000)
 * @returns {Promise<Float32Array>} Float32Array(particleCount * 3) with XYZ positions
 */
export async function sampleSVG(svgUrl, particleCount = 25000) {
    try {
        // 1. Fetch SVG content
        console.log(`[SVGSampler] Fetching SVG from: ${svgUrl}`);

        // 2. Create an Image element from SVG
        const img = new Image();
        img.crossOrigin = "Anonymous";

        await new Promise(async (resolve, reject) => {
            img.onload = () => {
                console.log(`[SVGSampler] Image loaded: ${img.width}x${img.height}`);
                resolve();
            };
            img.onerror = (e) => {
                console.error('[SVGSampler] Image load error:', e);
                reject(new Error('Failed to load SVG as image'));
            };

            if (svgUrl.startsWith('data:')) {
                img.src = svgUrl;
            } else {
                try {
                    const response = await fetch(svgUrl);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const text = await response.text();
                    const blob = new Blob([text], { type: 'image/svg+xml' });
                    img.src = URL.createObjectURL(blob);
                } catch (err) {
                    reject(err);
                }
            }
        });

        // 3. Draw SVG to offscreen canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Use reasonable resolution (512x512 or proportional to image)
        const maxDim = 512;
        const aspect = img.width / img.height;

        if (aspect >= 1) {
            canvas.width = maxDim;
            canvas.height = maxDim / aspect;
        } else {
            canvas.width = maxDim * aspect;
            canvas.height = maxDim;
        }

        // Draw with white fill to ensure visibility
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        URL.revokeObjectURL(url);

        // 4. Get image data and collect opaque pixels
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const sampledPoints = [];

        // Scan for pixels with alpha > 128 (visible pixels)
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                const alpha = pixels[i + 3];

                if (alpha > 128) {
                    // Store normalized coords [0-1]
                    sampledPoints.push({
                        x: x / canvas.width,
                        y: y / canvas.height
                    });
                }
            }
        }

        // 5. Sub-sample or over-sample to match particleCount
        const finalPoints = [];

        if (sampledPoints.length === 0) {
            console.warn('[SVGSampler] No visible pixels found in SVG, returning empty array');
            return new Float32Array(particleCount * 3);
        }

        if (sampledPoints.length >= particleCount) {
            // Sub-sample: random selection
            const indices = new Set();
            while (indices.size < particleCount) {
                indices.add(Math.floor(Math.random() * sampledPoints.length));
            }
            indices.forEach(i => finalPoints.push(sampledPoints[i]));
        } else {
            // Over-sample: duplicate points with jitter
            for (let i = 0; i < particleCount; i++) {
                const srcPoint = sampledPoints[i % sampledPoints.length];
                const jitterAmount = 0.002; // Small jitter to avoid exact duplicates
                finalPoints.push({
                    x: srcPoint.x + (Math.random() - 0.5) * jitterAmount,
                    y: srcPoint.y + (Math.random() - 0.5) * jitterAmount
                });
            }
        }

        // 6. Normalize to camera space [-5, 5] for fov 60, z=5
        // Maintain aspect ratio, fit within camera frustum
        const positions = new Float32Array(particleCount * 3);
        const scale = 10; // Range of -5 to 5 = 10 units

        for (let i = 0; i < particleCount; i++) {
            const point = finalPoints[i];

            // Center around origin and scale to camera space
            // X: -aspect*5 to aspect*5
            // Y: -2.5 to 2.5 (flipped because canvas Y is top-down)
            positions[i * 3] = (point.x - 0.5) * scale * aspect;
            positions[i * 3 + 1] = -(point.y - 0.5) * scale; // Flip Y
            positions[i * 3 + 2] = 0; // SVGs are flat (Z=0)
        }

        console.log(`[SVGSampler] Sampled ${particleCount} particles from ${sampledPoints.length} source pixels`);

        return positions;

    } catch (error) {
        console.error('[SVGSampler] Error:', error);
        throw error;
    }
}
