import"./style-71523510.js";import{b as i,e as S,B as o,a as e,c as m,P as I,r as t,d as L,D as r}from"./utils-db84c1a9.js";import"./swissgl-45adad6a.js";const c=Math.sqrt(3),d=i(4,0,.1),l=Math.sqrt(d.slice(0,3).reduce((a,s)=>a+s*s,0)),D=l<c/3?o.ADD:l<2*c/3?o.PREMULTIPLIED:o.SUBTRACT;S(d.join(","));const n=t(3,8);Array(n).fill().forEach(()=>{const a={particleColor:i(4,0,1/n),fieldColor:i(4,0,1/n),renderFieldBlend:D,renderParticlesBlend:o.ADD,mouseRadius:e(0,.5),mouseStrength:e(-.5,.5),initialParticlesXY:m([r.SIN(e(0,1),e(0,.5)),r.CIRCLE(e(0,1)),r.RANDOM_WORLD,r.DOT_GRID(t(2,20)),r.VERTICLE_LINE,r.HORIZONTAL_LINE,r.VERTICLE_LINES(t(2,20)),r.HORIZONTAL_LINES(t(2,20))])};e()>.5?new I({...a,uniforms:{dt:e(.005,.02),friction:e(.7,.99),rMax:e(.05,.5),beta:e(.01,.1),forceFactor:e(.5,8)},renderParticles:`
      vec2 velocity = particle.zw;
      float angle = atan(velocity.x, velocity.y);
      vec2 XYS = XY;
      XYS = vec2(cos(angle)*XYS.x-sin(angle)*XYS.y, sin(angle)*XYS.x+cos(angle)*XYS.y);          
      XYS *= vec2(1.+length(particle.zw)*5.,1.);
      FOut = mix(vec4(0.), particleColor, smoothstep(1.0, 0.2, length(XYS)));
      `,particleSize:e(1,5),particleCount:t(100,1400)}):new L({...a,uniforms:{senseDist:e(1,70),senseAng:e(-8,80),moveAng:e(20,170),moveDist:e(1,30)},particleSize:e(.1,1),particleCount:t(5e3,8e4)})});
