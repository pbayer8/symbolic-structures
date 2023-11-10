export const random = (min = 0, max = 1) => Math.random() * (max - min) + min;

export const randomInt = (min, max) => Math.floor(random(min, max));

export const randomCentered = (radius = 1, center = 0) =>
  random(center - radius, center + radius);

export const randomChoice = (arr) => arr[randomInt(0, arr.length)];

export const randomChoiceWeighted = (arr, weights) => {
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = random(0, sum);
  let i = 0;
  while (r > weights[i]) r -= weights[i++];
  return arr[i];
};

export const randomArray = (length, min = 0, max = 1) =>
  Array(length)
    .fill()
    .map(() => random(min, max));

export const randomArrayRange = (min, max) =>
  Array(min.length)
    .fill()
    .map((_, i) => random(min[i], max[i]));

export const glsl = (s, ...v) => String.raw(s, ...v);
