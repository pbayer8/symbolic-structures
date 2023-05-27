const C={};for(const e of["FLOAT","INT","BOOL"]){const t=e=="FLOAT"?"f":"i",i=WebGL2RenderingContext;C[i[e]]="uniform1"+t;for(const n of[2,3,4])C[i[`${e}_VEC${n}`]]=`uniform${n}${t}v`,t=="f"&&(C[i[`${e}_MAT${n}`]]=`uniformMatrix${n}fv`)}function D(e){const t={},i=n=>n in t?t[n]:t[n]=e(n);return i.cache=t,i}function S(e){if(!e)return;let t=e.replace(/\s+/g,"");if(!t)return null;const i=WebGL2RenderingContext,n={min:i.MIN,max:i.MAX,"+":i.FUNC_ADD,"s-d":i.FUNC_SUBTRACT,"d-s":i.FUNC_REVERSE_SUBTRACT},s={0:i.ZERO,1:i.ONE,s:i.SRC_COLOR,"(1-s)":i.ONE_MINUS_SRC_COLOR,d:i.DST_COLOR,"(1-d)":i.ONE_MINUS_DST_COLOR,sa:i.SRC_ALPHA,"(1-sa)":i.ONE_MINUS_SRC_ALPHA,da:i.DST_ALPHA,"(1-da)":i.ONE_MINUS_DST_ALPHA,c:i.CONSTANT_COLOR,"(1-c)":i.ONE_MINUS_CONSTANT_COLOR,ca:i.CONSTANT_ALPHA,"(1-ca)":i.ONE_MINUS_CONSTANT_ALPHA},o={s:i.ZERO,d:i.ZERO,f:null};t=t.replace(/(s|d)(?:\*(\w+|\(1-\w+\)))?/g,(d,u,h)=>{if(h=h||"1",!(h in s))throw`Unknown blend factor: "${h}"`;return o[u]=s[h],u});let l;if(l=t.match(/^(min|max)\((s,d|d,s)\)$/))o.f=n[l[1]];else if(t.match(/^(s|d|s\+d|d\+s)$/))o.f=n["+"];else if(t in n)o.f=n[t];else throw`Unable to parse blend spec: "${e}"`;return o}S=D(S);function R(e,t,i,n){t=`#version 300 es
`+t;const s=e.createShader(i);if(e.shaderSource(s,t),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS))throw t.split(`
`).map((l,d)=>`${(d+1+"").padStart(4)}: ${l}`).join(`
`)+`
--- GLSL COMPILE ERROR ---
`+e.getShaderInfoLog(s);e.attachShader(n,s),e.deleteShader(s)}function B(e,t,i){const n=e.createProgram();R(e,t,e.VERTEX_SHADER,n),R(e,i,e.FRAGMENT_SHADER,n),e.linkProgram(n),e.getProgramParameter(n,e.LINK_STATUS)||console.error("shader link error:"+e.getProgramInfoLog(n)),e.useProgram(n),n.setters={},n.samplers=[];const s=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let o=0;o<s;++o){const l=e.getActiveUniform(n,o),d=e.getUniformLocation(n,l.name);if(l.type==e.SAMPLER_2D||l.type==e.SAMPLER_2D_ARRAY)e.uniform1i(d,n.samplers.length),n.samplers.push(l);else{const u=C[l.type];n.setters[l.name]=u.startsWith("uniformMatrix")?h=>e[u](d,!1,h):h=>e[u](d,h)}}return e.useProgram(null),console.log("created",n),n}const O=`
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
`;function z(e){const t=[],i={1:"float",2:"vec2",3:"vec3",4:"vec4",9:"mat3",16:"mat4"};for(const n in e){const s=e[n];let o=null;s instanceof WebGLTexture?o=`uniform sampler2D ${n};
            #define ${n}(p) (_sample(${n}, (p)))
            ivec2 ${n}_size() {return textureSize(${n}, 0);}
            vec2  ${n}_step() {return 1.0/vec2(${n}_size());}`:typeof s=="number"?o=`uniform float ${n};`:s.length in i&&(o=`uniform ${i[s.length]} ${n};`),o&&t.push(o)}return t.join(`
`)+`
`}const V=e=>e.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,"");function G(e){e=V(e);const t=Array.from(e.matchAll(/uniform\s+\w+\s+([^;]+)\s*;/g));return new Set(t.map(i=>i[1].split(/[^\w]+/)).flat())}function k(e,t,i){const n=V(e).trim();return n!=""&&n.indexOf(";")==-1&&(e=`${i} = vec4(${n});`),n.match(new RegExp(`\\b${t}s*\\(`))||(e=`void ${t}() {
          ${e};
        }`),e}const H=D(e=>k(e,"vertex","VOut")),X=D(e=>k(e,"fragment","FOut"));function Y(e,t,i,n,s){const o=G([O,i,n,s].join(`
`)),l=Object.entries(t).filter(h=>!o.has(h[0])),d=z(Object.fromEntries(l)),u=`${O}
${i}
${d}`;return B(e,`
    #define VERT
    ${u}
${H(n)}
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
    ${u}
${X(s)}
    void main() {
      I = ivec2(gl_FragCoord.xy);
      fragment();
    }`)}function W(e,{size:t,format:i="rgba8",filter:n="linear",wrap:s="repeat",data:o=null}){const[l,d,u]={r8:[e.R8,e.RED,e.UNSIGNED_BYTE],rgba8:[e.RGBA8,e.RGBA,e.UNSIGNED_BYTE],r16f:[e.R16F,e.RED,e.FLOAT],rgba16f:[e.RGBA16F,e.RGBA,e.FLOAT],r32f:[e.R32F,e.RED,e.FLOAT],rgba32f:[e.RGBA32F,e.RGBA,e.FLOAT],depth:[e.DEPTH_COMPONENT24,e.DEPTH_COMPONENT,e.UNSIGNED_INT]}[i];i=="depth"&&(n="nearest");const h={nearest:e.NEAREST,linear:e.LINEAR}[n],m={repeat:e.REPEAT,edge:e.CLAMP_TO_EDGE,mirror:e.MIRRORED_REPEAT}[s],r=e.createTexture();return r.format=i,r.update=(A,f)=>{const[g,_]=A;e.bindTexture(e.TEXTURE_2D,r),e.texImage2D(e.TEXTURE_2D,0,l,g,_,0,d,u,f),e.bindTexture(e.TEXTURE_2D,null),r.size=A},r.update(t,o),e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,h),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,h),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,m),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,m),e.bindTexture(e.TEXTURE_2D,null),r}function j(e,t){const i=t.story||1,n=[];for(let o=0;o<i;++o)n.push(W(e,t));const s=i>1?n:n[0];return console.log("created",s),s}function J(e,t,i){if(!e)return[1,1];let n;switch(e){case"fit":n=Math.min(t,i);break;case"cover":n=Math.max(t,i);break;case"x":n=t;break;case"y":n=i;break;case"mean":n=(t+i)/2;break;default:throw`Unknown aspect mode "${e}"`}return[n/t,n/i]}function M(e,t){if(e._indexVA&&t<=e._indexVA.size)return;const i=t*2,n=e._indexVA||e.createVertexArray();n.size=i,e._indexVA=n,e.bindVertexArray(n);const s=new Int32Array(i);s.forEach((l,d)=>{s[d]=d});const o=n.buf||e.createBuffer();n.buf=o,e.bindBuffer(e.ARRAY_BUFFER,o),e.bufferData(e.ARRAY_BUFFER,s,e.STATIC_DRAW);for(let l=0;l<2;++l)e.enableVertexAttribArray(l),e.vertexAttribIPointer(l,1,e.INT,!1,0,0);e.vertexAttribDivisor(1,1),e.bindBuffer(e.ARRAY_BUFFER,null),e.bindVertexArray(null),console.log("created:",n)}function K(e){return!(!e||e instanceof WebGLTexture||Array.isArray(e)||e.fbo!==void 0)}function Z(e,{size:t,scale:i=1}){return t=t||[e.canvas.width,e.canvas.height],[Math.round(t[0]*i),Math.round(t[1]*i)]}function Q(e,t){if(!t.tag)throw"target must have a tag";const i=e.buffers;if(t.size=Z(e.gl,t),!i[t.tag])i[t.tag]=j(e.gl,t);else{const n=i[t.tag],s=Array.isArray(n)?n[n.length-1]:n,o=s.size[0]!=t.size[0]||s.size[1]!=t.size[1];(o||t.data)&&(o&&console.log(`resized tex (${s.size})->(${t.size})`),s.update(t.size,t.data))}return i[t.tag]}function q(e,t){if(t&&t.fbo===void 0){t.fbo=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,t.fbo);const i=t.format=="depth"?e.DEPTH_ATTACHMENT:e.COLOR_ATTACHMENT0;e.framebufferTexture2D(e.FRAMEBUFFER,i,e.TEXTURE_2D,t,0)}else{const i=t?t.fbo:null;e.bindFramebuffer(e.FRAMEBUFFER,i)}return t?t.size:[e.canvas.width,e.canvas.height]}const tt=new Set(["Inc","VP","FP","Clear","Blend","View","Grid","Mesh","Aspect","DepthTest","AlphaCoverage","Face"]);function et(e,t,i){const n={},s={};for(const c in t)(tt.has(c)?n:s)[c]=t[c];const[o,l,d]=[n.Inc||"",n.VP||"",n.FP||""],u=!l&&!d,h=o+l+d;K(i)&&(i=Q(e,i));let m=i;if(Array.isArray(i)&&(s.Src=s.Src||i[0],i.unshift(i.pop()),m=i[0]),n.Clear===void 0&&u)return i;const r=e.gl,A=q(r,m);let f=n.View||[0,0,A[0],A[1]];if(f.length==2&&(f=[0,0,f[0],f[1]]),r.depthMask(n.DepthTest!="keep"),n.Clear!==void 0){let c=n.Clear;typeof c=="number"&&(c=[c,c,c,c]),r.clearColor(...c),r.enable(r.SCISSOR_TEST),r.scissor(...f),r.clear(r.COLOR_BUFFER_BIT|r.DEPTH_BUFFER_BIT),r.disable(r.SCISSOR_TEST)}if(u)return i;h in e.shaders||(e.shaders[h]=Y(r,s,o,l,d));const g=e.shaders[h];if(r.useProgram(g),n.Blend){const c=S(n.Blend),{s:E,d:N,f:U}=c;r.enable(r.BLEND),r.blendFunc(E,N),r.blendEquation(U)}if(n.DepthTest&&r.enable(r.DEPTH_TEST),n.Face){r.enable(r.CULL_FACE);const c={front:r.BACK,back:r.FRONT}[n.Face];r.cullFace(c)}n.AlphaCoverage&&r.enable(r.SAMPLE_ALPHA_TO_COVERAGE),r.viewport(...f);const _=f[2],x=f[3];s.View=f,s.Aspect=J(n.Aspect,_,x);const[a=1,p=1,v=1]=n.Grid||[];s.Grid=[a,p,v],s.Mesh=n.Mesh||[1,1];const w=(s.Mesh[0]*2+3)*s.Mesh[1]-1,$=a*p*v;M(r,Math.max(w,$)),r.bindVertexArray(r._indexVA);for(const c in s){const E=s[c];c in g.setters&&g.setters[c](E)}for(let c=0;c<g.samplers.length;++c){const E=s[g.samplers[c].name];r.activeTexture(r.TEXTURE0+c),r.bindTexture(r.TEXTURE_2D,E)}return r.drawArraysInstanced(r.TRIANGLE_STRIP,0,w,$),n.Blend&&r.disable(r.BLEND),n.DepthTest&&r.disable(r.DEPTH_TEST),n.Face&&r.disable(r.CULL_FACE),n.AlphaCoverage&&r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.bindVertexArray(null),i}function P(e){const t=this,i=(n,s)=>e(t,n,s);return i.hook=P,i.gl=t.gl,i}function it(e){const t=e.getContext?e.getContext("webgl2",{alpha:!1,antialias:!0}):e;t.getExtension("EXT_color_buffer_float"),t.getExtension("OES_texture_float_linear"),M(t,1024);const i=(s,o)=>et(i,s,o);i.hook=P,i.gl=t,i.shaders={},i.buffers={};const n=s=>{s.fbo&&t.deleteFramebuffer(s.fbo),t.deleteTexture(s)};return i.reset=()=>{Object.values(i.shaders).forEach(s=>t.deleteProgram(s)),Object.values(i.buffers).forEach(s=>{Array.isArray(s)?s.forEach(n):n(s)}),i.shaders={},i.buffers={}},i}self._SwissGL=it;const mt=self._SwissGL;/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.18.1
 * @author George Michael Brower
 * @license MIT
 */class b{constructor(t,i,n,s,o="div"){this.parent=t,this.object=i,this.property=n,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement("div"),this.domElement.classList.add("controller"),this.domElement.classList.add(s),this.$name=document.createElement("div"),this.$name.classList.add("name"),b.nextNameID=b.nextNameID||0,this.$name.id=`lil-gui-name-${++b.nextNameID}`,this.$widget=document.createElement(o),this.$widget.classList.add("widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(n)}name(t){return this._name=t,this.$name.innerHTML=t,this}onChange(t){return this._onChange=t,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(t=!0){return this.disable(!t)}disable(t=!0){return t===this._disabled?this:(this._disabled=t,this.domElement.classList.toggle("disabled",t),this.$disable.toggleAttribute("disabled",t),this)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(t){const i=this.parent.add(this.object,this.property,t);return i.name(this._name),this.destroy(),i}min(t){return this}max(t){return this}step(t){return this}decimals(t){return this}listen(t=!0){return this._listening=t,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const t=this.save();t!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=t}getValue(){return this.object[this.property]}setValue(t){return this.object[this.property]=t,this._callOnChange(),this.updateDisplay(),this}updateDisplay(){return this}load(t){return this.setValue(t),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class nt extends b{constructor(t,i,n){super(t,i,n,"boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function L(e){let t,i;return(t=e.match(/(#|0x)?([a-f0-9]{6})/i))?i=t[2]:(t=e.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?i=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=e.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(i=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),i?"#"+i:!1}const st={isPrimitive:!0,match:e=>typeof e=="string",fromHexString:L,toHexString:L},y={isPrimitive:!0,match:e=>typeof e=="number",fromHexString:e=>parseInt(e.substring(1),16),toHexString:e=>"#"+e.toString(16).padStart(6,0)},rt={isPrimitive:!1,match:e=>Array.isArray(e),fromHexString(e,t,i=1){const n=y.fromHexString(e);t[0]=(n>>16&255)/255*i,t[1]=(n>>8&255)/255*i,t[2]=(n&255)/255*i},toHexString([e,t,i],n=1){n=255/n;const s=e*n<<16^t*n<<8^i*n<<0;return y.toHexString(s)}},ot={isPrimitive:!1,match:e=>Object(e)===e,fromHexString(e,t,i=1){const n=y.fromHexString(e);t.r=(n>>16&255)/255*i,t.g=(n>>8&255)/255*i,t.b=(n&255)/255*i},toHexString({r:e,g:t,b:i},n=1){n=255/n;const s=e*n<<16^t*n<<8^i*n<<0;return y.toHexString(s)}},at=[st,y,rt,ot];function lt(e){return at.find(t=>t.match(e))}class ht extends b{constructor(t,i,n,s){super(t,i,n,"color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=lt(this.initialValue),this._rgbScale=s,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const o=L(this.$text.value);o&&this._setValueFromHexString(o)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(t){if(this._format.isPrimitive){const i=this._format.fromHexString(t);this.setValue(i)}else this._format.fromHexString(t,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(t){return this._setValueFromHexString(t),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class T extends b{constructor(t,i,n){super(t,i,n,"function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",s=>{s.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class dt extends b{constructor(t,i,n,s,o,l){super(t,i,n,"number"),this._initInput(),this.min(s),this.max(o);const d=l!==void 0;this.step(d?l:this._getImplicitStep(),d),this.updateDisplay()}decimals(t){return this._decimals=t,this.updateDisplay(),this}min(t){return this._min=t,this._onUpdateMinMax(),this}max(t){return this._max=t,this._onUpdateMinMax(),this}step(t,i=!0){return this._step=t,this._stepExplicit=i,this}updateDisplay(){const t=this.getValue();if(this._hasSlider){let i=(t-this._min)/(this._max-this._min);i=Math.max(0,Math.min(i,1)),this.$fill.style.width=i*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?t:t.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$disable=this.$input;const t=()=>{let a=parseFloat(this.$input.value);isNaN(a)||(this._stepExplicit&&(a=this._snap(a)),this.setValue(this._clamp(a)))},i=a=>{const p=parseFloat(this.$input.value);isNaN(p)||(this._snapClampSetValue(p+a),this.$input.value=this.getValue())},n=a=>{a.code==="Enter"&&this.$input.blur(),a.code==="ArrowUp"&&(a.preventDefault(),i(this._step*this._arrowKeyMultiplier(a))),a.code==="ArrowDown"&&(a.preventDefault(),i(this._step*this._arrowKeyMultiplier(a)*-1))},s=a=>{this._inputFocused&&(a.preventDefault(),i(this._step*this._normalizeMouseWheel(a)))};let o=!1,l,d,u,h,m;const r=5,A=a=>{l=a.clientX,d=u=a.clientY,o=!0,h=this.getValue(),m=0,window.addEventListener("mousemove",f),window.addEventListener("mouseup",g)},f=a=>{if(o){const p=a.clientX-l,v=a.clientY-d;Math.abs(v)>r?(a.preventDefault(),this.$input.blur(),o=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(p)>r&&g()}if(!o){const p=a.clientY-u;m-=p*this._step*this._arrowKeyMultiplier(a),h+m>this._max?m=this._max-h:h+m<this._min&&(m=this._min-h),this._snapClampSetValue(h+m)}u=a.clientY},g=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",g)},_=()=>{this._inputFocused=!0},x=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",t),this.$input.addEventListener("keydown",n),this.$input.addEventListener("wheel",s,{passive:!1}),this.$input.addEventListener("mousedown",A),this.$input.addEventListener("focus",_),this.$input.addEventListener("blur",x)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("hasSlider");const t=(a,p,v,w,$)=>(a-p)/(v-p)*($-w)+w,i=a=>{const p=this.$slider.getBoundingClientRect();let v=t(a,p.left,p.right,this._min,this._max);this._snapClampSetValue(v)},n=a=>{this._setDraggingStyle(!0),i(a.clientX),window.addEventListener("mousemove",s),window.addEventListener("mouseup",o)},s=a=>{i(a.clientX)},o=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",s),window.removeEventListener("mouseup",o)};let l=!1,d,u;const h=a=>{a.preventDefault(),this._setDraggingStyle(!0),i(a.touches[0].clientX),l=!1},m=a=>{a.touches.length>1||(this._hasScrollBar?(d=a.touches[0].clientX,u=a.touches[0].clientY,l=!0):h(a),window.addEventListener("touchmove",r,{passive:!1}),window.addEventListener("touchend",A))},r=a=>{if(l){const p=a.touches[0].clientX-d,v=a.touches[0].clientY-u;Math.abs(p)>Math.abs(v)?h(a):(window.removeEventListener("touchmove",r),window.removeEventListener("touchend",A))}else a.preventDefault(),i(a.touches[0].clientX)},A=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",r),window.removeEventListener("touchend",A)},f=this._callOnFinishChange.bind(this),g=400;let _;const x=a=>{if(Math.abs(a.deltaX)<Math.abs(a.deltaY)&&this._hasScrollBar)return;a.preventDefault();const v=this._normalizeMouseWheel(a)*this._step;this._snapClampSetValue(this.getValue()+v),this.$input.value=this.getValue(),clearTimeout(_),_=setTimeout(f,g)};this.$slider.addEventListener("mousedown",n),this.$slider.addEventListener("touchstart",m,{passive:!1}),this.$slider.addEventListener("wheel",x,{passive:!1})}_setDraggingStyle(t,i="horizontal"){this.$slider&&this.$slider.classList.toggle("active",t),document.body.classList.toggle("lil-gui-dragging",t),document.body.classList.toggle(`lil-gui-${i}`,t)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(t){let{deltaX:i,deltaY:n}=t;return Math.floor(t.deltaY)!==t.deltaY&&t.wheelDelta&&(i=0,n=-t.wheelDelta/120,n*=this._stepExplicit?1:10),i+-n}_arrowKeyMultiplier(t){let i=this._stepExplicit?1:10;return t.shiftKey?i*=10:t.altKey&&(i/=10),i}_snap(t){const i=Math.round(t/this._step)*this._step;return parseFloat(i.toPrecision(15))}_clamp(t){return t<this._min&&(t=this._min),t>this._max&&(t=this._max),t}_snapClampSetValue(t){this.setValue(this._clamp(this._snap(t)))}get _hasScrollBar(){const t=this.parent.root.$children;return t.scrollHeight>t.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class ct extends b{constructor(t,i,n,s){super(t,i,n,"option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("display"),this._values=Array.isArray(s)?s:Object.values(s),this._names=Array.isArray(s)?s:Object.keys(s),this._names.forEach(o=>{const l=document.createElement("option");l.innerHTML=o,this.$select.appendChild(l)}),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.updateDisplay()}updateDisplay(){const t=this.getValue(),i=this._values.indexOf(t);return this.$select.selectedIndex=i,this.$display.innerHTML=i===-1?t:this._names[i],this}}class ut extends b{constructor(t,i,n){super(t,i,n,"string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",s=>{s.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}const pt=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  background-color: var(--background-color);
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean .widget {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background-color: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background-color: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background-color: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  line-height: calc(var(--title-height) - 4px);
  font-weight: 600;
  padding: 0 var(--padding);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  outline: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui input {
  -webkit-tap-highlight-color: transparent;
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input::-webkit-outer-spin-button,
.lil-gui input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.lil-gui input[type=number] {
  -moz-appearance: textfield;
}
.lil-gui input[type=checkbox] {
  appearance: none;
  -webkit-appearance: none;
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  -webkit-tap-highlight-color: transparent;
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  border: 1px solid var(--widget-color);
  text-align: center;
  line-height: calc(var(--widget-height) - 4px);
}
@media (hover: hover) {
  .lil-gui button:hover {
    background: var(--hover-color);
    border-color: var(--hover-color);
  }
  .lil-gui button:focus {
    border-color: var(--focus-color);
  }
}
.lil-gui button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;function ft(e){const t=document.createElement("style");t.innerHTML=e;const i=document.querySelector("head link[rel=stylesheet], head style");i?document.head.insertBefore(t,i):document.head.appendChild(t)}let I=!1;class F{constructor({parent:t,autoPlace:i=t===void 0,container:n,width:s,title:o="Controls",closeFolders:l=!1,injectStyles:d=!0,touchStyles:u=!0}={}){if(this.parent=t,this.root=t?t.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("div"),this.$title.classList.add("title"),this.$title.setAttribute("role","button"),this.$title.setAttribute("aria-expanded",!0),this.$title.setAttribute("tabindex",0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("keydown",h=>{(h.code==="Enter"||h.code==="Space")&&(h.preventDefault(),this.$title.click())}),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(o),u&&this.domElement.classList.add("allow-touch-styles"),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("root"),!I&&d&&(ft(pt),I=!0),n?n.appendChild(this.domElement):i&&(this.domElement.classList.add("autoPlace"),document.body.appendChild(this.domElement)),s&&this.domElement.style.setProperty("--width",s+"px"),this._closeFolders=l,this.domElement.addEventListener("keydown",h=>h.stopPropagation()),this.domElement.addEventListener("keyup",h=>h.stopPropagation())}add(t,i,n,s,o){if(Object(n)===n)return new ct(this,t,i,n);const l=t[i];switch(typeof l){case"number":return new dt(this,t,i,n,s,o);case"boolean":return new nt(this,t,i);case"string":return new ut(this,t,i);case"function":return new T(this,t,i)}console.error(`gui.add failed
	property:`,i,`
	object:`,t,`
	value:`,l)}addColor(t,i,n=1){return new ht(this,t,i,n)}addFolder(t){const i=new F({parent:this,title:t});return this.root._closeFolders&&i.close(),i}load(t,i=!0){return t.controllers&&this.controllers.forEach(n=>{n instanceof T||n._name in t.controllers&&n.load(t.controllers[n._name])}),i&&t.folders&&this.folders.forEach(n=>{n._title in t.folders&&n.load(t.folders[n._title])}),this}save(t=!0){const i={controllers:{},folders:{}};return this.controllers.forEach(n=>{if(!(n instanceof T)){if(n._name in i.controllers)throw new Error(`Cannot save GUI with duplicate property "${n._name}"`);i.controllers[n._name]=n.save()}}),t&&this.folders.forEach(n=>{if(n._title in i.folders)throw new Error(`Cannot save GUI with duplicate folder "${n._title}"`);i.folders[n._title]=n.save()}),i}open(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("closed",this._closed),this}close(){return this.open(!1)}_setClosed(t){this._closed!==t&&(this._closed=t,this._callOnOpenClose(this))}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const i=this.$children.clientHeight;this.$children.style.height=i+"px",this.domElement.classList.add("transition");const n=o=>{o.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("transition"),this.$children.removeEventListener("transitionend",n))};this.$children.addEventListener("transitionend",n);const s=t?this.$children.scrollHeight:0;this.domElement.classList.toggle("closed",!t),requestAnimationFrame(()=>{this.$children.style.height=s+"px"})}),this}title(t){return this._title=t,this.$title.innerHTML=t,this}reset(t=!0){return(t?this.controllersRecursive():this.controllers).forEach(n=>n.reset()),this}onChange(t){return this._onChange=t,this}_callOnChange(t){this.parent&&this.parent._callOnChange(t),this._onChange!==void 0&&this._onChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(t){this.parent&&this.parent._callOnFinishChange(t),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onOpenClose(t){return this._onOpenClose=t,this}_callOnOpenClose(t){this.parent&&this.parent._callOnOpenClose(t),this._onOpenClose!==void 0&&this._onOpenClose.call(this,t)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(t=>t.destroy())}controllersRecursive(){let t=Array.from(this.controllers);return this.folders.forEach(i=>{t=t.concat(i.controllersRecursive())}),t}foldersRecursive(){let t=Array.from(this.folders);return this.folders.forEach(i=>{t=t.concat(i.foldersRecursive())}),t}}const gt=F;export{gt as G,mt as S};
