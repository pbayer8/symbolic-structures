import MOUSE from "mouse-change";
import REGL from "regl";
import "./style.css";
const regl = REGL({ extensions: "OES_texture_float" });
const mouse = MOUSE();
let time = 0;

const N = 10;
const BLOCK_SIZE = 64;

const SPRITES = Array(2)
  .fill()
  .map(() =>
    regl.framebuffer({
      radius: N,
      colorType: "float",
      depthStencil: false,
      color: regl.texture({
        radius: N,
        type: "float",
        data: Array(N * N * 4)
          .fill(0)
          .map((i) => Math.random()),
      }),
    })
  );

const updateSprites = regl({
  vert: `
  precision mediump float;
  attribute vec2 position;
  void main () {
    gl_Position = vec4(position, 0, 1);
  }
  `,

  frag: `
  precision highp float;

  uniform sampler2D state;
  uniform float shapeX, shapeY, deltaT, gravity;

  void main () {
    vec2 shape = vec2(shapeX, shapeY);
    vec4 prevState = texture2D(state,
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

  depth: { enable: false },

  framebuffer: ({ tick }) => SPRITES[(tick + 1) % 2],

  uniforms: {
    state: ({ tick }) => SPRITES[tick % 2],
    shapeX: regl.context("viewportWidth"),
    shapeY: regl.context("viewportHeight"),
    deltaT: 0.1,
    gravity: -0.5,
  },

  attributes: {
    position: [0, -4, 4, 4, -4, 4],
  },
  primitive: "triangles",
  elements: null,
  offset: 0,
  count: 3,
});

const drawSprites = regl({
  vert: `
  precision highp float;
  attribute vec2 sprite;
  uniform sampler2D state;
  varying vec2 rg;
  void main () {
    vec2 position = texture2D(state, sprite).xy;
    gl_PointSize = 16.0;
    rg = sprite;
    gl_Position = vec4(position, 0, 1);
  }
  `,

  frag: `
  precision highp float;
  varying vec2 rg;
  void main () {
    gl_FragColor = vec4(rg, 1.0 - max(rg.x, rg.y), 1);
  }
  `,

  attributes: {
    sprite: Array(N * N)
      .fill()
      .map(function (_, i) {
        const x = i % N;
        const y = (i / N) | 0;
        return [x / N, y / N];
      })
      .reverse(),
  },
  uniforms: {
    state: ({ tick }) => SPRITES[tick % 2],
  },
  primitive: "points",
  count: N * N,
});
regl.frame(() => {
  updateSprites();
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1,
  });
  drawSprites();
});
