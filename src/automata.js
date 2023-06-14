import GUI from "lil-gui";
import SwissGL from "swissgl";
import { mouse } from "./mouse";
import "./style.css";

// TODO: collision detection using field.w > threshold optional convention
// TODO: particle lenia
// TODO: particles in force field
// TODO: gravity

let sharedField;
let _renderSharedField = "0.";
let time = 0;
let timeDelta = 0;

const gui = new GUI();
gui.hide();

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
export const glsl = SwissGL(canvas);

export const renderSharedField = (v) => (_renderSharedField = v);

function frame(t) {
  timeDelta = t / 1000 - time;
  time = t / 1000;
  requestAnimationFrame(frame);
  if (sharedField)
    glsl({
      field: sharedField,
      FP: _renderSharedField,
    });
  Automata.instances.forEach((i) => i.frame());
  const sharedFieldInstances = Object.fromEntries(
    Automata.instances
      .filter((i) => i.shareField)
      .map((i) => [`field_${i.name}`, i.field[0]])
  );
  sharedField = glsl(
    {
      Clear: [0, 0, 0, 0],
      ...sharedFieldInstances,
      FP: Object.keys(sharedFieldInstances)
        .map((k) => `${k}(UV)`)
        .join("+"),
    },
    { format: "rgba32f", tag: "field" }
  );
}
requestAnimationFrame(frame);

export const BLEND_MODES = {
  ADD: "s+d",
  SUBTRACT: "d-s",
  TRANSPARENT: "d*(1-sa)+s*sa",
  PREMULTIPLIED: "d*(1-sa)+s",
  MAX: "max(s,d)",
  MIN: "min(s,d)",
  MULTIPLY: "d*s",
  REPLACE: "s",
};

export const DISTRIBUTIONS = {
  RANDOM_WORLD: `hash(ivec3(I, seed)).xy * worldSize`,
  RANDOM_ANGLE: `vec2(hash(ivec3(I, seed)).x * TAU,1.0)`,
  RANDOM_RANGE: `hash(ivec3(I, seed)).xy * 2. - 1.`,
  RANDOM_UNIT: `normalize(hash(ivec3(I, seed)).xy * 2. - 1.)`,
  RANDOM: `hash(ivec3(I, seed)).xy`,
  RANDOM2: `hash(ivec3(seed, I*2)).xy`,
  DOT_GRID: (count) => `fract(vec2(I) / ${count}.0) * worldSize`,
  CIRCLE: (radius) =>
    `vec2(cos(hash(ivec3(I, seed)).x * TAU), sin(hash(ivec3(I, seed)).x * TAU)) * ${radius} * max(worldSize.x,worldSize.y) - worldSize/2.`,
  VERTICLE_LINE: `vec2(worldSize.x/2., hash(ivec3(I, seed)).x * worldSize.y)`,
  HORIZONTAL_LINE: `vec2(hash(ivec3(I, seed)).x * worldSize.x, worldSize.y/2.)`,
  VERTICLE_LINES: (count) =>
    `vec2(fract(vec2(I).x / ${count}.0) * worldSize.x, fract(hash(ivec3(I, seed)).xy * ${count}.0) * worldSize.y)`,
  HORIZONTAL_LINES: (count) =>
    `vec2(fract(hash(ivec3(I, seed)).xy * ${count}.0) * worldSize.x, fract(vec2(I).x / ${count}.0) * worldSize.y)`,
  ZERO: `vec2(0.)`,
  CONST: (x, y) => `vec2(${x}, ${y})`,
  VERTICLE_LINE_AT: (x) =>
    `vec2(${x}*worldSize.x, hash(ivec3(I, seed)).x * worldSize.y)`,
  HORIZONTAL_LINE_AT: (y) =>
    `vec2(hash(ivec3(I, seed)).x * worldSize.x, ${y}*worldSize.y)`,
  SIN: (period, radius) =>
    `vec2(hash(ivec3(I, seed)).x * worldSize.x,   sin(hash(ivec3(I, seed)).x * TAU / ${period}) * ${radius} * worldSize.y + worldSize.y/2.)`,
};

