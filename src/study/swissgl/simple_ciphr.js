import SwissGL from "swissgl";
import "./style.css";
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const glsl = SwissGL(canvas);
class Automata {
  constructor() {}
  frame() {
    this.step(glsl);
    // Update the output using the field and the parameters
    glsl({
      Blend: "s+d",
      field: this.field[0],
      // FP: `field(UV).x`,
      // mix between red and blue based on field value range -1 to 1
      FP: `vec4(mix(vec3(1.,0.,0.),vec3(0.,0.,1.),field(UV).x*0.5+0.5),1.)`,
    });
    glsl({
      points: this.points[0],
      Grid: this.points[0].size,
      // Blend: "s+d",
      VP: `
      float pointSize = 1.;
      // Calculate the vertex position in clip space
      VOut.xy = 2.0 * (points(ID.xy).xy+XY*pointSize)/vec2(ViewSize) - 1.0;`,
      FP: `
      // Calculate the fragment color based on the distance to the particle center
      // smoothstep(1.0, 0.0, length(XY))
      vec4(0.,1.,0.,1.)`,
    });
  }
  step(glsl) {
    // Update the field based on the source step and the surrounding cells
    this.field = glsl(
      {
        FP: `
      vec2 dp = Src_step();
      float x=UV.x, y=UV.y;
      float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
      // Macro to sample the source at given coordinates
      #define S(x,y) (Src(vec2(x,y)))
      // Apply a 3x3 mean filter and decay factor to the field
      FOut = .95*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;
      `,
      },
      { story: 2, format: "rgba32f", tag: "field" }
    );

    // Update the particles based on the field and the parameters
    this.points = glsl(
      {
        field: this.field[0],
        FP: `
      FOut = Src(I);
      vec2 worldSize = vec2(field_size());
      // Initialize new particles with random positions and directions
      if (FOut.w == 0.0 || FOut.x>=worldSize.x || FOut.y>=worldSize.y) {
          FOut = vec4(hash(ivec3(I, 123)), 1.0);
          FOut.xyz *= vec3(worldSize, TAU); 
          return;
      }
      // Calculate the current direction of the particle
      vec2 dir = vec2(cos(FOut.z), sin(FOut.z));

      // Sensing here:
      
      // Update the particle position based on the direction and movement distance
      FOut.xy += dir * .1;

      // Wrap the particle position to stay within the world size
      FOut.xy = mod(FOut.xy, worldSize);
      `,
      },
      {
        size: [20, 20],
        story: 2,
        format: "rgba32f",
        tag: "points",
      }
    );

    // Render the updated particles to the field texture
    glsl(
      {
        points: this.points[0],
        Grid: this.points[0].size,
        Blend: "s+d",
        VP: `
        float pointSize = 10.;
        // Calculate the vertex position in clip space
        VOut.xy = 2.0 * (points(ID.xy).xy+XY*pointSize)/vec2(ViewSize) - 1.0;`,
        FP: `
      // Calculate the fragment color based on the distance to the particle center
      // smoothstep(1.0, 0.0, length(XY))
      XY.x`,
      },
      this.field[0]
    );
  }
}

const physarums = Array(1)
  .fill("")
  .map((_, i) => new Automata());

function frame(t) {
  requestAnimationFrame(frame);
  physarums.forEach((p) => p.frame());
}
requestAnimationFrame(frame);
