varying vec3 vColor;
varying float vAlpha;

void main() {
    // Standard circular particle
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    
    // Discard corners to make circle
    if (ll > 0.5) discard;
    
    // Soft edge
    float alpha = smoothstep(0.5, 0.35, ll) * vAlpha;
    
    gl_FragColor = vec4(vColor, alpha);
}
