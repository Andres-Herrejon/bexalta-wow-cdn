
uniform float uTime;
uniform float uScrollProgress; // 0.0 (top) to 1.0 (bottom)
uniform vec2 uMouse;
uniform vec2 uResolution;

attribute vec3 aRandom; // x: random offset, y: size variation, z: speed variation

varying vec3 vColor;

// Simplex/Perlin Noise function (Simplified for performance)
// Source: https://github.com/stegu/webgl-noise
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  return 130.0 * dot(m, vec3( dot(x0,p.x), dot(x12.xy,p.y), dot(x12.zw,p.z) ));
}

void main() {
    vec3 pos = position;

    // --- State A: Chaos (Perlin Noise) ---
    // Particles float organically
    float noiseTime = uTime * 0.2 + aRandom.z;
    float noiseX = snoise(vec2(pos.x * 0.002, noiseTime));
    float noiseY = snoise(vec2(pos.y * 0.002, noiseTime + 100.0));
    
    vec3 chaosPos = pos;
    chaosPos.x += noiseX * 50.0;
    chaosPos.y += noiseY * 50.0;


    // --- State B: Clarity (Parametric Sine Wave) ---
    // Particles define a mathematical sine wave structure
    // Structured Laminar Flow
    
    float waveFreq = 0.01;
    float waveAmp = 50.0;
    float flowSpeed = uTime * 2.0;
    
    // We want them to form lines/waves based on their Y position or Index
    // Let's make them flow horizontally in sine waves
    
    float sineOffset = sin(pos.x * waveFreq + flowSpeed + aRandom.x * 5.0) * waveAmp;
    
    vec3 clarityPos = pos;
    clarityPos.y += sineOffset;
    // Align y to a grid for more "order"? 
    // Let's keep the original Y but add the wave.
    
    // --- Transition ---
    // 0.0 = Chaos, 1.0 = Clarity
    // uScrollProgress 0 -> 1
    // Let's map it so transition happens 0.2 -> 0.8
    
    float t = smoothstep(0.0, 0.8, uScrollProgress);
    
    vec3 finalPos = mix(chaosPos, clarityPos, t);
    
    // Mouse Interaction (Push)
    // Works in both states, but weaker in Clarity
    float dist = distance(finalPos.xy, uMouse);
    float maxDist = 300.0;
    if(dist < maxDist) {
        float force = (maxDist - dist) / maxDist; // 0 to 1
        vec2 dir = normalize(finalPos.xy - uMouse);
        finalPos.xy += dir * force * 100.0 * (1.0 - t * 0.5); // Less push in clarity
    }

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = (4.0 * aRandom.y + 2.0) * (300.0 / -mvPosition.z);

    // Color Interpolation passing to Fragment
    // 0.0: Dark/Grey
    // 1.0: Brand Green (#A2C62E -> 0.635, 0.776, 0.180)
    
    vec3 colorChaos = vec3(0.5, 0.5, 0.5); // Grey
    vec3 colorClarity = vec3(0.635, 0.776, 0.180); // Foundtech Green
    
    vColor = mix(colorChaos, colorClarity, t);
}
