import { BLEND_MODES, DISTRIBUTIONS, renderSharedField } from "../automata";
import { decodeObjectFromUrl, encodeObjectInUrl } from "../encoding";
import { ParticleLife } from "../particle-life";
import { Physarum } from "../physarum";
import "../refresh-button";
import { glsl, random, randomArray, randomChoice, randomInt } from "../utils";

const whiteLength = Math.sqrt(3);
const bgColor = randomArray(4, 0, 0.1);
const bgLength = Math.sqrt(bgColor.slice(0, 3).reduce((a, b) => a + b * b, 0));
const numSpecies = randomInt(3, 8);
const blendMode =
  bgLength < whiteLength / 3
    ? BLEND_MODES.ADD
    : bgLength < (2 * whiteLength) / 3
    ? BLEND_MODES.PREMULTIPLIED
    : BLEND_MODES.SUBTRACT;
const species = {
  life: () => ({
    type: "life",
    uniforms: {
      dt: random(0.005, 0.02),
      friction: random(0.7, 0.99),
      rMax: random(0.05, 0.5),
      beta: random(0.01, 0.1),
      forceFactor: random(0.5, 8),
    },
    particleSize: random(1, 5),
    particleCount: randomInt(100, 1400),
  }),
  physarum: () => ({
    type: "physarum",
    uniforms: {
      senseDist: random(1, 70),
      senseAng: random(-8, 80),
      moveAng: random(20, 170),
      moveDist: random(1, 30),
    },
    particleSize: random(0.1, 1),
    particleCount: randomInt(5000, 80000),
  }),
  shared: () => ({
    particleColor: randomArray(4, 0, 1 / numSpecies),
    fieldColor: randomArray(4, 0, 1 / numSpecies),
    renderFieldBlend: blendMode,
    renderParticlesBlend: BLEND_MODES.ADD,
    mouseRadius: random(0, 0.5),
    mouseStrength: random(-0.5, 0.5),
    initialParticlesXY: randomChoice([
      DISTRIBUTIONS.SIN(random(0, 1), random(0, 0.5)),
      DISTRIBUTIONS.CIRCLE(random(0, 1)),
      DISTRIBUTIONS.RANDOM_WORLD,
      DISTRIBUTIONS.DOT_GRID(randomInt(2, 20)),
      DISTRIBUTIONS.VERTICLE_LINE,
      DISTRIBUTIONS.HORIZONTAL_LINE,
      DISTRIBUTIONS.VERTICLE_LINES(randomInt(2, 20)),
      DISTRIBUTIONS.HORIZONTAL_LINES(randomInt(2, 20)),
    ]),
  }),
};
const params = {
  bgColor,
  bgLength,
  numSpecies,
  blendMode,
  species: Array(numSpecies)
    .fill()
    .map(() => ({
      ...species.shared(),
      ...(random() > 0.5 ? species.life() : species.physarum()),
    })),
  ...decodeObjectFromUrl(),
};

encodeObjectInUrl(params);

renderSharedField(params.bgColor.join(","));

params.species.forEach((specimen) =>
  specimen.type === "life"
    ? new ParticleLife({
        ...specimen,
        renderParticles: glsl`
    vec2 velocity = particle.zw;
    float angle = atan(velocity.x, velocity.y);
    vec2 XYS = XY;
    XYS = vec2(cos(angle)*XYS.x-sin(angle)*XYS.y, sin(angle)*XYS.x+cos(angle)*XYS.y);          
    XYS *= vec2(1.+length(particle.zw)*5.,1.);
    FOut = mix(vec4(0.), particleColor, smoothstep(1.0, 0.2, length(XYS)));
    `,
      })
    : new Physarum({ ...params.sharedProps, ...specimen })
);
