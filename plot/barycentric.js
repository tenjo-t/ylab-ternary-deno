/**
 * @typedef {import("./types.ts").Accessor} Accessor
 * @typedef {import("./types.ts").Coord} Coord
 * @typedef {import("./types.ts").Barycentric} Barycentric
 */

import { sum } from "d3";

const { sin, cos, PI, abs } = Math;
const rad = PI / 180;

/**
 * Constructs a new default ternary/barycentric converter.
 * By default, it generates an equilateral triangle on the unit circle centered at the origin.
 * @returns {Barycentric}
 */
export default function barycentric() {
  let normalizeData = true;

  /** @type {Accessor} */
  let a = (d) => d[0];
  /** @type {Accessor} */
  let b = (d) => d[1];
  /** @type {Accessor} */
  let c = (d) => d[2];

  // angles for equilateral triangle
  const angles = [-90, 150, 30];
  // default vertices
  /** @type {Coord[]} */
  let [vA, vB, vC] = angles.map((d) => [cos(d * rad), sin(d * rad)]);

  /**
   * @param {[number, number, number]} _
   * @returns {[number, number, number]}
   */
  function normalize(_) {
    const total = sum(_);
    if (total === 0) return [0, 0, 0];
    return [_[0] / total, _[1] / total, _[2] / total];
  }

  /** @type {Barycentric} */
  const barycentric = function (d) {
    const values = [a(d), b(d), c(d)];
    const [dA, dB, dC] = normalizeData ? normalize(values) : values;

    return [
      vA[0] * dA + vB[0] * dB + vC[0] * dC,
      vA[1] * dA + vB[1] * dB + vC[1] * dC,
    ];
  };

  barycentric.invert = function ([x, y]) {
    const [xA, yA] = vA,
      [xB, yB] = vB,
      [xC, yC] = vC;

    const yByC = yB - yC,
      xCxB = xC - xB,
      xAxC = xA - xC,
      yAyC = yA - yC,
      yCyA = yC - yA,
      xxC = x - xC,
      yyC = y - yC;

    const d = yByC * xAxC + xCxB * yAyC;

    return [
      abs((yByC * xxC + xCxB * yyC) / d),
      abs((yCyA * xxC + xAxC * yyC) / d),
      abs(1 - lambda1 - lambda2),
    ];
  };

  barycentric.a = function (fn) {
    return fn ? ((a = fn), barycentric) : a;
  };

  barycentric.b = function (fn) {
    return fn ? ((b = fn), barycentric) : b;
  };

  barycentric.c = function (fn) {
    return fn ? ((c = fn), barycentric) : c;
  };

  barycentric.vertices = function (ABC) {
    return ABC
      ? ((vA = ABC[0]), (vB = ABC[1]), (vC = ABC[2]), barycentric)
      : [vA, vB, vC];
  };

  barycentric.normalize = normalize;

  return barycentric;
}
