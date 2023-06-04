/** @license
 * Copyright 2023 Google LLC.
 * SPDX-License-Identifier: Apache-2.0
 */

// This is a model for reaction-diffusion system,
// a mathematical model which calculates how concentrations
// of one or more substances distributed in space change under the influence of
// two processes: local chemical reactions and diffusion.
class ReactionDiffusion {
  static Tags = ["2d", "simulation"];

  constructor(glsl, gui) {
    this.glsl = glsl; // The WebGL helper
    this.step_n = 1; // Number of simulation steps per frame
    gui.add(this, "reset"); // GUI control for resetting the simulation
    gui.add(this, "step_n", 0, 20, 1); // GUI control for the number of simulation steps per frame
    this.reset(); // Initialize the system
  }

  // Reset the state of the system
  reset() {
    // Create a new texture with the initial state of the system
    this.state = this.glsl(
      { FP: `1.0, exp(-400.0*dot(XY,XY))*hash(I.xyx).x, 0, 0` },
      { size: [256, 256], format: "rgba32f", story: 2, tag: "state" }
    );
  }

  // Perform a simulation step
  step() {
    // GLSL code here calculates the reaction and diffusion, and updates the state of the system
    this.glsl(
      {
        FP: `
          vec2 v = Src(I).xyz;  // Current state
          {
              ivec2 D=Src_size();  // Size of the texture
              #define S(x,y) Src(ivec2(x,y)).xy            
              int x=I.x, y=I.y, l=(x-1+D.x)%D.x, r=(x+1)%D.x, u=(y-1+D.y)%D.y, d=(y+1)%D.y;
              // Calculate the average state in the neighborhood
              vec2 blur = v/4.0 + (S(l,y)+S(r,y)+S(x,u)+S(x,d))/8.0 + (S(l,u)+S(r,u)+S(l,d)+S(r,d))/16.0;
              // Mix the current state and the average state
              v = mix(v, blur, vec2(1.0, 0.5));
          }
          // The reaction part of the reaction-diffusion
          const float k=0.05684, f=0.02542;
          float r = v.x*v.y*v.y;
          // Update the state
          FOut.xy = v + vec2(-r+f*(1.0-v.x), r-(f+k)*v.y);
          `,
      },
      this.state
    );
  }

  // Render a frame of the simulation
  frame(glsl, params) {
    const { state } = this;
    for (let i = 0; i < this.step_n; ++i) this.step(); // Perform simulation steps

    const [x, y, _] = params.pointer; // The current pointer position
    const s = 2.0 / Math.min(...params.canvasSize); // The scale factor
    const touchPos = [x * s, y * s]; // The current touch position in the texture
    const Inc = `
      vec2 state2screen(vec2 v) {
          return vec2((1.0-v.x)*2.0,v.y*4.0+0.1)-1.0;  // Convert from texture coordinates to screen coordinates
      }`;

    // Render a histogram of the state
    const hist = glsl(
      {
        state: state[0],
        Grid: state[0].size,
        Blend: "s+d",
        Clear: 0,
        Inc,
        VP: `
      vec2 v = state(ID.xy).xy;
      VOut.xy = state2screen(v) + XY*0.006;  // The vertex position
      `,
        FP: `exp(-dot(XY,XY)*4.0)`,
      }, // The fragment value
      { size: [512, 512], format: "rgba16f", tag: "hist", wrap: "edge" }
    );

    // Render the current state
    glsl({
      state: state[0],
      hist,
      Aspect: "fit",
      touchPos,
      Inc,
      FP: `
      vec2 v = state(UV).xy;
      FOut = vec4(sqrt(v.y));  // The fragment value

      float h = sqrt(hist(UV).x);  // The histogram value
      FOut.rgb = mix(FOut.rgb, h*vec3(1,0.3,0.05), min(h, 0.8));  // Mix the fragment value and the histogram value

      float r = length(state2screen(v)-touchPos)*20.0;  // The distance from the current state to the touch position
      float s = length(XY-touchPos)*20.0;  // The distance from the current fragment to the touch position
      FOut.g += exp(-r*r) + exp(-s*s);`,
    }); // Update the green channel based on the distances
  }
}
