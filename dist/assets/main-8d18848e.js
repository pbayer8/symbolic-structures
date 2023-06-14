import "./style-9feaaabd.js";
import { S as $, G as _ } from "./swissgl-45adad6a.js";
let a,
  j = "0.",
  l = [],
  n = 0,
  f = 0,
  m = 0;
const o = [0.5, 0.5],
  F = new _();
F.hide();
const h = document.createElement("canvas");
h.width = window.innerWidth;
h.height = window.innerHeight;
document.body.appendChild(h);
const c = $(h);
function y(r) {
  (f = r / 1e3 - n),
    (n = r / 1e3),
    requestAnimationFrame(y),
    a && c({ field: a, FP: j }),
    l.forEach((e) => e.frame());
  const i = Object.fromEntries(
    l.filter((e) => e.shareField).map((e) => [`field_${e.name}`, e.field[0]])
  );
  a = c(
    {
      Clear: [0, 0, 0, 0],
      ...i,
      FP: Object.keys(i)
        .map((e) => `${e}(UV)`)
        .join("+"),
    },
    { format: "rgba32f", tag: "field" }
  );
}
requestAnimationFrame(y);
document.addEventListener("mousemove", (r) => {
  (o[0] = r.clientX / window.innerWidth),
    (o[1] = 1 - r.clientY / window.innerHeight),
    (m = r.buttons ? 1 : 0);
});
const p = {
  ADD: "s+d",
  SUBTRACT: "d-s",
  TRANSPARENT: "d*(1-sa)+s*sa",
  PREMULTIPLIED: "d*(1-sa)+s",
  MAX: "max(s,d)",
  MIN: "min(s,d)",
  MULTIPLY: "d*s",
  REPLACE: "s",
};
class R {
  constructor({
    name: i = "",
    debug: e = !1,
    particleCount: S = 1024,
    particleSize: P = 1,
    shareField: D = !0,
    renderParticles:
      w = "mix(vec4(0.), particleColor, smoothstep(1.0, 0.0, length(XY)))",
    particleColor: x = [1, 1, 1, 1],
    renderField: z = "mix(vec4(0.), fieldColor, length(field(UV))/2.)",
    fieldColor: O = [1, 1, 1, 1],
    writeField: v = "smoothstep(1.0, 0.0, length(XY))",
    writeFieldBlend: g = p.ADD,
    renderFieldBlend: C = p.ADD,
    renderParticlesBlend: A = p.PREMULTIPLIED,
    updateFieldDecay: B = 0.95,
    updateFieldBlur: E = 1,
    updateFieldSteps: I = 1,
    updateField: b = `vec2 dp = Src_step()*updateFieldBlur;
    float x=UV.x, y=UV.y;
    float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
    #define S(x,y) (Src(vec2(x,y)))
    // Apply a 3x3 mean filter and decay factor to the field
    FOut = updateFieldDecay*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;`,
    initialParticles:
      T = "FOut = vec4(hash(ivec3(I, seed)), 1.0);FOut.xyz *= vec3(worldSize, TAU);",
    updateParticles: M = `vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
    FOut.xy += dir * .1;`,
    uniforms: U = {},
    numSteps: V = 1,
    wrapParticles: L = !0,
  } = {}) {
    (this.index = l.length),
      (this.debug = e),
      (this.name = i || this.index),
      (this.uniforms = U);
    const t = (d, s, u = this) => {
      (u[d] = s),
        e &&
          (typeof s == "number"
            ? this.gui.add(u, d, -1 * s, 4 * s)
            : Array.isArray(s) && this.gui.addColor(u, d));
    };
    e &&
      ((this.gui = F.addFolder(this.name)),
      this.gui.add(this, "uniformsToClipboard"),
      F.show()),
      t("particleCount", S),
      t("particleSize", P),
      t("numSteps", V),
      t("updateFieldDecay", B),
      t("updateFieldBlur", E),
      t("updateFieldSteps", I),
      t("particleColor", x),
      t("fieldColor", O),
      Object.entries(this.uniforms).forEach(([d, s]) => t(d, s, this.uniforms)),
      (this.renderParticles = w),
      (this.renderField = z),
      (this.writeField = v),
      (this.wrapParticles = L),
      (this.initialParticles = T),
      (this.updateParticles = M),
      (this.renderParticlesBlend = A),
      (this.renderFieldBlend = C),
      (this.writeFieldBlend = g),
      (this.updateField = b),
      (this.shareField = D),
      (this.seed = Math.floor(Math.random() * 1e3)),
      (this.standardParticlesVP = `
      particle = particles(ID.xy);
      VOut.xy = 2.0 * (particles(ID.xy).xy+XY*particleSize)/vec2(ViewSize) - 1.0;`),
      l.push(this);
  }
  uniformsToClipboard() {
    const i = JSON.stringify({
      particleCount: this.particleCount,
      particleSize: this.particleSize,
      numSteps: this.numSteps,
      updateFieldDecay: this.updateFieldDecay,
      updateFieldBlur: this.updateFieldBlur,
      updateFieldSteps: this.updateFieldSteps,
      uniforms: this.uniforms,
    });
    navigator.clipboard.writeText(i);
  }
  frame() {
    for (let i = 0; i < this.numSteps; i++) this.step(c);
    this.render(c);
  }
  render(i) {
    i({
      fieldColor: this.fieldColor,
      Blend: this.renderFieldBlend,
      field: this.field[0],
      FP: this.renderField,
    }),
      i({
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
  step(i) {
    for (let e = 0; e < this.updateFieldSteps; e++)
      this.field = i(
        {
          updateFieldDecay: Math.pow(
            this.updateFieldDecay,
            1 / this.updateFieldSteps
          ),
          updateFieldBlur: this.updateFieldBlur,
          FP: this.updateField,
        },
        { story: 2, format: "rgba32f", tag: `field_${this.name}` }
      );
    (this.particles = i(
      {
        ...this.uniforms,
        mouse: o,
        mouseButton: m,
        time: n,
        timeDelta: f,
        seed: this.seed,
        field: this.shareField && a ? a : this.field[0],
        ...Object.fromEntries(
          l.filter((e) => e.field).map((e) => [`field_${e.name}`, e.field[0]])
        ),
        FP: `FOut = Src(I);
      vec2 worldSize = vec2(field_size());
      if (FOut.w == 0.0 || FOut.x>=worldSize.x || FOut.y>=worldSize.y) {
        ${this.initialParticles}
        return;
      }
      ${this.updateParticles}
      ${this.wrapParticles ? "FOut.xy = mod(FOut.xy, worldSize);" : ""}
       FOut.z = mod(FOut.z, TAU);`,
      },
      {
        size: Array(2).fill(Math.ceil(Math.sqrt(this.particleCount))),
        story: 2,
        format: "rgba32f",
        tag: `particles_${this.name}`,
      }
    )),
      i(
        {
          ...this.uniforms,
          mouse: o,
          mouseButton: m,
          time: n,
          timeDelta: f,
          seed: this.seed,
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
new R({
  particleCount: 12e3,
  debug: !0,
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
  uniforms: { updateDir: 0.05, moveDist: 1 },
});
