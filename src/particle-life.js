import { Automata, DISTRIBUTIONS } from "./automata";
import { glsl } from "./utils";

export class ParticleLife extends Automata {
  static instances = [];
  constructor(params) {
    super({
      particleCount: 50,
      particleSize: 5,
      // renderField: glsl`0.`,
      renderField: glsl`mix(vec4(0.), fieldColor, length(field(UV))/2.)`,
      readOtherParticles: true,
      initialParticlesZW: DISTRIBUTIONS.RANDOM_UNIT,
      updateParticles: () => glsl`
  FOut = Src(I); // current particle
  #define wrap(p) (fract(p+0.5)-0.5)
  vec2 force=vec2(0.); // initialize force vector to 0
  ${ParticleLife.instances
    .map(
      (i, index) => glsl`// Looping through all particles to compute forces
  for (int y=0; y<particles_${i.name}_size().y; ++y)
  for (int x=0; x<particles_${i.name}_size().x; ++x) {
    if (x==I.x && y==I.y) continue; // Skip self
    vec2 data1 = particles_${
      i.name
    }(ivec2(x,y)).xy/(min(worldSize.x,worldSize.y)); // particle to compare with
    vec2 dpos = wrap(data1-(FOut.xy/(min(worldSize.x,worldSize.y)))); // distance vector between particles
    float r = length(dpos); // length of distance vector
    if (r>0.&&r<rMax) {
      float f = 0.;
      if (r<beta) f = r/beta-1.;
      else if (beta<r&&r<1.) f = F[${Math.min(
        Math.round(index),
        3
      )}]*(1.-abs(2.*r-1.-beta)/(1.-beta));
      force += dpos/r*f; // add net force (attraction - repulsion) to the force vector
    }
  }`
    )
    .join("\n")}
  force *= rMax*forceFactor;

  FOut.zw *= friction;
  FOut.zw += force*dt;

  // Compute new velocity and position
  FOut.xy = FOut.xy+FOut.zw;
`,
      ...params,
      uniforms: {
        dt: 0.01,
        friction: 0.94,
        rMax: 0.2,
        beta: 0.01,
        forceFactor: 6,
        F: Array(4)
          .fill()
          .map(() => Math.random() * 2 - 1),
        ...(params.uniforms || {}),
      },
    });
    ParticleLife.instances.push(this);
  }
}
