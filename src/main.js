import { Automata, BLEND_MODES, Physarum, Worms } from "./automata";

new Worms({
  debug: true,
  renderParticles: "0.",
  renderField: "field(UV).x*.1,0.,0.,1.",
});

new Physarum({
  debug: true,
  renderField: "0.,field(UV).x,0.,1.",
  renderParticles: "0.",
});
new Automata({
  particleCount: 10,
  particleSize: 5,
  writeField: "vec4(1.0, 1.0, 0.0, 1.0)",
  renderField: "field(UV)",
  renderFieldBlend: BLEND_MODES.PREMULTIPLIED,
});
