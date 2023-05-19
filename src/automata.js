import GUI from "lil-gui";
import SwissGL from "swissgl";
import "./style.css";

// TODO: field, bg and particle color convenience uniforms
// TODO: collision detection using field.w > threshold optional convention

const gui = new GUI();
gui.hide();
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const glsl = SwissGL(canvas);
let instances = [];
let time = 0;
let timeDelta = 0;
function frame(t) {
  timeDelta = t / 1000 - time;
  time = t / 1000;
  requestAnimationFrame(frame);
  instances.forEach((i) => i.frame());
  const sharedFieldInstances = Object.fromEntries(
    instances
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
const mouse = [0.5, 0.5];
let mouseButton = 0;
document.addEventListener("mousemove", (e) => {
  mouse[0] = e.clientX / window.innerWidth;
  mouse[1] = 1 - e.clientY / window.innerHeight;
  mouseButton = e.buttons ? 1 : 0;
});
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
let sharedField;
export class Automata {
  constructor({
    name = "",
    debug = false,
    particleCount = 1024,
    particleSize = 1,
    shareField = true,
    renderParticles = "step(length(XY),.5)",
    renderField = "field(UV).x",
    writeField = "smoothstep(1.0, 0.0, length(XY))",
    writeFieldBlend = BLEND_MODES.ADD,
    renderFieldBlend = BLEND_MODES.ADD,
    renderParticlesBlend = BLEND_MODES.PREMULTIPLIED,
    updateFieldDecay = 0.95,
    updateFieldBlur = 1,
    updateFieldSteps = 1, // TODO: this isn't working quite right
    updateField = `vec2 dp = Src_step()*updateFieldBlur;
    float x=UV.x, y=UV.y;
    float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
    #define S(x,y) (Src(vec2(x,y)))
    // Apply a 3x3 mean filter and decay factor to the field
    FOut = updateFieldDecay*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;`,
    // initialParticles = "FOut = vec4(UV*worldSize,0.,1.);",
    initialParticles = `FOut = vec4(hash(ivec3(I, seed)), 1.0);FOut.xyz *= vec3(worldSize, TAU);`,
    updateParticles = `vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
    FOut.xy += dir * .1;`,
    uniforms = {},
    numSteps = 1,
    wrapParticles = true,
  } = {}) {
    this.index = instances.length;
    this.debug = debug;
    this.name = name || this.index;
    this.uniforms = uniforms;

    const param = (name, value, target = this) => {
      target[name] = value;
      if (debug) this.gui.add(target, name, -1 * value, 4 * value);
    };
    if (debug) {
      this.gui = gui.addFolder(this.name);
      this.gui.add(this, "uniformsToClipboard");
      gui.show();
    }

    param("particleCount", particleCount);
    param("particleSize", particleSize);
    param("numSteps", numSteps);
    param("updateFieldDecay", updateFieldDecay);
    param("updateFieldBlur", updateFieldBlur);
    param("updateFieldSteps", updateFieldSteps);
    Object.entries(this.uniforms).forEach(([key, value]) =>
      param(key, value, this.uniforms)
    );

    this.renderParticles = renderParticles;
    this.renderField = renderField;
    this.writeField = writeField;
    this.wrapParticles = wrapParticles;
    this.initialParticles = initialParticles;
    this.updateParticles = updateParticles;
    this.renderParticlesBlend = renderParticlesBlend;
    this.renderFieldBlend = renderFieldBlend;
    this.writeFieldBlend = writeFieldBlend;
    this.updateField = updateField;
    this.shareField = shareField;
    this.seed = Math.floor(Math.random() * 1000);
    this.standardParticlesVP =
      "VOut.xy = 2.0 * (particles(ID.xy).xy+XY*particleSize)/vec2(ViewSize) - 1.0;";
    instances.push(this);
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
      Blend: this.renderFieldBlend,
      field: this.field[0],
      FP: this.renderField,
    });
    glsl({
      Blend: this.renderParticlesBlend,
      particles: this.particles[0],
      Grid: this.particles[0].size,
      particleSize: this.particleSize,
      VP: this.standardParticlesVP,
      FP: this.renderParticles,
    });
  }
  step(glsl) {
    for (let i = 0; i < this.updateFieldSteps; i++)
      this.field = glsl(
        {
          updateFieldDecay: Math.pow(
            this.updateFieldDecay,
            1 / this.updateFieldSteps
          ),
          updateFieldBlur: this.updateFieldBlur,
          FP: this.updateField,
        },
        {
          story: 2,
          format: "rgba32f",
          tag: `field_${this.name}`,
        }
      );
    this.particles = glsl(
      {
        ...this.uniforms,
        mouse,
        mouseButton,
        time,
        timeDelta,
        seed: this.seed,
        field: this.shareField && sharedField ? sharedField : this.field[0],
        ...Object.fromEntries(
          instances
            .filter((i) => i.field)
            .map((i) => [`field_${i.name}`, i.field[0]])
        ),
        FP: `FOut = Src(I);
      vec2 worldSize = vec2(field_size());
      if (FOut.w == 0.0 || FOut.x>=worldSize.x || FOut.y>=worldSize.y) {
        ${this.initialParticles}
        return;
      }
      ${this.updateParticles}
      ${this.wrapParticles ? "FOut.xy = mod(FOut.xy, worldSize);" : ""}`,
      },
      {
        size: Array(2).fill(Math.ceil(Math.sqrt(this.particleCount))),
        story: 2,
        format: "rgba32f",
        tag: `particles_${this.name}`,
      }
    );
    glsl(
      {
        ...this.uniforms,
        mouse,
        mouseButton,
        time,
        timeDelta,
        seed: this.seed,
        particles: this.particles[0],
        Grid: this.particles[0].size,
        particleSize: this.particleSize,
        Blend: this.writeFieldBlend,
        VP: this.standardParticlesVP,
        FP: this.writeField,
      },
      this.field[0]
    );
  }
}

export class Physarum extends Automata {
  constructor(params) {
    super({
      particleCount: 10000,
      particleSize: 1,
      renderField: "field(UV).x",
      updateParticles: `
  vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
  mat2 R = rot2(radians(senseAng));
  vec2 sense = senseDist*dir;
  #define F(p) field((FOut.xy+(p))/worldSize).x
  float c=F(sense), r=F(R*sense), l=F(sense*R);
  float rotAng = radians(moveAng);
  if (l>c && c>r) {
      FOut.z -= rotAng;
  } else if (r>c && c>l) {
      FOut.z += rotAng;
  } else if (c<=r && c<=l) {
      FOut.z += sign(hash(ivec3(FOut.xyz*5039.)).x-0.5)*rotAng;
  }
  FOut.xy += dir*moveDist;`,
      uniforms: {
        senseDist: 18,
        senseAng: 6,
        moveAng: 45,
        moveDist: 2,
        ...(params.uniforms || {}),
      },
      ...params,
    });
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
