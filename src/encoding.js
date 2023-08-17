// import LZString from "lz-string";
import qs from "qs";

const PART_SPLIT = "";
const COMPRESS = false;
const MINIFY = true;
const ROUND = 2;
// sortred by approx frequency of use
const KEYS = [
  "species",
  "uniforms",
  "particleColor",
  "fieldColor",
  "renderFieldBlend",
  "renderParticlesBlend",
  "mouseRadius",
  "mouseStrength",
  "initialParticlesXY",
  "type",
  "particleSize",
  "particleCount",
  "bgColor",
  "senseDist",
  "senseAng",
  "moveAng",
  "moveDist",
  "dt",
  "friction",
  "rMax",
  "beta",
  "forceFactor",
  "bgLength",
  "numSpecies",
  "blendMode",
];
// sorted by visual width, so if not compressing, url appears shorter
const LETTERS = [
  "i",
  "j",
  "l",
  "f",
  "t",
  "I",
  "r",
  "c",
  "k",
  "s",
  "v",
  "x",
  "y",
  "z",
  "J",
  "a",
  "b",
  "d",
  "e",
  "g",
  "h",
  "n",
  "o",
  "p",
  "q",
  "u",
  "L",
  "F",
  "T",
  "Z",
];
const ENCODE_KEY_MAP = Object.fromEntries(KEYS.map((k, i) => [k, LETTERS[i]]));
const DECODE_KEY_MAP = Object.fromEntries(
  Object.entries(ENCODE_KEY_MAP).map(([k, v]) => [v, k])
);

const indexToAlpha = (index) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (index < alphabet.length) return alphabet[index];
  return (
    indexToAlpha(Math.floor(index / alphabet.length)) +
    alphabet[index % alphabet.length]
  );
};
const encodeCounts = {};

const encodeKey = (key, map = ENCODE_KEY_MAP) => {
  // only encode non-numeric keys
  const parts = key
    .split("[")
    .map((i) => i.replace("]", ""))
    .filter((i) => isNaN(i));
  parts.forEach((part) => {
    encodeCounts[part] = encodeCounts[part] + 1 || 1;
    key = key.replaceAll(part, map[part] || part);
  });
  key = key
    .split("[")
    .map((i) => i.replace("]", ""))
    .join(PART_SPLIT);
  return key;
};

const decodeKey = (key, map = DECODE_KEY_MAP) => {
  // only decode non-numeric keys
  const parts = key.split(PART_SPLIT).map((part) => {
    if (!isNaN(part)) return part;
    return map[part] || part;
  });
  key = parts.map((p, i) => (i === 0 ? p : `[${p}]`)).join("");
  return key;
};

export const encodeObjectInUrl = (obj) => {
  const url = new URL(window.location.href);
  const params = qs.stringify(obj, {
    encoder: (param, defaultEncoder, charset, type) =>
      defaultEncoder(
        type === "key" && MINIFY
          ? encodeKey(param)
          : typeof param === "number"
          ? Math.round(param * Math.pow(10, ROUND)) / Math.pow(10, ROUND)
          : param,
        defaultEncoder,
        charset,
        type
      ),
  });
  url.search = params;
  // COMPRESS
  // ? LZString.compressToEncodedURIComponent(params)
  // : params;
  setTimeout(() => console.log("URL PARAM LENGTH", url.search.length), 100);
  window.history.replaceState({}, "", url);
};

export const decodeObjectFromUrl = () => {
  const url = new URL(window.location.href);
  const params = qs.parse(
    url.search,
    // COMPRESS
    // ? LZString.decompressFromEncodedURIComponent(url.search.split("?")[1])
    // : url.search,
    {
      ignoreQueryPrefix: true,
      decoder: (param, defaultDecoder, charset, type) => {
        const value = defaultDecoder(param, defaultDecoder, charset, type);
        const num = Number(value);
        return type === "key" && MINIFY
          ? decodeKey(value)
          : Number.isNaN(num)
          ? value
          : num;
      },
    }
  );
  return params;
};
