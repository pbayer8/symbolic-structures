import { Automata } from "./automata";

// velocity field:
new Automata({
  particleCount: 50000,
  debug: true,
  updateFieldBlur: 1,
  updateFieldDecay: 0.9,
  particleSize: 0.5,
  updateParticles: `vec2 dir = vec2(cos(FOut.z), sin(FOut.z))*friction;
  vec3 fieldData = field(FOut.xy/worldSize).xyz;
  vec2 fieldDir = fieldData.xy;
  float fieldMag = fieldData.z;
  // if field mag is greater than explosion, updatedir moves negative
  // float updateStrength = updateDir*(smoothstep(explosion, 0., fieldMag)-.5);
  float updateStrength = fieldMag > explosion ? -updateDir*explosionStrength : updateDir;
  vec2 meanDir = (1.-updateStrength)*dir + updateStrength*fieldDir;
  meanDir = normalize(meanDir);
  float newAng = atan(meanDir.y, meanDir.x);
  FOut.xy += meanDir*moveDist;
  // FOut.xy += dir;
  FOut.z = newAng;`,
  writeField: `vec2 dir = vec2(cos(particle.z), sin(particle.z));
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
    friction: 0.5,
  },
});
