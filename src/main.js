import { ParticleLife } from "./particle-life copy";

new ParticleLife({
  particleCount: 100,
  debug: true,
  particleSize: 5,
  renderParticlesColor: [1, 0, 0, 1],
  uniforms: {
    F: [0.1, 0.1, 0.1, 0.1],
  },
});

// new ParticleLife({
//   particleCount: 100,
//   debug: true,
//   particleSize: 5,
//   renderParticlesColor: [0, 1, 0, 1],
// });
