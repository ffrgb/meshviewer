define(["leaflet", "rbush"],
  function (L, rbush) {
    var labelLocations = [["left",   "middle",      0 / 8],
                          ["center", "top",         6 / 8],
                          ["right",  "middle",      4 / 8],
                          ["left",   "top",         7 / 8],
                          ["left",   "ideographic", 1 / 8],
                          ["right",  "top",         5 / 8],
                          ["center", "ideographic", 2 / 8],
                          ["right",  "ideographic", 3 / 8]]

    var labelOffset = 8
    var font = "10px Roboto"
    var labelHeight = 12
    var nodeRadius = 4

    var ctx = document.createElement("canvas").getContext("2d")

    function measureText(font, text) {
      ctx.font = font
      return ctx.measureText(text)
    }

    function mapRTree(d) {
      var o = [d.position.lat, d.position.lng, d.position.lat, d.position.lng]

      o.label = d

      return o
    }

    function prepareLabel(fillStyle) {
      return function (d) {
        return { position: L.latLng(d.nodeinfo.location.latitude, d.nodeinfo.location.longitude),
                 label: d.nodeinfo.hostname,
                 fillStyle: fillStyle,
                 height: labelHeight,
                 width: measureText(font, d.nodeinfo.hostname).width
               }
      }
    }

    function calcOffset(loc) {
      return [ labelOffset * Math.cos(loc[2] * 2 * Math.PI),
              -labelOffset * Math.sin(loc[2] * 2 * Math.PI)]
    }

    function labelRect(p, offset, anchor, label) {
      var dx = { left: 0,
                 right: -label.width,
                 center: -label.width /  2
               }

      var dy = { top: 0,
                 ideographic: -label.height,
                 middle: -label.height / 2
               }

      var x = p.x + offset[0] + dx[anchor[0]]
      var y = p.y + offset[1] + dy[anchor[1]]

      return [x, y, x + label.width, y + label.height]
    }

    var c = L.TileLayer.Canvas.extend({
      onAdd: function (map) {
        L.TileLayer.Canvas.prototype.onAdd.call(this, map)
        if (this.data)
          this.prepareLabels()
      },
      setData: function (d) {
        this.data = d
        if (this._map)
          this.prepareLabels()
      },
      prepareLabels: function () {
        var d = this.data

        // label:
        // - position (WGS84 coords)
        // - offset (2D vector in pixels)
        // - anchor (tuple, textAlignment, textBaseline)
        // - minZoom (inclusive)
        // - label (string)
        // - color (string)

        var labelsOnline = d.online.map(prepareLabel("rgba(0, 0, 0, 0.9)"))
        var labelsOffline = d.offline.map(prepareLabel("rgba(212, 62, 42, 0.9)"))
        var labelsNew = d.new.map(prepareLabel("rgba(85, 128, 32, 0.9)"))
        var labelsLost = d.lost.map(prepareLabel("rgba(212, 62, 42, 0.9)"))

        var labels = []
                     .concat(labelsNew)
                     .concat(labelsLost)
                     .concat(labelsOnline)
                     .concat(labelsOffline)

        var minZoom = this.options.minZoom
        var maxZoom = this.options.maxZoom

        var trees = []

        var map = this._map

        function nodeToRect(z) {
          return function (d) {
            var p = map.project(d.position, z)
            return [p.x - nodeRadius, p.y - nodeRadius,
                    p.x + nodeRadius, p.y + nodeRadius]
          }
        }

        for (var z = minZoom; z <= maxZoom; z++) {
          trees[z] = rbush(9)
          trees[z].load(labels.map(nodeToRect(z)))
        }

        labels.forEach(function (d) {
          var best = labelLocations.map(function (loc) {
            var offset = calcOffset(loc, d)
            var z

            for (z = maxZoom; z >= minZoom; z--) {
              var p = map.project(d.position, z)
              var rect = labelRect(p, offset, loc, d)
              var candidates = trees[z].search(rect)

              if (candidates.length > 0)
                break
            }

            return {loc: loc, z: z + 1}
          }).filter(function (d) {
            return d.z <= maxZoom
          }).sort(function (a, b) {
            return a.z - b.z
          })[0]

          if (best === undefined)
            return

          d.offset = calcOffset(best.loc, d)
          d.minZoom = best.z
          d.anchor = best.loc

          for (var z = maxZoom; z >= best.z; z--) {
            var p = map.project(d.position, z)
            var rect = labelRect(p, d.offset, best.loc, d)
            trees[z].insert(rect)
          }
        })

        labels = labels.filter(function (d) {
          return d.minZoom !== undefined
        })

        this.margin = 16 + labels.map(function (d) {
          return d.width
        }).sort().reverse()[0]

        this.labels = rbush(9)
        this.labels.load(labels.map(mapRTree))

        this.redraw()
      },
      drawTile: function (canvas, tilePoint, zoom) {
        function getTileBBox(s, map, tileSize, margin) {
          var tl = map.unproject([s.x - margin, s.y - margin])
          var br = map.unproject([s.x + margin + tileSize, s.y + margin + tileSize])

          return [br.lat, tl.lng, tl.lat, br.lng]
        }

        if (!this.labels)
          return

        var tileSize = this.options.tileSize
        var s = tilePoint.multiplyBy(tileSize)
        var map = this._map

        function projectNodes(d) {
          var p = map.project(d.label.position)

          p.x -= s.x
          p.y -= s.y

          return {p: p, label: d.label}
        }

        var bbox = getTileBBox(s, map, tileSize, this.margin)

        var labels = this.labels.search(bbox).map(projectNodes)

        var ctx = canvas.getContext("2d")

        ctx.font = font
        ctx.lineWidth = 5
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
        ctx.miterLimit = 2

        function drawLabel(d) {
          ctx.textAlign = d.label.anchor[0]
          ctx.textBaseline = d.label.anchor[1]
          ctx.fillStyle = d.label.fillStyle
          ctx.strokeText(d.label.label, d.p.x + d.label.offset[0], d.p.y + d.label.offset[1])
          ctx.fillText(d.label.label, d.p.x + d.label.offset[0], d.p.y + d.label.offset[1])
        }

        labels.filter(function (d) {
          return zoom >= d.label.minZoom
        }).forEach(drawLabel)
      }
    })

    return c
})
