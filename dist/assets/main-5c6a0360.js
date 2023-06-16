var Q=Object.defineProperty;var ee=(i,e,t)=>e in i?Q(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var O=(i,e,t)=>(ee(i,typeof e!="symbol"?e+"":e,t),t);import{m as w}from"./style-71523510.js";import{G as ie,S as te}from"./swissgl-45adad6a.js";let n,se="0.",S=0,z=0;const v=new ie;v.hide();const F=document.createElement("canvas");F.width=window.innerWidth;F.height=window.innerHeight;document.body.appendChild(F);const u=te(F);function R(i){z=i/1e3-S,S=i/1e3,requestAnimationFrame(R),n&&u({field:n,FP:se}),h.instances.forEach(t=>t.frame());const e=Object.fromEntries(h.instances.filter(t=>t.shareField).map(t=>[`field_${t.name}`,t.field[0]]));n=u({Clear:[0,0,0,0],...e,FP:Object.keys(e).map(t=>`${t}(UV)`).join("+")},{format:"rgba32f",tag:"field"})}requestAnimationFrame(R);const c={ADD:"s+d",SUBTRACT:"d-s",TRANSPARENT:"d*(1-sa)+s*sa",PREMULTIPLIED:"d*(1-sa)+s",MAX:"max(s,d)",MIN:"min(s,d)",MULTIPLY:"d*s",REPLACE:"s"},r={RANDOM_WORLD:"hash(ivec3(I, seed)).xy * worldSize",RANDOM_ANGLE:"vec2(hash(ivec3(I, seed)).x * TAU,1.0)",RANDOM_RANGE:"hash(ivec3(I, seed)).xy * 2. - 1.",RANDOM_UNIT:"normalize(hash(ivec3(I, seed)).xy * 2. - 1.)",RANDOM:"hash(ivec3(I, seed)).xy",RANDOM2:"hash(ivec3(seed, I*2)).xy",DOT_GRID:i=>`fract(vec2(I) / ${i}.0) * worldSize`,CIRCLE:i=>`vec2(cos(hash(ivec3(I, seed)).x * TAU), sin(hash(ivec3(I, seed)).x * TAU)) * ${i} * max(worldSize.x,worldSize.y) - worldSize/2.`,VERTICLE_LINE:"vec2(worldSize.x/2., hash(ivec3(I, seed)).x * worldSize.y)",HORIZONTAL_LINE:"vec2(hash(ivec3(I, seed)).x * worldSize.x, worldSize.y/2.)",VERTICLE_LINES:i=>`vec2(
      fract(vec2(I).x / ${i}.0) * worldSize.x, 
      fract(hash(ivec3(I, seed)).y * ${i}.0) * worldSize.y
    )`,HORIZONTAL_LINES:i=>`vec2(
      fract(hash(ivec3(I, seed)).x * ${i}.0) * worldSize.x, 
      fract(vec2(I).y / ${i}.0) * worldSize.y
    )`,ZERO:"vec2(0.)",CONST:(i,e)=>`vec2(${i}, ${e})`,VERTICLE_LINE_AT:i=>`vec2(${i}*worldSize.x, hash(ivec3(I, seed)).x * worldSize.y)`,HORIZONTAL_LINE_AT:i=>`vec2(hash(ivec3(I, seed)).x * worldSize.x, ${i}*worldSize.y)`,SIN:(i,e)=>`vec2(hash(ivec3(I, seed)).x * worldSize.x,   sin(hash(ivec3(I, seed)).x * TAU / ${i}) * ${e} * worldSize.y + worldSize.y/2.)`},o=class{constructor({name:e="",debug:t=!1,particleCount:I=1024,particleSize:E=1,shareField:D=!0,readOtherFields:A=!1,readOtherParticles:L=!1,renderParticles:g="mix(vec4(0.), particleColor, smoothstep(1.0, 0.0, length(XY)))",particleColor:N=[1,1,1,1],renderField:C="mix(vec4(0.), fieldColor, length(field(UV))/2.)",fieldColor:T=[1,1,1,1],writeField:M="smoothstep(1.0, 0.0, length(XY))",writeFieldBlend:_=c.ADD,renderFieldBlend:$=c.ADD,renderParticlesBlend:B=c.PREMULTIPLIED,updateFieldDecay:b=.95,updateFieldBlur:U=1,updateFieldSteps:V=1,updateField:G=`vec2 dp = Src_step()*updateFieldBlur;
    float x=UV.x, y=UV.y;
    float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
    #define S(x,y) (Src(vec2(x,y)))
    // Apply a 3x3 mean filter and decay factor to the field
    FOut = updateFieldDecay*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;`,initialParticlesXY:Z=r.RANDOM_WORLD,initialParticlesZW:j=r.RANDOM_ANGLE,initialField:H="0.",updateParticles:W="",uniforms:X={},numSteps:Y=1,numStorysParticles:q=2,wrapParticles:k=!0,mouseStrength:J=.1,mouseRadius:K=.25}={}){this.instances=o.instances,this.index=o.instances.length,this.debug=t,this.name=e||this.index,this.uniforms=X;const a=(p,d,x=this)=>{x[p]=d,t&&(typeof d=="number"?this.gui.add(x,p,-1*d,8*d):Array.isArray(d)&&this.gui.addColor(x,p))};t&&(this.gui=v.addFolder(this.name),this.gui.add(this,"uniformsToClipboard"),this.gui.add(this,"reset"),v.show()),a("particleCount",I),a("particleSize",E),a("numSteps",Y),a("updateFieldDecay",b),a("updateFieldBlur",U),a("updateFieldSteps",V),a("particleColor",N),a("fieldColor",T),a("mouseStrength",J),a("mouseRadius",K),Object.entries(this.uniforms).forEach(([p,d])=>a(p,d,this.uniforms)),this.renderParticles=g,this.renderField=C,this.writeField=M,this.readOtherFields=A,this.readOtherParticles=L,this.wrapParticles=k,this.initialParticlesXY=Z,this.initialParticlesZW=j,this.initialField=H,this.updateParticles=W,this.renderParticlesBlend=B,this.renderFieldBlend=$,this.numStorysParticles=q,this.writeFieldBlend=_,this.updateField=G,this.shareField=D,this.seed=Math.floor(Math.random()*1e3),this.standardParticlesVP=`
      particle = particles(ID.xy);
      VOut.xy = 2.0 * (particles(ID.xy).xy+XY*particleSize)/vec2(ViewSize) - 1.0;`,this.reset(),o.instances.push(this)}uniformsToClipboard(){const e=JSON.stringify({particleCount:this.particleCount,particleSize:this.particleSize,numSteps:this.numSteps,updateFieldDecay:this.updateFieldDecay,updateFieldBlur:this.updateFieldBlur,updateFieldSteps:this.updateFieldSteps,uniforms:this.uniforms});navigator.clipboard.writeText(e)}frame(){for(let e=0;e<this.numSteps;e++)this.step(u);this.render(u)}render(e){e({fieldColor:this.fieldColor,Blend:this.renderFieldBlend,field:this.field[0],FP:this.renderField,...this.uniforms}),e({particleColor:this.particleColor,Blend:this.renderParticlesBlend,particles:this.particles[0],Grid:this.particles[0].size,particleSize:this.particleSize,Inc:"varying vec4 particle;",VP:this.standardParticlesVP,FP:this.renderParticles})}reset(){this.field=u({FP:this.initialField},{story:2,format:"rgba32f",tag:`field_${this.name}`});for(let e=0;e<this.numStorysParticles;e++)this.particles=u({seed:this.seed,field:this.shareField&&n?n:this.field[0],FP:`vec2 worldSize = vec2(field_size());
          FOut = vec4(${this.initialParticlesXY}, ${this.initialParticlesZW});`},{size:Array(2).fill(Math.ceil(Math.sqrt(this.particleCount))),story:this.numStorysParticles,format:"rgba32f",tag:`particles_${this.name}`})}step(e){for(let t=0;t<this.updateFieldSteps;t++)e({updateFieldDecay:Math.pow(this.updateFieldDecay,1/this.updateFieldSteps),updateFieldBlur:this.updateFieldBlur,FP:this.updateField},this.field);e({...this.uniforms,mouse:w,time:S,timeDelta:z,mouseStrength:this.mouseStrength,mouseRadius:this.mouseRadius,...this.numStorysParticles>2?{past:this.particles[1]}:{},seed:this.seed,field:this.shareField&&n?n:this.field[0],...this.readOtherFields?Object.fromEntries(o.instances.filter(t=>t.field).map(t=>[`field_${t.name}`,t.field[0]])):{},...this.readOtherParticles?Object.fromEntries(o.instances.filter(t=>t.particles).map(t=>[`particles_${t.name}`,t.particles[0]])):{},FP:`FOut = Src(I);
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
      ${this.wrapParticles?"FOut.xy = mod(FOut.xy, worldSize);":""}`},this.particles),e({...this.uniforms,mouse:w,time:S,timeDelta:z,seed:this.seed,mouseStrength:this.mouseStrength,particles:this.particles[0],Grid:this.particles[0].size,particleSize:this.particleSize,Blend:this.writeFieldBlend,Inc:"varying vec4 particle;",VP:this.standardParticlesVP,FP:this.writeField},this.field[0])}};let h=o;O(h,"instances",[]);const y=class extends h{constructor(e){super({particleCount:50,particleSize:5,renderField:"mix(vec4(0.), fieldColor, length(field(UV))/2.)",readOtherParticles:!0,initialParticlesZW:r.RANDOM_UNIT,updateParticles:()=>`
  FOut = Src(I); // current particle
  #define wrap(p) (fract(p+0.5)-0.5)
  vec2 force=vec2(0.); // initialize force vector to 0
  ${y.instances.map((t,I)=>`// Looping through all particles to compute forces
  for (int y=0; y<particles_${t.name}_size().y; ++y)
  for (int x=0; x<particles_${t.name}_size().x; ++x) {
    if (x==I.x && y==I.y) continue; // Skip self
    vec2 data1 = particles_${t.name}(ivec2(x,y)).xy/(min(worldSize.x,worldSize.y)); // particle to compare with
    vec2 dpos = wrap(data1-(FOut.xy/(min(worldSize.x,worldSize.y)))); // distance vector between particles
    float r = length(dpos); // length of distance vector
    if (r>0.&&r<rMax) {
      float f = 0.;
      if (r<beta) f = r/beta-1.;
      else if (beta<r&&r<1.) f = F[${Math.min(Math.round(I),3)}]*(1.-abs(2.*r-1.-beta)/(1.-beta));
      force += dpos/r*f; // add net force (attraction - repulsion) to the force vector
    }
  }`).join(`
`)}
  force *= rMax*forceFactor;

  FOut.zw *= friction;
  FOut.zw += force*dt;

  // Compute new velocity and position
  FOut.xy = FOut.xy+FOut.zw;
  `,...e,uniforms:{dt:.01,friction:.94,rMax:.2,beta:.01,forceFactor:6,F:Array(4).fill().map(()=>Math.random()*2-1),...e.uniforms||{}}}),y.instances.push(this)}};let m=y;O(m,"instances",[]);class re extends h{constructor(e){super({particleCount:1e4,particleSize:1,updateParticles:`
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
  FOut.xy += dir*moveDist;`,...e,uniforms:{senseDist:18,senseAng:6,senseChannel:0,moveAng:45,moveDist:1,...e.uniforms||{}}})}}const s=(i=0,e=1)=>Math.random()*(e-i)+i,l=(i,e)=>Math.floor(s(i,e)),P=i=>i[l(0,i.length)],f=(i,e=0,t=1)=>Array(i).fill().map(()=>s(e,t));Array(l(2,8)).fill().forEach(()=>{s()>.5?new m({particleCount:l(100,1400),particleSize:s(1,5),particleColor:f(4),fieldColor:f(4),uniforms:{dt:s(.005,.01),friction:s(.93,.99),rMax:s(.05,.5),beta:s(.01,.1),forceFactor:s(1,8)},renderFieldBlend:c.PREMULTIPLIED,renderParticlesBlend:c.PREMULTIPLIED,mouseRadius:s(0,.25),mouseStrength:s(-.5,.5),initialParticlesXY:P([r.SIN(s(0,1),s(0,.5)),r.CIRCLE(s(0,1)),r.RANDOM_WORLD,r.DOT_GRID(l(2,100)),r.VERTICLE_LINE,r.HORIZONTAL_LINE,r.VERTICLE_LINES(l(2,100)),r.HORIZONTAL_LINES(l(2,100))])}):new re({particleSize:s(.1,1),particleCount:l(100,5e4),fieldColor:f(4),particleColor:f(4),mouseRadius:s(0,.25),mouseStrength:s(-.5,.5),uniforms:{senseDist:s(1,70),senseAng:s(-8,80),moveAng:s(20,170),moveDist:s(1,30)},renderFieldBlend:c.PREMULTIPLIED,renderParticlesBlend:c.PREMULTIPLIED,initialParticlesXY:P([r.SIN(s(0,1),s(0,.5)),r.CIRCLE(s(0,1)),r.RANDOM_WORLD,r.DOT_GRID(l(2,100)),r.VERTICLE_LINE,r.HORIZONTAL_LINE,r.VERTICLE_LINES(l(2,100)),r.HORIZONTAL_LINES(l(2,100))])})});
