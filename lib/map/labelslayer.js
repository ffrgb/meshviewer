define(['leaflet', 'rbush', 'helper'],
  function (L, rbush, helper) {
    'use strict';

    var labelLocations = [['left', 'middle', 0 / 8],
      ['center', 'top', 6 / 8],
      ['right', 'middle', 4 / 8],
      ['left', 'top', 7 / 8],
      ['left', 'ideographic', 1 / 8],
      ['right', 'top', 5 / 8],
      ['center', 'ideographic', 2 / 8],
      ['right', 'ideographic', 3 / 8]];
    var bodyStyle = window.getComputedStyle(document.querySelector('body'));
    var labelShadow;
    var nodeRadius = 4;

    var cFont = document.createElement('canvas').getContext('2d');

    function measureText(font, text) {
      cFont.font = font;
      return cFont.measureText(text);
    }

    function mapRTree(d) {
      var o = [d.position.lat, d.position.lng, d.position.lat, d.position.lng];

      o.label = d;

      return o;
    }

    function prepareLabel(fillStyle, fontSize, offset, stroke, minZoom) {
      return function (d) {
        var font = fontSize + 'px ' + bodyStyle.fontFamily;
        return {
          position: L.latLng(d.nodeinfo.location.latitude, d.nodeinfo.location.longitude),
          label: d.nodeinfo.hostname,
          offset: offset,
          fillStyle: fillStyle,
          height: fontSize * 1.2,
          font: font,
          stroke: stroke,
          minZoom: minZoom,
          width: measureText(font, d.nodeinfo.hostname).width
        };
      };
    }

    function calcOffset(offset, loc) {
      return [offset * Math.cos(loc[2] * 2 * Math.PI),
        -offset * Math.sin(loc[2] * 2 * Math.PI)];
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

      return [x, y, x + width, y + height];
    }

    return L.TileLayer.Canvas.extend({
      onAdd: function (map) {
        L.TileLayer.Canvas.prototype.onAdd.call(this, map);
        if (this.data) {
          this.prepareLabels();
        }
      },
      setData: function (d) {
        this.data = d;
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

        var labelsOnline = d.online.map(prepareLabel(bodyStyle.color, 11, 8, true, 13));
        var labelsOffline = d.offline.map(prepareLabel('rgba(212, 62, 42, 0.9)', 9, 5, false, 16));
        var labelsNew = d.new.map(prepareLabel('rgba(48, 99, 20, 0.9)', 11, 8, true, 0));
        var labelsLost = d.lost.map(prepareLabel('rgba(212, 62, 42, 0.9)', 11, 8, true, 0));
        labelShadow = bodyStyle.backgroundColor.replace(/rgb/i, 'rgba').replace(/\)/i, ',0.7)');

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
            return [p.x - nodeRadius, p.y - nodeRadius,
              p.x + nodeRadius, p.y + nodeRadius];
          };
        }

        for (var z = minZoom; z <= maxZoom; z++) {
          trees[z] = rbush(9);
          trees[z].load(labels.map(nodeToRect(z)));
        }

        labels = labels.map(function (n) {
          var best = labelLocations.map(function (loc) {
            var offset = calcOffset(n.offset, loc);
            var i;

            for (i = maxZoom; i >= n.minZoom; i--) {
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

        this.labels = rbush(9);
        this.labels.load(labels.map(mapRTree));

        this.redraw();
      },
      drawTile: function (canvas, tilePoint, zoom) {
        if (!this.labels) {
          return;
        }

        var tileSize = this.options.tileSize;
        var s = tilePoint.multiplyBy(tileSize);
        var map = this._map;

        function projectNodes(d) {
          var p = map.project(d.label.position);

          p.x -= s.x;
          p.y -= s.y;

          return { p: p, label: d.label };
        }

        var bbox = helper.getTileBBox(s, map, tileSize, this.margin);

        var labels = this.labels.search(bbox).map(projectNodes);

        var ctx = canvas.getContext('2d');

        ctx.lineWidth = 5;
        ctx.strokeStyle = labelShadow;
        ctx.miterLimit = 2;

        function drawLabel(d) {
          ctx.font = d.label.font;
          ctx.textAlign = d.label.anchor[0];
          ctx.textBaseline = d.label.anchor[1];
          ctx.fillStyle = d.label.fillStyle;

          if (d.label.stroke) {
            ctx.strokeText(d.label.label, d.p.x + d.label.offset[0], d.p.y + d.label.offset[1]);
          }

          ctx.fillText(d.label.label, d.p.x + d.label.offset[0], d.p.y + d.label.offset[1]);
        }

        labels.filter(function (d) {
          return zoom >= d.label.minZoom;
        }).forEach(drawLabel);
      }
    });
  });
