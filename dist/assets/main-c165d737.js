import"./style-71523510.js";import{r as i,a as e,P as L,b as a,B as I,c as o,d as t,D as r}from"./utils-db84c1a9.js";import"./swissgl-45adad6a.js";Array(i(2,8)).fill().forEach(()=>{e()>.5?new L({particleCount:i(100,1400),particleSize:e(1,5),particleColor:a(4),fieldColor:a(4),uniforms:{dt:e(.005,.01),friction:e(.93,.99),rMax:e(.05,.5),beta:e(.01,.1),forceFactor:e(1,8)},renderFieldBlend:I.PREMULTIPLIED,renderParticlesBlend:I.PREMULTIPLIED,mouseRadius:e(0,.25),mouseStrength:e(-.5,.5),initialParticlesXY:o([r.SIN(e(0,1),e(0,.5)),r.CIRCLE(e(0,1)),r.RANDOM_WORLD,r.DOT_GRID(i(2,100)),r.VERTICLE_LINE,r.HORIZONTAL_LINE,r.VERTICLE_LINES(i(2,100)),r.HORIZONTAL_LINES(i(2,100))])}):new t({particleSize:e(.1,1),particleCount:i(100,5e4),fieldColor:a(4),particleColor:a(4),mouseRadius:e(0,.25),mouseStrength:e(-.5,.5),uniforms:{senseDist:e(1,70),senseAng:e(-8,80),moveAng:e(20,170),moveDist:e(1,30)},renderFieldBlend:I.PREMULTIPLIED,renderParticlesBlend:I.PREMULTIPLIED,initialParticlesXY:o([r.SIN(e(0,1),e(0,.5)),r.CIRCLE(e(0,1)),r.RANDOM_WORLD,r.DOT_GRID(i(2,100)),r.VERTICLE_LINE,r.HORIZONTAL_LINE,r.VERTICLE_LINES(i(2,100)),r.HORIZONTAL_LINES(i(2,100))])})});
