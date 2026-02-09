
varying vec3 vColor;

void main() {
    // Circle shape for point
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
    if (r > 1.0) discard;

    // Soft edge
    float alpha = 1.0 - smoothstep(0.8, 1.0, r);

    gl_FragColor = vec4(vColor, alpha);
}
