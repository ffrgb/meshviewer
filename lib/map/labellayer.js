define(['leaflet', 'rbush', 'helper', 'moment'],
  function (L, RBush, helper, moment) {
    'use strict';

    var groupOnline;
    var groupOffline;
    var groupNew;
    var groupLost;
    var groupLines;

    var labelLocations = [['left', 'middle', 0 / 8],
      ['center', 'top', 6 / 8],
      ['right', 'middle', 4 / 8],
      ['left', 'top', 7 / 8],
      ['left', 'ideographic', 1 / 8],
      ['right', 'top', 5 / 8],
      ['center', 'ideographic', 2 / 8],
      ['right', 'ideographic', 3 / 8]];
    var labelShadow;
    var bodyStyle = { fontFamily: 'sans-serif' };
    var nodeRadius = 4;

    var cFont = document.createElement('canvas').getContext('2d');

    function measureText(font, text) {
      cFont.font = font;
      return cFont.measureText(text);
    }

    function mapRTree(d) {
      return { minX: d.position.lat, minY: d.position.lng, maxX: d.position.lat, maxY: d.position.lng, label: d };
    }

    function prepareLabel(fillStyle, fontSize, offset, stroke) {
      return function (d) {
        var font = fontSize + 'px ' + bodyStyle.fontFamily;
        return {
          position: L.latLng(d.location.latitude, d.location.longitude),
          label: d.hostname,
          offset: offset,
          fillStyle: fillStyle,
          height: fontSize * 1.2,
          font: font,
          stroke: stroke,
          width: measureText(font, d.hostname).width
        };
      };
    }

    function calcOffset(offset, loc) {
      return [offset * Math.cos(loc[2] * 2 * Math.PI),
        offset * Math.sin(loc[2] * 2 * Math.PI)];
    }

    function labelRect(p, offset, anchor, label, minZoom, maxZoom, z) {
      var margin = 1 + 1.41 * (1 - (z - minZoom) / (maxZoom - minZoom));

      var width = label.width * margin;
      var height = label.height * margin;

      var dx = {
        left: 0,
        right: -width,
        center: -width / 2
      };

      var dy = {
        top: 0,
        ideographic: -height,
        middle: -height / 2
      };

      var x = p.x + offset[0] + dx[anchor[0]];
      var y = p.y + offset[1] + dy[anchor[1]];

      return { minX: x, minY: y, maxX: x + width, maxY: y + height };
    }

    function mkMarker(dict, iconFunc) {
      return function (d) {
        var m = L.circleMarker([d.location.latitude, d.location.longitude], iconFunc(d));

        m.resetStyle = function resetStyle() {
          m.setStyle(iconFunc(d));
        };

        m.on('click', function () {
          router.fullUrl({ node: d.node_id });
        });
        m.bindTooltip(helper.escape(d.hostname));

        dict[d.node_id] = m;

        return m;
      };
    }

    function addLinksToMap(dict, linkScale, graph) {
      graph = graph.filter(function (d) {
        return 'distance' in d && d.type.indexOf('vpn') !== 0;
      });

      return graph.map(function (d) {
        var opts = {
          color: linkScale((d.source_tq + d.target_tq) / 2),
          weight: 4,
          opacity: 0.5,
          dashArray: 'none'
        };

        var line = L.polyline(d.latlngs, opts);

        line.resetStyle = function resetStyle() {
          line.setStyle(opts);
        };

        line.bindTooltip(helper.escape(d.source.hostname + ' – ' + d.target.hostname) +
          '<br><strong>' + helper.showDistance(d) + ' / ' + helper.showTq(d.source_tq) + ' - ' + helper.showTq(d.target_tq) + '<br>' + d.type + '</strong>');

        line.on('click', function () {
          router.fullUrl({ link: d.id });
        });

        dict[d.id] = line;

        return line;
      });
    }

    function getIcon(color) {
      return Object.assign({}, config.icon.base, config.icon[color]);
    }

    return L.GridLayer.extend({
      onAdd: function (map) {
        L.GridLayer.prototype.onAdd.call(this, map);
        if (this.data) {
          this.prepareLabels();
        }
      },
      setData: function (data, map, nodeDict, linkDict, linkScale) {
        var iconOnline = getIcon('online');
        var iconOffline = getIcon('offline');
        var iconLost = getIcon('lost');
        var iconAlert = getIcon('alert');
        var iconNew = getIcon('new');
        // Check if init or data is already set
        if (groupLines) {
          groupOffline.clearLayers();
          groupOnline.clearLayers();
          groupNew.clearLayers();
          groupLost.clearLayers();
          groupLines.clearLayers();
        }

        var lines = addLinksToMap(linkDict, linkScale, data.links);
        groupLines = L.featureGroup(lines).addTo(map);

        var nodesOnline = helper.subtract(data.nodes.online, data.nodes.new).filter(helper.hasLocation);
        var nodesOffline = helper.subtract(data.nodes.offline, data.nodes.lost).filter(helper.hasLocation);
        var nodesNew = data.nodes.new.filter(helper.hasLocation);
        var nodesLost = data.nodes.lost.filter(helper.hasLocation);

        var markersOnline = nodesOnline.map(mkMarker(nodeDict, function () {
          return iconOnline;
        }));

        var markersOffline = nodesOffline.map(mkMarker(nodeDict, function () {
          return iconOffline;
        }));

        var markersNew = nodesNew.map(mkMarker(nodeDict, function () {
          return iconNew;
        }));

        var markersLost = nodesLost.map(mkMarker(nodeDict, function (d) {
          var age = moment(data.now).diff(d.lastseen, 'days', true);
          if (age <= config.maxAgeAlert) {
            return iconAlert;
          }
          if (age <= config.maxAge) {
            return iconLost;
          }
          return null;
        }));

        groupOffline = L.featureGroup(markersOffline).addTo(map);
        groupLost = L.featureGroup(markersLost).addTo(map);
        groupOnline = L.featureGroup(markersOnline).addTo(map);
        groupNew = L.featureGroup(markersNew).addTo(map);

        this.data = {
          online: nodesOnline,
          offline: nodesOffline,
          new: nodesNew,
          lost: nodesLost
        };
        this.updateLayer();
      },
      updateLayer: function () {
        if (this._map) {
          this.prepareLabels();
        }
      },
      prepareLabels: function () {
        var d = this.data;

        // label:
        // - position (WGS84 coords)
        // - offset (2D vector in pixels)
        // - anchor (tuple, textAlignment, textBaseline)
        // - minZoom (inclusive)
        // - label (string)
        // - color (string)

        var labelsOnline = d.online.map(prepareLabel(null, 11, 8, true));
        var labelsOffline = d.offline.map(prepareLabel(config.icon.offline.color, 9, 5, false));
        var labelsNew = d.new.map(prepareLabel(config.map.labelNewColor, 11, 8, true));
        var labelsLost = d.lost.map(prepareLabel(config.icon.lost.color, 11, 8, true));

        var labels = []
          .concat(labelsNew)
          .concat(labelsLost)
          .concat(labelsOnline)
          .concat(labelsOffline);

        var minZoom = this.options.minZoom;
        var maxZoom = this.options.maxZoom;

        var trees = [];

        var map = this._map;

        function nodeToRect(z) {
          return function (n) {
            var p = map.project(n.position, z);
            return { minX: p.x - nodeRadius, minY: p.y - nodeRadius, maxX: p.x + nodeRadius, maxY: p.y + nodeRadius };
          };
        }

        for (var z = minZoom; z <= maxZoom; z++) {
          trees[z] = new RBush(9);
          trees[z].load(labels.map(nodeToRect(z)));
        }

        labels = labels.map(function (n) {
          var best = labelLocations.map(function (loc) {
            var offset = calcOffset(n.offset, loc);
            var i;

            for (i = maxZoom; i >= minZoom; i--) {
              var p = map.project(n.position, i);
              var rect = labelRect(p, offset, loc, n, minZoom, maxZoom, i);
              var candidates = trees[i].search(rect);

              if (candidates.length > 0) {
                break;
              }
            }

            return { loc: loc, z: i + 1 };
          }).filter(function (k) {
            return k.z <= maxZoom;
          }).sort(function (a, b) {
            return a.z - b.z;
          })[0];

          if (best !== undefined) {
            n.offset = calcOffset(n.offset, best.loc);
            n.minZoom = best.z;
            n.anchor = best.loc;

            for (var i = maxZoom; i >= best.z; i--) {
              var p = map.project(n.position, i);
              var rect = labelRect(p, n.offset, best.loc, n, minZoom, maxZoom, i);
              trees[i].insert(rect);
            }

            return n;
          }
          return undefined;
        }).filter(function (n) {
          return n !== undefined;
        });

        this.margin = 16;

        if (labels.length > 0) {
          this.margin += labels.map(function (n) {
            return n.width;
          }).sort().reverse()[0];
        }

        this.labels = new RBush(9);
        this.labels.load(labels.map(mapRTree));

        this.redraw();
      },
      createTile: function (tilePoint) {
        var tile = L.DomUtil.create('canvas', 'leaflet-tile');

        var tileSize = this.options.tileSize;
        tile.width = tileSize;
        tile.height = tileSize;

        if (!this.labels) {
          return tile;
        }

        var s = tilePoint.multiplyBy(tileSize);
        var map = this._map;
        bodyStyle = window.getComputedStyle(document.querySelector('body'));
        labelShadow = bodyStyle.backgroundColor.replace(/rgb/i, 'rgba').replace(/\)/i, ',0.7)');

        function projectNodes(d) {
          var p = map.project(d.label.position);

          p.x -= s.x;
          p.y -= s.y;

          return { p: p, label: d.label };
        }

        var bbox = helper.getTileBBox(s, map, tileSize, this.margin);
        var labels = this.labels.search(bbox).map(projectNodes);
        var ctx = tile.getContext('2d');

        ctx.lineWidth = 5;
        ctx.strokeStyle = labelShadow;
        ctx.miterLimit = 2;

        function drawLabel(d) {
          ctx.font = d.label.font;
          ctx.textAlign = d.label.anchor[0];
          ctx.textBaseline = d.label.anchor[1];
          ctx.fillStyle = d.label.fillStyle === null ? bodyStyle.color : d.label.fillStyle;

          if (d.label.stroke) {
            ctx.strokeText(d.label.label, d.p.x + d.label.offset[0], d.p.y + d.label.offset[1]);
          }

          ctx.fillText(d.label.label, d.p.x + d.label.offset[0], d.p.y + d.label.offset[1]);
        }

        labels.filter(function (d) {
          return tilePoint.z >= d.label.minZoom;
        }).forEach(drawLabel);

        return tile;
      }
    });
  });
