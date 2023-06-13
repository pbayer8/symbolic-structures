import { ParticleLife } from "./particle-life copy";

new ParticleLife({
  particleCount: 1000,
  debug: true,
  particleSize: 3,
  renderParticlesColor: [1, 0, 0, 1],
  uniforms: { beta: 0.04 },
});

new ParticleLife({
  particleCount: 1000,
  debug: true,
  particleSize: 3,
  renderParticlesColor: [0, 1, 0, 1],
  uniforms: {},
});

new ParticleLife({
  particleCount: 1000,
  debug: true,
  particleSize: 3,
  renderParticlesColor: [0, 1, 1, 1],
  uniforms: {},
});

new ParticleLife({
  particleCount: 1000,
  debug: true,
  particleSize: 3,
  renderParticlesColor: [1, 0, 1, 1],
  uniforms: {},
});
