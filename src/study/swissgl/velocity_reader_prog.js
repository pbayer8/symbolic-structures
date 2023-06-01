import { Automata } from "../../automata";

new Automata({
  particleCount: 12000,
  debug: true,
  updateFieldBlur: 1,
  updateFieldDecay: 0.9,
  particleSize: 1,
  updateParticles: `vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
  vec2 fieldDir = field(FOut.xy/worldSize).xy;
  // if field is too strong, turn away from it
  float updateDir2 = smoothstep(0., .05, length(fieldDir))-.5;
  vec2 meanDir = length(fieldDir)>0. ? (1.-updateDir2)*dir + updateDir2*fieldDir : dir;
  meanDir = normalize(meanDir);
  float newAng = atan(meanDir.y, meanDir.x);
  FOut.xy += meanDir*moveDist;
  FOut.z = newAng;`,
  writeField: `vec2 dir = vec2(cos(particle.z), sin(particle.z));
  FOut.xy = dir;`,
  uniforms: {
    // senseDist: 18,
    updateDir: 0.05,
    moveDist: 1,
  },
});
