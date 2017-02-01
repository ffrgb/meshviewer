define(['map/clientlayer', 'map/labelslayer',
  'leaflet', 'moment', 'locationmarker', 'rbush', 'helper',
  'leaflet.label'],
  function (ClientLayer, LabelsLayer, L, moment, LocationMarker, rbush, helper) {
    'use strict';

    var options = {
      worldCopyJump: true,
      zoomControl: false
    };

    var LocateButton = L.Control.extend({
      options: {
        position: 'bottomright'
      },

      active: false,
      button: undefined,

      initialize: function (f, o) {
        L.Util.setOptions(this, o);
        this.f = f;
      },

      onAdd: function () {
        var button = L.DomUtil.create('button', 'ion-android-locate shadow');
        L.DomEvent.disableClickPropagation(button);
        L.DomEvent.addListener(button, 'click', this.onClick, this);

        this.button = button;

        return button;
      },

      update: function () {
        this.button.classList.toggle('active', this.active);
      },

      set: function (v) {
        this.active = v;
        this.update();
      },

      onClick: function () {
        this.f(!this.active);
      }
    });

    var CoordsPickerButton = L.Control.extend({
      options: {
        position: 'bottomright'
      },

      active: false,
      button: undefined,

      initialize: function (f, o) {
        L.Util.setOptions(this, o);
        this.f = f;
      },

      onAdd: function () {
        var button = L.DomUtil.create('button', 'ion-pin shadow');

        // Click propagation isn't disabled as this causes problems with the
        // location picking mode; instead propagation is stopped in onClick().
        L.DomEvent.addListener(button, 'click', this.onClick, this);

        this.button = button;

        return button;
      },

      update: function () {
        this.button.classList.toggle('active', this.active);
      },

      set: function (v) {
        this.active = v;
        this.update();
      },

      onClick: function (e) {
        L.DomEvent.stopPropagation(e);
        this.f(!this.active);
      }

    });

    function mkMarker(dict, iconFunc, router) {
      return function (d) {
        var m = L.circleMarker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], iconFunc(d));

        m.resetStyle = function resetStyle() {
          m.setStyle(iconFunc(d));
        };

        m.on('click', router.node(d));
        m.bindLabel(d.nodeinfo.hostname);

        dict[d.nodeinfo.node_id] = m;

        return m;
      };
    }

    function addLinksToMap(dict, linkScale, graph, router) {
      graph = graph.filter(function (d) {
        return 'distance' in d && d.type !== 'VPN';
      });

      return graph.map(function (d) {
        var opts = {
          color: d.type === 'Kabel' ? '#50B0F0' : linkScale(d.tq).hex(),
          weight: 4,
          opacity: 0.5,
          dashArray: 'none'
        };

        var line = L.polyline(d.latlngs, opts);

        line.resetStyle = function resetStyle() {
          line.setStyle(opts);
        };

        line.bindLabel(d.source.node.nodeinfo.hostname + ' – ' + d.target.node.nodeinfo.hostname + '<br><strong>' + helper.showDistance(d) + ' / ' + helper.showTq(d) + '</strong>');
        line.on('click', router.link(d));

        dict[d.id] = line;

        return line;
      });
    }

    var iconOnline = {
      color: '#1566A9',
      fillColor: '#1566A9',
      radius: 6,
      fillOpacity: 0.5,
      opacity: 0.5,
      weight: 2,
      className: 'stroke-first'
    };
    var iconOffline = {
      color: '#D43E2A',
      fillColor: '#D43E2A',
      radius: 3,
      fillOpacity: 0.5,
      opacity: 0.5,
      weight: 1,
      className: 'stroke-first'
    };
    var iconLost = {
      color: '#D43E2A',
      fillColor: '#D43E2A',
      radius: 4,
      fillOpacity: 0.8,
      opacity: 0.8,
      weight: 1,
      className: 'stroke-first'
    };
    var iconAlert = {
      color: '#D43E2A',
      fillColor: '#D43E2A',
      radius: 5,
      fillOpacity: 0.8,
      opacity: 0.8,
      weight: 2,
      className: 'stroke-first'
    };
    var iconNew = { color: '#1566A9', fillColor: '#93E929', radius: 6, fillOpacity: 1.0, opacity: 0.5, weight: 2 };

    return function (config, linkScale, sidebar, router, buttons) {
      var self = this;
      var barycenter;
      var groupOnline;
      var groupOffline;
      var groupNew;
      var groupLost;
      var groupLines;
      var savedView;

      var map;
      var userLocation;
      var layerControl;
      var baseLayers = {};

      var locateUserButton = new LocateButton(function (d) {
        if (d) {
          enableTracking();
        } else {
          disableTracking();
        }
      });

      var mybuttons = [];

      function addButton(button) {
        var el = button.onAdd();
        mybuttons.push(el);
        buttons.appendChild(el);
      }

      function clearButtons() {
        mybuttons.forEach(function (d) {
          buttons.removeChild(d);
        });
      }

      var showCoordsPickerButton = new CoordsPickerButton(function (d) {
        if (d) {
          enableCoords();
        } else {
          disableCoords();
        }
      });

      function saveView() {
        savedView = {
          center: map.getCenter(),
          zoom: map.getZoom()
        };
      }

      function enableTracking() {
        map.locate({
          watch: true,
          enableHighAccuracy: true,
          setView: true
        });
        locateUserButton.set(true);
      }

      function disableTracking() {
        map.stopLocate();
        locationError();
        locateUserButton.set(false);
      }

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
        router.gotoLocation(e.latlng);
        disableCoords();
      }

      function locationFound(e) {
        if (!userLocation) {
          userLocation = new LocationMarker(e.latlng).addTo(map);
        }

        userLocation.setLatLng(e.latlng);
        userLocation.setAccuracy(e.accuracy);
      }

      function locationError() {
        if (userLocation) {
          map.removeLayer(userLocation);
          userLocation = null;
        }
      }

      function contextMenuOpenLayerMenu() {
        document.querySelector('.leaflet-control-layers').classList.add('leaflet-control-layers-expanded');
      }

      var el = document.createElement('div');
      el.classList.add('map');

      map = L.map(el, options);
      var now = new Date();
      config.mapLayers.forEach(function (item, i) {
        if ((typeof item.config.start === 'number' && item.config.start <= now.getHours()) || (typeof item.config.end === 'number' && item.config.end > now.getHours())) {
          item.config.order = item.config.start * -1;
        } else {
          item.config.order = i;
        }
      });

      config.mapLayers = config.mapLayers.sort(function (a, b) {
        return a.config.order - b.config.order;
      });

      var layers = config.mapLayers.map(function (d) {
        return {
          'name': d.name,
          'layer': 'url' in d ? L.tileLayer(d.url.replace('{retina}', L.Browser.retina ? '@2x' : ''), d.config) : console.warn('Missing map url')
        };
      });

      layers[0].layer.addTo(map);

      layers.forEach(function (d) {
        baseLayers[d.name] = d.layer;
      });

      map.on('locationfound', locationFound);
      map.on('locationerror', locationError);
      map.on('dragend', saveView);
      map.on('contextmenu', contextMenuOpenLayerMenu);

      addButton(locateUserButton);
      addButton(showCoordsPickerButton);

      layerControl = L.control.layers(baseLayers, [], { position: 'bottomright' });
      layerControl.addTo(map);

      var clientLayer = new ClientLayer({ minZoom: 15 });
      clientLayer.addTo(map);
      clientLayer.setZIndex(5);

      var labelsLayer = new LabelsLayer({});
      labelsLayer.addTo(map);
      labelsLayer.setZIndex(6);

      map.on('baselayerchange', function (e) {
        map.options.maxZoom = e.layer.options.maxZoom;
        clientLayer.options.maxZoom = map.options.maxZoom;
        labelsLayer.options.maxZoom = map.options.maxZoom;
        if (map.getZoom() > map.options.maxZoom) {
          map.setZoom(map.options.maxZoom);
        }

        var style = document.querySelector('.css-mode:not([media="not"])');
        if (style && e.layer.options.mode !== '' && !style.classList.contains(e.layer.options.mode)) {
          style.media = 'not';
          labelsLayer.updateLayer();
        }
        if (e.layer.options.mode) {
          document.querySelector('.css-mode.' + e.layer.options.mode).media = '';
          labelsLayer.updateLayer();
        }
      });

      var nodeDict = {};
      var linkDict = {};
      var highlight;

      function resetMarkerStyles(nodes, links) {
        Object.keys(nodes).forEach(function (d) {
          nodes[d].resetStyle();
        });

        Object.keys(links).forEach(function (d) {
          links[d].resetStyle();
        });
      }

      function setView(bounds) {
        map.fitBounds(bounds, { paddingTopLeft: [sidebar(), 0], maxZoom: config.nodeZoom });
      }

      function resetZoom() {
        if (barycenter) {
          setView(barycenter.getBounds());
        }
      }

      function goto(m) {
        var bounds;

        if ('getBounds' in m) {
          bounds = m.getBounds();
        } else {
          bounds = L.latLngBounds([m.getLatLng()]);
        }

        setView(bounds);

        return m;
      }

      function updateView(nopanzoom) {
        resetMarkerStyles(nodeDict, linkDict);
        var m;

        if (highlight !== undefined) {
          if (highlight.type === 'node') {
            m = nodeDict[highlight.o.nodeinfo.node_id];

            if (m) {
              m.setStyle({ color: 'orange', weight: 20, fillOpacity: 1, opacity: 0.7, className: 'stroke-first' });
            }
          } else if (highlight.type === 'link') {
            m = linkDict[highlight.o.id];

            if (m) {
              m.setStyle({ weight: 4, opacity: 1, dashArray: '5, 10' });
            }
          }
        }

        if (!nopanzoom) {
          if (m) {
            goto(m);
          } else if (savedView) {
            map.setView(savedView.center, savedView.zoom);
          } else {
            resetZoom();
          }
        }
      }

      function mapRTree(d) {
        var o = [d.nodeinfo.location.latitude, d.nodeinfo.location.longitude,
          d.nodeinfo.location.latitude, d.nodeinfo.location.longitude];

        o.node = d;

        return o;
      }

      self.setData = function setData(data) {
        nodeDict = {};
        linkDict = {};

        if (groupOffline) {
          groupOffline.clearLayers();
        }

        if (groupOnline) {
          groupOnline.clearLayers();
        }

        if (groupNew) {
          groupNew.clearLayers();
        }

        if (groupLost) {
          groupLost.clearLayers();
        }

        if (groupLines) {
          groupLines.clearLayers();
        }

        var lines = addLinksToMap(linkDict, linkScale, data.graph.links, router);
        groupLines = L.featureGroup(lines).addTo(map);

        if (typeof config.fixedCenter === 'undefined') {
          console.error('FixedCenter is required');
        } else {
          barycenter = L.circle(L.latLng(new L.LatLng(config.fixedCenter.lat, config.fixedCenter.lng)), config.fixedCenter.radius * 1000);
        }

        var nodesOnline = helper.subtract(data.nodes.all.filter(helper.online), data.nodes.new);
        var nodesOffline = helper.subtract(data.nodes.all.filter(helper.offline), data.nodes.lost);

        var markersOnline = nodesOnline.filter(helper.hasLocation)
          .map(mkMarker(nodeDict, function () {
            return iconOnline;
          }, router));

        var markersOffline = nodesOffline.filter(helper.hasLocation)
          .map(mkMarker(nodeDict, function () {
            return iconOffline;
          }, router));

        var markersNew = data.nodes.new.filter(helper.hasLocation)
          .map(mkMarker(nodeDict, function () {
            return iconNew;
          }, router));

        var markersLost = data.nodes.lost.filter(helper.hasLocation)
          .map(mkMarker(nodeDict, function (d) {
            if (d.lastseen.isAfter(moment(data.now).subtract(config.maxAgeAlert, 'days'))) {
              return iconAlert;
            }

            if (d.lastseen.isAfter(moment(data.now).subtract(config.maxAge, 'days'))) {
              return iconLost;
            }
            return null;
          }, router));

        groupOffline = L.featureGroup(markersOffline).addTo(map);
        groupLost = L.featureGroup(markersLost).addTo(map);
        groupOnline = L.featureGroup(markersOnline).addTo(map);
        groupNew = L.featureGroup(markersNew).addTo(map);

        var rtreeOnlineAll = rbush(9);

        rtreeOnlineAll.load(data.nodes.all.filter(helper.online).filter(helper.hasLocation).map(mapRTree));

        clientLayer.setData(rtreeOnlineAll);
        labelsLayer.setData({
          online: nodesOnline.filter(helper.hasLocation),
          offline: nodesOffline.filter(helper.hasLocation),
          new: data.nodes.new.filter(helper.hasLocation),
          lost: data.nodes.lost.filter(helper.hasLocation)
        });

        updateView(true);
      };

      self.resetView = function resetView() {
        disableTracking();
        highlight = undefined;
        updateView();
      };

      self.gotoNode = function gotoNode(d, update) {
        disableTracking();
        highlight = { type: 'node', o: d };
        updateView(update);
      };

      self.gotoLink = function gotoLink(d, update) {
        disableTracking();
        highlight = { type: 'link', o: d };
        updateView(update);
      };

      self.gotoLocation = function gotoLocation() {
        // ignore
      };

      self.destroy = function destroy() {
        clearButtons();
        map.remove();

        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      };

      self.render = function render(d) {
        d.appendChild(el);
        map.invalidateSize();
      };

      return self;
    };
  });
