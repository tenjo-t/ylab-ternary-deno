/**
 * @typedef {import("./types.ts").Barycentric} Barycentric
 * @typedef {import("./types.ts").TernaryPlot} TernaryPlot
 * @typedef {import("./types.ts").TernaryAxis} TernaryAxis
 * @typedef {import("./types.ts").Coord} Coord
 */

import { scaleLinear } from "d3";

function getDomainLengths(domains) {
  return new Set(
    domains.map((domain) => {
      // round differences
      // https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
      const d0 = Math.round((domain[0] + Number.EPSILON) * 100) / 100;
      const d1 = Math.round((domain[1] + Number.EPSILON) * 100) / 100;
      const difference = Math.abs(d1 - d0);

      return Math.round((difference + Number.EPSILON) * 100) / 100;
    }),
  );
}

/**
 * Calculate shift in x and y from distance between two perpendicular lines
 *
 * @param {number} m Slope
 * @param {number} c distance between two perpendicular lines
 * @returns {Coord} distances
 */
function getdXdY(m, c) {
  const theta = Math.atan(m);
  const dx = c * Math.cos(theta) * Math.sign(theta); // ! using Math.sign() is questionable?
  const dy = c * Math.sin(theta) * Math.sign(theta);

  return [dx, dy];
}

/**
 * Calculate offsets needed to move transform within initial triangle
 * @param {number} m
 * @param {number} distance
 * @returns {Coord}
 */
function getTranslateCorrections(m, distance) {
  // ! 🌶 distance shouldn't always have negative sign only if line is below origin
  if (m === 0) return [0, -distance]; // for horizontal lines

  const inverseSlope = -1 / m;

  return getdXdY(inverseSlope, distance);
}

/**
 * Currying function that returns a function that
 *
 * @param {Coord}
 * @param {Coord}
 * @returns {(t: number) => Coord}
 */
function lineBetween([x1, y1], [x2, y2]) {
  return function (t) {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  };
}

/**
 * Calculate the slope of a line between two cartesian points
 *
 * @param {Coord}
 * @param {Coord}
 * @returns {number}
 */
function getSlope([x1, y1], [x2, y2]) {
  return (y2 - y1) / (x2 - x1);
}

const epsilon = 1e-4;

/**
 * Calculate distance between to parallel liens
 * https://en.wikipedia.org/wiki/Distance_between_two_parallel_lines
 *
 * @param {number} b1
 * @param {number} b2
 * @param {number} m slop
 * @returns {number}
 */
function parallelLinesDistance(b1, b2, m) {
  return ((b2 - b1) * Math.sign(b1)) / Math.sqrt(m ** 2 + 1); // ! using * Math.sign(b1) is hacky tho
}

/**
 * @param {Barycentric} barycentric
 */
