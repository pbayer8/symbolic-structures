const v={};for(const e of["FLOAT","INT","BOOL"]){const n=e=="FLOAT"?"f":"i",t=WebGL2RenderingContext;v[t[e]]="uniform1"+n;for(const r of[2,3,4])v[t[`${e}_VEC${r}`]]=`uniform${r}${n}v`,n=="f"&&(v[t[`${e}_MAT${r}`]]=`uniformMatrix${r}fv`)}function R(e){const n={},t=r=>r in n?n[r]:n[r]=e(r);return t.cache=n,t}function h(e){if(!e)return;let n=e.replace(/\s+/g,"");if(!n)return null;const t=WebGL2RenderingContext,r={min:t.MIN,max:t.MAX,"+":t.FUNC_ADD,"s-d":t.FUNC_SUBTRACT,"d-s":t.FUNC_REVERSE_SUBTRACT},i={0:t.ZERO,1:t.ONE,s:t.SRC_COLOR,"(1-s)":t.ONE_MINUS_SRC_COLOR,d:t.DST_COLOR,"(1-d)":t.ONE_MINUS_DST_COLOR,sa:t.SRC_ALPHA,"(1-sa)":t.ONE_MINUS_SRC_ALPHA,da:t.DST_ALPHA,"(1-da)":t.ONE_MINUS_DST_ALPHA,c:t.CONSTANT_COLOR,"(1-c)":t.ONE_MINUS_CONSTANT_COLOR,ca:t.CONSTANT_ALPHA,"(1-ca)":t.ONE_MINUS_CONSTANT_ALPHA},o={s:t.ZERO,d:t.ZERO,f:null};n=n.replace(/(s|d)(?:\*(\w+|\(1-\w+\)))?/g,(u,d,f)=>{if(f=f||"1",!(f in i))throw`Unknown blend factor: "${f}"`;return o[d]=i[f],d});let a;if(a=n.match(/^(min|max)\((s,d|d,s)\)$/))o.f=r[a[1]];else if(n.match(/^(s|d|s\+d|d\+s)$/))o.f=r["+"];else if(n in r)o.f=r[n];else throw`Unable to parse blend spec: "${e}"`;return o}h=R(h);function O(e,n,t,r){n=`#version 300 es
`+n;const i=e.createShader(t);if(e.shaderSource(i,n),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS))throw n.split(`
`).map((a,u)=>`${(u+1+"").padStart(4)}: ${a}`).join(`
`)+`
--- GLSL COMPILE ERROR ---
`+e.getShaderInfoLog(i);e.attachShader(r,i),e.deleteShader(i)}function C(e,n,t){const r=e.createProgram();O(e,n,e.VERTEX_SHADER,r),O(e,t,e.FRAGMENT_SHADER,r),e.linkProgram(r),e.getProgramParameter(r,e.LINK_STATUS)||console.error("shader link error:"+e.getProgramInfoLog(r)),e.useProgram(r),r.setters={},r.samplers=[];const i=e.getProgramParameter(r,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(r,o),u=e.getUniformLocation(r,a.name);if(a.type==e.SAMPLER_2D||a.type==e.SAMPLER_2D_ARRAY)e.uniform1i(u,r.samplers.length),r.samplers.push(a);else{const d=v[a.type];r.setters[a.name]=d.startsWith("uniformMatrix")?f=>e[d](u,!1,f):f=>e[d](u,f)}}return e.useProgram(null),console.log("created",r),r}const y=`
precision highp float;
precision highp int;
#ifdef VERT
    #define varying out
    #define VOut gl_Position
    layout(location = 0) in int VertexID;
    layout(location = 1) in int InstanceID;
    ivec2 VID;
    ivec3 ID;
#else
    #define varying in
    layout(location = 0) out vec4 FOut;
    ivec2 I;
#endif

uniform ivec3 Grid;
uniform ivec2 Mesh;
uniform ivec4 View;
#define ViewSize (View.zw)
uniform vec2 Aspect;
varying vec2 UV;
#define XY (2.0*UV-1.0)
// #define VertexID gl_VertexID
// #define InstanceID gl_InstanceID


//////// GLSL Utils ////////

const float PI  = radians(180.0);
const float TAU = radians(360.0);

// source: https://www.shadertoy.com/view/XlXcW4
// TODO more complete hash library
vec3 hash( ivec3 ix ) {
    uvec3 x = uvec3(ix);
    const uint k = 1103515245U;
    x = ((x>>8U)^x.yzx)*k;
    x = ((x>>8U)^x.yzx)*k;
    x = ((x>>8U)^x.yzx)*k;
    return vec3(x)*(1.0/float(0xffffffffU));
}

mat2 rot2(float a) {
  float s=sin(a), c=cos(a);
  return mat2(c, s, -s, c);
}

// https://suricrasia.online/demoscene/functions/
vec3 erot(vec3 p, vec3 ax, float ro) {
    return mix(dot(ax, p)*ax, p, cos(ro)) + cross(ax,p)*sin(ro);
}

vec3 uv2sphere(vec2 uv) {
  uv *= vec2(-TAU,PI);
  return vec3(vec2(cos(uv.x), sin(uv.x))*sin(uv.y), cos(uv.y));
}

vec3 torus(vec2 uv, float r1, float r2) {
    uv *= TAU;
    vec3 p = vec3(r1+cos(uv.x)*r2, 0, sin(uv.x)*r2);
    return vec3(p.xy * rot2(uv.y), p.z);
}

vec3 cubeVert(vec2 xy, int side) {
    float x=xy.x, y=xy.y;
    switch (side) {
        case 0: return vec3(x,y,1); case 1: return vec3(y,x,-1);
        case 2: return vec3(y,1,x); case 3: return vec3(x,-1,y);
        case 4: return vec3(1,x,y); case 5: return vec3(-1,y,x);
    };
    return vec3(0.0);
}

vec3 _surf_f(vec3 p, vec3 a, vec3 b, out vec3 normal) {
    normal = normalize(cross(a-p, b-p));
    return p;
}
#define SURF(f, uv, out_normal, eps) _surf_f(f(uv), f(uv+vec2(eps,0)), f(uv+vec2(0,eps)), out_normal)

vec4 _sample(sampler2D tex, vec2 uv) {return texture(tex, uv);}
vec4 _sample(sampler2D tex, ivec2 xy) {return texelFetch(tex, xy, 0);}

#ifdef FRAG
    float isoline(float v) {
        float distToInt = abs(v-round(v));
        return smoothstep(max(fwidth(v), 0.0001), 0.0, distToInt);
    }
    float wireframe() {
        vec2 m = UV*vec2(Mesh);
        float d1 = isoline(m.x-m.y), d2 = isoline(m.x+m.y);
        float d = mix(d1, d2, float(int(m.y)%2));
        return isoline(m.x)+isoline(m.y)+d;
    }
#endif
`;function P(e){const n=[],t={1:"float",2:"vec2",3:"vec3",4:"vec4",9:"mat3",16:"mat4"};for(const r in e){const i=e[r];let o=null;i instanceof WebGLTexture?o=`uniform sampler2D ${r};
            #define ${r}(p) (_sample(${r}, (p)))
            ivec2 ${r}_size() {return textureSize(${r}, 0);}
            vec2  ${r}_step() {return 1.0/vec2(${r}_size());}`:typeof i=="number"?o=`uniform float ${r};`:i.length in t&&(o=`uniform ${t[i.length]} ${r};`),o&&n.push(o)}return n.join(`
`)+`
`}const D=e=>e.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,"");function M(e){e=D(e);const n=Array.from(e.matchAll(/uniform\s+\w+\s+([^;]+)\s*;/g));return new Set(n.map(t=>t[1].split(/[^\w]+/)).flat())}function U(e,n,t){const r=D(e).trim();return r!=""&&r.indexOf(";")==-1&&(e=`${t} = vec4(${r});`),r.match(new RegExp(`\\b${n}s*\\(`))||(e=`void ${n}() {
          ${e};
        }`),e}const $=R(e=>U(e,"vertex","VOut")),G=R(e=>U(e,"fragment","FOut"));function B(e,n,t,r,i){const o=M([y,t,r,i].join(`
`)),a=Object.entries(n).filter(f=>!o.has(f[0])),u=P(Object.fromEntries(a)),d=`${y}
${t}
${u}`;return C(e,`
    #define VERT
    ${d}
${$(r)}
    void main() {
      int rowVertN = Mesh.x*2+3;
      int rowI = VertexID/rowVertN;
      int rowVertI = min(VertexID%rowVertN, rowVertN-2);
      int odd = rowI%2;
      if (odd==0) rowVertI = rowVertN-rowVertI-2;
      VID = ivec2(rowVertI>>1, rowI + (rowVertI+odd+1)%2);
      int ii = InstanceID;
      ID.x = ii % Grid.x; ii/=Grid.x;
      ID.y = ii % Grid.y; ii/=Grid.y;
      ID.z = ii;
      UV = vec2(VID) / vec2(Mesh);
      VOut = vec4(XY,0,1);
      vertex();
      VOut.xy *= Aspect;
    }`,`
    #define FRAG
    ${d}
${G(i)}
    void main() {
      I = ivec2(gl_FragCoord.xy);
      fragment();
    }`)}function z(e,{size:n,format:t="rgba8",filter:r="linear",wrap:i="repeat",data:o=null}){const[a,u,d]={r8:[e.R8,e.RED,e.UNSIGNED_BYTE],rgba8:[e.RGBA8,e.RGBA,e.UNSIGNED_BYTE],r16f:[e.R16F,e.RED,e.FLOAT],rgba16f:[e.RGBA16F,e.RGBA,e.FLOAT],r32f:[e.R32F,e.RED,e.FLOAT],rgba32f:[e.RGBA32F,e.RGBA,e.FLOAT],depth:[e.DEPTH_COMPONENT24,e.DEPTH_COMPONENT,e.UNSIGNED_INT]}[t];t=="depth"&&(r="nearest");const f={nearest:e.NEAREST,linear:e.LINEAR}[r],m={repeat:e.REPEAT,edge:e.CLAMP_TO_EDGE,mirror:e.MIRRORED_REPEAT}[i],s=e.createTexture();return s.format=t,s.update=(A,T)=>{const[E,x]=A;e.bindTexture(e.TEXTURE_2D,s),e.texImage2D(e.TEXTURE_2D,0,a,E,x,0,u,d,T),e.bindTexture(e.TEXTURE_2D,null),s.size=A},s.update(n,o),e.bindTexture(e.TEXTURE_2D,s),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,f),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,m),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,m),e.bindTexture(e.TEXTURE_2D,null),s}function X(e,n){const t=n.story||1,r=[];for(let o=0;o<t;++o)r.push(z(e,n));const i=t>1?r:r[0];return console.log("created",i),i}function H(e,n,t){if(!e)return[1,1];let r;switch(e){case"fit":r=Math.min(n,t);break;case"cover":r=Math.max(n,t);break;case"x":r=n;break;case"y":r=t;break;case"mean":r=(n+t)/2;break;default:throw`Unknown aspect mode "${e}"`}return[r/n,r/t]}function L(e,n){if(e._indexVA&&n<=e._indexVA.size)return;const t=n*2,r=e._indexVA||e.createVertexArray();r.size=t,e._indexVA=r,e.bindVertexArray(r);const i=new Int32Array(t);i.forEach((a,u)=>{i[u]=u});const o=r.buf||e.createBuffer();r.buf=o,e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,i,e.STATIC_DRAW);for(let a=0;a<2;++a)e.enableVertexAttribArray(a),e.vertexAttribIPointer(a,1,e.INT,!1,0,0);e.vertexAttribDivisor(1,1),e.bindBuffer(e.ARRAY_BUFFER,null),e.bindVertexArray(null),console.log("created:",r)}function k(e){return!(!e||e instanceof WebGLTexture||Array.isArray(e)||e.fbo!==void 0)}function W(e,{size:n,scale:t=1}){return n=n||[e.canvas.width,e.canvas.height],[Math.round(n[0]*t),Math.round(n[1]*t)]}function Y(e,n){if(!n.tag)throw"target must have a tag";const t=e.buffers;if(n.size=W(e.gl,n),!t[n.tag])t[n.tag]=X(e.gl,n);else{const r=t[n.tag],i=Array.isArray(r)?r[r.length-1]:r,o=i.size[0]!=n.size[0]||i.size[1]!=n.size[1];(o||n.data)&&(o&&console.log(`resized tex (${i.size})->(${n.size})`),i.update(n.size,n.data))}return t[n.tag]}function j(e,n){if(n&&n.fbo===void 0){n.fbo=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,n.fbo);const t=n.format=="depth"?e.DEPTH_ATTACHMENT:e.COLOR_ATTACHMENT0;e.framebufferTexture2D(e.FRAMEBUFFER,t,e.TEXTURE_2D,n,0)}else{const t=n?n.fbo:null;e.bindFramebuffer(e.FRAMEBUFFER,t)}return n?n.size:[e.canvas.width,e.canvas.height]}const Z=new Set(["Inc","VP","FP","Clear","Blend","View","Grid","Mesh","Aspect","DepthTest","AlphaCoverage","Face"]);function K(e,n,t){const r={},i={};for(const c in n)(Z.has(c)?r:i)[c]=n[c];const[o,a,u]=[r.Inc||"",r.VP||"",r.FP||""],d=!a&&!u,f=o+a+u;k(t)&&(t=Y(e,t));let m=t;if(Array.isArray(t)&&(i.Src=i.Src||t[0],t.unshift(t.pop()),m=t[0]),r.Clear===void 0&&d)return t;const s=e.gl,A=j(s,m);let T=r.View||[0,0,A[0],A[1]];if(T.length==2&&(T=[0,0,T[0],T[1]]),s.depthMask(r.DepthTest!="keep"),r.Clear!==void 0){let c=r.Clear;typeof c=="number"&&(c=[c,c,c,c]),s.clearColor(...c),s.enable(s.SCISSOR_TEST),s.scissor(...T),s.clear(s.COLOR_BUFFER_BIT|s.DEPTH_BUFFER_BIT),s.disable(s.SCISSOR_TEST)}if(d)return t;f in e.shaders||(e.shaders[f]=B(s,i,o,a,u));const E=e.shaders[f];if(s.useProgram(E),r.Blend){const c=h(r.Blend),{s:_,d:N,f:V}=c;s.enable(s.BLEND),s.blendFunc(_,N),s.blendEquation(V)}if(r.DepthTest&&s.enable(s.DEPTH_TEST),r.Face){s.enable(s.CULL_FACE);const c={front:s.BACK,back:s.FRONT}[r.Face];s.cullFace(c)}r.AlphaCoverage&&s.enable(s.SAMPLE_ALPHA_TO_COVERAGE),s.viewport(...T);const x=T[2],F=T[3];i.View=T,i.Aspect=H(r.Aspect,x,F);const[l=1,p=1,b=1]=r.Grid||[];i.Grid=[l,p,b],i.Mesh=r.Mesh||[1,1];const S=(i.Mesh[0]*2+3)*i.Mesh[1]-1,I=l*p*b;L(s,Math.max(S,I)),s.bindVertexArray(s._indexVA);for(const c in i){const _=i[c];c in E.setters&&E.setters[c](_)}for(let c=0;c<E.samplers.length;++c){const _=i[E.samplers[c].name];s.activeTexture(s.TEXTURE0+c),s.bindTexture(s.TEXTURE_2D,_)}return s.drawArraysInstanced(s.TRIANGLE_STRIP,0,S,I),r.Blend&&s.disable(s.BLEND),r.DepthTest&&s.disable(s.DEPTH_TEST),r.Face&&s.disable(s.CULL_FACE),r.AlphaCoverage&&s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.bindVertexArray(null),t}function w(e){const n=this,t=(r,i)=>e(n,r,i);return t.hook=w,t.gl=n.gl,t}function q(e){const n=e.getContext?e.getContext("webgl2",{alpha:!1,antialias:!0}):e;n.getExtension("EXT_color_buffer_float"),n.getExtension("OES_texture_float_linear"),L(n,1024);const t=(i,o)=>K(t,i,o);t.hook=w,t.gl=n,t.shaders={},t.buffers={};const r=i=>{i.fbo&&n.deleteFramebuffer(i.fbo),n.deleteTexture(i)};return t.reset=()=>{Object.values(t.shaders).forEach(i=>n.deleteProgram(i)),Object.values(t.buffers).forEach(i=>{Array.isArray(i)?i.forEach(r):r(i)}),t.shaders={},t.buffers={}},t}self._SwissGL=q;const Q=self._SwissGL;export{Q as S};
