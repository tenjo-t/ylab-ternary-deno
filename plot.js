import { JSDOM } from "jsdom";
import * as d3 from "d3";

import {
  axisLabels,
  barycentric,
  grid,
  ternaryPlot,
  ticks,
} from "./plot/mod.js";

const file = Deno.args[0].replaceAll("\\", "/");
const {
  data,
  labels,
  domains = [
    [0, 1],
    [0, 1],
    [0, 1],
  ],
  ticks: tickCount = 10,
  legend = null,
} = await import(file);

const dom = new JSDOM();
const document = dom.window.document;

// SVGのサイズ
const height = 250;
const width = 350;

const svg = d3
  .select(document.body)
  .append("svg")
  .attr("xmlns", "http://www.w3.org/2000/svg")
  .attr("width", width)
  .attr("height", height);

const b = barycentric();
const t = ternaryPlot(b).radius(100).labels(labels).domains(domains);

const radius = t.radius();
const yOffset = radius / 5;

const chart = svg
  .append("g")
  .attr("transform", `translate(${width / 2} ${height / 2 + yOffset})`)
  .attr("font-family", "sans-serif")
  .attr("id", "chart");

const defs = chart.append("defs");

const clipPath = defs
  .append("clipPath")
  .attr("id", "trianglePath")
  .append("path")
  .attr("d", t.triangle());

const axisLabelsGroups = chart
  .append("g")
  .attr("class", "axis-labels")
  .append("g")
  .attr("class", "labels")
  .attr("font-size", 14);

axisLabelsGroups.call(
  axisLabels,
  t.labelOffsets(100).axisLabels({ center: true }),
);

const gridLinesPaths = t
  .gridLines(tickCount)
  .map((axisGrid) => axisGrid.map(d3.line()).join(" "));

const gridGroup = chart
  .append("g")
  .attr("class", "grid")
  .call(grid, gridLinesPaths);

const axisTicksGroups = chart
  .append("g")
  .attr("class", "ternary-ticks")
  .attr("font-size", 10)
  .selectAll("g")
  .data(t.ticks(tickCount))
  .join("g")
  .attr("class", "axis-ticks")
  .call(ticks);

const triangle = chart
  .append("path")
  .attr("id", "triangle")
  .attr("d", t.triangle())
  .attr("stroke", "black")
  .attr("stroke-width", "1px")
  .attr("fill", "none");

const data_fmt = data.reduce(
  (pre, cur) => pre.concat(cur.data.map((d) => [t(d), cur.color])),
  [],
);

chart
  .append("g")
  .attr("class", "data")
  // .attr("clip-path", "url(#trianglePath")
  .selectAll("circle")
  .data(data_fmt)
  .enter()
  .append("circle")
  .attr("cx", (d) => d[0][0])
  .attr("cy", (d) => d[0][1])
  .attr("r", 3) // markerのサイズ
  .attr("fill", (d) => d[1]);

if (legend !== null) {
  const { color = d3.interpolateViridis, domain = [0, 1], ticks = 10 } = legend;
  const legendWidth = 10;
  const legendHeight = 120;
  const legendScale = d3.scaleLinear().domain(domain).range([legendHeight, 0]);
  const legendGroup = svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${width / 2 + radius + 40},${height / 2 - legendHeight / 2})`,
    );

  legendGroup
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 1)
    .attr("y2", 0)
    .selectAll("stop")
    .data(d3.scaleLinear().ticks())
    .enter()
    .append("stop")
    .attr("offset", (d) => d * 100 + "%")
    .attr("stop-color", (d) => color(d));

  legendGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", "url(#gradient)");

  legendGroup
    .append("g")
    .attr("transform", `translate(${legendWidth},0)`)
    .call(d3.axisRight(legendScale).ticks(ticks).tickSize(3))
    .attr("font-size", 8);
}

await Deno.writeTextFile(file.replace(".js", ".svg"), svg.node().outerHTML);
