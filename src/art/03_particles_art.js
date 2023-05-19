import REGL from "regl";
import "./style.css";

const regl = REGL();
let mouse = [0, 0];
let time = 0;
window.addEventListener("mousemove", (e) => {
  mouse[0] = (2 * e.clientX) / window.innerWidth - 1;
  mouse[1] = 1 - (2 * e.clientY) / window.innerHeight;
});

const NUM_POINTS = 1e4;
// const VERT_SIZE = 4 * (4 + 4 + 1);
const VERT_SIZE = 4;

const pointBuffer = regl.buffer(
  Array(NUM_POINTS)
    .fill(0)
    .map((_, i) => {
      return [
        // freq
        // Math.random() * 10,
        // Math.random() * 10,
        i / NUM_POINTS,
        // Math.random(),
        // Math.random() * 10,
        // phase
        // 2.0 * Math.PI * Math.random(),
        // 2.0 * Math.PI * Math.random(),
        // 2.0 * Math.PI * Math.random(),
        // 2.0 * Math.PI * Math.random(),
        // index
        // (i / NUM_POINTS) * 10,
      ];
    })
);

const drawParticles = regl({
  vert: `
  precision mediump float;
  // attribute vec4 freq, phase;
  attribute float index;
  uniform float time;
  uniform vec2 mouse;
  // uniform mat4 view, projection;
  varying vec3 fragColor;
  void main() {
    // float i = index * 10.*(sin(time*5.));
    float i = index * 10.;
    vec2 canvasSize = vec2(${window.innerWidth}.0, ${window.innerHeight}.0);
    float canvasAspectRatio = canvasSize.x / canvasSize.y;
    float timeMult = 5.;
    float timee = (sin(time/timeMult)*timeMult+sin(time/1.8));
    // float timee = sin(time/timeMult)*timeMult+sin(time/1.8) + 20.;
    // float timee = sin((time+20.)/timeMult)*timeMult+sin((time+20.)/1.8);
    // vec3 position = .8 * cos(freq.xyz * time + phase.xyz);
    vec3 position = .8 * vec3(cos(i * sin(i * timee) * timee), sin(i * cos(i) * timee), 0);
    // position.x *= 2.;
    // gl_PointSize = 10.0 * (1.0 + cos(freq.w * time + phase.w));
    // gl_PointSize = 3. * i;
    // gl_PointSize = 1./(1.-index+.05) ;
    float sinIndex = sin(index*3.14);
    // gl_PointSize =  sinIndex* sinIndex*sinIndex*sinIndex*sinIndex*10. ;
    gl_PointSize = 6.*index*index*index*index+2.;
    // gl_PointSize = 60.*index*index*index*index;
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
  }`,

  frag: `
  precision mediump float;
  varying vec3 fragColor;
  uniform float time;
  void main() {
    if (length(gl_PointCoord.xy - 0.5) > 0.5) {
      discard;
    }
    float timeMult = 5.;
    float timee = sin(time/timeMult)*timeMult;
    // gl_FragColor = vec4(fragColor, 1);
    // gl_FragColor = vec4(vec3(gl_PointCoord, 0.)*.5+fragColor, 1.);
    float dist = 1.-length(gl_PointCoord.xy - 0.5);
    // gl_FragColor = vec4(vec3(gl_PointCoord, 0.)*.5+fragColor, dist*dist*dist*dist);
    // gl_FragColor.rgb *= gl_FragColor.a;  
    gl_FragColor = vec4(vec3(gl_PointCoord, 0.)*.5+fragColor, 1.);
  }`,

  attributes: {
    index: {
      buffer: pointBuffer,
      stride: VERT_SIZE,
      offset: 0,
    },
  },
  blend: {
    enable: true,
    func: {
      srcRGB: "src alpha",
      srcAlpha: "src alpha",
      dstRGB: "one minus src alpha",
      dstAlpha: "one minus src alpha",
    },
  },
  depth: { enable: false },
  uniforms: {
    time: () => time,
    mouse: () => mouse,
  },

  count: NUM_POINTS,
  primitive: "points",
});
const slowSpot = Math.random() - 0.5;
console.log(slowSpot);
regl.frame(() => {
  time += (mouse[0] - slowSpot) * 0.005;
  regl.clear({
    depth: 1,
    color: [236 / 255, 225 / 255, 208 / 255, 1],
  });

  drawParticles();
});
