import{m}from"./style-d20be366.js";import{S as F}from"./swissgl-a59cd27d.js";import{r as I,a as n,b as O,c as o}from"./utils-5b63e897.js";const a=document.createElement("canvas");a.width=window.innerWidth;a.height=window.innerHeight;document.body.appendChild(a);const b=[[151,123,234],[214,127,114],[105,77,230],[188,174,226]],w=b.map(e=>e.map(t=>t/255)),f=4,s=Array(f).fill().map(()=>{const e=I(w);return{x:n(),y:n(),copyIndex:O(0,f-1),xo:o(0,1e-4),yo:o(0,1e-4),xv:0,yv:0,r:e[0],g:e[1],b:e[2],radius:o(.2,.7),width:o(.1,.3),subtractRadiusOffset:n(.08),subtractWidth:o(0,.1),subtractStrength:o(.8,1),subtractOffsetX:n(.1),subtractOffsetY:n(.1)}}),S=F(a);function l(e){e/=1e3,s.forEach((t,c)=>{t.x+=t.xv,t.y+=t.yv,t.xv=t.xv*(1-t.xo)+(m[0]-t.x)*t.xo,t.yv=t.yv*(1-t.yo)+(m[1]-t.y)*t.yo,t.xv*=.99,t.yv*=.99,t.copyIndex>0&&t.copyIndex>c&&(t.x=s[t.copyIndex].x,t.y=s[t.copyIndex].y)}),S({t:e,Inc:`
    // 2D noise function
    float noise(vec2 p) {
      return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    `,FP:`
    FOut = vec4(180./255.,180./255.,230./255.,1.0);
    vec3 color = vec3(0.);
    float strength = 0.0;
    float cumulativeStrength = 0.0;
    float len = 0.;
    vec2 xy = XY;
    float offsetLen = 0.;
    ${s.map(({x:t,y:c,r:v,g:d,b:y,radius:r,width:x,subtractRadiusOffset:i,subtractWidth:h,subtractOffsetX:u,subtractOffsetY:$,subtractStrength:g})=>`len = length(xy-vec2(${t},${c}));
          offsetLen = length(xy-vec2(${t}+${u},${c}+${$}));
        strength = smoothstep(${r+x},${r},len)
          - smoothstep(${r-i+h},${r-i},offsetLen)*${g};
        cumulativeStrength += strength;
        FOut = mix(FOut,vec4(${v},${d},${y},1.),clamp(strength,0.,1.));
        // FOut += vec4(color,1.0);
        xy += cumulativeStrength*.04;
        `).join(`
`)}
      FOut += noise (XY*10.)*0.15;`,Aspect:"fit"}),requestAnimationFrame(l)}requestAnimationFrame(l);
