import REGL from "regl";
import "./style.css";
const regl = REGL({ extensions: "OES_texture_float" });
const mouse = [0, 0];

document.addEventListener("mousemove", (e) => {
  mouse[0] = e.clientX;
  mouse[1] = window.innerHeight - e.clientY;
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
  updateUniforms = {},
  drawFrag,
  drawVert = basicVert,
  drawUniforms = {},
  drawBuffers,
}: {
  numPoints: number;
  updateFrag: string;
  updateUniforms?: object;
  updateVert?: string;
  drawFrag: string;
  drawVert?: string;
  drawUniforms?: object;
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
            .map(() => Math.random() * 2 - 1),
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
      u_mouse: () => mouse,
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
  updateUniforms = {},
  drawFrag,
  drawVert = basicVert,
  drawUniforms = {},
}: {
  updateFrag: string;
  updateVert?: string;
  updateUniforms?: object;
  drawFrag: string;
  drawVert?: string;
  drawUniforms?: object;
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
      u_mouse: () => mouse,
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
      u_mouse: () => mouse,
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
const N = 100;
const { update, draw, buffers } = pingPongShader({
  updateFrag: `
  precision highp float;
  uniform sampler2D u_state;
  uniform vec2 u_resolution, u_mouse;
  void main () {
    vec2 shape = u_resolution.xy;
    // todo, make better and generalized blur
    vec2 pos = gl_FragCoord.xy;
    vec4 blurred = texture2D(u_state,(pos + vec2(1.0, 0.0)) / shape) +
      texture2D(u_state,(pos + vec2(-1.0, 0.0)) / shape) +
      texture2D(u_state,(pos + vec2(0.0, 1.0)) / shape) +
      texture2D(u_state,(pos + vec2(0.0, -1.0)) / shape);
    
    blurred /= 4.0;
    blurred *= 0.95;
    float dist = distance(gl_FragCoord.xy, u_mouse);
    blurred.x += step(dist, 10.0);
    gl_FragColor = vec4(blurred.xyz, 1.0);
  }
  `,
  drawFrag: `
  precision highp float;
  uniform sampler2D u_state;
  uniform vec2 u_resolution;
  void main () {
    vec2 shape = u_resolution.xy;
    vec4 prevState = texture2D(u_state,
      gl_FragCoord.xy / shape);
    float dist = length(gl_FragCoord.xy - u_resolution.xy / 2.0);
    prevState.x += step(dist, 10.0);
    gl_FragColor = prevState;
  }
  `,
});
const { update: updateSprites, draw: drawSprites } = pingPongPoints({
  numPoints: N * N,
  updateFrag: `precision highp float;

  uniform sampler2D u_state, u_substrate;
  uniform vec2 u_resolution;

  void main () {
    vec2 shape = u_resolution.xy;
    vec4 prevState = texture2D(u_state,
      gl_FragCoord.xy / shape);
    vec2 position = prevState.xy;
    vec2 velocity = prevState.zw;
    // sample N, W, S, E neighbors
    float dist = .05;
    float N = texture2D(u_substrate,(position*.5+.5)+vec2(0.,1.)*dist).x;
    float S = texture2D(u_substrate,(position*.5+.5)+vec2(0.,-1.)*dist).x;
    float E = texture2D(u_substrate,(position*.5+.5)+vec2(1.,0.)*dist).x;
    float W = texture2D(u_substrate,(position*.5+.5)+vec2(-1.,0.)*dist).x;
    vec2 vdiff = vec2(E - W, N - S);
    // if (length(vdiff) > .1) vdiff *= -10.;
    velocity += vdiff*.5;
    velocity = normalize(velocity);
    position += velocity*.0005;
    // wrap around
    if (position.x > 1.0) position.x -= 2.0;
    else if (position.x < -1.) position.x += 2.0;
    if (position.y > 1.0) position.y -= 2.0;
    else if (position.y < -1.) position.y += 2.0;
    gl_FragColor = vec4(position, velocity);
  }
  `,
  drawVert: `
  precision highp float;
  attribute vec2 a_point;
  uniform sampler2D u_state;
  void main () {
    vec2 position = texture2D(u_state, a_point).xy;
    gl_PointSize = 3.0;
    gl_Position = vec4(position, 0, 1);
  }
  `,
  drawFrag: `
  precision highp float;
  uniform sampler2D u_substrate;
  void main () {
    if (length(gl_PointCoord.xy - vec2(.5)) > .5) discard;
    // float dist = length(gl_PointCoord.xy - vec2(.5));
    // gl_FragColor = vec4(vec3(1.0), step(dist, .5)*step(.45, dist));
    vec4 substrate = texture2D(u_substrate, gl_PointCoord.xy);
    gl_FragColor = vec4(vec3(1.0) + substrate.xyz, 1.0);
  }
  `,
  updateUniforms: {
    u_substrate: ({ tick }) => buffers[(tick + 1) % 2],
  },
  drawUniforms: {
    u_substrate: ({ tick }) => buffers[tick % 2],
  },
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
