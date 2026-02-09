
varying vec3 vColor;
varying float vVisible;

void main() {
    if (vVisible < 0.5) discard;

    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;

    // Sharp clean dots for data look
    float alpha = smoothstep(0.5, 0.35, ll);

    gl_FragColor = vec4(vColor, alpha);
}
