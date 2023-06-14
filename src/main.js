import { DISTRIBUTIONS } from "./automata";
import { ParticleLife } from "./particle-life";
import { Diatoms, Physarum } from "./physarum";

new ParticleLife({
  particleCount: 1000,
  debug: true,
  particleSize: 2,
  particleColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  fieldColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  uniforms: { beta: 0.04 },
  mouseRadius: Math.random() * 0.25,
  mouseStrength: Math.random() - 0.5,
});

new ParticleLife({
  particleCount: 1000,
  debug: true,
  particleSize: 2,
  particleColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  fieldColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  uniforms: {},
  mouseRadius: Math.random() * 0.25,
  mouseStrength: Math.random() - 0.5,
});

new ParticleLife({
  particleCount: 1000,
  debug: true,
  particleSize: 2,
  particleColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  fieldColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  uniforms: {},
  mouseRadius: Math.random() * 0.25,
  mouseStrength: Math.random() - 0.5,
  initialParticlesXY: DISTRIBUTIONS.DOT_GRID(10),
});

new ParticleLife({
  particleCount: 1000,
  debug: true,
  particleSize: 2,
  particleColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  fieldColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  uniforms: {},
  mouseRadius: Math.random() * 0.25,
  mouseStrength: Math.random() - 0.5,
  initialParticlesXY: DISTRIBUTIONS.HORIZONTAL_LINE,
});

new Physarum({
  debug: true,
  particleSize: 1,
  fieldColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  particleColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  mouseRadius: Math.random() * 0.25,
  mouseStrength: Math.random() - 0.5,
  initialParticlesXY: DISTRIBUTIONS.VERTICLE_LINE,
});

new Physarum({
  ...Diatoms,
  debug: true,
  particleColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  fieldColor: [Math.random(), Math.random(), Math.random(), Math.random()],
  mouseRadius: Math.random() * 0.25,
  mouseStrength: Math.random() - 0.5,
  initialParticlesXY: DISTRIBUTIONS.CIRCLE(0.25),
});