export default function ternaryPlot(barycentric) {
  let radius = 300,
    k = 1,
    tx = 0,
    ty = 0,
    /** @type {string | (tick: number) => string} */
    tickFormat = "%",
    reverse = false,
    unscaledVertices = barycentric.vertices();

  // return this function, has access to all closed over variables in the parent 'ternaryPlot' function
  /** @type {TernaryPlot} */
  const ternaryPlot = function (_) {
    const [x, y] = barycentric(_);

    return [x * radius, y * radius];
  };

  ternaryPlot.vertices = function (newScaledVertices) {
    if (newScaledVertices) {
      const newUnscaledVertices = newScaledVertices.map(([x, y]) => [
        x / radius,
        y / radius,
      ]);

      barycentric.vertices(newUnscaledVertices);

      return ternaryPlot;
    }

    const vertices = barycentric.vertices();

    return vertices.map(([x, y]) => [x * radius, y * radius]);
  };

  let [svA, svB, svC] = ternaryPlot.vertices();

  // axes configurations
  // domain from vC (angle: 30°) to vA (angle: -90°)
  /** @type {TernaryAxis} */
  let A = {
    label: "A",
    labelAngle: 0,
    labelOffset: 45, // 🤔💭 or relative to radius? labelOffset: radius / 10
    gridLine: lineBetween(svC, svA),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: 0,
    tickSize: 6,
    tickTextAnchor: "start",
    conjugate: null,
  };

  // domain from svA (angle: -90°) to svB (angle: 150°)
  /** @type {TernaryAxis} */
  let B = {
    label: "B",
    labelAngle: 60,
    labelOffset: 45,
    gridLine: lineBetween(svA, svB),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: 60,
    tickSize: 6,
    tickTextAnchor: "end",
    conjugate: null,
  };

  // domain from vB (angle: 150°) to vC (angle: 30°)
  /** @type {TernaryAxis} */
  let C = {
    label: "C",
    labelAngle: -60,
    labelOffset: 45,
    gridLine: lineBetween(svB, svC),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: -60,
    tickSize: 6,
    tickTextAnchor: "end",
    conjugate: null,
  };

  // just a nicety for the gridlines function
  A.conjugate = B;
  B.conjugate = C;
  C.conjugate = A;

  ternaryPlot.axisLabels = function ({ center = false } = {}) {
    return [A, B, C].map((d) => {
      const { label, labelAngle } = d;
      const [x, y] = d.gridLine(center ? 0.5 : 1);
      const position = [
        (x / radius) * (radius + d.labelOffset),
        (y / radius) * (radius + d.labelOffset),
      ];

      return {
        position,
        label,
        angle: labelAngle,
      };
    });
  };

  ternaryPlot.reverseVertices = function () {
    // "swap" vertices clockwise
    reverse = true;
    const swappedVertices = [svC, svA, svB];
    const [vA, vB, vC] = unscaledVertices;
    unscaledVertices = [vC, vA, vB]; // needed for .transform() and transformFromDomains() & .domainsFromVertices() to work
    ternaryPlot.vertices(swappedVertices);

    // swap gridLines
    A.gridLine = lineBetween(svA, svC);
    B.gridLine = lineBetween(svB, svA);
    C.gridLine = lineBetween(svC, svB);

    return ternaryPlot;
  };

  // checks if domains are reversed and applies appropriate transform for partial domain

  ternaryPlot.domains = function (domains) {
    if (!domains) return [A.scale.domain(), B.scale.domain(), C.scale.domain()];

    const domainLengths = getDomainLengths(domains);
    if (domainLengths.size !== 1) {
      throw new Error("Domains must all be of equal length");
    }

    const isReverseDomain = domains.every((d) => d[0] > d[1]);

    if (isReverseDomain) {
      ternaryPlot.reverseVertices();
    } else {
      reverse = false; // in case domains switch from reverse to normal
    }

    ternaryPlot.setDomains(domains);

    // Get transform corresponding to this domain
    const { x, y, k } = ternaryPlot.transformFromDomains(domains);

    // Set and apply transform ie update barycentric coord system
    ternaryPlot.scale(k);
    ternaryPlot.translate([x, y]);

    return ternaryPlot;
  };

  // set domains without applying matching transform
  ternaryPlot.setDomains = function (domains) {
    const [domainA, domainB, domainC] = domains;

    A.scale.domain(domainA);
    B.scale.domain(domainB);
    C.scale.domain(domainC);

    return ternaryPlot;
  };

  ternaryPlot.gridLines = function (counts = 20) {
    return [A, B, C].map((axis, i) => {
      const gridCount = Array.isArray(counts) ? +counts[i] : +counts;
      const gridValues = axis.scale.ticks(gridCount - 1); // forgot what the -1 was for

      return gridValues.map((d) => [
        axis.gridLine(axis.scale(d)),
        axis.conjugate.gridLine(1 - axis.scale(d)),
      ]);
    });
  };

  ternaryPlot.ticks = function (counts = 10) {
    return [A, B, C].map((axis, i) => {
      const tickCount = Array.isArray(counts) ? +counts[i] : +counts;
      const tickValues = axis.scale.ticks(tickCount);

      const format = typeof tickFormat === "function"
        ? tickFormat
        : axis.scale.tickFormat(tickCount, tickFormat);

      return tickValues.map((tick) => {
        const tickPos = reverse ? 1 - axis.scale(tick) : axis.scale(tick); // not a fan of using "reverse" boolean
        return {
          tick: format(tick),
          position: axis.gridLine(tickPos),
          angle: axis.tickAngle,
          size: axis.tickSize,
          textAnchor: axis.tickTextAnchor,
        };
      });
    });
  };

  ternaryPlot.tickAngles = function (tickAngles) {
    return tickAngles
      ? ((A.tickAngle = tickAngles[0]),
        (B.tickAngle = tickAngles[1]),
        (C.tickAngle = tickAngles[2]),
        ternaryPlot)
      : [A.tickAngle, B.tickAngle, C.tickAngle];
  };

  ternaryPlot.tickSizes = function (_) {
    return _
      ? Array.isArray(_)
        ? ((A.tickSize = _[0]),
          (B.tickSize = _[1]),
          (C.tickSize = _[2]),
          ternaryPlot)
        : ((A.tickSize = B.tickSize = C.tickSize = +_), ternaryPlot)
      : [A.tickSize, B.tickSize, C.tickSize];
  };

  ternaryPlot.tickFormat = function (_) {
    return _ ? ((tickFormat = _), ternaryPlot) : tickFormat;
  };

  ternaryPlot.tickTextAnchors = function (_) {
    return _
      ? ((A.tickTextAnchor = _[0]),
        (B.tickTextAnchor = _[1]),
        (C.tickTextAnchor = _[2]),
        ternaryPlot)
      : [A.tickTextAnchor, B.tickTextAnchor, C.tickTextAnchor];
  };

  ternaryPlot.labels = function (_) {
    return _
      ? ((A.label = String(_[0])),
        (B.label = String(_[1])),
        (C.label = String(_[2])),
        ternaryPlot)
      : [A.label, B.label, C.label];
  };

  ternaryPlot.labelAngles = function (_) {
    return _
      ? ((A.labelAngle = _[0]),
        (B.labelAngle = _[1]),
        (C.labelAngle = _[2]),
        ternaryPlot)
      : [A.labelAngle, B.labelAngle, C.labelAngle];
  };

  ternaryPlot.labelOffsets = function (_) {
    return _
      ? Array.isArray(_)
        ? ((A.labelOffset = _[0]),
          (B.labelOffset = _[1]),
          (C.labelOffset = _[2]),
          ternaryPlot)
        : ((A.labelOffset = B.labelOffset = C.labelOffset = +_), ternaryPlot)
      : [A.labelOffset, B.labelOffset, C.labelOffset];
  };

  ternaryPlot.triangle = function () {
    // TODO: use d3-path or d3-line for canvas support
    return `M${svA}L${svB}L${svC}Z`;
  };

  ternaryPlot.radius = function (_) {
    if (typeof _ === "undefined") return radius;

    radius = +_;

    [svA, svB, svC] = ternaryPlot.vertices(); // scaled vertices for drawing gridlines and axis labels

    // 🤔💭 Make a function for setting gridlines?
    A.gridLine = lineBetween(svC, svA);
    B.gridLine = lineBetween(svA, svB);
    C.gridLine = lineBetween(svB, svC);

    return ternaryPlot;
  };

  ternaryPlot.scale = function (_) {
    return _ ? ((k = +_), ternaryPlot.transform(), ternaryPlot) : k;
  };

  ternaryPlot.translate = function (_) {
    return _
      ? ((tx = _[0]), (ty = _[1]), ternaryPlot.transform(), ternaryPlot)
      : [[tx, ty]];
  };

  ternaryPlot.invert = function (_) {
    const xy = [_[0] / radius, _[1] / radius];

    return barycentric.invert(xy);
  };

  // apply scale and translate to vertices
  ternaryPlot.transform = function () {
    if (k === 1) {
      tx = 0;
      ty = 0;
      return ternaryPlot;
    }

    const scaleAndTranslateVertex = ([vx, vy]) => [vx * k + tx, vy * k + ty];

    const [vA, vB, vC] = unscaledVertices; // copy old unscaled vertices
    // these are the newly transformed vertices BEFORE checking if they within bounds of original triangle
    const [newvA, newvB, _newvC] = unscaledVertices.map(
      scaleAndTranslateVertex,
    );

    // slopes of triangle sides
    const mAB = getSlope(vA, vB), // In case of equilateral triangle: sqrt(3) = 1.732
      mAC = getSlope(vA, vC), // In case of equilateral triangle: -sqrt(3) = -1.732
      mBC = getSlope(vB, vC); // In case of equilateral triangle: 0

    // y-intercepts of zoomed triangle sides
    // newY = m * newX + b
    const bAB = newvA[1] - mAB * newvA[0],
      bAC = newvA[1] - mAC * newvA[0],
      bBC = newvB[1] - mBC * newvB[0];

    const lineDistanceAC = parallelLinesDistance(vA[1], bAC, mAC),
      lineDistanceAB = parallelLinesDistance(reverse ? vB[1] : vA[1], bAB, mAB),
      lineDistanceBC = parallelLinesDistance(vB[1], bBC, mBC);

    if (lineDistanceAB < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mAB,
        lineDistanceAB,
      );

      tx += correctionX;
      ty += correctionY;
    }

    if (lineDistanceAC < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mAC,
        lineDistanceAC,
      );

      tx += correctionX;
      ty += correctionY;
    }

    if (lineDistanceBC < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mBC,
        lineDistanceBC,
      );

      tx += correctionX;
      ty += correctionY;
    }

    const transformedVertices = unscaledVertices.map(scaleAndTranslateVertex);

    barycentric.vertices(transformedVertices); // update barycentic coordinates

    return ternaryPlot;
  };

  ternaryPlot.transformFromDomains = function (domains) {
    const [domainA, domainB, domainC] = domains;

    const domainLengths = getDomainLengths(domains);
    const domainLength = [...domainLengths][0];

    const [uvA, uvB, uvC] = unscaledVertices;
    const k = 1 / domainLength;

    // find start value of centered, untranslated domain for this scale
    const untranslatedDomainStart = (1 - domainLength) / 3;

    const shiftA = untranslatedDomainStart - domainA[0],
      shiftB = untranslatedDomainStart - domainB[0],
      shiftC = untranslatedDomainStart - domainC[0];

    const [tx, ty] = [
      uvA[0] * shiftA + uvB[0] * shiftB + uvC[0] * shiftC,
      uvA[1] * shiftA + uvB[1] * shiftB + uvC[1] * shiftC,
    ].map((d) => d * k);

    return { k, x: tx, y: ty };
  };

  ternaryPlot.domainsFromVertices = function () {
    const [bA, bB, bC] = unscaledVertices.map(barycentric.invert);

    const newADomain = [bB[0], bA[0]].map(insideDomain),
      newBDomain = [bC[1], bB[1]].map(insideDomain),
      newCDomain = [bA[2], bC[2]].map(insideDomain);

    return [newADomain, newBDomain, newCDomain];
  };

  return ternaryPlot;
}
