define(["leaflet"],
  function (L) {
    return L.TileLayer.Canvas.extend({
      setData: function (d) {
        this.data = d
        this.redraw()
      },
      drawTile: function (canvas, tilePoint) {
        if (!this.data)
          return

        var tileSize = this.options.tileSize
        var s = tilePoint.multiplyBy(tileSize)
        var map = this._map

        function project(coords) {
          var p = map.project(new L.LatLng(coords[0], coords[1]))
          return {x: p.x - s.x, y: p.y - s.y}
        }

        function projectNodes(d) {
          return { p: project([d.nodeinfo.location.latitude, d.nodeinfo.location.longitude]),
                   o: d
                 }
        }

        var margin = 150
        function onTile(d) {
          return d.p.x + margin > 0 ||
                 d.p.y + margin > 0 ||
                 d.p.x - tileSize - margin < 0 ||
                 d.p.y - tileSize - margin < 0
        }

        var ctx = canvas.getContext("2d")

        var nodesOnline = this.data.online.map(projectNodes).filter(onTile)
        var nodesOffline = this.data.offline.map(projectNodes).filter(onTile)
        var nodesNew = this.data.new.map(projectNodes).filter(onTile)
        var nodesLost = this.data.lost.map(projectNodes).filter(onTile)

        var distance = 10
        ctx.font = "12px Roboto"
        ctx.textBaseline = "middle"
        ctx.textAlign = "left"
        ctx.lineWidth = 2.5

        function drawLabel(d) {
            ctx.strokeText(d.o.nodeinfo.hostname, d.p.x + distance, d.p.y)
            ctx.fillText(d.o.nodeinfo.hostname, d.p.x + distance, d.p.y)
        }

        ctx.fillStyle = "rgba(212, 62, 42, 0.6)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"
        nodesOffline.forEach(drawLabel)

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
        nodesOnline.forEach(drawLabel)

        ctx.fillStyle = "rgba(212, 62, 42, 0.6)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
        nodesLost.forEach(drawLabel)

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
        ctx.strokeStyle = "rgba(255, 255, 255, 1.0)"
        nodesNew.forEach(drawLabel)
      }
    })
})
