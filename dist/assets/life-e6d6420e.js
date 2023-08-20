import"./style-7da4ff8e.js";import{d as g,e as S,r as y,P as E,a as I,B as i,D as r}from"./physarum-e74b1a30.js";import{r as c,a as e,b as t,c as L}from"./utils-bfa13002.js";import"./_commonjsHelpers-edff4021.js";import"./lil-gui.esm-b4f18ba3.js";import"./swissgl-a59cd27d.js";const h=document.createElement("style");h.innerHTML=`
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
    }
`;document.head.appendChild(h);const d=document.createElement("button");d.id="refresh";d.onclick=function(){window.location=window.location.pathname};document.body.appendChild(d);const p=Math.sqrt(3),u=c(4,0,.1),l=Math.sqrt(u.slice(0,3).reduce((o,m)=>o+m*m,0)),a=t(3,8),f=l<p/3?i.ADD:l<2*p/3?i.PREMULTIPLIED:i.SUBTRACT,s={life:()=>({type:"life",uniforms:{dt:e(.005,.02),friction:e(.7,.99),rMax:e(.05,.5),beta:e(.01,.1),forceFactor:e(.5,8)},particleSize:e(1,5),particleCount:t(100,1400)}),physarum:()=>({type:"physarum",uniforms:{senseDist:e(1,70),senseAng:e(-8,80),moveAng:e(20,170),moveDist:e(1,30)},particleSize:e(.1,1),particleCount:t(5e3,8e4)}),shared:()=>({particleColor:c(4,0,1/a),fieldColor:c(4,0,1/a),renderFieldBlend:f,renderParticlesBlend:i.ADD,mouseRadius:e(0,.5),mouseStrength:e(-.5,.5),initialParticlesXY:L([r.SIN(e(0,1),e(0,.5)),r.CIRCLE(e(0,1)),r.RANDOM_WORLD,r.DOT_GRID(t(2,20)),r.VERTICLE_LINE,r.HORIZONTAL_LINE,r.VERTICLE_LINES(t(2,20)),r.HORIZONTAL_LINES(t(2,20))])})},n={bgColor:u,bgLength:l,numSpecies:a,blendMode:f,species:Array(a).fill().map(()=>({...s.shared(),...e()>.5?s.life():s.physarum()})),...g()};S(n);y(n.bgColor.join(","));n.species.forEach(o=>o.type==="life"?new E({...o,renderParticles:`
    vec2 velocity = particle.zw;
    float angle = atan(velocity.x, velocity.y);
    vec2 XYS = XY;
    XYS = vec2(cos(angle)*XYS.x-sin(angle)*XYS.y, sin(angle)*XYS.x+cos(angle)*XYS.y);          
    XYS *= vec2(1.+length(particle.zw)*5.,1.);
    FOut = mix(vec4(0.), particleColor, smoothstep(1.0, 0.2, length(XYS)));
    `}):new I({...n.sharedProps,...o}));
