import SwissGL from "swissgl";
import "./style.css";
const canvas = document.createElement("canvas");
const size = Math.min(window.innerWidth, window.innerHeight);
// canvas.width = size;
// canvas.height = size;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
// create WebGL2 context end SwissGL
const glsl = SwissGL(canvas);
function render(t) {
  t /= 1000; // ms to sec
  glsl({
    t, // pass uniform 't' to GLSL
    Mesh: [10, 10], // draw a 10x10 tessellated plane mesh
    // Vertex shader expression returns vec4 vertex position in
    // WebGL clip space. 'XY' and 'UV' are vec2 input vertex
    // coordinates in [-1,1] and [0,1] ranges.
    // VP: `XY*0.8+sin(t+XY.yx*2.0)*0.2,0,1`,
    // Fragment shader returns 'RGBA'
    FP: `step(1.-length(XY),.5)`,
    Aspect: "fit",
    Clear: [1, 0, 0, 1],
  });
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
