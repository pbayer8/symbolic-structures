import { Automata } from "./automata";
import { glsl } from "./utils";

export class Physarum extends Automata {
  constructor(params) {
    super({
      particleCount: 10000,
      particleSize: 1,
      updateParticles: glsl`
  vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
  mat2 R = rot2(radians(senseAng));
  vec2 sense = senseDist*dir;
  #define F(p) field((FOut.xy+(p))/worldSize)[int(senseChannel)]
  float c=F(sense), r=F(R*sense), l=F(sense*R);
  float rotAng = radians(moveAng);
  if (l>c && c>r) {
      FOut.z -= rotAng;
  } else if (r>c && c>l) {
      FOut.z += rotAng;
  } else if (c<=r && c<=l) {
      FOut.z += sign(hash(ivec3(FOut.xyz*seed)).x-0.5)*rotAng;
  }
  FOut.xy += dir*moveDist;`,
      ...params,
      uniforms: {
        senseDist: 18,
        senseAng: 6,
        senseChannel: 0,
        moveAng: 45,
        moveDist: 1,
        ...(params.uniforms || {}),
      },
    });
  }
}

export const StrangeRings = {
  particleCount: 100000,
  particleSize: 0.2,
  updateFieldDecay: 0.95,
  uniforms: {
    senseDist: 40,
    senseAng: 80,
    moveAng: 25,
    moveDist: 17,
  },
};

export const WobblingLoops = {
  particleCount: 100000,
  particleSize: 0.3,
  updateFieldDecay: 0.95,
  uniforms: {
    senseDist: 7,
    senseAng: 23,
    moveAng: 14,
    moveDist: 2,
  },
};

export const InterestingCells = {
  particleCount: 100000,
  particleSize: 0.2,
  updateFieldDecay: 0.95,
  uniforms: {
    senseDist: 56,
    senseAng: 110,
    moveAng: 13,
    moveDist: 12,
  },
};
export const ArcedBars = {
  particleCount: 100000,
  particleSize: 0.2,
  numSteps: 1,
  updateFieldDecay: 0.95,
  updateFieldBlur: 1,
  updateFieldSteps: 1,
  uniforms: {
    senseDist: 14.112,
    senseAng: 77.22,
    senseChannel: 0,
    moveAng: 104,
    moveDist: 9.72,
  },
};
export const Diatoms = {
  particleCount: 100000,
  particleSize: 0.2,
  numSteps: 1,
  updateFieldDecay: 0.95,
  updateFieldBlur: 1,
  updateFieldSteps: 1,
  uniforms: {
    senseDist: 9.906624,
    senseAng: 62.5482,
    senseChannel: 0,
    moveAng: 118.872,
    moveDist: 16.44624,
  },
};
export const FossilWorms = {
  particleCount: 40000,
  particleSize: 0.5,
  updateFieldDecay: 0.95,
  uniforms: {
    senseDist: 36,
    senseAng: 30,
    moveAng: 30,
    moveDist: 36,
  },
};
export const FossilHoneycomb = {
  particleCount: 100000,
  particleSize: 0.2,
  updateFieldDecay: 0.95,
  uniforms: {
    senseDist: 15,
    senseAng: 70,
    moveAng: 160,
    moveDist: 30,
  },
};
export const Triangles = {
  particleCount: 100000,
  particleSize: 0.2,
  updateFieldDecay: 0.95,
  uniforms: {
    senseDist: 12,
    senseAng: -8,
    moveAng: 237.6,
    moveDist: 6,
  },
};

export const Clovers = {
  particleCount: 100000,
  particleSize: 0.2,
  updateFieldDecay: 0.95,
  uniforms: {
    senseDist: 5.76,
    senseAng: 56.16,
    moveAng: 36.9,
    moveDist: 2.448,
  },
};
