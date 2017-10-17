define(['map/clientlayer', 'map/labellayer', 'leaflet', 'map/locationmarker'],
  function (ClientLayer, LabelLayer, L, LocationMarker) {
    'use strict';
    var self = {};

    var ButtonBase = L.Control.extend({
      options: {
        position: 'bottomright'
      },

      active: false,
      button: undefined,

      initialize: function (f, o) {
        L.Util.setOptions(this, o);
        this.f = f;
      },

      update: function () {
        this.button.classList.toggle('active', this.active);
      },

      set: function (v) {
        this.active = v;
        this.update();
      }
    });

    var LocateButton = ButtonBase.extend({
      onAdd: function () {
        var button = L.DomUtil.create('button', 'ion-locate shadow');
        button.setAttribute('data-tooltip', _.t('button.tracking'));
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.addListener(button, 'click', this.onClick, this);

        this.button = button;

        return button;
      },

      onClick: function () {
        this.f(!this.active);
      }
    });

    var CoordsPickerButton = ButtonBase.extend({
      onAdd: function () {
        var button = L.DomUtil.create('button', 'ion-pin shadow');
        button.setAttribute('data-tooltip', _.t('button.location'));

        // Click propagation isn't disabled as this causes problems with the
        // location picking mode; instead propagation is stopped in onClick().
        L.DomEvent.addListener(button, 'click', this.onClick, this);

        this.button = button;

        return button;
      },

      onClick: function (e) {
        L.DomEvent.stopPropagation(e);
        this.f(!this.active);
      }
    });

    return function (config, map, router, buttons) {
      var userLocation;

      var locateUserButton = new LocateButton(function (d) {
        if (d) {
          enableTracking();
        } else {
          self.disableTracking();
        }
      });

      var mybuttons = [];

      function addButton(button) {
        var el = button.onAdd();
        mybuttons.push(el);
        buttons.appendChild(el);
      }

      self.clearButtons = function clearButtons() {
        mybuttons.forEach(function (d) {
          buttons.removeChild(d);
        });
      };

      var showCoordsPickerButton = new CoordsPickerButton(function (d) {
        if (d) {
          enableCoords();
        } else {
          disableCoords();
        }
      });

      function enableTracking() {
        map.locate({
          watch: true,
          enableHighAccuracy: true,
          setView: true
        });
        locateUserButton.set(true);
      }

      self.disableTracking = function disableTracking() {
        map.stopLocate();
        self.locationError();
        locateUserButton.set(false);
      };

      function enableCoords() {
        map.getContainer().classList.add('pick-coordinates');
        map.on('click', showCoordinates);
        showCoordsPickerButton.set(true);
      }

      function disableCoords() {
        map.getContainer().classList.remove('pick-coordinates');
        map.off('click', showCoordinates);
        showCoordsPickerButton.set(false);
      }

      function showCoordinates(e) {
        router.fullUrl({ zoom: map.getZoom(), lat: e.latlng.lat, lng: e.latlng.lng });
        disableCoords();
      }

      self.locationFound = function locationFound(e) {
        if (!userLocation) {
          userLocation = new LocationMarker(e.latlng).addTo(map);
        }

        userLocation.setLatLng(e.latlng);
        userLocation.setAccuracy(e.accuracy);
      };

      self.locationError = function locationError() {
        if (userLocation) {
          map.removeLayer(userLocation);
          userLocation = null;
        }
      };

      self.init = function init() {
        addButton(locateUserButton);
        addButton(showCoordsPickerButton);
      };

      return self;
    };
  });
