import { BLEND_MODES, DISTRIBUTIONS } from "./automata";
import { ParticleLife } from "./particle-life";
import { Physarum } from "./physarum";
import { random, randomArray, randomChoice, randomInt } from "./utils";

Array(randomInt(2, 8))
  .fill()
  .forEach(() => {
    random() > 0.5
      ? new ParticleLife({
          particleCount: randomInt(100, 1400),
          particleSize: random(1, 5),
          particleColor: randomArray(4),
          fieldColor: randomArray(4),
          uniforms: {
            dt: random(0.005, 0.01),
            friction: random(0.93, 0.99),
            rMax: random(0.05, 0.5),
            beta: random(0.01, 0.1),
            forceFactor: random(1, 8),
          },
          renderFieldBlend: BLEND_MODES.PREMULTIPLIED,
          renderParticlesBlend: BLEND_MODES.PREMULTIPLIED,
          mouseRadius: random(0, 0.25),
          mouseStrength: random(-0.5, 0.5),
          initialParticlesXY: randomChoice([
            DISTRIBUTIONS.SIN(random(0, 1), random(0, 0.5)),
            DISTRIBUTIONS.CIRCLE(random(0, 1)),
            DISTRIBUTIONS.RANDOM_WORLD,
            DISTRIBUTIONS.DOT_GRID(randomInt(2, 100)),
            DISTRIBUTIONS.VERTICLE_LINE,
            DISTRIBUTIONS.HORIZONTAL_LINE,
            DISTRIBUTIONS.VERTICLE_LINES(randomInt(2, 100)),
            DISTRIBUTIONS.HORIZONTAL_LINES(randomInt(2, 100)),
          ]),
        })
      : new Physarum({
          particleSize: random(0.1, 1),
          particleCount: randomInt(100, 50000),
          fieldColor: randomArray(4),
          particleColor: randomArray(4),
          mouseRadius: random(0, 0.25),
          mouseStrength: random(-0.5, 0.5),
          uniforms: {
            senseDist: random(1, 70),
            senseAng: random(-8, 80),
            moveAng: random(20, 170),
            moveDist: random(1, 30),
          },
          renderFieldBlend: BLEND_MODES.PREMULTIPLIED,
          renderParticlesBlend: BLEND_MODES.PREMULTIPLIED,
          initialParticlesXY: randomChoice([
            DISTRIBUTIONS.SIN(random(0, 1), random(0, 0.5)),
            DISTRIBUTIONS.CIRCLE(random(0, 1)),
            DISTRIBUTIONS.RANDOM_WORLD,
            DISTRIBUTIONS.DOT_GRID(randomInt(2, 100)),
            DISTRIBUTIONS.VERTICLE_LINE,
            DISTRIBUTIONS.HORIZONTAL_LINE,
            DISTRIBUTIONS.VERTICLE_LINES(randomInt(2, 100)),
            DISTRIBUTIONS.HORIZONTAL_LINES(randomInt(2, 100)),
          ]),
        });
  });
