export const mouse = [0.5, 0.5, 0];
export const mouseCentered = [0, 0, 0];

const handleMouseMove = (e) => {
  mouse[0] = e.clientX / window.innerWidth;
  mouse[1] = 1 - e.clientY / window.innerHeight;
  mouse[2] = e.buttons ? 1 : 0;
  mouseCentered[0] = mouse[0] - 0.5;
  mouseCentered[1] = mouse[1] - 0.5;
  mouseCentered[2] = mouse[2];
};

// document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("pointermove", handleMouseMove);
// document.addEventListener("mousedown", () => (mouse[2] = 1));
document.addEventListener("pointerdown", () => (mouse[2] = 1));
// document.addEventListener("mouseup", () => (mouse[2] = 0));
document.addEventListener("pointerup", () => (mouse[2] = 0));
