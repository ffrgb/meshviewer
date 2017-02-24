define(['d3-selection', 'd3-zoom', 'd3-drag', 'd3-force'], function (d3Selection, d3Zoom, d3Drag, d3Force) {
  return Object.assign({}, d3Zoom, d3Drag, d3Force, d3Selection);
});
