import SwissGL from "swissgl";
import "./style.css";
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
// create WebGL2 context end SwissGL
const glsl = SwissGL(canvas);
const fields = {};
const fieldFactors = {};
const colors = {};
const outerEdge = Math.random() * 0.5 + 0.5;
const edge = { outerEdge, innerEdge: Math.random() * outerEdge };
const mouse = [-100, -100];
// Create a new Physarum instance
import GUI from "lil-gui";
const gui = new GUI();
gui.close();
gui.add(edge, "outerEdge", 0, 1);
gui.add(edge, "innerEdge", 0, 1);
let count = 0;
const channels = ["x", "y", "z", "w"];
const colorStrength = 0.2;
const clearColor = [
  Math.random() * colorStrength,
  Math.random() * colorStrength,
  Math.random() * colorStrength,
  1,
];
document.addEventListener("mousemove", (e) => {
  mouse[0] = e.buttons ? e.clientX / window.innerWidth : -100;
  mouse[1] = e.buttons ? 1 - e.clientY / window.innerHeight : -100;
});

class Physarum2 {
  static Tags = ["2d", "simulation"];

  // Constructor for the Physarum class, setting up initial parameters
  constructor() {
    this.index = count;
    this.channel = channels[count % channels.length];
    count++;
    const U = (this.U = { viewScale: 1, step_n: 1, mouse });
    // Function to add a parameter to the U object and the GUI
    const par = (s, v, ...arg) => {
      // U[s] = v;
      U[s] = Math.random() * (arg[1] - arg[0]) + arg[0];
      gui.add(U, s, ...arg);
    };
    par("density", 1, 1, 3, 1); // Particle density
    // par("senseAng", 5.5, -180, 180); // Sensor angle
    par("senseDist", 18, 1, 50); // Sensor distance
    par("moveAng", 45, 0, 180); // Rotation angle
    par("moveDist", 0, -2, 2); // Movement distance
    par("fieldFactor", 0, -5, 5); // Movement distance
    U["displayColor"] = [Math.random(), Math.random(), Math.random(), 1];
    gui.addColor(U, "displayColor");
  }

  // Method to run the simulation for a certain number of steps
  frame() {
    for (let i = 0; i < this.U.step_n; ++i) {
      this.step(glsl);
    }
    // Update the output using the field and the parameters
    glsl({
      ...fields,
      ...this.U,
      ...colors,
      Clear: clearColor,
      // Aspect: "fit",
      Blend: "s+d",
      FP: `${Object.keys(fields)
        // .map((k, i) => `FOut += mix(vec4(0.),color${i},${k}(UV*viewScale).x)`)
        .map(
          (k, i) =>
            `FOut = mix(vec4(FOut.xyz,1.),color${i},${k}(UV*viewScale).x)`
        )
        .join(";")};
        `,
    });
  }

  // Method to perform one simulation step
  step(glsl) {
    fieldFactors["fieldFactor" + this.index] = this.U.fieldFactor;
    colors["color" + this.index] = this.U.displayColor;

    // Update the field based on the source step and the surrounding cells
    this.field = glsl(
      {
        mouse,
        ...edge,
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
      { story: 2, format: "rgba8", tag: "field" + this.index }
    );
    fields["field" + this.index] = this.field[0];

    // Update the particles based on the field and the parameters
    this.points = glsl(
      {
        field: this.field[0],
        ...fields,
        ...fieldFactors,
        ...this.U,
        mouse,
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
      // sample the field north, east, south and west of the particle
      vec4 field = vec4(
          field(FOut.xy+vec2(0.0, senseDist)).x,
          field(FOut.xy+vec2(senseDist, 0.0)).x,
          field(FOut.xy+vec2(0.0, -senseDist)).x,
          field(FOut.xy+vec2(-senseDist, 0.0)).x
      );
      // Calculate the angle of the field gradient
      float ang = atan(field.y-field.z, field.w-field.x);
      // Calculate the angle difference between the particle direction and the field gradient
      float diff = ang - FOut.z;
      // Wrap the angle difference to stay within -PI and PI
      diff = mod(diff+PI, TAU)-PI;
      // Calculate the new particle direction based on the angle difference and the rotation angle
      FOut.z += clamp(diff, -moveAng, moveAng);
      // Calculate the distance to move based on the field strength and the movement distance
      float moveDist = field.x*moveDist;
      // Update the particle position based on the direction and movement distance
      FOut.xy += dir*moveDist;
      // Wrap the particle position to stay within the world size
      FOut.xy = mod(FOut.xy, wldSize);
      `,
      },
      {
        scale: this.U.density / 16,
        story: 2,
        format: "rgba32f",
        tag: "points" + this.index,
      }
    );

    // Render the updated particles to the field texture
    glsl(
      {
        points: this.points[0],
        Grid: this.points[0].size,
        ...this.U,
        Blend: "s+d",
        VP: `
      // Calculate the vertex position in clip space
      VOut.xy = 2.0 * (points(ID.xy).xy+XY*2.0)/vec2(ViewSize) - 1.0;`,
        FP: `
      // Calculate the fragment color based on the distance to the particle center
      smoothstep(1.0, 0.0, length(XY)*2.)
      `,
      },
      this.field[0]
    );
  }
}

const physarums = Array(1)
  .fill("")
  .map((_, i) => new Physarum2());

function frame(t) {
  requestAnimationFrame(frame);
  physarums.forEach((p) => p.frame());
}
requestAnimationFrame(frame);
