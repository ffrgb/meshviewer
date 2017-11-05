define(['leaflet'], function (L) {
  'use strict';

  return L.CircleMarker.extend({
    initialize: function (latlng) {
      this.accuracyCircle = L.circle(latlng, 0, config.locate.accuracyCircle);
      this.outerCircle = L.circleMarker(latlng, config.locate.outerCircle);
      L.CircleMarker.prototype.initialize.call(this, latlng, config.locate.innerCircle);

      this.on('remove', function () {
        this._map.removeLayer(this.accuracyCircle);
        this._map.removeLayer(this.outerCircle);
      });
    },

    setLatLng: function (latlng) {
      this.accuracyCircle.setLatLng(latlng);
      this.outerCircle.setLatLng(latlng);
      L.CircleMarker.prototype.setLatLng.call(this, latlng);
    },

    setAccuracy: function (accuracy) {
      this.accuracyCircle.setRadius(accuracy);
    },

    onAdd: function (map) {
      this.accuracyCircle.addTo(map).bringToBack();
      this.outerCircle.addTo(map);
      L.CircleMarker.prototype.onAdd.call(this, map);
    }
  });
});
