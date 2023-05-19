import { Automata, Physarum } from "./automata";

// new Worms({
//   debug: true,
//   renderParticlesColor: [Math.random(), Math.random(), Math.random(), 1],
//   renderFieldColor: [Math.random(), Math.random(), Math.random(), 1],
// });

// renderSharedField(
//   "mix(vec4(1.,0.,0.,1.), vec4(0.,1.,0.,1.), smoothstep(-1.,1.,field(UV).x))"
// );

new Physarum({
  debug: true,
  particleSize: 5,
  writeField: "smoothstep(1.0, 0.0, length(XY))*vec4(1.,-1.,0.,1.)",
  renderParticlesColor: [Math.random(), Math.random(), Math.random(), 1],
  renderFieldColor: [1, 0, 0, 1],
  uniforms: { senseChannel: 1 },
});
new Physarum({
  debug: true,
  particleSize: 5,
  writeField: "smoothstep(1.0, 0.0, length(XY))*vec4(-1.,1.,0.,1.)",
  renderParticlesColor: [Math.random(), Math.random(), Math.random(), 1],
  renderFieldColor: [0, 1, 0, 1],
});
new Automata({
  particleCount: 10,
  particleSize: 10,
});
