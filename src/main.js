import { renderSharedField } from "./automata";
import { Clovers, Physarum } from "./physarum";
import "./refresh-button";

renderSharedField(`
FOut = vec4(-1.*sin(UV.xy*10.)/2.+1.,0.,1.)*.1;
`);

new Physarum({
  ...Clovers,
  fieldColor: `vec4(sin(UV.xy*10.)/2.+1.,0.,1.)`,
  debug: true,
});
