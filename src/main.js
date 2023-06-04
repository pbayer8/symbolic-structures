import { Automata } from "./automata";

// velocity field:
new Automata({
  particleCount: 50000,
  debug: true,
  updateFieldBlur: 1,
  updateFieldDecay: 0.9,
  particleSize: 0.5,
  initialParticles: `FOut = vec4(hash(ivec3(I, seed)).xy,hash(ivec3(seed,I*2)).xy);
    FOut *= vec4(worldSize,2.,2.);
    FOut.zw -= 1.;`,
  updateParticles: `
  vec2 dir = FOut.zw;
  vec4 fieldData = field(FOut.xy/worldSize);
  vec2 fieldDir = fieldData.xy;
  float fieldMag = fieldData.z;
  float updateStrength = fieldMag > explosion ? -updateDir*explosionStrength : updateDir;
  vec2 meanDir = (1.-updateStrength)*dir + updateStrength*fieldDir;
  // meanDir = normalize(meanDir)*min(length(meanDir), 1.);
  meanDir = normalize(meanDir);
  FOut.xy += meanDir*moveDist;
  FOut.zw = meanDir;`,
  writeField: `vec2 dir = particle.zw;
  FOut.xy = dir;
  FOut.z += 1.;`,
  renderField: `vec3 f = field(UV).xyz;
  FOut.xy = abs(f.xy);
  FOut.z = smoothstep(0., explosion/6., f.z);`,
  uniforms: {
    updateDir: 0.1,
    moveDist: 1,
    explosion: 10,
    explosionStrength: 1,
  },
});
