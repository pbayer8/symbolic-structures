import{g as o,m as i}from"./utils-59f65cc7.js";import{R as c}from"./regl-2edf780c.js";import"./_commonjsHelpers-edff4021.js";const e=c();let t=Math.random()*50,r=Math.random()*6e-4,l=Math.random()-.5,n=!1;const a=1e4,m=Array(a).fill(0).map((h,f)=>[f/a]),u=4*m[0].length,d=e.buffer(m),p=Array(window.innerWidth*window.innerHeight*4).fill(0),s=e.framebuffer({color:e.texture({shape:[window.innerWidth,window.innerHeight],data:p}),depthStencil:!1}),v=e({vert:o`
  precision mediump float;
  attribute float index;
  uniform float time;
  uniform vec3 mouse;
  varying vec3 fragColor;
  void main() {
    float i = index * 10.;
    vec2 canvasSize = vec2(${window.innerWidth}.0, ${window.innerHeight}.0);
    float canvasAspectRatio = canvasSize.x / canvasSize.y;
    float timeMult = 5.;
    float timee = (sin(time/timeMult)*timeMult+sin(time/1.8));
    vec3 position = .8 * vec3(cos(i * sin(i * timee) * timee), sin(i * cos(i) * timee), 0);
    float sinIndex = sin(index*3.14);
    gl_PointSize = 6.*index*index*index*index+2.;
    vec2 mousePos = mouse.xy;
    if (canvasAspectRatio > 1.) {
      mousePos.x = mousePos.x * canvasAspectRatio;
    } else {
      mousePos.y = mousePos.y / canvasAspectRatio;
    }
    mousePos.y += .4;
    vec2 pos = position.xy;
    vec2 diff = mousePos - pos;
    float dist = length(diff);
    float avoid = .04 / (dist * dist );
    position.xy -= diff * avoid;
    if (canvasAspectRatio > 1.) {
      position.x = position.x / canvasAspectRatio; 
    } else {
      position.y = position.y * canvasAspectRatio; 
    }
    gl_Position = vec4(position, 1);
    fragColor = vec3(.1,(position.x + 0.5)/6.,(position.y + 0.5)/2.);
  }`,frag:o`
  precision mediump float;
  varying vec3 fragColor;
  uniform float time;
  void main() {
    if (length(gl_PointCoord.xy - 0.5) > 0.5) {
      discard;
    }
    float timeMult = 5.;
    float timee = sin(time/timeMult)*timeMult;
    float dist = 1.-length(gl_PointCoord.xy - 0.5);
    gl_FragColor = vec4(gl_PointCoord.xyy+.4*fragColor, 1.);
  }`,attributes:{index:{buffer:d,stride:u,offset:0}},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"src alpha",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},uniforms:{time:()=>t,mouse:()=>[i[0]*2-1,i[1]*2-1,i[3]]},count:a,primitive:"points",framebuffer:s}),g=e({vert:o`
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  uniform float time;
  uniform vec3 mouse;
  void main() {
    uv = position/2. + 0.5;
    gl_Position = vec4(position, 0, 1);
  }`,frag:o`
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D texture;
  uniform float time;
  uniform vec3 mouse;
  void main() {
    vec3 color = texture2D(texture, uv).rgb;
    gl_FragColor = vec4(color, 1);
  }`,attributes:{position:[[-4,0],[0,-4],[4,4]]},uniforms:{texture:()=>s,time:()=>t,mouse:()=>mo[i[0]*2-1,i[1]*2-1,i[3]]},depth:{enable:!1},count:3});e.frame(()=>{t+=(i[0]-l)*r,v(),g(),i[2]===1&&n&&(n=!1,t=Math.random()*100,r=Math.random()*6e-4,l=Math.random()-.5,e.clear({color:[0,0,0,1],framebuffer:s})),i[2]===0&&(n=!0)});
