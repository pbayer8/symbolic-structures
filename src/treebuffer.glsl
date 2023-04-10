precision mediump float;

// Define constants for the shader
#define STEPS 40  // advection steps

#define ts 0.2    // advection curl
#define cs -2.0   // curl scale
#define ls 0.05   // laplacian scale
#define ps -2.0   // laplacian of divergence scale
#define ds -0.4   // divergence scale
#define dp -0.03  // divergence update scale
#define pl 0.3    // divergence smoothing
#define amp 1.0   // self-amplification
#define upd 0.4   // update smoothing

#define _D 0.6    // diagonal weight

#define _K0 -20.0/6.0 // laplacian center weight
#define _K1 4.0/6.0   // laplacian edge-neighbors
#define _K2 1.0/6.0   // laplacian vertex-neighbors

#define _G0 0.25      // gaussian center weight
#define _G1 0.125     // gaussian edge-neighbors
#define _G2 0.0625    // gaussian vertex-neighbors

uniform vec2 iMouse;
uniform vec2 iResolution;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
varying vec2 vUv;

// Normalize a 2D vector, return zero vector if input is zero vector
vec2 normz(vec2 x) {
    return x == vec2(0.0) ? vec2(0.0) : normalize(x);
}

// Get texture value with offset d
#define T(d) texture2D(iChannel0, fract(aUv+d)).xyz

// Advection function
vec3 advect(vec2 ab, vec2 vUv, vec2 texel, out float curl, out float div, out vec3 lapl, out vec3 blur) {
    
    vec2 aUv = vUv - ab * texel;
    vec4 t = vec4(texel, -texel.y, 0.0);

    // Sample texture values from neighboring pixels
    vec3 uv =    T( t.ww); vec3 uv_n =  T( t.wy); vec3 uv_e =  T( t.xw);
    vec3 uv_s =  T( t.wz); vec3 uv_w =  T(-t.xw); vec3 uv_nw = T(-t.xz);
    vec3 uv_sw = T(-t.xy); vec3 uv_ne = T( t.xy); vec3 uv_se = T( t.xz);
    
    // Compute curl and divergence using neighboring pixel values
    curl = uv_n.x - uv_s.x - uv_e.y + uv_w.y + _D * (uv_nw.x + uv_nw.y + uv_ne.x - uv_ne.y + uv_sw.y - uv_sw.x - uv_se.y - uv_se.x);
    div  = uv_s.y - uv_n.y - uv_e.x + uv_w.x + _D * (uv_nw.x - uv_nw.y - uv_ne.x - uv_ne.y + uv_sw.x + uv_sw.y + uv_se.y - uv_se.x);

    // Compute laplacian and gaussian blur using neighboring pixel values
    lapl = _K0*uv + _K1*(uv_n + uv_e + uv_w + uv_s) + _K2*(uv_nw + uv_sw + uv_ne + uv_se);
    blur = _G0*uv + _G1*(uv_n + uv_e + uv_w + uv_s) + _G2*(uv_nw + uv_sw + uv_ne + uv_se);
    
    return uv;
}

// Rotate a 2D vector by angle th
vec2 rot(vec2 v, float th) {
    return vec2(dot(v, vec2(cos(th), -sin(th))), dot(v, vec2(sin(th), cos(th)))); 
}

// Main shader function for Buffer A
void main( )
{
    vec2 texel = 1. / iResolution.xy;
    
    vec3 lapl, blur;
    float curl, div;
    
    // Compute advection values
    vec3 uv = advect(vec2(0), vUv, texel, curl, div, lapl, blur);

    // Compute values based on constants and advection
    float sp = ps * lapl.z;
    float sc = cs * curl;
    float sd = uv.z + dp * div + pl * lapl.z;
    vec2 norm = normz(uv.xy);

    // Calculate offsets and blur
    vec2 off = uv.xy;
    vec2 offd = off;
    vec3 ab = vec3(0);

    for(int i = 0; i < STEPS; i++) {
        advect(off, vUv, texel, curl, div, lapl, blur);
        offd = rot(offd,ts*curl);
        off += offd;
        ab += blur / float(STEPS);  
    }
    
    // Calculate final values based on advection, laplacian, and other parameters
    vec2 tab = amp * ab.xy + ls * lapl.xy + norm * sp + uv.xy * ds * sd;    
    vec2 rab = rot(tab,sc);
    
    vec3 abd = mix(vec3(rab,sd), uv, upd);
    
    // Add mouse interaction
    if (iMouse.x > 0.0) {
        vec2 d = (gl_FragCoord.xy - iMouse.xy) / iResolution.x;
        vec2 m = 0.1 * normz(d) * exp(-length(d) / 0.02);
        abd.xy += m;
        uv.xy += m;
    }
    
    // Initialize with noise texture
    vec3 init = texture2D(iChannel1, vUv).xyz;
    if(uv == vec3(0) && init != vec3(0)) {
        gl_FragColor = 1.0 * vec4(-0.5 + init, 1);
    } else {
        abd.z = clamp(abd.z, -1.0, 1.0);
        abd.xy = clamp(length(abd.xy) > 1.0 ? normz(abd.xy) : abd.xy, -1.0, 1.0);
        gl_FragColor = vec4(abd, 0.0);
    }

}