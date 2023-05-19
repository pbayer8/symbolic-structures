import SwissGL from "swissgl";
import "./style.css";
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const glsl = SwissGL(canvas);
let instances = [];
function frame(t) {
  requestAnimationFrame(frame);
  instances.forEach((i) => i.frame());
}
requestAnimationFrame(frame);

const BLEND_MODES = {
  ADD: "s+d",
  SUBTRACT: "d-s",
  TRANSPARENT: "d*(1-sa)+s*sa",
  PREMULTIPLIED: "d*(1-sa)+s",
  MAX: "max(s,d)",
  MIN: "min(s,d)",
  MULTIPLY: "d*s",
};
class Automata {
  constructor({
    pointCount = 1024,
    pointSize = 1,
    renderPoint = "step(length(XY),.5)",
    renderField = "field(UV).x",
    writeField = "smoothstep(1.0, 0.0, length(XY))",
    writeFieldBlend = BLEND_MODES.ADD,
    renderFieldBlend = BLEND_MODES.ADD,
    renderPointBlend = BLEND_MODES.PREMULTIPLIED,
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
    updateParticlesUniforms = {},
    numSteps = 1,
    wrapParticles = true,
  } = {}) {
    this.index = instances.length;
    this.sqrtPointCount = Math.ceil(Math.sqrt(pointCount));
    this.pointSize = pointSize;
    this.renderPoint = renderPoint;
    this.renderField = renderField;
    this.writeField = writeField;
    this.numSteps = numSteps;
    this.wrapParticles = wrapParticles;
    this.initialParticles = initialParticles;
    this.updateParticles = updateParticles;
    this.updateParticlesUniforms = updateParticlesUniforms;
    this.updateFieldDecay = Math.pow(updateFieldDecay, 1 / updateFieldSteps);
    this.updateFieldBlur = updateFieldBlur;
    this.updateFieldSteps = updateFieldSteps;
    this.renderPointBlend = renderPointBlend;
    this.renderFieldBlend = renderFieldBlend;
    this.writeFieldBlend = writeFieldBlend;
    this.updateField = updateField;
    this.seed = Math.floor(Math.random() * 1000);
    this.standardPointVP =
      "VOut.xy = 2.0 * (points(ID.xy).xy+XY*pointSize)/vec2(ViewSize) - 1.0;";
    instances.push(this);
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
      Blend: this.renderPointBlend,
      points: this.points[0],
      Grid: this.points[0].size,
      pointSize: this.pointSize,
      VP: this.standardPointVP,
      FP: this.renderPoint,
    });
  }
  step(glsl) {
    for (let i = 0; i < this.updateFieldSteps; i++)
      this.field = glsl(
        {
          updateFieldDecay: this.updateFieldDecay,
          updateFieldBlur: this.updateFieldBlur,
          FP: this.updateField,
        },
        { story: 2, format: "rgba32f", tag: `field_${this.index}` }
      );
    this.points = glsl(
      {
        ...this.updateParticlesUniforms,
        field: this.field[0],
        seed: this.seed,
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
        size: [this.sqrtPointCount, this.sqrtPointCount],
        story: 2,
        format: "rgba32f",
        tag: `points_${this.index}`,
      }
    );
    glsl(
      {
        points: this.points[0],
        Grid: this.points[0].size,
        pointSize: this.pointSize,
        Blend: this.writeFieldBlend,
        VP: this.standardPointVP,
        FP: this.writeField,
      },
      this.field[0]
    );
  }
}

new Automata({
  pointCount: 10000,
  pointSize: 1,
  renderField: "field(UV).x",
  updateParticles: `
  vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
  // Rotate the sensor angle and create a rotation matrix
  mat2 R = rot2(radians(senseAng));
  // Calculate the sensor positions
  vec2 sense = senseDist*dir;
  // Macro to sample the field at the given position
  #define F(p) field((FOut.xy+(p))/worldSize).x
  // Sample the field at the sensor positions
  float c=F(sense), r=F(R*sense), l=F(sense*R);
  // Calculate the rotation angle in radians
  float rotAng = radians(moveAng);
  // Update the particle direction based on the sensor readings
  if (l>c && c>r) {
      FOut.z -= rotAng;
  } else if (r>c && c>l) {
      FOut.z += rotAng;
  } else if (c<=r && c<=l) {
      FOut.z += sign(hash(ivec3(FOut.xyz*5039.)).x-0.5)*rotAng;
  }
  // Update the particle position based on the direction and movement distance
  FOut.xy += dir*moveDist;`,
  updateParticlesUniforms: {
    senseDist: 18,
    senseAng: 6,
    moveAng: 45,
    moveDist: 2,
  },
});
