define(['map/clientlayer', 'map/labellayer', 'map/button', 'leaflet', 'map/activearea'],
  function (ClientLayer, LabelLayer, Button, L) {
    'use strict';

    var options = {
      worldCopyJump: true,
      zoomControl: true,
      minZoom: 0
    };

    return function (linkScale, sidebar, buttons) {
      var self = this;
      var savedView;

      var map;
      var layerControl;
      var baseLayers = {};

      function saveView() {
        savedView = {
          center: map.getCenter(),
          zoom: map.getZoom()
        };
      }

      function contextMenuOpenLayerMenu() {
        document.querySelector('.leaflet-control-layers').classList.add('leaflet-control-layers-expanded');
      }

      function setActiveArea() {
        setTimeout(function () {
          map.setActiveArea({
            position: 'absolute',
            left: sidebar.getWidth() + 'px',
            right: 0,
            top: 0,
            bottom: 0
          });
        }, 300);
      }

      var el = document.createElement('div');
      el.classList.add('map');

      map = L.map(el, options);
      map.setActiveArea({
        position: 'absolute',
        left: sidebar.getWidth() + 'px',
        right: 0,
        top: 0,
        bottom: 0
      });

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
          'layer': L.tileLayer(d.url.replace('{retina}', L.Browser.retina ? '@2x' : ''), d.config)
        };
      });

      map.addLayer(layers[0].layer);

      layers.forEach(function (d) {
        baseLayers[d.name] = d.layer;
      });

      var button = new Button(map, buttons);

      map.on('locationfound', button.locationFound);
      map.on('locationerror', button.locationError);
      map.on('dragend', saveView);
      map.on('contextmenu', contextMenuOpenLayerMenu);

      if (config.geo) {
        [].forEach.call(config.geo, function (geo) {
          L.geoJSON(geo.json, geo.option).addTo(map);
        });
      }

      button.init();

      layerControl = L.control.layers(baseLayers, [], { position: 'bottomright' });
      layerControl.addTo(map);

      map.zoomControl.setPosition('topright');

      var clientLayer = new ClientLayer({ minZoom: config.clientZoom });
      clientLayer.addTo(map);
      clientLayer.setZIndex(5);

      var labelLayer = new LabelLayer({ minZoom: config.labelZoom });
      labelLayer.addTo(map);
      labelLayer.setZIndex(6);

      sidebar.button.addEventListener('visibility', setActiveArea);

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

      map.on('load', function () {
        var inputs = document.querySelectorAll('.leaflet-control-layers-selector');
        [].forEach.call(inputs, function (input) {
          input.setAttribute('role', 'radiogroup');
          input.setAttribute('aria-label', input.nextSibling.innerHTML.trim());
        });
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

      function setView(bounds, zoom) {
        map.fitBounds(bounds, { maxZoom: (zoom ? zoom : config.nodeZoom) });
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
          if (highlight.type === 'node' && nodeDict[highlight.o.node_id]) {
            m = nodeDict[highlight.o.node_id];
            m.setStyle(config.map.highlightNode);
          } else if (highlight.type === 'link' && linkDict[highlight.o.id]) {
            m = linkDict[highlight.o.id];
            m.setStyle(config.map.highlightLink);
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

      self.setData = function setData(data) {
        nodeDict = {};
        linkDict = {};

        clientLayer.setData(data);
        labelLayer.setData(data, map, nodeDict, linkDict, linkScale);

        updateView(true);
      };

      self.resetView = function resetView() {
        button.disableTracking();
        highlight = undefined;
        updateView();
      };

      self.gotoNode = function gotoNode(d) {
        button.disableTracking();
        highlight = { type: 'node', o: d };
        updateView();
      };

      self.gotoLink = function gotoLink(d) {
        button.disableTracking();
        highlight = { type: 'link', o: d[0] };
        updateView();
      };

      self.gotoLocation = function gotoLocation(d) {
        button.disableTracking();
        map.setView([d.lat, d.lng], d.zoom);
      };

      self.destroy = function destroy() {
        button.clearButtons();
        sidebar.button.removeEventListener('visibility', setActiveArea);
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
