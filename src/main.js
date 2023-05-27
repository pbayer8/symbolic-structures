import { Automata, renderSharedField } from "./automata";

renderSharedField(
  "mix(vec4(1.,0.,0.,1.), vec4(0.,1.,0.,1.), smoothstep(-.01,.01,field(UV).x))"
);

new Automata({
  particleCount: 20000,
  updateFieldDecay: 0.99,
  updateFieldBlur: 1,
  particleSize: 1,
  writeField: `mat2 R = rot2(-particle.z);
    vec2 RXY = R*XY;
    FOut.x = .001* RXY.x * smoothstep(1., 0., length(XY));`,
  updateParticles: `vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
    vec2 pos = FOut.xy;
    // we want to sense the field in all 8 directions
    // then we will align with the strongest absolute field
    // and move towards where the field is 0.
    float maxField = 0.;
    float maxFieldAng = 0.;
    vec2 maxFieldDir = vec2(0.);
    for (float ang = 0.; ang < 2.*PI; ang += PI/4.) {
      dir = vec2(cos(FOut.z+ang), sin(FOut.z+ang));
      vec2 pos2 = pos + dir * senseDist;
      vec4 field = field(pos2);
      float fieldMag = abs(field.x);
      if (fieldMag > maxField) {
        maxField = fieldMag;
        maxFieldAng = FOut.z+ang;
      }
    }
    FOut.z = mix(FOut.z, maxFieldAng-PI, moveAng);
    // measure field left and right of the current direction, if near zero
    // move less, if far from zero, move more
    vec2 leftDir = vec2(cos(FOut.z+PI/2.), sin(FOut.z+PI/2.));
    vec2 rightDir = vec2(cos(FOut.z-PI/2.), sin(FOut.z-PI/2.));
    vec2 leftPos = pos + leftDir * senseDist;
    vec2 rightPos = pos + rightDir * senseDist;
    float leftField = field(leftPos).x;
    float rightField = field(rightPos).x;
    dir = vec2(cos(FOut.z), sin(FOut.z));
    FOut.xy += dir * moveDist * (abs(leftField) + abs(rightField));`,
  renderField: "0.",
  renderParticles: "0.",
  debug: true,
  uniforms: {
    senseDist: 18,
    moveDist: 0.1,
    moveAng: 0.1,
  },
});
