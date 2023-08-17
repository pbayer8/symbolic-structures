var v=Object.defineProperty;var S=(i,t,e)=>t in i?v(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var p=(i,t,e)=>(S(i,typeof t!="symbol"?t+"":t,e),e);import{a as d}from"./style-d20be366.js";import{G as w}from"./lil-gui.esm-b4f18ba3.js";import{S as z}from"./swissgl-a59cd27d.js";const r=document.createElement("canvas");r.width=window.innerWidth;r.height=window.innerHeight;document.body.appendChild(r);const m=z(r),s={},u={},f={},y=Math.random()*.5+.5,h={outerEdge:y,innerEdge:Math.random()*y},o=new w;o.close();o.hide();o.add(h,"outerEdge",0,1);o.add(h,"innerEdge",0,1);let c=0;const x=["x","y","z","w"],l=Math.random()*.3,O=[Math.random()*l,Math.random()*l,Math.random()*l,1];class F{constructor(){this.index=c,this.channel=x[c%x.length],c++;const t=this.U={viewScale:1,step_n:1,mouse:d},e=(a,U,...n)=>{t[a]=Math.random()*(n[1]-n[0])+n[0],o.add(t,a,...n)};e("density",1,1,3,1),e("senseAng",5.5,-180,180),e("senseDist",18,1,50),e("moveAng",45,0,180),e("moveDist",0,-2,2),e("fieldFactor",0,-5,5),t.displayColor=[Math.random(),Math.random(),Math.random(),1],o.addColor(t,"displayColor")}frame(){for(let t=0;t<this.U.step_n;++t)this.step(m);m({...s,...this.U,...f,Clear:O,Blend:"s+d",FP:`${Object.keys(s).map((t,e)=>`FOut = mix(vec4(FOut.xyz,1.),color${e},${t}(UV*viewScale).x)`).join(";")};
        `})}step(t){u["fieldFactor"+this.index]=this.U.fieldFactor,f["color"+this.index]=this.U.displayColor,this.field=t({mouse:d,...h,FP:`
      vec2 dp = Src_step();
      float x=UV.x, y=UV.y;
      float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
      // Macro to sample the source at given coordinates
      #define S(x,y) (Src(vec2(x,y)))
      // Apply a 3x3 mean filter and decay factor to the field
      FOut = 0.95*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;
      // Apply a rect sigmoid function to the field
      FOut *= smoothstep(outerEdge,innerEdge,length(XY*XY*XY*XY));
      `},{story:2,format:"rgba8",tag:"field"+this.index}),s["field"+this.index]=this.field[0],this.points=t({field:this.field[0],...s,...u,...this.U,mouse:d,FP:`
      FOut = Src(I);
      vec2 worldSize = vec2(field_size());
      float aspectRatio = worldSize.x/worldSize.y;
      // Initialize new particles with random positions and directions
      if (FOut.w == 0.0 || FOut.x>=worldSize.x || FOut.y>=worldSize.y) {
          FOut = vec4(hash(ivec3(I, 123)), 1.0);
          FOut.xyz *= vec3(worldSize, TAU); 
          return;
      }
      // Calculate the current direction of the particle
      vec2 dir = vec2(cos(FOut.z), sin(FOut.z));
      // Rotate the sensor angle and create a rotation matrix
      mat2 R = rot2(radians(senseAng));
      // Calculate the sensor positions
      vec2 sense = senseDist*dir;
      vec2 mousePos = mouse.z>0.?mouse.xy:vec2(-100.);
      vec2 aspectMult = aspectRatio > 1. ? vec2(aspectRatio, 1.) : vec2(1., 1./aspectRatio);
      // Macro to sample the field at the given position
      #define F(p) ${Object.keys(s).map((e,a)=>`${e}((FOut.xy+p)/worldSize).x*fieldFactor${a}`).join("+")}+50.*smoothstep(.2,0.,length(((FOut.xy+p)/worldSize-mousePos)*aspectMult))
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
      FOut.xy += dir*moveDist;
      // Wrap the particle position to stay within the world size
      FOut.xy = mod(FOut.xy, worldSize);
      `},{scale:this.U.density/16,story:2,format:"rgba32f",tag:"points"+this.index}),t({points:this.points[0],Grid:this.points[0].size,...this.U,Blend:"s+d",VP:`
      // Calculate the vertex position in clip space
      VOut.xy = 2.0 * (points(ID.xy).xy+XY*2.0)/vec2(ViewSize) - 1.0;`,FP:`
      // Calculate the fragment color based on the distance to the particle center
      smoothstep(1.0, 0.0, length(XY)*2.)
      `},this.field[0])}}p(F,"Tags",["2d","simulation"]);const M=Array(Math.ceil(Math.random()*6)).fill("").map((i,t)=>new F);function g(i){requestAnimationFrame(g),M.forEach(t=>t.frame())}requestAnimationFrame(g);
