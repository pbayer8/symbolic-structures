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

// Inspired by the video https://youtu.be/p4YirERTVF0?t=480
class ParticleLife {
  // Declaring static variable 'Tags' as an array of strings '2d' and 'simulation'
  static Tags = ["2d", "simulation"];

  // Constructor of ParticleLife class which accepts two arguments: glsl and gui
  constructor() {
    // Storing glsl and gui as class variables
    this.glsl = glsl; // glsl reference
    this.step_n = 1; // the number of simulation steps
    this.dt = 0.1; // time step size
    this.worldExtent = 15.0; // extent of the world
    this.repulsion = 2.0; // repulsion force parameter
    this.inertia = 0.1; // inertia parameter

    // Adding GUI controls for the parameters
    gui.add(this, "step_n", 0, 50, 1); // Control for 'step_n' in range [0, 50] with step 1
    gui.add(this, "dt", 0.0, 0.5); // Control for 'dt' in range [0.0, 0.5]
    gui.add(this, "worldExtent", 1, window.innerHeight); // Control for 'worldExtent' in range [10, 50]
    gui.add(this, "repulsion", 0.0, 10.0 * (window.innerHeight / 30)); // Control for 'repulsion' in range [0.0, 10.0]
    gui.add(this, "inertia", 0.0, 1.0); // Control for 'inertia' in range [0.0, 1.0]
    gui.add(this, "reset"); // Control for reset method

    // Defining interaction force between particles
    const K = (this.K = 6); // Number of particles
    this.F = glsl(
      { K, FP: `float(I.x==I.y) + 0.1*float(I.x==(I.y+1)%int(K))` },
      { size: [K, K], format: "r16f", tag: "F" }
    );

    // Defining particle data structure
    this.points = glsl(
      {},
      { size: [30, 10], story: 3, format: "rgba32f", tag: "points" }
    );

    // Resetting the particle state
    this.reset();
  }

  // Method to reset the simulation
  reset() {
    // Re-initialize the particle positions and colors
    for (let i = 0; i < 2; ++i) {
      this.glsl(
        {
          K: this.K,
          seed: 123,
          FP: `
              vec2 pos = (hash(ivec3(I, seed)).xy-0.5)*10.0;
              float color = floor(UV.x*K);
              FOut = vec4(pos, 0.0, color);`,
        },
        this.points
      );
    }
  }

  // Method to perform a simulation step
  step() {
    const { K, F, points, worldExtent, repulsion, inertia, dt } = this; // Destructuring class variables for easier access

    // Performing simulation step(s)
    for (let i = 0; i < this.step_n; ++i)
      this.glsl(
        {
          F,
          worldExtent: worldExtent,
          repulsion,
          inertia,
          dt,
          past: points[1],
          FP: `
          FOut = Src(I); // current particle
          #define wrap(p) ((fract((p)/worldExtent+0.5)-0.5)*worldExtent)
          // #define wrap(p) (mod(p,worldExtent))
          vec2 force=vec2(0); // initialize force vector to 0
          
          // Looping through all particles to compute forces
          for (int y=0; y<ViewSize.y; ++y)
          for (int x=0; x<ViewSize.x; ++x) {
            vec4 data1 = Src(ivec2(x,y)); // particle to compare with
            vec2 dpos = wrap(data1.xy-FOut.xy); // distance vector between particles
            float r = length(dpos); // length of distance vector
            if (r>3.0) continue; // Skip if particles are too far
            dpos /= r+1e-8; // normalize distance vector
            float rep = max(1.0-r, 0.0)*repulsion; // compute repulsion
            float f = F(ivec2(FOut.w, data1.w)).x; // force between the two particles
            float att = f*max(1.0-abs(r-2.0), 0.0); // attraction between the two particles
            force += dpos*(att-rep); // add net force (attraction - repulsion) to the force vector
          }

          // Compute new velocity and position
          vec2 vel = wrap(FOut.xy-past(I).xy)*pow(inertia, dt);
          FOut.xy = wrap(FOut.xy+vel+0.5*force*(dt*dt));
      `,
        },
        points
      );
  }

  // Method to draw a frame
  frame() {
    const { K, points, worldExtent } = this;

    // Perform a simulation step
    this.step();
    // Draw the particles on top of the field
    glsl({
      K,
      worldExtent,
      points: points[0],
      Grid: points[0].size,
      Aspect: "fit",
      Blend: "d*(1-sa)+s*sa",
      Inc: `
          varying vec3 color;`,
      VP: `
          vec4 d = points(ID.xy);
          color = cos((d.w/K+vec3(0,0.33,0.66))*TAU)*0.5+0.5;
          VOut.xy = 2.0*(d.xy+XY/120.*worldExtent)/worldExtent;`,
      FP: `color, smoothstep(1.0, 0.6, length(XY))`,
    });
  }
}

const physarum = new ParticleLife();

function frame(t) {
  requestAnimationFrame(frame);

  physarum.frame();
}
requestAnimationFrame(frame);
