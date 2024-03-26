import { ScaleLinear } from "d3";

export interface Barycentric {
  (d: any): Coord;
  /**
   * Computes ternary values from coordinates (a two-element array `[x, y]`). Note that the [x, y] coordinates here are unscaled i.e. a radius of 1.
   * [Wikipedia: Conversion between barycentric and Cartesian coordinates](en.wikipedia.org/wiki/Barycentric_coordinate_system#Conversion_between_barycentric_and_Cartesian_coordinates)
   */
  invert([x, y]: Coord): [number, number, number];
  /** Returns the current a-value accessor, which defaults to: `const a = (d) => d[0];` */
  a(): Accessor;
  /** Sets the a-accessor to the specified function and returns this barycentric converter. */
  a(fn: Accessor): Barycentric;
  /** Returns the current b-value accessor, which defaults to: `const b = (d) => d[0];` */
  b(): Accessor;
  /** Sets the b-accessor to the specified function and returns this barycentric converter. */
  b(fn: Accessor): Barycentric;
  /** Returns the current c-value accessor, which defaults to: `const v = (d) => d[0];` */
  c(): Accessor;
  /** Sets the c-accessor to the specified function and returns this barycentric converter. */
  c(fn: Accessor): Barycentric;
  /** Returns the current vertices, which defaults to the vertices of an equilateral triangle with radius 1 with angles -90°, 150°, 30°. */
  vertices(): [Coord, Coord, Coord];
  /** Sets the vertices to the specified array and returns this barycentric converter. */
  vertices(ABC: readonly [Coord, Coord, Coord]): Barycentric;
  /**
   * Computes normalized ternary values by summing and taking proportions of ternary data using the value accessors.
   * [Wikipedia: Composition closure operator](https://en.wikipedia.org/wiki/Compositional_data)
   */
  normalize: (_: [number, number, number]) => [number, number, number];
}

