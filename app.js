require.config({
  baseUrl: "lib",
  paths: {
    "leaflet": "../bower_components/leaflet/dist/leaflet",
    "leaflet.label": "../bower_components/Leaflet.label/dist/leaflet.label",
    "leaflet.providers": "../bower_components/leaflet-providers/leaflet-providers",
    "chroma-js": "../bower_components/chroma-js/chroma.min",
    "moment": "../bower_components/moment/min/moment-with-locales.min",
    "tablesort": "../bower_components/tablesort/tablesort.min",
    "tablesort.numeric": "../bower_components/tablesort/src/sorts/tablesort.numeric",
    "d3": "../bower_components/d3/d3.min",
    "numeral": "../bower_components/numeraljs/min/numeral.min",
    "numeral-intl": "../bower_components/numeraljs/min/languages.min",
    "virtual-dom": "../bower_components/virtual-dom/dist/virtual-dom",
    "rbush": "../bower_components/rbush/rbush",
    "helper": "../helper",
    "jshashes": "../bower_components/jshashes/hashes"
  },
  shim: {
    "leaflet.label": ["leaflet"],
    "leaflet.providers": ["leaflet"],
    "tablesort": {
      exports: "Tablesort"
    },
    "numeral-intl": {
      deps: ["numeral"],
      exports: "numeral"
    },
    "tablesort.numeric": ["tablesort"],
    "helper": ["numeral-intl"]
  }
});

require(["main", "helper"], function (main) {
  getJSON("config.json").then(main);
});
