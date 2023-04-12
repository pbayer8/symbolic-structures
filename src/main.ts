import REGL from "regl";
import "./style.css";

const regl = REGL();
let mouse = [0, 0];

window.addEventListener("mousemove", (e) => {
  mouse[0] = (2 * e.clientX) / window.innerWidth - 1;
  mouse[1] = 1 - (2 * e.clientY) / window.innerHeight;
});

const NUM_POINTS = 5e3;
const VERT_SIZE = 4 * (4 + 4 + 1);

const pointBuffer = regl.buffer(
  Array(NUM_POINTS)
    .fill(0)
    .map((i) => {
      return [
        // freq
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10,
        // phase
        2.0 * Math.PI * Math.random(),
        2.0 * Math.PI * Math.random(),
        2.0 * Math.PI * Math.random(),
        2.0 * Math.PI * Math.random(),
        2.0 * Math.PI * Math.random(),
        // index
        i / NUM_POINTS,
      ];
    })
);

const drawParticles = regl({
  vert: `
  precision mediump float;
  attribute vec4 freq, phase;
  attribute float index;
  uniform float time;
  uniform vec2 mouse;
  // uniform mat4 view, projection;
  varying vec3 fragColor;
  void main() {
    float timeMult = 50.;
    float timee = sin(time/timeMult)*timeMult;
    // vec3 position = .5 * cos(freq.xyz * time + phase.xyz);
    vec3 position = .5 * vec3(cos(index * sin(index * timee) * timee), sin(index * cos(index) * timee), 0);
    // gl_PointSize = 10.0 * (1.0 + cos(freq.w * time + phase.w));
    gl_PointSize = 2. * index;

    // particles avoid the mouse, moving away from it
    vec2 pos = position.xy;
    vec2 diff = mouse - pos;
    float dist = length(diff);
    float avoid = .01 / (dist * dist);
    position.xy -= diff * avoid;
    gl_Position = vec4(position, 1);
    fragColor = position + 0.5;
  }`,

  frag: `
  precision lowp float;
  varying vec3 fragColor;
  void main() {
    if (length(gl_PointCoord.xy - 0.5) > 0.5) {
      discard;
    }
    gl_FragColor = vec4(fragColor, 1);
  }`,

  attributes: {
    freq: {
      buffer: pointBuffer,
      stride: VERT_SIZE,
      offset: 0,
    },
    phase: {
      buffer: pointBuffer,
      stride: VERT_SIZE,
      offset: 16,
    },
    index: {
      buffer: pointBuffer,
      stride: VERT_SIZE,
      offset: 32,
    },
  },

  uniforms: {
    time: ({ tick }) => tick * 0.001,
    mouse: () => mouse,
  },

  count: NUM_POINTS,

  primitive: "points",
});

regl.frame(() => {
  regl.clear({
    depth: 1,
    color: [0, 0, 0, 1],
  });

  drawParticles();
});