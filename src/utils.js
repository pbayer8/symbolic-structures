import qs from "qs";

export const random = (min = 0, max = 1) => Math.random() * (max - min) + min;

export const randomInt = (min, max) => Math.floor(random(min, max));

export const randomChoice = (arr) => arr[randomInt(0, arr.length)];

export const randomChoiceWeighted = (arr, weights) => {
  const sum = weights.reduce((a, b) => a + b, 0);
  const r = random(0, sum);
  let i = 0;
  while (r > weights[i]) r -= weights[i++];
  return arr[i];
};

export const randomArray = (length, min = 0, max = 1) =>
  Array(length)
    .fill()
    .map(() => random(min, max));

export const encodeObjectInUrl = (obj) => {
  console.log("encoding params", obj);
  const url = new URL(window.location.href);
  const params = qs.stringify(obj, {
    encoder: (param, defaultEncoder, charset, type) =>
      defaultEncoder(
        typeof param === "number" ? Math.round(param * 1000) / 1000 : param,
        defaultEncoder,
        charset,
        type
      ),
  });
  url.search = params;
  window.history.replaceState({}, "", url);
};

export const decodeObjectFromUrl = () => {
  const url = new URL(window.location.href);
  const params = qs.parse(url.search, {
    ignoreQueryPrefix: true,
    decoder: (param, defaultDecoder, charset, type) => {
      const value = defaultDecoder(param, defaultDecoder, charset, type);
      const num = Number(value);
      return Number.isNaN(num) ? value : num;
    },
  });
  console.log("decoded params", params);
  return params;
};
