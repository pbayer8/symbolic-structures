import REGL from "regl";
import { mouse } from "../mouse";
import "../style.css";
import { glsl } from "../utils";

const regl = REGL();
let time = Math.random() * 100;
let speed = Math.random() * 0.0002;
let slowSpot = Math.random() - 0.5;
let clear = false;

const NUM_POINTS = 1e4;
const VERT_SIZE = 4;

const pointBuffer = regl.buffer(
  Array(NUM_POINTS)
    .fill(0)
    .map((_, i) => {
      return [i / NUM_POINTS];
    })
);

const drawParticles = regl({
  vert: glsl`
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
  }`,

  frag: glsl`
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
    mouse: () => [mouse[0] * 2 - 1, mouse[1] * 2 - 1, mouse[3]],
  },

  count: NUM_POINTS,
  primitive: "points",
});

regl.frame(() => {
  time += (mouse[0] - slowSpot) * speed;
  regl.clear({
    depth: 1,
    color: [236 / 255, 225 / 255, 208 / 255, 1],
  });
  drawParticles();
  if (mouse[2] === 1 && clear) {
    time = Math.random() * 10;
    speed = Math.random() * 0.0003;
    slowSpot = Math.random() - 0.5;
    clear = false;
  }
  if (mouse[2] === 0) {
    clear = true;
  }
});
