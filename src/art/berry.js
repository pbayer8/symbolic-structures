import SwissGL from "swissgl";
import { mouseCentered } from "../mouse";
import "../style.css";
import { random, randomCentered, randomChoice, randomInt } from "../utils";
const canvas = document.createElement("canvas");
const size = Math.min(window.innerWidth, window.innerHeight);
// canvas.width = size;
// canvas.height = size;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const colorsRGB = [
  [151, 123, 234],
  [214, 127, 114],
  [105, 77, 230],
  [188, 174, 226],
];
const colors = colorsRGB.map((c) => c.map((v) => v / 255));
const NUM_POINTS = 4;
const points = Array(NUM_POINTS)
  .fill()
  .map(() => {
    const color = randomChoice(colors);
    const data = {
      x: randomCentered(),
      y: randomCentered(),
      copyIndex: randomInt(0, NUM_POINTS - 1),
      xo: random(0, 0.0001),
      yo: random(0, 0.0001),
      xv: 0,
      yv: 0,
      // r: random(-0.01, 0.03),
      // g: random(-0.01, 0.03),
      // b: random(-0.01, 0.03),
      r: color[0],
      g: color[1],
      b: color[2],
      radius: random(0.2, 0.7),
      width: random(0.1, 0.3),
      subtractRadiusOffset: randomCentered(0.08),
      subtractWidth: random(0, 0.1),
      subtractStrength: random(0.8, 1),
      subtractOffsetX: randomCentered(0.1),
      subtractOffsetY: randomCentered(0.1),
    };
    return data;
  });

// create WebGL2 context end SwissGL
const glsl = SwissGL(canvas);
function render(t) {
  t /= 1000; // ms to sec
  points.forEach((p, i) => {
    // move the points sinusoidally in x and y
    // p.x = Math.sin(t * p.xv + p.xo) * 0.5;
    // p.y = Math.sin(t * p.yv + p.yo) * 0.5;

    // move in the direction of the velocity xv at speed xo
    p.x += p.xv;
    p.y += p.yv;
    // update the velocity to be towards the mouse by mixing the desired v with the current velocity, weighted by the distance from the mouse
    p.xv = p.xv * (1 - p.xo) + (mouseCentered[0] - p.x) * p.xo;
    p.yv = p.yv * (1 - p.yo) + (mouseCentered[1] - p.y) * p.yo;
    p.xv *= 0.99;
    p.yv *= 0.99;

    if (p.copyIndex > 0 && p.copyIndex > i) {
      p.x = points[p.copyIndex].x;
      p.y = points[p.copyIndex].y;
    }

    // move the points towards one point and away from the next
    // const strength = Math.random() * 0.01;
    // const nextp = points[(i + 1) % NUM_POINTS];
    // p[0] += (nextp[0] - p[0]) * strength;
    // p[1] += (nextp[1] - p[1]) * strength;
    // const nextnextp = points[(i + 2) % NUM_POINTS];
    // p[0] -= (nextnextp[0] - p[0]) * strength;
    // p[1] -= (nextnextp[1] - p[1]) * strength;
    // slow down movement away from edges
    // p[0] *= 0.99;
    // p[1] *= 0.99;
  });
  glsl({
    t,
    Inc: `
    // 2D noise function
    float noise(vec2 p) {
      return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    `,
    FP: `
    FOut = vec4(180./255.,180./255.,230./255.,1.0);
    vec3 color = vec3(0.);
    float strength = 0.0;
    float cumulativeStrength = 0.0;
    float len = 0.;
    vec2 xy = XY;
    float offsetLen = 0.;
    ${points
      .map(
        ({
          x,
          y,
          r,
          g,
          b,
          radius,
          width,
          subtractRadiusOffset,
          subtractWidth,
          subtractOffsetX,
          subtractOffsetY,
          subtractStrength,
        }) =>
          `len = length(xy-vec2(${x},${y}));
          offsetLen = length(xy-vec2(${x}+${subtractOffsetX},${y}+${subtractOffsetY}));
        strength = smoothstep(${radius + width},${radius},len)
          - smoothstep(${radius - subtractRadiusOffset + subtractWidth},${
            radius - subtractRadiusOffset
          },offsetLen)*${subtractStrength};
        cumulativeStrength += strength;
        FOut = mix(FOut,vec4(${r},${g},${b},1.),clamp(strength,0.,1.));
        // FOut += vec4(color,1.0);
        xy += cumulativeStrength*.04;
        `
      )
      .join("\n")}
      FOut += noise (XY*10.)*0.15;`,
    Aspect: "fit",
    // Clear: [1, 0, 0, 1],
  });
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
