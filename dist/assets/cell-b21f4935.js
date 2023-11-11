var S=Object.defineProperty;var w=(i,t,e)=>t in i?S(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var m=(i,t,e)=>(w(i,typeof t!="symbol"?t+"":t,e),e);import{m as c,g as o}from"./utils-59f65cc7.js";import{G as z}from"./lil-gui.esm-b4f18ba3.js";import{S as O}from"./swissgl-a59cd27d.js";const d=document.createElement("canvas");d.width=window.innerWidth;d.height=window.innerHeight;document.body.appendChild(d);const u=O(d),a={},f={},y={},x=Math.random()*.5+.5,p={outerEdge:x,innerEdge:Math.random()*x},s=new z;s.close();s.hide();s.add(p,"outerEdge",0,1);s.add(p,"innerEdge",0,1);let l=0;const F=["x","y","z","w"],h=Math.random()*.3,M=[Math.random()*h,Math.random()*h,Math.random()*h,1];class g{constructor(){this.index=l,this.channel=F[l%F.length],l++;const t=this.U={viewScale:1,step_n:1,mouse:c},e=(n,A,...r)=>{t[n]=Math.random()*(r[1]-r[0])+r[0],s.add(t,n,...r)};e("density",1,1,3,1),e("senseAng",5.5,-180,180),e("senseDist",18,1,50),e("moveAng",45,0,180),e("moveDist",0,-2,2),e("fieldFactor",0,-5,5),t.displayColor=[Math.random(),Math.random(),Math.random(),1],s.addColor(t,"displayColor")}frame(){for(let t=0;t<this.U.step_n;++t)this.step(u);u({...a,...this.U,...y,Clear:M,Blend:"s+d",FP:o`${Object.keys(a).map((t,e)=>o`FOut = mix(vec4(FOut.xyz,1.),color${e},${t}(UV*viewScale).x)`).join(";")};
        `})}step(t){f["fieldFactor"+this.index]=this.U.fieldFactor,y["color"+this.index]=this.U.displayColor,this.field=t({mouse:c,...p,FP:o`
      vec2 dp = Src_step();
      float x=UV.x, y=UV.y;
      float l=x-dp.x, r=x+dp.x, u=y-dp.y, d=y+dp.y;
      // Macro to sample the source at given coordinates
      #define S(x,y) (Src(vec2(x,y)))
      // Apply a 3x3 mean filter and decay factor to the field
      FOut = 0.95*(S(x,y)+S(l,y)+S(r,y)+S(x,u)+S(x,d)+S(l,u)+S(r,u)+S(l,d)+S(r,d))/9.0;
      // Apply a rect sigmoid function to the field
      FOut *= smoothstep(outerEdge,innerEdge,length(XY*XY*XY*XY));
      `},{story:2,format:"rgba8",tag:"field"+this.index}),a["field"+this.index]=this.field[0],this.points=t({field:this.field[0],...a,...f,...this.U,mouse:c,FP:o`
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
      #define F(p) ${Object.keys(a).map((e,n)=>o`${e}((FOut.xy+p)/worldSize).x*fieldFactor${n}`).join("+")}+50.*smoothstep(.2,0.,length(((FOut.xy+p)/worldSize-mousePos)*aspectMult))
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
      `},{scale:this.U.density/16,story:2,format:"rgba32f",tag:"points"+this.index}),t({points:this.points[0],Grid:this.points[0].size,...this.U,Blend:"s+d",VP:o`
      // Calculate the vertex position in clip space
      VOut.xy = 2.0 * (points(ID.xy).xy+XY*2.0)/vec2(ViewSize) - 1.0;`,FP:o`
      // Calculate the fragment color based on the distance to the particle center
      smoothstep(1.0, 0.0, length(XY)*2.)
      `},this.field[0])}}m(g,"Tags",["2d","simulation"]);const U=Array(Math.ceil(Math.random()*6)).fill("").map((i,t)=>new g);function v(i){requestAnimationFrame(v),U.forEach(t=>t.frame())}requestAnimationFrame(v);
