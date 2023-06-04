/** @license
 * Copyright 2023 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */

// This code is for a model known as Particle Lenia. More information on the model can be found at the given URLs.
class ParticleLenia {
  static Tags = ["2d", "simulation"];

  constructor(glsl, gui) {
    // This hook is adding a new function "peak_f" into the shader code.
    this.glsl = glsl.hook((glsl, p, t) =>
      glsl(
        {
          ...p,
          Inc:
            `
      vec2 peak_f(float x, float mu, float sigma) {
        float t = (x-mu)/sigma;
        float y = exp(-t*t);
        return vec2(y, -2.0*t*y/sigma);
      }\n` + (p.Inc || ""),
        },
        t
      )
    );

    this.step_n = 5; // Number of simulation steps per frame
    this.viewR = 15.0; // Radius of the viewing area
    const params = (this.params = {
      dt: 0.1, // Time step for the simulation
      mu_k: 4.0,
      sigma_k: 1.0,
      w_k: 0.022, // Parameters for K function
      mu_g: 0.6,
      sigma_g: 0.15,
      c_rep: 1.0,
    }); // Parameters for G function

    // Adding GUI controls for simulation parameters
    gui.add(this, "step_n", 0, 50, 1);
    gui.add(params, "mu_k", 0.0, 5.0).onChange(() => this.updateNormCoef());
    gui.add(params, "sigma_k", 0.1, 2.0).onChange(() => this.updateNormCoef());
    gui.add(params, "mu_g", 0.0, 1.5);
    gui.add(params, "sigma_g", 0.1, 1.0);
    gui.add(params, "c_rep", 0.0, 2.0);
    gui.add(this, "reset");

    this.reset(); // Initializing the system
  }

  // Method to update normalization coefficients
  updateNormCoef() {
    // Bunch of calculations here to update w_k
  }

  // Method to reset the system
  reset() {
    // Initialize the state of the system with random positions
    this.state = this.glsl(
      {
        seed: Math.random() * 1234567,
        FP: `(hash(ivec3(I, int(seed))).xy-0.5)*12.0,0,0`,
      },
      { size: [20, 10], story: 2, format: "rgba32f", tag: "state" }
    );
  }

  // Method to perform a simulation step
  step() {
    // This is the core of the simulation. The shader code calculates forces between particles and updates their positions.
    this.glsl(
      {
        ...this.params,
        FP: `
      vec3 pos = Src(I).xyz;  // Current particle position
      float mu = mu_k*sigma_k;  // Calculate mu
      vec3 R_grad=vec3(0), U_grad=vec3(0);  // Initialize gradient vectors
      float U = peak_f(0.0, mu, sigma_k).x*w_k;  // Calculate U
      for (int y=0; y<ViewSize.y; ++y)  // Loop over all particles
      for (int x=0; x<ViewSize.x; ++x) {
        if (x==I.x && y==I.y) continue;  // Skip self
        vec3 pos1 = Src(ivec2(x, y)).xyz;  // Other particle position
        vec3 dp = pos-pos1;  // Difference vector
        float r = length(dp);  // Distance between particles
        dp /= max(r, 1e-4);  // Normalized difference vector
        if (r<1.0) {
          R_grad -= dp*(1.0-r);  // Calculate R gradient
        }
        vec2 K = peak_f(r, mu, sigma_k)*w_k;  // Calculate K
        U_grad += K.g*dp;  // Accumulate U gradient
        U += K.x;  // Accumulate U
      } 
      vec2 G = peak_f(U, mu_g, sigma_g);  // Calculate G
      pos -= dt*(R_grad*c_rep - G.g*U_grad);  // Update position
      FOut = vec4(pos,0.0);
      `,
      },
      this.state
    );
  }

  // Method to render particles as spots
  renderSpots(target = null, pointR = 0.4) {
    // Rendering particles as Gaussian spots
    this.glsl(
      {
        state: state[0],
        Grid: state[0].size,
        viewR,
        pointR,
        Blend: "d*(1-sa)+s",
        Aspect: "mean",
        VP: `(state(ID.xy).xy + XY*pointR)/viewR,0,1`,
        FP: `exp(-dot(XY,XY)*4.)`,
      },
      target
    );
  }

  // Method to perform a frame of the simulation
  frame(_, params) {
    // Perform several steps of simulation and render the result
    for (let i = 0; i < this.step_n; ++i) {
      this.step();
    }
    this.renderSpots();
  }
}
