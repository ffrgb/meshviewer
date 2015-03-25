define(function () {
  return function (config) {
    var objects = { nodes: {}, links: {} }
    var targets = []
    var self = this

    function resetView(push) {
      push = trueDefault(push)

      targets.forEach( function (t) {
        t.resetView()
      })

      if (push)
        saveState()
    }

    function gotoNode(d, showMap, push) {
      showMap = trueDefault(showMap)
      push = trueDefault(push)

      targets.forEach( function (t) {
        t.gotoNode(d)
      })

      if (push)
        saveState( { node: d })

      return false
    }

    function gotoLink(d, showMap, push) {
      showMap = trueDefault(showMap)
      push = trueDefault(push)

      targets.forEach( function (t) {
        t.gotoLink(d)
      })

      if (push)
        saveState( { link: d })

      return false
    }

    function saveState(d) {
      var s = "#!"

      if (d) {
        if ("node" in d)
          s += "n:" + d.node.nodeinfo.node_id

        if ("link" in d)
          s += "l:" + linkId(d.link)
      }

      window.history.pushState(s, undefined, s)
    }

    function loadState(s) {
      if (!s)
        return

      if (!s.startsWith("#!"))
        return

      var args = s.slice(2).split(":")

      if (args.length == 1 && args[0] == "")
        resetView(false)

      if (args[0] === "n") {
        var id = args[1]

        if (id in objects.nodes)
          gotoNode(objects.nodes[id], true, false)
      }

      if (args[0] === "l") {
        var id = args[1]

        if (id in objects.links)
          gotoLink(objects.links[id], true, false)
      }
    }

    self.node = function (d, m, p) { return function () { return gotoNode(d, m, p) }}
    self.link = function (d, m, p) { return function () { return gotoLink(d, m, p) }}
    self.reset = resetView
    self.addMarkers = function (d) {
                        markers = d
                      }
    self.addTarget = function (d) { targets.push(d) }

    self.setData = function (nodes, links) {
      objects.nodes = {}
      objects.links = {}

      nodes.forEach( function (d) {
        objects.nodes[d.nodeinfo.node_id] = d
      })

      links.forEach( function (d) {
        objects.links[linkId(d)] = d
      })
    }

    window.onpopstate = function (d) { loadState(d.state) }

    return self
  }
})
