var J=Object.defineProperty;var K=(t,e,i)=>e in t?J(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[e]=i;var F=(t,e,i)=>(K(t,typeof e!="symbol"?e+"":e,i),i);import{G as Q}from"./lil-gui.esm-b4f18ba3.js";import{S as ee}from"./swissgl-a59cd27d.js";import{g as s,m as x}from"./utils-59f65cc7.js";let d,v="0.",h=0,f=0;const S=new Q;S.hide();const p=document.createElement("canvas");p.width=window.innerWidth;p.height=window.innerHeight;document.body.appendChild(p);const o=ee(p),ae=t=>v=t;function w(t){f=t/1e3-h,h=t/1e3,requestAnimationFrame(w),d&&o({field:d,FP:v}),n.instances.forEach(i=>i.frame());const e=Object.fromEntries(n.instances.filter(i=>i.shareField).map(i=>[`field_${i.name}`,i.field[0]]));d=o({Clear:[0,0,0,0],...e,FP:Object.keys(e).map(i=>`${i}(UV)`).join("+")},{format:"rgba32f",tag:"field"})}requestAnimationFrame(w);const m={ADD:"s+d",SUBTRACT:"d-s",TRANSPARENT:"d*(1-sa)+s*sa",PREMULTIPLIED:"d*(1-sa)+s",MAX:"max(s,d)",MIN:"min(s,d)",MULTIPLY:"d*s",REPLACE:"s"},z={RANDOM_WORLD:s`hash(ivec3(I, seed)).xy * worldSize`,RANDOM_ANGLE:s`vec2(hash(ivec3(I, seed)).x * TAU,1.0)`,RANDOM_RANGE:s`hash(ivec3(I, seed)).xy * 2. - 1.`,RANDOM_UNIT:s`normalize(hash(ivec3(I, seed)).xy * 2. - 1.)`,RANDOM:s`hash(ivec3(I, seed)).xy`,RANDOM2:s`hash(ivec3(seed, I*2)).xy`,DOT_GRID:t=>s`fract(vec2(I) / ${t}.0) * worldSize`,CIRCLE:t=>s`vec2(cos(hash(ivec3(I, seed)).x * TAU), sin(hash(ivec3(I, seed)).x * TAU)) * ${t} * max(worldSize.x,worldSize.y) - worldSize/2.`,VERTICLE_LINE:s`vec2(worldSize.x/2., hash(ivec3(I, seed)).x * worldSize.y)`,HORIZONTAL_LINE:s`vec2(hash(ivec3(I, seed)).x * worldSize.x, worldSize.y/2.)`,VERTICLE_LINES:t=>s`vec2(
      fract(vec2(I).x / ${t}.0) * worldSize.x, 
      fract(hash(ivec3(I, seed)).y * ${t}.0) * worldSize.y
    )`,HORIZONTAL_LINES:t=>s`vec2(
      fract(hash(ivec3(I, seed)).x * ${t}.0) * worldSize.x, 
      fract(vec2(I).y / ${t}.0) * worldSize.y
    )`,ZERO:s`vec2(0.)`,CONST:(t,e)=>s`vec2(${t}, ${e})`,VERTICLE_LINE_AT:t=>s`vec2(${t}*worldSize.x, hash(ivec3(I, seed)).x * worldSize.y)`,HORIZONTAL_LINE_AT:t=>s`vec2(hash(ivec3(I, seed)).x * worldSize.x, ${t}*worldSize.y)`,SIN:(t,e)=>s`vec2(hash(ivec3(I, seed)).x * worldSize.x,   sin(hash(ivec3(I, seed)).x * TAU / ${t}) * ${e} * worldSize.y + worldSize.y/2.)`},l=class{constructor({name:e="",debug:i=!1,particleCount:I=1024,particleSize:O=1,shareField:g=!0,readOtherFields:A=!1,readOtherParticles:D=!1,renderParticles:C=s`mix(vec4(0.), particleColor, smoothstep(1.0, 0.0, length(XY)))`,particleColor:R=[1,1,1,1],renderField:E=s`mix(vec4(0.), fieldColor, length(field(UV))/2.)`,fieldColor:N=[1,1,1,1],writeField:T=s`smoothstep(1.0, 0.0, length(XY))`,writeFieldBlend:L=m.ADD,renderFieldBlend:$=m.ADD,renderParticlesBlend:M=m.PREMULTIPLIED,updateFieldDecay:_=.95,updateFieldBlur:b=1,updateFieldSteps:B=1,updateField:U=s`vec2 dp = Src_step()*updateFieldBlur;
    float x=UV.x, y=UV.y;
    float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
    #define S(x,y) (Src(vec2(x,y)))
    // Apply a 3x3 mean filter and decay factor to the field
    FOut = updateFieldDecay*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;`,initialParticlesXY:V=z.RANDOM_WORLD,initialParticlesZW:G=z.RANDOM_ANGLE,initialField:j="0.",updateParticles:X="",uniforms:Y={},numSteps:Z=1,numStorysParticles:H=2,wrapParticles:W=!0,mouseStrength:k=.1,mouseRadius:q=.25}={}){this.instances=l.instances,this.index=l.instances.length,this.debug=i,this.name=e||this.index,this.uniforms=Y;const r=(c,a,u=this)=>{u[c]=a,i&&(typeof a=="number"?this.gui.add(u,c,-1*a,8*a):Array.isArray(a)&&this.gui.addColor(u,c))};i&&(this.gui=S.addFolder(this.name),this.gui.add(this,"uniformsToClipboard"),this.gui.add(this,"reset"),S.show()),r("particleCount",I),r("particleSize",O),r("numSteps",Z),r("updateFieldDecay",_),r("updateFieldBlur",b),r("updateFieldSteps",B),r("particleColor",R),r("fieldColor",N),r("mouseStrength",k),r("mouseRadius",q),Object.entries(this.uniforms).forEach(([c,a])=>r(c,a,this.uniforms)),this.renderParticles=C,this.renderField=E,this.writeField=T,this.readOtherFields=A,this.readOtherParticles=D,this.wrapParticles=W,this.initialParticlesXY=V,this.initialParticlesZW=G,this.initialField=j,this.updateParticles=X,this.renderParticlesBlend=M,this.renderFieldBlend=$,this.numStorysParticles=H,this.writeFieldBlend=L,this.updateField=U,this.shareField=g,this.seed=Math.floor(Math.random()*1e3),this.standardParticlesVP=s`
      particle = particles(ID.xy);
      VOut.xy = 2.0 * (particles(ID.xy).xy+XY*particleSize)/vec2(ViewSize) - 1.0;`,this.reset(),l.instances.push(this)}uniformsToClipboard(){const e=JSON.stringify({particleCount:this.particleCount,particleSize:this.particleSize,numSteps:this.numSteps,updateFieldDecay:this.updateFieldDecay,updateFieldBlur:this.updateFieldBlur,updateFieldSteps:this.updateFieldSteps,uniforms:this.uniforms});navigator.clipboard.writeText(e)}frame(){for(let e=0;e<this.numSteps;e++)this.step(o);this.render(o)}render(e){e({...Array.isArray(this.fieldColor)?{fieldColor:this.fieldColor}:{},Blend:this.renderFieldBlend,field:this.field[0],FP:typeof this.fieldColor=="string"?this.renderField.replaceAll("fieldColor",this.fieldColor):this.renderField,...this.uniforms}),e({...Array.isArray(this.particleColor)?{particleColor:this.particleColor}:{},Blend:this.renderParticlesBlend,particles:this.particles[0],Grid:this.particles[0].size,particleSize:this.particleSize,Inc:"varying vec4 particle;",VP:this.standardParticlesVP,FP:typeof this.particleColor=="string"?this.renderParticles.replaceAll("particleColor",this.particleColor):this.renderParticles})}reset(){this.field=o({FP:this.initialField},{story:2,format:"rgba32f",tag:s`field_${this.name}`});for(let e=0;e<this.numStorysParticles;e++)this.particles=o({seed:this.seed,field:this.shareField&&d?d:this.field[0],FP:s`vec2 worldSize = vec2(field_size());
          FOut = vec4(${this.initialParticlesXY}, ${this.initialParticlesZW});`},{size:Array(2).fill(Math.ceil(Math.sqrt(this.particleCount))),story:this.numStorysParticles,format:"rgba32f",tag:s`particles_${this.name}`})}step(e){for(let i=0;i<this.updateFieldSteps;i++)e({updateFieldDecay:Math.pow(this.updateFieldDecay,1/this.updateFieldSteps),updateFieldBlur:this.updateFieldBlur,FP:this.updateField},this.field);e({...this.uniforms,mouse:x,time:h,timeDelta:f,mouseStrength:this.mouseStrength,mouseRadius:this.mouseRadius,...this.numStorysParticles>2?{past:this.particles[1]}:{},seed:this.seed,field:this.shareField&&d?d:this.field[0],...this.readOtherFields?Object.fromEntries(l.instances.filter(i=>i.field).map(i=>[`field_${i.name}`,i.field[0]])):{},...this.readOtherParticles?Object.fromEntries(l.instances.filter(i=>i.particles).map(i=>[`particles_${i.name}`,i.particles[0]])):{},FP:s`FOut = Src(I);
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
      ${this.wrapParticles?"FOut.xy = mod(FOut.xy, worldSize);":""}`},this.particles),e({...this.uniforms,mouse:x,time:h,timeDelta:f,seed:this.seed,mouseStrength:this.mouseStrength,particles:this.particles[0],Grid:this.particles[0].size,particleSize:this.particleSize,Blend:this.writeFieldBlend,Inc:"varying vec4 particle;",VP:this.standardParticlesVP,FP:this.writeField},this.field[0])}};let n=l;F(n,"instances",[]);class le extends n{constructor(e){super({particleCount:1e4,particleSize:1,updateParticles:s`
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
  FOut.xy += dir*moveDist;`,...e,uniforms:{senseDist:18,senseAng:6,senseChannel:0,moveAng:45,moveDist:1,...e.uniforms||{}}})}}const de={particleCount:1e5,particleSize:.2,updateFieldDecay:.95,uniforms:{senseDist:5.76,senseAng:56.16,moveAng:36.9,moveDist:2.448}},P=document.createElement("style");P.innerHTML=`
  #refresh {
    position: fixed;
    --size: 0.75rem;
    top: var(--size);
    right: var(--size);
    width: var(--size);
    height: var(--size);
    padding: 0;
    margin: 0;
    border-radius: 9999px;
    border: 1px solid #fff;
    background: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }`;document.head.appendChild(P);const y=document.createElement("button");y.id="refresh";y.onclick=function(){window.location=window.location.pathname};document.body.appendChild(y);export{n as A,m as B,de as C,z as D,le as P,ae as r};
