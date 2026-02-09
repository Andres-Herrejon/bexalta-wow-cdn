
uniform float uTime;
uniform float uScroll;       // 0.0 (top) to 1.0 (bottom)
uniform float uPixelRatio;
uniform vec3 uPointer;       // Mouse position in world space

attribute float aIndex;
attribute vec3 aRandom;      // Chaos sphere positions
attribute vec3 aTarget;      // Organized grid positions

varying float vVisible;
varying vec3 vColor;

// Simple noise for organic chaos movement
vec3 getNoise(vec3 p, float time) {
  float t = time * 0.5;
  return vec3(
    sin(p.y * 2.0 + t),
    cos(p.z * 1.5 + t),
    sin(p.x * 2.5 + t)
  ) * 0.1;
}

void main() {
    // ----------------------------
    // 1. Progressive Reveal
    // ----------------------------
    float totalParticles = 25000.0;
    float initialCount = 10000.0;

    float revealThreshold = (aIndex - initialCount) / (totalParticles - initialCount);
    float effectiveScrollForReveal = smoothstep(0.3, 0.9, uScroll);

    float isBaseParticle = step(aIndex, initialCount);
    float isRevealed = step(revealThreshold, effectiveScrollForReveal);

    float isVisible = max(isBaseParticle, isRevealed);
    vVisible = isVisible;

    // ----------------------------
    // 2. Position: Chaos vs Organized Wave
    // ----------------------------

    // State A: Chaos cloud (random sphere)
    vec3 chaosPos = aRandom * 4.0;
    vec3 chaosMovement = getNoise(chaosPos, uTime * 2.0);
    vec3 posA = chaosPos + chaosMovement;

    // State B: Organized sine wave flow
    vec3 posB = aTarget;

    // Double sine wave for mathematical data-flow look
    float speed = 2.0;
    float freq1 = 0.5;
    float amp1 = 1.2;
    float freq2 = 1.2;
    float amp2 = 0.3;

    float wave1 = sin(posB.x * freq1 - uTime * speed);
    float wave2 = cos(posB.x * freq2 - uTime * speed * 1.5 + posB.z);
    posB.y += (wave1 * amp1) + (wave2 * amp2);

    // Interpolation (Chaos -> Order)
    float mixFactor = smoothstep(0.0, 0.8, uScroll);
    vec3 finalPos = mix(posA, posB, mixFactor);

    // Gentle rotation in chaos state, dampened as wave forms
    float angle = (1.0 - mixFactor) * uTime * 0.1;
    float s = sin(angle);
    float c = cos(angle);
    mat2 rot = mat2(c, -s, s, c);
    finalPos.xz = rot * finalPos.xz;

    // ----------------------------
    // 3. Mouse Repulsion
    // ----------------------------
    float dist = distance(finalPos, uPointer);
    float radius = 3.0;
    float repulsionStrength = 2.0;

    float repulsion = smoothstep(radius, 0.0, dist);
    vec3 repelDir = normalize(finalPos - uPointer + 0.001);

    vec3 interactionOffset = repelDir * repulsion * repulsionStrength;
    interactionOffset.y += repulsion * 1.0;

    finalPos += interactionOffset;

    vec4 viewPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    // ----------------------------
    // 4. Size
    // ----------------------------
    float baseSize = 14.0;
    float sizeFactor = mix(1.0, 0.8, mixFactor);

    gl_PointSize = baseSize * sizeFactor * uPixelRatio * (1.0 / -viewPosition.z);
    gl_PointSize *= isVisible;

    // ----------------------------
    // 5. Color: 3-act narrative
    // ----------------------------
    // Foundtech brand palette
    vec3 colorBlack = vec3(0.03, 0.03, 0.03);   // #080808 Act I
    vec3 colorGray  = vec3(0.78, 0.78, 0.77);   // #C7C6C6 Foundtech Light Gray
    vec3 colorGreen = vec3(0.635, 0.776, 0.18);  // #a2c62e Foundtech Green
    vec3 colorOlive = vec3(0.447, 0.573, 0.173); // #72922C Foundtech Olive

    // Act I (0-0.4): darkness -> gray mist
    vec3 c1 = mix(colorBlack, colorGray, smoothstep(0.0, 0.4, uScroll));
    // Act II-III (0.4-0.9): gray -> Foundtech Green
    float depthBrightness = smoothstep(-2.0, 2.0, posB.y) * 0.15;
    vec3 targetGreen = mix(colorOlive, colorGreen, 0.7) + depthBrightness;

    vec3 c2 = mix(c1, targetGreen, smoothstep(0.4, 0.9, uScroll));

    vColor = c2;
}
