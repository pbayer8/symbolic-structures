import { renderSharedField } from "./automata";
import { Clovers, Physarum } from "./physarum";
import "./refresh-button";
import { glsl } from "./utils";

renderSharedField(glsl`
FOut = vec4(sin(UV.xy*10.)/2.+1.,0.,1.)*.2;
`);

new Physarum({
  ...Clovers,
  fieldColor: glsl`vec4(sin(UV.xy*10.)/2.+1.,0.,1.)`,
  debug: true,
});
