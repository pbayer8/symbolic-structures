import REGL from "regl";
import "./style.css";

const regl = REGL();
let mouse = [0, 0];

const NUM_POINTS = 1e4;
const VERT_SIZE = 4 * (4 + 4);

const pointBuffer = regl.buffer(
  Array(NUM_POINTS)
    .fill(0)
    .map(function () {
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
      ];
    })
);

const drawParticles = regl({
  vert: `
  precision mediump float;
  attribute vec4 freq, phase;
  uniform float time;
  varying vec3 fragColor;
  void main() {
    vec3 position = .5 * cos(freq.xyz * time + phase.xyz);
    gl_PointSize = 5.0 * (1.0 + cos(freq.w * time + phase.w));
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
  },

  uniforms: {
    time: ({ tick }) => tick * 0.001,
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
