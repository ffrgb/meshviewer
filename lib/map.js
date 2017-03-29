define(['map/clientlayer', 'map/labellayer', 'leaflet', 'moment', 'map/locationmarker', 'rbush', 'helper', 'utils/scales'],
  function (ClientLayer, LabelLayer, L, moment, LocationMarker, rbush, helper, scales) {
    'use strict';

    var options = {
      worldCopyJump: true,
      zoomControl: true,
      minZoom: 0
    };

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

    function mkMarker(dict, iconFunc, router) {
      return function (d) {
        var m = L.circleMarker([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude], iconFunc(d));

        m.resetStyle = function resetStyle() {
          m.setStyle(iconFunc(d));
        };

        m.on('click', router.node(d));
        m.bindTooltip(d.nodeinfo.hostname);

        dict[d.nodeinfo.node_id] = m;

        return m;
      };
    }

    function addLinksToMap(dict, graph, router) {
      graph = graph.filter(function (d) {
        return 'distance' in d && !d.vpn;
      });

      return graph.map(function (d) {
        var opts = {
          color: scales.link(1 / d.tq),
          weight: 4,
          opacity: 0.5,
          dashArray: 'none'
        };

        var line = L.polyline(d.latlngs, opts);

        line.resetStyle = function resetStyle() {
          line.setStyle(opts);
        };

        line.bindTooltip(d.source.node.nodeinfo.hostname + ' – ' + d.target.node.nodeinfo.hostname + '<br><strong>' + helper.showDistance(d) + ' / ' + helper.showTq(d) + '</strong>');
        line.on('click', router.link(d));

        dict[d.id] = line;

        return line;
      });
    }

    return function (sidebar, router, buttons) {
      var self = this;
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

      map.addLayer(layers[0].layer);

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

      map.zoomControl.setPosition('topright');

      var clientLayer = new ClientLayer({ minZoom: config.clientZoom });
      clientLayer.addTo(map);
      clientLayer.setZIndex(5);

      var labelLayer = new LabelLayer({ minZoom: config.labelZoom });
      labelLayer.addTo(map);
      labelLayer.setZIndex(6);

      map.on('zoom', function () {
        clientLayer.redraw();
        labelLayer.redraw();
      });

      map.on('baselayerchange', function (e) {
        map.options.maxZoom = e.layer.options.maxZoom;
        clientLayer.options.maxZoom = map.options.maxZoom;
        labelLayer.options.maxZoom = map.options.maxZoom;
        if (map.getZoom() > map.options.maxZoom) {
          map.setZoom(map.options.maxZoom);
        }

        var style = document.querySelector('.css-mode:not([media="not"])');
        if (style && e.layer.options.mode !== '' && !style.classList.contains(e.layer.options.mode)) {
          style.media = 'not';
          labelLayer.updateLayer();
        }
        if (e.layer.options.mode) {
          var newStyle = document.querySelector('.css-mode.' + e.layer.options.mode);
          newStyle.media = '';
          newStyle.appendChild(document.createTextNode(''));
          labelLayer.updateLayer();
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
          if (highlight.type === 'node' && nodeDict[highlight.o.nodeinfo.node_id]) {
            m = nodeDict[highlight.o.nodeinfo.node_id];
            m.setStyle({ color: 'orange', weight: 20, fillOpacity: 1, opacity: 0.7, className: 'stroke-first' });
          } else if (highlight.type === 'link' && linkDict[highlight.o.id]) {
            m = linkDict[highlight.o.id];
            m.setStyle({ weight: 4, opacity: 1, dashArray: '5, 10' });
          }
        }

        if (!nopanzoom) {
          if (m) {
            goto(m);
          } else if (savedView) {
            map.setView(savedView.center, savedView.zoom);
          } else {
            setView(config.fixedCenter);
          }
        }
      }

      function mapRTree(d) {
        return {
          minX: d.nodeinfo.location.latitude, minY: d.nodeinfo.location.longitude,
          maxX: d.nodeinfo.location.latitude, maxY: d.nodeinfo.location.longitude,
          node: d
        };
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

        var lines = addLinksToMap(linkDict, data.graph.links, router);
        groupLines = L.featureGroup(lines).addTo(map);

        var nodesOnline = helper.subtract(data.nodes.all.filter(helper.online), data.nodes.new);
        var nodesOffline = helper.subtract(data.nodes.all.filter(helper.offline), data.nodes.lost);

        var markersOnline = nodesOnline.filter(helper.hasLocation)
          .map(mkMarker(nodeDict, function () {
            return config.constance.map.node.online;
          }, router));

        var markersOffline = nodesOffline.filter(helper.hasLocation)
          .map(mkMarker(nodeDict, function () {
            return config.constance.map.node.offline;
          }, router));

        var markersNew = data.nodes.new.filter(helper.hasLocation)
          .map(mkMarker(nodeDict, function () {
            return config.constance.map.node.new;
          }, router));

        var markersLost = data.nodes.lost.filter(helper.hasLocation)
          .map(mkMarker(nodeDict, function (d) {
            if (d.lastseen.isAfter(moment(data.now).subtract(config.maxAgeAlert, 'days'))) {
              return config.constance.map.node.alert;
            }

            if (d.lastseen.isAfter(moment(data.now).subtract(config.maxAge, 'days'))) {
              return config.constance.map.node.lost;
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
        labelLayer.setData({
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
