require.config({
  baseUrl: "lib",
  paths: {
    "leaflet": "../bower_components/leaflet/dist/leaflet",
    "leaflet.label": "../bower_components/Leaflet.label/dist/leaflet.label",
    "chroma-js": "../bower_components/chroma-js/chroma.min",
    "moment": "../bower_components/moment/min/moment-with-locales.min",
    "tablesort": "../bower_components/tablesort/tablesort.min",
    "tablesort.numeric": "../bower_components/tablesort/src/sorts/tablesort.numeric",
    "helper": "../helper"
  },
  shim: {
    "leaflet.label": ["leaflet"],
    "tablesort": {
      exports: "Tablesort"
    },
    "tablesort.numeric": ["tablesort"],
    "helper": []
  }
})

require(["main", "helper"], function (main) {
  main()
})
