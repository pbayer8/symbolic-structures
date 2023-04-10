precision mediump float;
uniform vec2 iResolution;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
varying vec2 vUv;
// Main shader function for the Image buffer
void main( ){
    vec2 uv = vUv;
    float d = length(texture2D(iChannel0, uv).xy);
    vec3 tx = texture2D(iChannel1, uv, 1.0).xyz;

    // Compute final color based on d and tx
    vec3 col = mix(0.25 * (tx + 3.0 * vec3(1,0.85,0.7)), vec3(0.4,0,0.1), 5.0*d);
    gl_FragColor = vec4(col, 1.);
    // gl_FragColor = vec4(tx,1.0);
}