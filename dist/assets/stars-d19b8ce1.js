import"./style-e83eefe1.js";import{R as m}from"./regl-a5845c54.js";const e=m();let o=[0,0],t=Math.random()*100,a=Math.random()*2e-4,r=Math.random()-.5,n=!1;window.addEventListener("mousemove",i=>{o[0]=2*i.clientX/window.innerWidth-1,o[1]=1-2*i.clientY/window.innerHeight});window.addEventListener("mousedown",i=>{n=!0});const s=1e4,c=4,d=e.buffer(Array(s).fill(0).map((i,l)=>[l/s])),f=e({vert:`
  precision mediump float;
  attribute float index;
  uniform float time;
  uniform vec2 mouse;
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
    vec2 mousePos = mouse;
    if (canvasAspectRatio > 1.) {
      mousePos.x = mousePos.x * canvasAspectRatio;
    } else {
      mousePos.y = mousePos.y / canvasAspectRatio;
    }
    mousePos.y += .4;
    // particles avoid the mouse, moving away from it
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
    gl_FragColor = vec4(vec3(gl_PointCoord, 0.)*.5+fragColor, 1.);
  }`,attributes:{index:{buffer:d,stride:c,offset:0}},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"src alpha",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},uniforms:{time:()=>t,mouse:()=>o},count:s,primitive:"points"});e.frame(()=>{t+=(o[0]-r)*a,e.clear({depth:1,color:[236/255,225/255,208/255,1]}),f(),n&&(t=Math.random()*10,a=Math.random()*3e-4,r=Math.random()-.5,n=!1)});
