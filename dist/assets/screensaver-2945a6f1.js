import{m as i}from"./style-71523510.js";import{R as f}from"./regl-a5845c54.js";const e=f();let o=Math.random()*50,s=Math.random()*6e-4,r=Math.random()-.5,t=!1;const n=1e4,l=Array(n).fill(0).map((g,m)=>[m/n]),c=4*l[0].length,u=e.buffer(l),d=Array(window.innerWidth*window.innerHeight*4).fill(0),a=e.framebuffer({color:e.texture({shape:[window.innerWidth,window.innerHeight],data:d}),depthStencil:!1}),p=e({vert:`
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
  }`,frag:`
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
  }`,attributes:{index:{buffer:u,stride:c,offset:0}},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"src alpha",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},uniforms:{time:()=>o,mouse:()=>[i[0]*2-1,i[1]*2-1,i[3]]},count:n,primitive:"points",framebuffer:a}),v=e({vert:`
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  uniform float time;
  uniform vec3 mouse;
  void main() {
    uv = position/2. + 0.5;
    gl_Position = vec4(position, 0, 1);
  }`,frag:`
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D texture;
  uniform float time;
  uniform vec3 mouse;
  void main() {
    vec3 color = texture2D(texture, uv).rgb;
    gl_FragColor = vec4(color, 1);
  }`,attributes:{position:[[-4,0],[0,-4],[4,4]]},uniforms:{texture:()=>a,time:()=>o,mouse:()=>mo[i[0]*2-1,i[1]*2-1,i[3]]},depth:{enable:!1},count:3});e.frame(()=>{o+=(i[0]-r)*s,p(),v(),i[2]===1&&t&&(t=!1,o=Math.random()*100,s=Math.random()*6e-4,r=Math.random()-.5,e.clear({color:[0,0,0,1],framebuffer:a})),i[2]===0&&(t=!0)});
