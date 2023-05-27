import SwissGL from "swissgl";
import "../style.css";
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
gui.hide();
gui.add(edge, "outerEdge", 0, 1);
gui.add(edge, "innerEdge", 0, 1);
let count = 0;
const channels = ["x", "y", "z", "w"];
const colorStrength = Math.random() * 0.3;
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

class Physarum {
  static Tags = ["2d", "simulation"];

  // Constructor for the Physarum class, setting up initial parameters
  constructor() {
    this.index = count;
    this.channel = channels[count % channels.length];
    count++;
    const U = (this.U = { viewScale: 1, step_n: 1, mouse });
    // Function to add a parameter to the U object and the GUI
    const par = (s, v, ...arg) => {
      U[s] = Math.random() * (arg[1] - arg[0]) + arg[0];
      gui.add(U, s, ...arg);
    };
    par("density", 1, 1, 3, 1); // Particle density
    par("senseAng", 5.5, -180, 180); // Sensor angle
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
      Blend: "s+d",
      FP: `${Object.keys(fields)
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
      // Apply a rect sigmoid function to the field
      FOut *= smoothstep(outerEdge,innerEdge,length(XY*XY*XY*XY));
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
      vec2 worldSize = vec2(field_size());
      float aspectRatio = worldSize.x/worldSize.y;
      // Initialize new particles with random positions and directions
      if (FOut.w == 0.0 || FOut.x>=worldSize.x || FOut.y>=worldSize.y) {
          FOut = vec4(hash(ivec3(I, 123)), 1.0);
          FOut.xyz *= vec3(worldSize, TAU); 
          return;
      }
      // Calculate the current direction of the particle
      vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
      // Rotate the sensor angle and create a rotation matrix
      mat2 R = rot2(radians(senseAng));
      // Calculate the sensor positions
      vec2 sense = senseDist*dir;
      vec2 mousePos = mouse;
      vec2 aspectMult = aspectRatio > 1. ? vec2(aspectRatio, 1.) : vec2(1., 1./aspectRatio);
      // Macro to sample the field at the given position
      #define F(p) ${Object.keys(fields)
        .map((k, i) => `${k}((FOut.xy+p)/worldSize).x*fieldFactor${i}`)
        .join(
          "+"
        )}+50.*smoothstep(.2,0.,length(((FOut.xy+p)/worldSize-mousePos)*aspectMult))
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
      FOut.xy = mod(FOut.xy, worldSize);
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

const physarums = Array(Math.ceil(Math.random() * 6))
  .fill("")
  .map((_, i) => new Physarum());

function frame(t) {
  requestAnimationFrame(frame);
  physarums.forEach((p) => p.frame());
}
requestAnimationFrame(frame);
