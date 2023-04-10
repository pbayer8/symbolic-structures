import REGL from "regl";
import img from "./image.png";
import "./style.css";
import buffer from "./treebuffer.glsl?raw";
import image from "./treemain.glsl?raw";
import vertex from "./vertex.glsl?raw";

const regl = REGL();

// Load the textures you need for the shader, for example:
var im = new Image();
im.src = img;
im.onload = () => {
  const noiseTexture = regl.texture(im);

  // Create a framebuffer to store Buffer A's output
  const bufferAFramebuffer = regl.framebuffer({
    color: regl.texture({
      width: regl._gl.canvas.width,
      height: regl._gl.canvas.height,
    }),
  });
  const bufferBFramebuffer = regl.framebuffer({
    color: regl.texture({
      width: regl._gl.canvas.width,
      height: regl._gl.canvas.height,
    }),
  });
  let fbos = {
    current: bufferAFramebuffer,
    next: bufferBFramebuffer,
  };

  // Define the command for Buffer A
  const bufferACommand = regl({
    frag: buffer,
    vert: vertex,

    framebuffer: bufferAFramebuffer,

    uniforms: {
      iChannel0: regl.prop("bufferAInput"),
      iChannel1: noiseTexture,
      iResolution: ({
        drawingBufferWidth,
        drawingBufferHeight,
      }: {
        drawingBufferWidth: number;
        drawingBufferHeight: number;
      }) => [drawingBufferWidth, drawingBufferHeight],
      iMouse: () => mouse,
      // iMouse: function (context, props) {
      //   return props.iMouse;
      // },
    },

    attributes: {
      position: [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ],
    },

    count: 4,
    primitive: "triangle strip",
  });

  // Define the command for the Image buffer
  const imageCommand = regl({
    frag: image,
    vert: vertex,

    uniforms: {
      iChannel0: regl.prop("bufferAInput"),
      iChannel1: noiseTexture,
      iResolution: ({
        drawingBufferWidth,
        drawingBufferHeight,
      }: {
        drawingBufferWidth: number;
        drawingBufferHeight: number;
      }) => [drawingBufferWidth, drawingBufferHeight],
    },

    attributes: {
      position: [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ],
    },

    count: 4,
    primitive: "triangle strip",
  });

  // Set initial input for Buffer A and mouse state
  const bufferAInput = regl.texture();
  const mouse = [0, 0];
  document.addEventListener("mousemove", (e) => {
    mouse[0] = e.clientX;
    mouse[1] = e.clientY;
  });

  // Main loop
  regl.frame(() => {
    // Run the Buffer A command
    bufferACommand({
      bufferAInput: fbos.current,
      mouse,
      framebuffer: fbos.next,
    });

    // Run the Image command
    imageCommand({
      bufferAInput: fbos.current,
    });

    // Swap framebuffers
    fbos = {
      current: fbos.next,
      next: fbos.current,
    };
  });
};
