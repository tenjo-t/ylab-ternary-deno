/**
 * @typedef {import("./type.ts").Data} Data
 * @typedef {import("./type.ts").Labels} Labels
 * @typedef {import("./type.ts").Domains} Domains
 * @typedef {import("./type.ts").Ticks} Ticks
 * @typedef {import("./type.ts").Legend} Legend
 */

// import * as d3 from "d3";

/** @type {Data[number]} */
const data1 = {
  // データ点の配列
  // ラベルの順番と対応するように
  data: [
    [36.45, 15.2, 48.35],
    [36.68, 15.4, 47.91],
    [35.87, 15.13, 49.0],
    [36.72, 15.27, 48.01],
    [36.35, 15.4, 48.24],
    [36.74, 15.09, 48.17],
    [36.3, 15.14, 48.56],
  ],
  // 点の色
  // 指定する方法はリンク先を参照
  // https://developer.mozilla.org/ja/docs/Web/CSS/color_value
  color: "red",
};

/** @type {Data[number]} */
const data2 = {
  data: [
    [49.19, 2.25, 48.56],
    [50.71, 1.71, 47.58],
    [46.28, 5.81, 47.91],
  ],
  color: "blue",
};

/** @type {Data[number]} */
const data3 = {
  data: [
    [28.84, 16.42, 54.74],
    [32.82, 20.92, 46.25],
    [37.37, 15.15, 47.47],
  ],
  color: "green",
};

// プロットするデータの配列
/** @type {Data}  */
export const data = [data1, data2, data3];

// ラベル
// このラベルの順番とデータの順番が対応するように
/** @type {Labels}  */
export const labels = ["Ga", "Yb", "Au"];

// 表示のレンジ
// 0~1の範囲で指定する (0%~100%に対応する)
// それぞれmax-minの値が一致するように
/** @type {Domains} */
export const domains = [
  [0.2, 0.7],
  [0, 0.5],
  [0.3, 0.8],
];

// 軸目盛りの数
/** @type {Ticks} */
export const ticks = 10;

// シーケンシャルな凡例
/** @type {Legend} */
// export const legend = {
//   color: d3.interpolateViridis,
//   domain: [7.3, 7.6],
//   ticks: 5,
// };
