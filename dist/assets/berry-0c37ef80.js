import{d as I,e as o,b as O,a as n,f as l,g as i}from"./utils-59f65cc7.js";import{S as b}from"./swissgl-a59cd27d.js";const r=document.createElement("canvas");r.width=window.innerWidth;r.height=window.innerHeight;document.body.appendChild(r);const w=[[151,123,234],[214,127,114],[105,77,230],[188,174,226]],S=w.map(e=>e.map(t=>t/255)),d=4,a=Array(d).fill().map(()=>{const e=I(S);return{x:o(),y:o(),copyIndex:O(0,d-1),xo:n(0,1e-4),yo:n(0,1e-4),xv:0,yv:0,r:e[0],g:e[1],b:e[2],radius:n(.2,.7),width:n(.1,.3),subtractRadiusOffset:o(.08),subtractWidth:n(0,.1),subtractStrength:n(.8,1),subtractOffsetX:o(.1),subtractOffsetY:o(.1)}}),A=b(r);function f(e){e/=1e3,a.forEach((t,c)=>{t.x+=t.xv,t.y+=t.yv,t.xv=t.xv*(1-t.xo)+(l[0]-t.x)*t.xo,t.yv=t.yv*(1-t.yo)+(l[1]-t.y)*t.yo,t.xv*=.99,t.yv*=.99,t.copyIndex>0&&t.copyIndex>c&&(t.x=a[t.copyIndex].x,t.y=a[t.copyIndex].y)}),A({t:e,Inc:i`
    // 2D noise function
    float noise(vec2 p) {
      return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }`,FP:i`
    FOut = vec4(180./255.,180./255.,230./255.,1.0);
    vec3 color = vec3(0.);
    float strength = 0.0;
    float cumulativeStrength = 0.0;
    float len = 0.;
    vec2 xy = XY;
    float offsetLen = 0.;
    ${a.map(({x:t,y:c,r:v,g:y,b:x,radius:s,width:h,subtractRadiusOffset:m,subtractWidth:u,subtractOffsetX:g,subtractOffsetY:$,subtractStrength:F})=>i`len = length(xy-vec2(${t},${c}));
          offsetLen = length(xy-vec2(${t}+${g},${c}+${$}));
        strength = smoothstep(${s+h},${s},len)
          - smoothstep(${s-m+u},${s-m},offsetLen)*${F};
        cumulativeStrength += strength;
        FOut = mix(FOut,vec4(${v},${y},${x},1.),clamp(strength,0.,1.));
        // FOut += vec4(color,1.0);
        xy += cumulativeStrength*.04;`).join(`
`)}
      FOut += noise (XY*10.)*0.15;`,Aspect:"fit"}),requestAnimationFrame(f)}requestAnimationFrame(f);
