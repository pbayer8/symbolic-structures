var J=Object.defineProperty;var K=(i,e,t)=>e in i?J(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var m=(i,e,t)=>(K(i,typeof e!="symbol"?e+"":e,t),t);import{G as Q,S as ee}from"./swissgl-45adad6a.js";import{m as v}from"./style-71523510.js";let l,w="0.",n=0,F=0;const x=new Q;x.hide();const u=document.createElement("canvas");u.width=window.innerWidth;u.height=window.innerHeight;document.body.appendChild(u);const o=ee(u),ae=i=>w=i;function O(i){F=i/1e3-n,n=i/1e3,requestAnimationFrame(O),l&&o({field:l,FP:w}),d.instances.forEach(t=>t.frame());const e=Object.fromEntries(d.instances.filter(t=>t.shareField).map(t=>[`field_${t.name}`,t.field[0]]));l=o({Clear:[0,0,0,0],...e,FP:Object.keys(e).map(t=>`${t}(UV)`).join("+")},{format:"rgba32f",tag:"field"})}requestAnimationFrame(O);const S={ADD:"s+d",SUBTRACT:"d-s",TRANSPARENT:"d*(1-sa)+s*sa",PREMULTIPLIED:"d*(1-sa)+s",MAX:"max(s,d)",MIN:"min(s,d)",MULTIPLY:"d*s",REPLACE:"s"},z={RANDOM_WORLD:"hash(ivec3(I, seed)).xy * worldSize",RANDOM_ANGLE:"vec2(hash(ivec3(I, seed)).x * TAU,1.0)",RANDOM_RANGE:"hash(ivec3(I, seed)).xy * 2. - 1.",RANDOM_UNIT:"normalize(hash(ivec3(I, seed)).xy * 2. - 1.)",RANDOM:"hash(ivec3(I, seed)).xy",RANDOM2:"hash(ivec3(seed, I*2)).xy",DOT_GRID:i=>`fract(vec2(I) / ${i}.0) * worldSize`,CIRCLE:i=>`vec2(cos(hash(ivec3(I, seed)).x * TAU), sin(hash(ivec3(I, seed)).x * TAU)) * ${i} * max(worldSize.x,worldSize.y) - worldSize/2.`,VERTICLE_LINE:"vec2(worldSize.x/2., hash(ivec3(I, seed)).x * worldSize.y)",HORIZONTAL_LINE:"vec2(hash(ivec3(I, seed)).x * worldSize.x, worldSize.y/2.)",VERTICLE_LINES:i=>`vec2(
      fract(vec2(I).x / ${i}.0) * worldSize.x, 
      fract(hash(ivec3(I, seed)).y * ${i}.0) * worldSize.y
    )`,HORIZONTAL_LINES:i=>`vec2(
      fract(hash(ivec3(I, seed)).x * ${i}.0) * worldSize.x, 
      fract(vec2(I).y / ${i}.0) * worldSize.y
    )`,ZERO:"vec2(0.)",CONST:(i,e)=>`vec2(${i}, ${e})`,VERTICLE_LINE_AT:i=>`vec2(${i}*worldSize.x, hash(ivec3(I, seed)).x * worldSize.y)`,HORIZONTAL_LINE_AT:i=>`vec2(hash(ivec3(I, seed)).x * worldSize.x, ${i}*worldSize.y)`,SIN:(i,e)=>`vec2(hash(ivec3(I, seed)).x * worldSize.x,   sin(hash(ivec3(I, seed)).x * TAU / ${i}) * ${e} * worldSize.y + worldSize.y/2.)`},a=class{constructor({name:e="",debug:t=!1,particleCount:p=1024,particleSize:P=1,shareField:A=!0,readOtherFields:D=!1,readOtherParticles:g=!1,renderParticles:R="mix(vec4(0.), particleColor, smoothstep(1.0, 0.0, length(XY)))",particleColor:C=[1,1,1,1],renderField:E="mix(vec4(0.), fieldColor, length(field(UV))/2.)",fieldColor:N=[1,1,1,1],writeField:M="smoothstep(1.0, 0.0, length(XY))",writeFieldBlend:T=S.ADD,renderFieldBlend:$=S.ADD,renderParticlesBlend:L=S.PREMULTIPLIED,updateFieldDecay:_=.95,updateFieldBlur:b=1,updateFieldSteps:B=1,updateField:U=`vec2 dp = Src_step()*updateFieldBlur;
    float x=UV.x, y=UV.y;
    float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
    #define S(x,y) (Src(vec2(x,y)))
    // Apply a 3x3 mean filter and decay factor to the field
    FOut = updateFieldDecay*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;`,initialParticlesXY:V=z.RANDOM_WORLD,initialParticlesZW:G=z.RANDOM_ANGLE,initialField:j="0.",updateParticles:Z="",uniforms:W={},numSteps:X=1,numStorysParticles:Y=2,wrapParticles:H=!0,mouseStrength:q=.1,mouseRadius:k=.25}={}){this.instances=a.instances,this.index=a.instances.length,this.debug=t,this.name=e||this.index,this.uniforms=W;const s=(c,r,f=this)=>{f[c]=r,t&&(typeof r=="number"?this.gui.add(f,c,-1*r,8*r):Array.isArray(r)&&this.gui.addColor(f,c))};t&&(this.gui=x.addFolder(this.name),this.gui.add(this,"uniformsToClipboard"),this.gui.add(this,"reset"),x.show()),s("particleCount",p),s("particleSize",P),s("numSteps",X),s("updateFieldDecay",_),s("updateFieldBlur",b),s("updateFieldSteps",B),s("particleColor",C),s("fieldColor",N),s("mouseStrength",q),s("mouseRadius",k),Object.entries(this.uniforms).forEach(([c,r])=>s(c,r,this.uniforms)),this.renderParticles=R,this.renderField=E,this.writeField=M,this.readOtherFields=D,this.readOtherParticles=g,this.wrapParticles=H,this.initialParticlesXY=V,this.initialParticlesZW=G,this.initialField=j,this.updateParticles=Z,this.renderParticlesBlend=L,this.renderFieldBlend=$,this.numStorysParticles=Y,this.writeFieldBlend=T,this.updateField=U,this.shareField=A,this.seed=Math.floor(Math.random()*1e3),this.standardParticlesVP=`
      particle = particles(ID.xy);
      VOut.xy = 2.0 * (particles(ID.xy).xy+XY*particleSize)/vec2(ViewSize) - 1.0;`,this.reset(),a.instances.push(this)}uniformsToClipboard(){const e=JSON.stringify({particleCount:this.particleCount,particleSize:this.particleSize,numSteps:this.numSteps,updateFieldDecay:this.updateFieldDecay,updateFieldBlur:this.updateFieldBlur,updateFieldSteps:this.updateFieldSteps,uniforms:this.uniforms});navigator.clipboard.writeText(e)}frame(){for(let e=0;e<this.numSteps;e++)this.step(o);this.render(o)}render(e){e({fieldColor:this.fieldColor,Blend:this.renderFieldBlend,field:this.field[0],FP:this.renderField,...this.uniforms}),e({particleColor:this.particleColor,Blend:this.renderParticlesBlend,particles:this.particles[0],Grid:this.particles[0].size,particleSize:this.particleSize,Inc:"varying vec4 particle;",VP:this.standardParticlesVP,FP:this.renderParticles})}reset(){this.field=o({FP:this.initialField},{story:2,format:"rgba32f",tag:`field_${this.name}`});for(let e=0;e<this.numStorysParticles;e++)this.particles=o({seed:this.seed,field:this.shareField&&l?l:this.field[0],FP:`vec2 worldSize = vec2(field_size());
          FOut = vec4(${this.initialParticlesXY}, ${this.initialParticlesZW});`},{size:Array(2).fill(Math.ceil(Math.sqrt(this.particleCount))),story:this.numStorysParticles,format:"rgba32f",tag:`particles_${this.name}`})}step(e){for(let t=0;t<this.updateFieldSteps;t++)e({updateFieldDecay:Math.pow(this.updateFieldDecay,1/this.updateFieldSteps),updateFieldBlur:this.updateFieldBlur,FP:this.updateField},this.field);e({...this.uniforms,mouse:v,time:n,timeDelta:F,mouseStrength:this.mouseStrength,mouseRadius:this.mouseRadius,...this.numStorysParticles>2?{past:this.particles[1]}:{},seed:this.seed,field:this.shareField&&l?l:this.field[0],...this.readOtherFields?Object.fromEntries(a.instances.filter(t=>t.field).map(t=>[`field_${t.name}`,t.field[0]])):{},...this.readOtherParticles?Object.fromEntries(a.instances.filter(t=>t.particles).map(t=>[`particles_${t.name}`,t.particles[0]])):{},FP:`FOut = Src(I);
      vec2 worldSize = vec2(field_size());
      ${typeof this.updateParticles=="function"?this.updateParticles():this.updateParticles}
      vec2 mousePos = mouse.xy;
      float aspectRatio = worldSize.x/worldSize.y;
      vec2 aspectMult = aspectRatio > 1. ? vec2(aspectRatio, 1.) : vec2(1., 1./aspectRatio);
      float mouseDist = length(mousePos*worldSize - FOut.xy);
      mouseDist = min(mouseDist, length((mousePos+worldSize)*worldSize - FOut.xy));
      mouseDist = min(mouseDist, length((mousePos-worldSize)*worldSize - FOut.xy));
      float strength = mouse.z * smoothstep(mouseRadius, 0., mouseDist/max(worldSize.x, worldSize.y));
      FOut.xy += mouseStrength * strength * (mousePos*worldSize - FOut.xy);
      ${this.wrapParticles?"FOut.xy = mod(FOut.xy, worldSize);":""}`},this.particles),e({...this.uniforms,mouse:v,time:n,timeDelta:F,seed:this.seed,mouseStrength:this.mouseStrength,particles:this.particles[0],Grid:this.particles[0].size,particleSize:this.particleSize,Blend:this.writeFieldBlend,Inc:"varying vec4 particle;",VP:this.standardParticlesVP,FP:this.writeField},this.field[0])}};let d=a;m(d,"instances",[]);const h=class extends d{constructor(e){super({particleCount:50,particleSize:5,renderField:"mix(vec4(0.), fieldColor, length(field(UV))/2.)",readOtherParticles:!0,initialParticlesZW:z.RANDOM_UNIT,updateParticles:()=>`
  FOut = Src(I); // current particle
  #define wrap(p) (fract(p+0.5)-0.5)
  vec2 force=vec2(0.); // initialize force vector to 0
  ${h.instances.map((t,p)=>`// Looping through all particles to compute forces
  for (int y=0; y<particles_${t.name}_size().y; ++y)
  for (int x=0; x<particles_${t.name}_size().x; ++x) {
    if (x==I.x && y==I.y) continue; // Skip self
    vec2 data1 = particles_${t.name}(ivec2(x,y)).xy/(min(worldSize.x,worldSize.y)); // particle to compare with
    vec2 dpos = wrap(data1-(FOut.xy/(min(worldSize.x,worldSize.y)))); // distance vector between particles
    float r = length(dpos); // length of distance vector
    if (r>0.&&r<rMax) {
      float f = 0.;
      if (r<beta) f = r/beta-1.;
      else if (beta<r&&r<1.) f = F[${Math.min(Math.round(p),3)}]*(1.-abs(2.*r-1.-beta)/(1.-beta));
      force += dpos/r*f; // add net force (attraction - repulsion) to the force vector
    }
  }`).join(`
`)}
  force *= rMax*forceFactor;

  FOut.zw *= friction;
  FOut.zw += force*dt;

  // Compute new velocity and position
  FOut.xy = FOut.xy+FOut.zw;
  `,...e,uniforms:{dt:.01,friction:.94,rMax:.2,beta:.01,forceFactor:6,F:Array(4).fill().map(()=>Math.random()*2-1),...e.uniforms||{}}}),h.instances.push(this)}};let y=h;m(y,"instances",[]);class le extends d{constructor(e){super({particleCount:1e4,particleSize:1,updateParticles:`
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
  FOut.xy += dir*moveDist;`,...e,uniforms:{senseDist:18,senseAng:6,senseChannel:0,moveAng:45,moveDist:1,...e.uniforms||{}}})}}const I=(i=0,e=1)=>Math.random()*(e-i)+i,ie=(i,e)=>Math.floor(I(i,e)),de=i=>i[ie(0,i.length)],oe=(i,e=0,t=1)=>Array(i).fill().map(()=>I(e,t));export{S as B,z as D,y as P,I as a,oe as b,de as c,le as d,ae as e,ie as r};