export class Automata {
  static instances = [];
  constructor({
    name = "",
    debug = false,
    particleCount = 1024,
    particleSize = 1,
    shareField = true,
    readOtherFields = false,
    readOtherParticles = false,
    renderParticles = "mix(vec4(0.), particleColor, smoothstep(1.0, 0.0, length(XY)))",
    particleColor = [1, 1, 1, 1],
    renderField = "mix(vec4(0.), fieldColor, length(field(UV))/2.)",
    fieldColor = [1, 1, 1, 1],
    writeField = "smoothstep(1.0, 0.0, length(XY))",
    writeFieldBlend = BLEND_MODES.ADD,
    renderFieldBlend = BLEND_MODES.ADD,
    renderParticlesBlend = BLEND_MODES.PREMULTIPLIED,
    updateFieldDecay = 0.95,
    updateFieldBlur = 1,
    updateFieldSteps = 1,
    updateField = `vec2 dp = Src_step()*updateFieldBlur;
    float x=UV.x, y=UV.y;
    float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
    #define S(x,y) (Src(vec2(x,y)))
    // Apply a 3x3 mean filter and decay factor to the field
    FOut = updateFieldDecay*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;`,
    initialParticlesXY = DISTRIBUTIONS.RANDOM_WORLD,
    initialParticlesZW = DISTRIBUTIONS.RANDOM_ANGLE,
    initialField = "0.",
    updateParticles = ``,
    uniforms = {},
    numSteps = 1,
    numStorysParticles = 2,
    wrapParticles = true,
    mouseStrength = 0.1,
    mouseRadius = 0.25,
  } = {}) {
    this.instances = Automata.instances;
    this.index = Automata.instances.length;
    this.debug = debug;
    this.name = name || this.index;
    this.uniforms = uniforms;

    const param = (name, value, target = this) => {
      target[name] = value;
      if (debug) {
        if (typeof value === "number")
          this.gui.add(target, name, -1 * value, 8 * value);
        else if (Array.isArray(value)) {
          this.gui.addColor(target, name);
        }
      }
    };
    if (debug) {
      this.gui = gui.addFolder(this.name);
      this.gui.add(this, "uniformsToClipboard");
      this.gui.add(this, "reset");
      gui.show();
    }

    param("particleCount", particleCount);
    param("particleSize", particleSize);
    param("numSteps", numSteps);
    param("updateFieldDecay", updateFieldDecay);
    param("updateFieldBlur", updateFieldBlur);
    param("updateFieldSteps", updateFieldSteps);
    param("particleColor", particleColor);
    param("fieldColor", fieldColor);
    param("mouseStrength", mouseStrength);
    param("mouseRadius", mouseRadius);
    Object.entries(this.uniforms).forEach(([key, value]) =>
      param(key, value, this.uniforms)
    );
    this.renderParticles = renderParticles;
    this.renderField = renderField;
    this.writeField = writeField;
    this.readOtherFields = readOtherFields;
    this.readOtherParticles = readOtherParticles;
    this.wrapParticles = wrapParticles;
    this.initialParticlesXY = initialParticlesXY;
    this.initialParticlesZW = initialParticlesZW;
    this.initialField = initialField;
    this.updateParticles = updateParticles;
    this.renderParticlesBlend = renderParticlesBlend;
    this.renderFieldBlend = renderFieldBlend;
    this.numStorysParticles = numStorysParticles;
    this.writeFieldBlend = writeFieldBlend;
    this.updateField = updateField;
    this.shareField = shareField;
    this.seed = Math.floor(Math.random() * 1000);
    this.standardParticlesVP = `
      particle = particles(ID.xy);
      VOut.xy = 2.0 * (particles(ID.xy).xy+XY*particleSize)/vec2(ViewSize) - 1.0;`;
    this.reset();
    Automata.instances.push(this);
  }
  uniformsToClipboard() {
    const json = JSON.stringify({
      particleCount: this.particleCount,
      particleSize: this.particleSize,
      numSteps: this.numSteps,
      updateFieldDecay: this.updateFieldDecay,
      updateFieldBlur: this.updateFieldBlur,
      updateFieldSteps: this.updateFieldSteps,
      uniforms: this.uniforms,
    });
    navigator.clipboard.writeText(json);
  }
  frame() {
    for (let i = 0; i < this.numSteps; i++) this.step(glsl);
    this.render(glsl);
  }
  render(glsl) {
    glsl({
      fieldColor: this.fieldColor,
      Blend: this.renderFieldBlend,
      field: this.field[0],
      FP: this.renderField,
      ...this.uniforms,
    });
    glsl({
      particleColor: this.particleColor,
      Blend: this.renderParticlesBlend,
      particles: this.particles[0],
      Grid: this.particles[0].size,
      particleSize: this.particleSize,
      Inc: "varying vec4 particle;",
      VP: this.standardParticlesVP,
      FP: this.renderParticles,
    });
  }
  reset() {
    this.field = glsl(
      {
        FP: this.initialField,
      },
      {
        story: 2,
        format: "rgba32f",
        tag: `field_${this.name}`,
      }
    );
    for (let i = 0; i < this.numStorysParticles; i++)
      this.particles = glsl(
        {
          seed: this.seed,
          field: this.shareField && sharedField ? sharedField : this.field[0],
          FP: `vec2 worldSize = vec2(field_size());
          FOut = vec4(${this.initialParticlesXY}, ${this.initialParticlesZW});`,
        },
        {
          size: Array(2).fill(Math.ceil(Math.sqrt(this.particleCount))),
          story: this.numStorysParticles,
          format: "rgba32f",
          tag: `particles_${this.name}`,
        }
      );
  }
  step(glsl) {
    for (let i = 0; i < this.updateFieldSteps; i++)
      glsl(
        {
          updateFieldDecay: Math.pow(
            this.updateFieldDecay,
            1 / this.updateFieldSteps
          ),
          updateFieldBlur: this.updateFieldBlur,
          FP: this.updateField,
        },
        this.field
      );
    glsl(
      {
        ...this.uniforms,
        mouse,
        time,
        timeDelta,
        mouseStrength: this.mouseStrength,
        mouseRadius: this.mouseRadius,
        ...(this.numStorysParticles > 2 ? { past: this.particles[1] } : {}),
        seed: this.seed,
        field: this.shareField && sharedField ? sharedField : this.field[0],
        ...(this.readOtherFields
          ? Object.fromEntries(
              Automata.instances
                .filter((i) => i.field)
                .map((i) => [`field_${i.name}`, i.field[0]])
            )
          : {}),
        ...(this.readOtherParticles
          ? Object.fromEntries(
              Automata.instances
                .filter((i) => i.particles)
                .map((i) => [`particles_${i.name}`, i.particles[0]])
            )
          : {}),
        FP: `FOut = Src(I);
      vec2 worldSize = vec2(field_size());
      ${
        typeof this.updateParticles === "function"
          ? this.updateParticles()
          : this.updateParticles
      }
      vec2 mousePos = mouse.xy;
      float aspectRatio = worldSize.x/worldSize.y;
      vec2 aspectMult = aspectRatio > 1. ? vec2(aspectRatio, 1.) : vec2(1., 1./aspectRatio);
      float mouseDist = length(mousePos*worldSize - FOut.xy);
      mouseDist = min(mouseDist, length((mousePos+worldSize)*worldSize - FOut.xy));
      mouseDist = min(mouseDist, length((mousePos-worldSize)*worldSize - FOut.xy));
      float strength = mouse.z * smoothstep(mouseRadius, 0., mouseDist/max(worldSize.x, worldSize.y));
      FOut.xy += mouseStrength * strength * (mousePos*worldSize - FOut.xy);
      ${this.wrapParticles ? "FOut.xy = mod(FOut.xy, worldSize);" : ""}`,
      },
      this.particles
    );
    glsl(
      {
        ...this.uniforms,
        mouse,
        time,
        timeDelta,
        seed: this.seed,
        mouseStrength: this.mouseStrength,
        particles: this.particles[0],
        Grid: this.particles[0].size,
        particleSize: this.particleSize,
        Blend: this.writeFieldBlend,
        Inc: "varying vec4 particle;",
        VP: this.standardParticlesVP,
        FP: this.writeField,
      },
      this.field[0]
    );
  }
}

