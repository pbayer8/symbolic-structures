import REGL from "regl";
import img from "./image.png";
import "./style.css";

const regl = REGL();

var im = new Image();
im.src = img;
im.onload = () => {
  const imgTexture = regl.texture({ data: im, flipY: true });

  const INITIAL_CONDITIONS = Array(window.innerWidth * window.innerHeight * 4)
    .fill(0)
    .map(() => (Math.random() > 0.9 ? 255 : 0));

  const state = Array(2)
    .fill(0)
    .map(() =>
      regl.framebuffer({
        color: regl.texture({
          shape: [window.innerWidth, window.innerHeight],
          data: INITIAL_CONDITIONS,
        }),
        depthStencil: false,
      })
    );
  const updateLife = regl({
    frag: `
  precision mediump float;
  uniform sampler2D prevState;
  uniform sampler2D imageTexture;
  varying vec2 uv;
  void main() {
    float n = 0.0;
    for(int dx=-1; dx<=1; ++dx)
    for(int dy=-1; dy<=1; ++dy) {
      n += texture2D(prevState, uv+vec2(dx,dy)/vec2(${window.innerWidth}., ${window.innerHeight}.)).r;
    }
    float s = texture2D(prevState, uv).r;
    if(n > 3.0+s || n < 3.0) {
      gl_FragColor = vec4(0,0,0,1);
    } else {
      gl_FragColor = vec4(1,1,1,1);
    }
  }`,

    framebuffer: ({ tick }) => state[(tick + 1) % 2],
  });

  const setupQuad = regl({
    frag: `
  precision mediump float;
  uniform sampler2D prevState;
  uniform sampler2D imageTexture;
  varying vec2 uv;
  void main() {
    vec2 imUv = uv;

    vec2 canvasSize = vec2(${window.innerWidth}.0, ${window.innerHeight}.0);
    vec2 imageSize = vec2(${im.width}.0, ${im.height}.0);
    float canvasAspectRatio = canvasSize.x / canvasSize.y;
    float imageAspectRatio = imageSize.x / imageSize.y;
    float ratio = canvasAspectRatio / imageAspectRatio;
    if (canvasAspectRatio > imageAspectRatio) {
      // The image is taller than the canvas
      imUv.x = uv.x * ratio + (1.0 - ratio) / 2.0;
    } else {
      // The image is wider than the canvas
      imUv.y = uv.y / ratio + (1.0 - 1.0 / ratio) / 2.0;
    }
    float state = texture2D(prevState, uv).r;
    gl_FragColor = vec4(vec3(state) + texture2D(imageTexture, imUv).rgb, 1);
  }`,

    vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,

    attributes: {
      position: [-4, -4, 4, -4, 0, 4],
    },

    uniforms: {
      prevState: ({ tick }) => state[tick % 2],
      imageTexture: imgTexture,
    },

    depth: { enable: false },

    count: 3,
  });

  regl.frame(() => {
    setupQuad(() => {
      regl.draw();
      updateLife();
    });
  });
};
