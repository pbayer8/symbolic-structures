import { Physarum, Worms } from "./automata";

new Worms({
  debug: true,
  renderParticlesColor: [Math.random(), Math.random(), Math.random(), 1],
  renderFieldColor: [Math.random(), Math.random(), Math.random(), 1],
});

new Physarum({
  debug: true,
  renderParticlesColor: [Math.random(), Math.random(), Math.random(), 1],
  renderFieldColor: [Math.random(), Math.random(), Math.random(), 1],
});
// new Automata({
//   particleCount: 10,
//   particleSize: 5,
//   writeField: "vec4(1.0, 1.0, 0.0, 1.0)",
//   renderFieldBlend: BLEND_MODES.PREMULTIPLIED,
// });
