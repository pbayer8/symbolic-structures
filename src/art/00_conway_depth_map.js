import REGL from "regl";
import depth from "./depth.png";
import img from "./image.png";
import "./style.css";

const regl = REGL();
let mouse = [0, 0];

const setup = () => {
  const imgTexture = regl.texture({ data: im, flipY: true });
  const depthTexture = regl.texture({ data: dep, flipY: true });

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
  uniform sampler2D depthTexture;
  uniform vec2 mouse;
  varying vec2 uv;
  void main() {
    vec2 imUv = uv;

    vec2 canvasSize = vec2(${window.innerWidth}.0, ${window.innerHeight}.0);
    vec2 imageSize = vec2(${im.width}.0, ${im.height}.0);
    float canvasAspectRatio = canvasSize.x / canvasSize.y;
    float imageAspectRatio = imageSize.x / imageSize.y;
    float ratio = canvasAspectRatio / imageAspectRatio;
    vec2 mouseUv = vec2(mouse.x + .5, mouse.y - .5);
    // if (canvasAspectRatio > imageAspectRatio) {
    //   imUv.x = uv.x * ratio + (1.0 - ratio) / 2.0;
    // } else {
    //   imUv.y = uv.y / ratio + (1.0 - 1.0 / ratio) / 2.0;
    // }
    if (canvasAspectRatio > imageAspectRatio) {
      // The image is taller than the canvas
      imUv.y = uv.y / ratio + (1.0 - 1.0 / ratio) / 2.0 - (mouseUv.y)*(canvasAspectRatio/imageAspectRatio)*.15;
    } else {
      // The image is wider than the canvas
      imUv.x = uv.x * ratio + (1.0 - ratio) / 2.0 - (mouseUv.x)*(imageAspectRatio/canvasAspectRatio)*.15;
    }
    float strength = 0.3;
    float depth =( texture2D(depthTexture, imUv).r -.5)* strength;
    float distortedDepth = (texture2D(depthTexture, imUv+depth*mouseUv).r-.5) * strength;
    imUv += distortedDepth*mouseUv;
    float state = texture2D(prevState, imUv).r;
    float gaussianState = state;
    for(int dx=-1; dx<=1; ++dx)
    for(int dy=-1; dy<=1; ++dy) {
      gaussianState += texture2D(prevState, imUv+vec2(dx,dy)/vec2(${window.innerWidth}., ${window.innerHeight}.)).r;
    }
    float blurredState = gaussianState/9.0;
    imUv.y += blurredState*distortedDepth*.2;
    // imUv += blurredState*texture2D(depthTexture, imUv).r*.05;
    vec3 color = texture2D(imageTexture, imUv).rgb;
    // gl_FragColor = vec4(vec3(state) + cop, 1);
    gl_FragColor = vec4(color, 1);
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
      depthTexture: depthTexture,
      mouse: () => mouse,
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

document.addEventListener("mousemove", (e) => {
  mouse[0] = -(e.clientX / window.innerWidth);
  mouse[1] = e.clientY / window.innerHeight;
});

document.addEventListener("touchmove", (e) => {
  mouse[0] = -(e.touches[0].clientX / window.innerWidth);
  mouse[1] = e.touches[0].clientY / window.innerHeight;
});

var im = new Image();
im.src = img;
var dep = new Image();
dep.src = depth;
im.onload = setup;
