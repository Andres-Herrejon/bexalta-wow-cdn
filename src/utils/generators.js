import * as THREE from 'three';

export function generateChaosPositions(count = 25000) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = 5.0 * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
}

export function generateGridPositions(count = 25000) {
    const positions = new Float32Array(count * 3);
    const cols = 200; // Hardcoded to match NeuralFlow desktop default
    const rows = 50;
    const width = 20.0;
    const depth = 6.0;

    for (let i = 0; i < count; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const u = col / cols;
        const v = row / rows; // Simple row mapping, ignoring wrap for now as per NeuralFlow

        const tx = (u - 0.5) * width;
        const ty = 0; // Flat grid, wave handled by shader or simplified
        const tz = (v - 0.5) * depth;

        positions[i * 3 + 0] = tx;
        positions[i * 3 + 1] = ty;
        positions[i * 3 + 2] = tz;
    }
    return positions;
}
