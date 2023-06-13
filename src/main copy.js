import { Automata } from "./automata";

new Automata({
  debug: true,
  particleCount: 10,
  particleSize: 5,
  renderField: `0.`,
  // numStorysParticles: 3,
  uniforms: {
    // K: 6,
    // F: glsl(
    //   { K: 6, FP: `float(I.x==I.y) + 0.1*float(I.x==(I.y+1)%int(K))` },
    //   { size: [6, 6], format: "r16f", tag: "F" }
    // ),
    dt: 0.02,
    // repulsion: 4,
    friction: Math.pow(0.5, 0.02 / 0.04),
    rMax: 0.3,
    beta: 0.1,
    forceFactor: 10,
  },
  initialParticles: `
  vec2 pos = (hash(ivec3(I, seed)).xy-0.5)*100.0+100.;
  vec2 vel = (hash(ivec3(I, seed)).xy-0.5)*5.; 
  FOut = vec4(pos, vel);`,
  updateParticles: `
  FOut = Src(I); // current particle
  vec2 force=vec2(0.); // initialize force vector to 0
  
  // Looping through all particles to compute forces
  for (int y=0; y<ViewSize.y; ++y)
  for (int x=0; x<ViewSize.x; ++x) {
    if (x==I.x && y==I.y) continue; // Skip self
    vec2 data1 = Src(ivec2(x,y)).xy/worldSize; // particle to compare with
    vec2 dpos = data1-FOut.xy/worldSize; // distance vector between particles
    float r = length(dpos); // length of distance vector
    if (r>0.&&r<rMax) {
      float f = 0.;
      if (r>beta) f = r/beta-1.;
      else if (beta<r&&r<1.) f = 1.-abs(2.*r-1.-beta)/(1.-beta);
      force += dpos/r*f; // add net force (attraction - repulsion) to the force vector
    }
  }
  force *= rMax*forceFactor;

  FOut.zw *= friction;
  FOut.zw += force*dt;

  // Compute new velocity and position
  FOut.xy = FOut.xy+FOut.zw;
  `,
  // updateParticles: `
  // FOut = Src(I); // current particle
  // vec2 force=vec2(0.); // initialize force vector to 0

  // // Looping through all particles to compute forces
  // for (int y=0; y<ViewSize.y; ++y)
  // for (int x=0; x<ViewSize.x; ++x) {
  //   vec4 data1 = Src(ivec2(x,y)); // particle to compare with
  //   vec2 dpos = data1.xy-FOut.xy; // distance vector between particles
  //   float r = length(dpos); // length of distance vector
  //   // if (r>3.0) continue; // Skip if particles are too far
  //   // dpos /= r+1e-8; // normalize distance vector
  //   dpos = normalize(dpos);
  //   float rep = max(1.0-r, 0.0)*repulsion; // compute repulsion
  //   // rep=0.;
  //   // float f = F(ivec2(FOut.w, data1.w)).x; // force between the two particles
  //   float f = 1.; // force between the two particles
  //   float att = f*max(1.0-abs(r-2.0), 0.0); // attraction between the two particles
  //   force += dpos*(att-rep); // add net force (attraction - repulsion) to the force vector
  // }

  // // adding an additional force when touchPos is near
  // // vec2 touchVec = (mouse.xy-FOut.xy);
  // // force += mouse.z*touchVec*exp(-dot(touchVec, touchVec))*50.0;

  // // Compute new velocity and position
  // vec2 vel = (FOut.xy-past(I).xy)*pow(inertia, dt);
  // FOut.xy = FOut.xy+vel+0.5*force*(dt*dt);
  // `,
});

// new Automata({
//   renderParticles: "vec4(particle.xy/1000., 0.0, 1.0)",
//   renderField: "0.",
// });

// new Physarum({
//   debug: true,
// });