export interface TernaryPlot {
  (_: any): Coord;
  /** Returns the plots current, scaled vertices. */
  vertices(): [Coord, Coord, Coord];
  /** Unscales _newScaledVertices_ and sets the vertices of the _barycentric()_ function passed to _ternaryPlot()_. */
  vertices(newScaledVertices: readonly [Coord, Coord, Coord]): TernaryPlot;
  /**
   * Generates and return an array containing axis label objects. Each axis label object contains the following properties.
   * - `position`: an array of [x,y] coords
   * - `labelAngle`: the rotation of the axis label
   * - `label`: The axis label
   *
   * Takes an optional configuration object that specifies whether axis labels should be placed at the center of the axis, the default is `false`.
   */
  axisLabels(_: { center: boolean }): [AxisLabel, AxisLabel, AxisLabel];
  setDomains(domains: Domains): TernaryPlot;
  reverseVertices(): TernaryPlot;
  /** Returns the current domains, which defaults to `[[0, 1], [0, 1], [0, 1]]`. */
  domains(): Domains;
  /**
   * Sets the domains of the ternary plot to the specified domains in order `[A, B, C]` and checks if the supplied domains are reversed.
   * If this is the case, [`reverseVertices()`](#ternaryPlotReverseVertices) is called. The scale and translation offset associated with
   * the domains are [applied](#ternaryPlotTransformDoc) to correctly scale and translate the plot. At last it returns the ternaryPlot.
   */
  domains(domains: Domains): TernaryPlot;
  /**
   * Generates and return an array of arrays containing each grid line objects. If counts is not specified,
   * it defaults to 20. *Counts* can be a number or an array of numbers, one for each axis in order of `[A, B, C]`.
   * Each array contains `counts` elements of two-element arrays with the start- and end coordinates of the grid line in two-element arrays.
   */
  gridLines(
    counts: readonly [number, number, number]
  ): [[Coord, Coord][], [Coord, Coord][], [Coord, Coord][]];
  gridLines(
    counts: number
  ): [[Coord, Coord][], [Coord, Coord][], [Coord, Coord][]];
  /**
   * Generates and return an array of arrays containing each grid line objects. If counts is not specified
   * it defaults to 10. *Counts* can be a number or an array of numbers, one for each axis in order of `[A, B, C]`.
   * Each array contains `counts` elements of two-element arrays with the start- and end coordinates of the grid line in two-element arrays.
   */
  ticks(counts: number): Tick[][];
  ticks(counts: readonly [number, number, number]): Tick[][];
  /** Returns the current tick angles, which defaults to `[0, 60, -60]`. */
  tickAngles(): [number, number, number];
  /**
   * Sets the angle of axis ticks to the specified angles in order `[A, B, C]` and returns the ternary plot.
   * If _angles_ is not specified, returns the current tick angles, which defaults to `[0, 60, -60]`.
   */
  tickAngles(tickAngles: readonly [number, number, number]): TernaryPlot;
  /** Returns the current tick sizes, which defaults to `[6, 6, 6]` (px). */
  tickSizes(): [number, number, number];
  /** Sets the tick sizes of all axes to _sizes_ (px). */
  tickSizes(_: number): TernaryPlot;
  /** Sets the axis tick sizes to the specified tick sizes in order `[A, B, C]` and returns the ternary plot. */
  tickSizes(_: readonly [number, number, number]): TernaryPlot;
  /**
   * Returns the current tick sizes, which defaults to `"%"`, meaning ticks are formatted as percentages.
   */
  tickFormat(): string | ((tick: number) => string);
  /**
   * Sets the tick format or formatter. _format_ can either be a [format specifier string](https://github.com/d3/d3-format#format) that is passed to [`d3.tickFormat()`](https://github.com/d3/d3-scale/blob/master/README.md#tickFormat).
   * To implement your own tick format function, pass a custom formatter function, for example `const formatTick = (x) => String(x.toFixed(1))`.
   *
   * @param _ - [format specifier string](https://github.com/d3/d3-format#format) or formatter function
   */
  tickFormat(_: string | ((tick: number) => string)): TernaryPlot;
  /** Returns the current tick text-anchors, which defaults to `["start", "start", "end"]`. */
  tickTextAnchors(): [TextAnchor, TextAnchor, TextAnchor];
  /**
   * Sets the axis tick [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) to the specified text-anchors in order of `[A, B, C]` and returns the ternary plot.
   *
   * @param _ - The tick text anchors per axis in order of `[A, B, C]`
   */
  tickTextAnchors(
    _: readonly [TextAnchor, TextAnchor, TextAnchor]
  ): TernaryPlot;
  /** Returns the current labels, which defaults to `[A, B, C]`. */
  labels(): [string, string, string];
  /**
   * If _labels_ is specified, sets the axis labels to the labels in order `[A, B, C]` and returns the ternary plot.
   *
   * @param _ The labels per axis in order of `[A, B, C]`
   */
  labels(
    _: readonly [string | number, string | number, string | number]
  ): TernaryPlot;
  /** Returns the current label angles, which defaults to `[0, 60, -60]` */
  labelAngles(): [number, number, number];
  /**
   * Sets the angles of the axis labels to the specified angles in order `[A, B, C]` and returns the ternary plot.
   *
   * @param _ - The label angles per axis in order of `[A, B, C]`
   */
  labelAngles(_: readonly [number, number, number]): TernaryPlot;
  /**
   * The label offset is the spacing of the label to the vertex in pixels.
   * Returns the current label offsets, which defaults to `[45, 45, 45]` px.
   */
  labelOffsets(): [number, number, number];
  /**
   * The label offset is the spacing of the label to the vertex in pixels. Sets the label offsets of all axes to _offsets_.
   *
   * @param _ - The label offsets in px per axis in order of `[A, B, C]`
   */
  labelOffsets(_: number): TernaryPlot;
  /**
   * The label offset is the spacing of the label to the vertex in pixels. If _offsets_ is specified and is an array,
   * sets the axis label offsets to the specified angles in order of `[A, B, C]` and returns the ternary plot.
   *
   * @param _ - A label offset in px
   */
  labelOffsets(_: readonly [number, number, number]): TernaryPlot;
  /**
   * Returns an [SVG path command](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) for a the outer triangle.
   * This is used for the bounds of the ternary plot and its [clipPath](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath).
   */
  triangle(): string;
  /** Returns the current radius, which defaults to 300 (px). */
  radius(): number;
  /**
   * Sets the radius of the ternary plot to the specified number.
   *
   * @param _ - The plot radius in px
   */
  radius(_: number): TernaryPlot;
  /**
   * Returns the current scale factor, which defaults to `1`.
   *
   * The scale factor corresponds inversely to the domain length.
   * For example a domains of `[[0, 0.5], [0, 0.5], [0.5, 1]` corresponds to a scale of 2.
   */
  scale(): number;
  /**
   * If _scale_ is specified, sets the plot’s scale factor to the specified value, applies the transform and returns the plot.
   *
   * The scale factor corresponds inversely to the domain length. For example a domains of
   * `[[0, 0.5], [0, 0.5], [0.5, 1]` corresponds to a scale of 2.
   *
   * @param _ - The plot scale factor
   */
  scale(_: number): TernaryPlot;
  /**
   * Returns the current translation offset which defaults to `[0, 0]`.
   *
   * Note when setting the translation, the translation offsets are not scaled by the plot radius.
   */
  translate(): [number, number];
  /**
   * If translate is specified, sets the plot’s translation offset to the specified two-element array
   * `[tx, ty]`. Note that these are **unscaled by the radius**. Then it applies the transform and returns
   * the ternary plot.
   *
   * Note when setting the translation, the offsets **should not** be scaled by the plot radius.
   *
   * @param _ - The plot translation (not scaled by radius)
   */
  translate(_: [number, number]): TernaryPlot;
  /**
   * Computes ternary values from `[x, y]` coordinates that are scaled by the radius.
   * Unlike the _barycentric_.[invert()](#barycentricInvertDoc) method this method takes
   * the plot radius into account. Note that for inverting mouse positions, the ternary plot
   * should centered at the origin of the containing SVG element.
   *
   * @param _ - Array of ternary values
   */
  invert(_: Coord): [number, number, number];
  /**
   * Applies the plot's scale factor and translations to the plots *barycentric()* conversion function.
   * Or more simply, calling this method moves and scales the triangle defined by *barycentric()* used
   * to calculate the ternary values.
   * Before scale and translation are applied, they are checked if they are within bounds, if not,
   * a correction is applied such that they are within bounds. Finally, the ternary plot is returned.
   */
  transform(): TernaryPlot;
  /**
   * Computes the scale and translation for the given _domains_ and returns a transform object containing
   * scale *k*, and translation offsets *x*, and *y*. This is used to sync the zoom and pan of the plot to
   * the specified domains set by [.domains()](ternaryPlotDomainsDoc). You'll rarely need to call this method directly.
   *
   * Note that the translation returned here is unscaled by radius.
   *
   * @param domains - Array of the plot domains
   */
  transformFromDomains(domains: Readonly<Domains>): Transform;
  /**
   * Computes and returns the domains corresponding to the current transform.
   * This is used for syncing domains while zooming and panning.
   */
  domainsFromVertices(): Domains;
}

export interface Transform {
  k: number;
  x: number;
  y: number;
}

export type Domains = [[number, number], [number, number], [number, number]];

export type Coord = [number, number];

export type TextAnchor = "start" | "middle" | "end";

export interface AxisLabel {
  label: string | number;
  angle: number;
  position: Coord;
}

export interface Tick {
  tick: number | string;
  angle: number;
  textAnchor: TextAnchor;
  size: number;
  position: Coord;
}

export interface TernaryAxis {
  label: string;
  labelAngle: number;
  labelOffset: number;
  gridLine: (t: number) => Coord;
  scale: ScaleLinear<number, number, never>;
  tickAngle: number;
  tickSize: number;
  tickTextAnchor: TextAnchor;
  conjugate: TernaryAxis | null;
}

export type Accessor = (d: any) => number;
