"use strict";

require.config({
  baseUrl: "lib",
  paths: {
    "leaflet": "../bower_components/leaflet/dist/leaflet",
    "leaflet.label": "../bower_components/Leaflet.label/dist/leaflet.label",
    "chroma-js": "../bower_components/chroma-js/chroma.min",
    "moment": "../bower_components/moment",
    "tablesort": "../bower_components/tablesort/src/tablesort",
    "d3": "../bower_components/d3/d3.min",
    "virtual-dom": "../bower_components/virtual-dom/dist/virtual-dom",
    "rbush": "../bower_components/rbush/rbush",
    "helper": "utils/helper"
  },
  shim: {
    "leaflet.label": ["leaflet"],
    "tablesort": {
      exports: "Tablesort"
    }
  }
});

require(["main"], function (main) {
  main(jsonData);
});
