import REGL from "regl";
import "./style.css";
const regl = REGL({ extensions: "OES_texture_float" });
const mouse = [0, 0];

document.addEventListener("mousemove", (e) => {
  mouse[0] = e.clientX / window.innerWidth;
  mouse[1] = e.clientY / window.innerHeight;
});

const quadPoints = [-1, -1, 1, -1, -1, 1, 1, -1, -1, 1, 1, 1];
const basicVert = `precision mediump float;
attribute vec2 position;
void main () {
  gl_Position = vec4(position, 0, 1);
}`;
const pingPongPoints = ({
  numPoints,
  updateFrag,
  updateVert = basicVert,
  updateUniforms,
  drawFrag,
  drawVert = basicVert,
  drawUniforms,
  drawBuffers,
}: {
  numPoints: number;
  updateFrag: string;
  updateUniforms: object;
  updateVert?: string;
  drawFrag: string;
  drawVert?: string;
  drawUniforms: object;
  drawBuffers: REGL.Framebuffer[];
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
    vert: updateVert,
    frag: updateFrag,
    depth: { enable: false },
    framebuffer: ({ tick }: any) => buffers[(tick + 1) % 2],
    uniforms: {
      u_state: ({ tick }: any) => buffers[tick % 2],
      u_tick: ({ tick }) => tick,
      u_time: ({ time }) => time,
      u_resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight,
      ],
      ...updateUniforms,
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
      ...drawUniforms,
    },
    primitive: "points",
    count: N * N,
    framebuffer: ({ tick }: any) => drawBuffers[(tick + 1) % 2],
  });
  return { update, buffers, draw };
};

const pingPongShader = ({
  updateFrag,
  updateVert = basicVert,
  updateUniforms,
  drawFrag,
  drawVert = basicVert,
  drawUniforms,
}: {
  updateFrag: string;
  updateVert?: string;
  updateUniforms: object;
  drawFrag: string;
  drawVert?: string;
  drawUniforms: object;
}) => {
  const buffers = Array(2)
    .fill(0)
    .map(() =>
      regl.framebuffer({
        color: regl.texture({
          shape: [window.innerWidth, window.innerHeight],
          data: Array(window.innerWidth * window.innerHeight * 4).fill(0),
        }),
        depthStencil: false,
      })
    );
  const update = regl({
    frag: updateFrag,
    vert: updateVert,
    depth: { enable: false },
    framebuffer: ({ tick }: any) => buffers[(tick + 1) % 2],
    uniforms: {
      u_state: ({ tick }: any) => buffers[tick % 2],
      u_tick: ({ tick }) => tick,
      u_time: ({ time }) => time,
      u_resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight,
      ],
      ...updateUniforms,
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
    frag: drawFrag,
    vert: drawVert,
    uniforms: {
      u_state: ({ tick }) => buffers[tick % 2],
      u_tick: ({ tick }) => tick,
      u_time: ({ time }) => time,
      u_resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight,
      ],
      ...drawUniforms,
    },
    attributes: {
      position: quadPoints,
    },
    primitive: "triangles",
    elements: null,
    offset: 0,
    count: quadPoints.length / 2,
  });
  return { update, buffers, draw };
};
const N = 10;
const { update, draw, buffers } = pingPongShader({
  updateFrag: `
  precision highp float;
  uniform sampler2D u_state;
  uniform vec2 u_resolution;
  void main () {
    vec2 shape = u_resolution.xy;
    vec4 prevState = texture2D(u_state,
      gl_FragCoord.xy / shape);
    gl_FragColor = prevState;
  }
  `,
  updateUniforms: {},
  drawFrag: `
  precision highp float;
  uniform sampler2D u_state;
  uniform vec2 u_resolution;
  void main () {
    vec2 shape = u_resolution.xy;
    vec4 prevState = texture2D(u_state,
      gl_FragCoord.xy / shape);
    gl_FragColor = prevState;
  }
  `,
  drawUniforms: {},
});
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
  updateUniforms: {
    deltaT: 0.1,
    gravity: -0.5,
  },
  drawUniforms: {},
  drawBuffers: buffers,
});

regl.frame(() => {
  updateSprites();
  update();
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1,
  });
  drawSprites();
  draw();
});
