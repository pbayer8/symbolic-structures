import { Automata, Physarum, Worms } from "./automata";

new Automata({
  particleCount: 10,
  particleSize: 5,
  writeField: "vec4(1.0, 0.0, 0.0, 1.0)",
  renderField: "field(UV)",
});

new Worms({
  debug: true,
  renderParticles:
    "vec4(smoothstep(1.0, 0.5, length(XY)), smoothstep(.5, 0., length(XY)), 0.0, smoothstep(1.0, 0.0, length(XY)))",
});

new Physarum({});
