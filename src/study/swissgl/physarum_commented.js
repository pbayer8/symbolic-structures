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
// Create a new Physarum instance
import GUI from "lil-gui";
const gui = new GUI();

class Physarum {
  static Tags = ["2d", "simulation"];

  // Constructor for the Physarum class, setting up initial parameters
  constructor() {
    const U = (this.U = {});
    // Function to add a parameter to the U object and the GUI
    const par = (s, v, ...arg) => {
      U[s] = v;
      gui.add(U, s, ...arg);
    };
    par("step_n", 1, 0, 20, 1); // Number of simulation steps
    par("density", 1, 1, 4, 1); // Particle density
    par("senseAng", 5.5, -180, 180); // Sensor angle
    par("senseDist", 18, 1, 50); // Sensor distance
    par("moveAng", 45, 0, 180); // Rotation angle
    par("moveDist", 2, 0, 10); // Movement distance
    par("viewScale", 1, 1, 3, 1); // View scale factor
  }

  // Method to run the simulation for a certain number of steps
  frame() {
    for (let i = 0; i < this.U.step_n; ++i) {
      this.step(glsl);
    }
    // Update the output using the field and the parameters
    glsl({ field: this.field[0], ...this.U, FP: `field(UV*viewScale).x` });
  }

  // Method to perform one simulation step
  step(glsl) {
    // Update the field bafieldsed on the source step and the surrounding cells
    const field = (this.field = glsl(
      {
        FP: `
      vec2 dp = Src_step();
      float x=UV.x, y=UV.y;
      float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
      // Macro to sample the source at given coordinates
      #define S(x,y) (Src(vec2(x,y)))
      // Apply a 3x3 mean filter and decay factor to the field
      FOut = 0.95*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;
      `,
      },
      { story: 2, format: "rgba8", tag: "field" }
    ));

    // Update the particles based on the field and the parameters
    const points = glsl(
      {
        field: field[0],
        ...this.U,
        FP: `
      FOut = Src(I);
      vec2 wldSize = vec2(field_size());
      // Initialize new particles with random positions and directions
      if (FOut.w == 0.0 || FOut.x>=wldSize.x || FOut.y>=wldSize.y) {
          FOut = vec4(hash(ivec3(I, 123)), 1.0);
          FOut.xyz *= vec3(wldSize, TAU); 
          return;
      }
      // Calculate the current direction of the particle
      vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
      // Rotate the sensor angle and create a rotation matrix
      mat2 R = rot2(radians(senseAng));
      // Calculate the sensor positions
      vec2 sense = senseDist*dir;// Macro to sample the field at the given position
      #define F(p) field((FOut.xy+(p))/wldSize).x
      // Sample the field at the sensor positions
      float c=F(sense), r=F(R*sense), l=F(sense*R);
      // Calculate the rotation angle in radians
      float rotAng = radians(moveAng);
      // Update the particle direction based on the sensor readings
      if (l>c && c>r) {
          FOut.z -= rotAng;
      } else if (r>c && c>l) {
         FOut.z += rotAng;
      } else if (c<=r && c<=l) {
         FOut.z += sign(hash(ivec3(FOut.xyz*5039.)).x-0.5)*rotAng;
      }
      // Update the particle position based on the direction and movement distance
      FOut.xy += dir*moveDist;
      // Wrap the particle position to stay within the world size
      FOut.xy = mod(FOut.xy, wldSize);
      `,
      },
      { scale: this.U.density / 16, story: 2, format: "rgba32f", tag: "points" }
    );

    // Render the updated particles to the field texture
    glsl(
      {
        points: points[0],
        Grid: points[0].size,
        Blend: "s+d",
        VP: `
      // Calculate the vertex position in clip space
      VOut.xy = 2.0 * (points(ID.xy).xy+XY*2.0)/vec2(ViewSize) - 1.0;`,
        FP: `
      // Calculate the fragment color based on the distance to the particle center
      smoothstep(1.0, 0.0, length(XY))`,
      },
      field[0]
    );
  }
}

const physarum = new Physarum();

function frame(t) {
  requestAnimationFrame(frame);

  physarum
    .frame
    // glsl,
    // this.withCamera, {
    // time:t/1000.0, xrMode: false,
    // ...this.viewParams,}
    ();
}
// requestAnimationFrame(frame);