export class Worms extends Automata {
  constructor(params) {
    super({
      particleCount: 6000,
      updateFieldBlur: 0,
      updateFieldDecay: 0.99,
      particleSize: 1,
      updateParticles: `vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
    vec2 pos = FOut.xy;
    vec2 pos2 = pos + dir * senseDist;
    vec4 field = field(pos2);
    if (field.x > 0.1) {
      FOut.z += PI * field.x * turnSpeed; 
    }
    FOut.xy += dir * moveDist;`,
      uniforms: {
        senseDist: 2,
        turnSpeed: 1,
        moveDist: 1,
        ...(params.uniforms || {}),
      },
      ...params,
    });
  }
}

export class StrangeWorms extends Automata {
  constructor(params) {
    super({
      particleCount: 2000,
      updateFieldBlur: 0,
      updateFieldDecay: 0.95,
      particleSize: 3,
      updateParticles: `vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
    vec2 pos = FOut.xy;
    vec2 pos2 = pos + dir * senseDist;
    vec4 field = field(pos2);
    if (field.x > 0.1) {
      FOut.z += PI * field.x * turnSpeed * sin(time); 
    }
    FOut.xy += dir * moveDist * sin(pos.x*.01+time*1.7);`,
      uniforms: {
        senseDist: 2,
        turnSpeed: 0.2,
        moveDist: 2,
        ...(params.uniforms || {}),
      },
      ...params,
    });
  }
}

export class velocityField extends Automata {
  constructor(params) {
    super({
      particleCount: 50000,
      updateFieldBlur: 1,
      updateFieldDecay: 0.9,
      particleSize: 0.5,
      initialParticlesZW: DISTRIBUTIONS.RANDOM_UNIT,
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
        updateDir: 0.03,
        moveDist: 1,
        explosion: 10,
        explosionStrength: 1,
        ...(params.uniforms || {}),
      },
      ...params,
    });
  }
}
