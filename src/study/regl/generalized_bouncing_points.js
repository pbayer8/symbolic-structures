import REGL from "regl";
import "./style.css";
const regl = REGL({ extensions: "OES_texture_float" });
const mouse = [0, 0];

document.addEventListener("mousemove", (e) => {
  mouse[0] = e.clientX / window.innerWidth;
  mouse[1] = e.clientY / window.innerHeight;
});

const quadPoints = [-1, -1, 1, -1, -1, 1, 1, -1, -1, 1, 1, 1];

const pingPongPoints = ({
  numPoints,
  updateFrag,
  uniformsUpdate,
  drawFrag,
  drawVert,
  uniformsDraw,
}) => {
  const radius = Math.ceil(Math.sqrt(numPoints));
  const buffers = Array(2)
    .fill(0)
    .map(() =>
      regl.framebuffer({
        radius,
        colorType: "float",
        depthStencil: false,
        color: regl.texture({
          radius,
          type: "float",
          data: Array(radius * radius * 4)
            .fill(0)
            .map(() => Math.random()),
        }),
      })
    );
  const update = regl({
    vert: `precision mediump float;
      attribute vec2 position;
      void main () {
        gl_Position = vec4(position, 0, 1);
      }`,
    frag: updateFrag,
    depth: { enable: false },
    framebuffer: ({ tick }) => buffers[(tick + 1) % 2],
    uniforms: {
      u_state: ({ tick }) => buffers[tick % 2],
      u_tick: ({ tick }) => tick,
      u_time: ({ time }) => time,
      u_resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight,
      ],
      ...uniformsUpdate,
    },
    attributes: {
      position: quadPoints,
    },
    primitive: "triangles",
    elements: null,
    offset: 0,
    count: quadPoints.length / 2,
  });
  const draw = regl({
    vert: drawVert,
    frag: drawFrag,
    attributes: {
      a_point: Array(N * N)
        .fill(0)
        .map(function (_, i) {
          const x = i % N;
          const y = (i / N) | 0;
          return [x / N, y / N];
        })
        .reverse(),
    },
    uniforms: {
      u_state: ({ tick }) => buffers[tick % 2],
      u_tick: ({ tick }) => tick,
      u_time: ({ time }) => time,
      u_mouse: () => mouse,
      u_resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight,
      ],
      ...uniformsDraw,
    },
    primitive: "points",
    count: N * N,
  });
  return { update, buffers, draw };
};
const N = 10;
const { update: updateSprites, draw: drawSprites } = pingPongPoints({
  numPoints: N * N,
  updateFrag: `precision highp float;

  uniform sampler2D u_state;
  uniform vec2 u_resolution;
  uniform float deltaT, gravity;

  void main () {
    vec2 shape = u_resolution.xy;
    vec4 prevState = texture2D(u_state,
      gl_FragCoord.xy / shape);

    vec2 position = prevState.xy;
    vec2 velocity = prevState.zw;

    position += 0.5 * velocity * deltaT;
    if (position.x < -1.0 || position.x > 1.0) {
      velocity.x *= -1.0;
    }
    if (position.y < -1.0 || position.y > 1.0) {
      velocity.y *= -1.0;
    }
    position += 0.5 * velocity * deltaT;

    velocity.y = velocity.y + gravity * deltaT;

    gl_FragColor = vec4(position, velocity);
  }
  `,
  drawVert: `
  precision highp float;
  attribute vec2 a_point;
  uniform sampler2D u_state;
  varying vec2 rg;
  void main () {
    vec2 position = texture2D(u_state, a_point).xy;
    gl_PointSize = 16.0;
    rg = a_point;
    gl_Position = vec4(position, 0, 1);
  }
  `,
  drawFrag: `
  precision highp float;
  varying vec2 rg;
  void main () {
    gl_FragColor = vec4(rg, 1.0 - max(rg.x, rg.y), 1);
  }
  `,
  uniformsUpdate: {
    deltaT: 0.1,
    gravity: -0.5,
  },
  uniformsDraw: {},
});

regl.frame(() => {
  updateSprites();
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1,
  });
  drawSprites();
});
