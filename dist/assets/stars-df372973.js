import"./style-9feaaabd.js";import{R as l}from"./regl-a5845c54.js";import{m as i}from"./mouse-c0624d90.js";const o=l();let t=Math.random()*100,s=Math.random()*2e-4,n=Math.random()-.5,e=!1;const a=1e4,m=4,c=o.buffer(Array(a).fill(0).map((d,r)=>[r/a])),f=o({vert:`
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
  }`,attributes:{index:{buffer:c,stride:m,offset:0}},blend:{enable:!0,func:{srcRGB:"src alpha",srcAlpha:"src alpha",dstRGB:"one minus src alpha",dstAlpha:"one minus src alpha"}},depth:{enable:!1},uniforms:{time:()=>t,mouse:()=>[i[0]*2-1,i[1]*2-1,i[3]]},count:a,primitive:"points"});o.frame(()=>{t+=(i[0]-n)*s,o.clear({depth:1,color:[236/255,225/255,208/255,1]}),f(),i[2]===1&&e&&(t=Math.random()*10,s=Math.random()*3e-4,n=Math.random()-.5,e=!1),i[2]===0&&(e=!0)});
