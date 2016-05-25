require.config({
  baseUrl: "lib",
  paths: {
    "leaflet": "../bower_components/leaflet/dist/leaflet",
    "leaflet.label": "../bower_components/Leaflet.label/dist/leaflet.label",
    "leaflet.providers": "../bower_components/leaflet-providers/leaflet-providers",
    "chroma-js": "../bower_components/chroma-js/chroma.min",
    "moment": "../bower_components/moment/min/moment.min",
    "moment.de": "../bower_components/moment/locale/de",
    "tablesort": "../bower_components/tablesort/tablesort.min",
    "tablesort.number": "../bower_components/tablesort/src/sorts/tablesort.number",
    "d3": "../bower_components/d3/d3.min",
    "virtual-dom": "../bower_components/virtual-dom/dist/virtual-dom",
    "rbush": "../bower_components/rbush/rbush",
    "helper": "../helper"
  },
  shim: {
    "leaflet.label": ["leaflet"],
    "leaflet.providers": ["leaflet"],
    "moment.de": ["moment"],
    "tablesort": {
      exports: "Tablesort"
    },
    "tablesort.number": ["tablesort"]
  }
});

require(["main", "helper"], function (main) {
  getJSON("config.json").then(main);
});
