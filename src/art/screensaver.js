import REGL from "regl";
import { mouse } from "../mouse";
import "../style.css";

const regl = REGL();
let time = Math.random() * 50;
let speed = Math.random() * 0.0006;
let slowSpot = Math.random() - 0.5;
let clear = false;

const NUM_POINTS = 1e4;
const points = Array(NUM_POINTS)
  .fill(0)
  .map((_, i) => {
    return [i / NUM_POINTS];
  });

const VERT_SIZE = 4 * points[0].length;

const pointBuffer = regl.buffer(points);
const INITIAL_CONDITIONS = Array(
  window.innerWidth * window.innerHeight * 4
).fill(0);

const drawbuffer = regl.framebuffer({
  color: regl.texture({
    shape: [window.innerWidth, window.innerHeight],
    data: INITIAL_CONDITIONS,
  }),
  depthStencil: false,
});

const drawParticles = regl({
  vert: `
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
    float dist = 1.-length(gl_PointCoord.xy - 0.5);
    gl_FragColor = vec4(gl_PointCoord.xyy+.4*fragColor, 1.);
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
  framebuffer: drawbuffer,
});

const draw = regl({
  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  uniform float time;
  uniform vec3 mouse;
  void main() {
    uv = position/2. + 0.5;
    gl_Position = vec4(position, 0, 1);
  }`,
  frag: `
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D texture;
  uniform float time;
  uniform vec3 mouse;
  void main() {
    vec3 color = texture2D(texture, uv).rgb;
    gl_FragColor = vec4(color, 1);
  }`,
  attributes: {
    position: [
      [-4, 0],
      [0, -4],
      [4, 4],
    ],
  },
  uniforms: {
    texture: () => drawbuffer,
    time: () => time,
    mouse: () => mo[(mouse[0] * 2 - 1, mouse[1] * 2 - 1, mouse[3])],
  },
  depth: { enable: false },
  count: 3,
});

regl.frame(() => {
  time += (mouse[0] - slowSpot) * speed;
  drawParticles();
  draw();
  if (mouse[2] === 1 && clear) {
    clear = false;
    time = Math.random() * 100;
    speed = Math.random() * 0.0006;
    slowSpot = Math.random() - 0.5;
    regl.clear({
      color: [0, 0, 0, 1],
      framebuffer: drawbuffer,
    });
  }
  if (mouse[2] === 0) {
    clear = true;
  }
});
