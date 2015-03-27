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

    function gotoNode(d) {
      targets.forEach( function (t) {
        t.gotoNode(d)
      })
    }

    function gotoLink(d) {
      targets.forEach( function (t) {
        t.gotoLink(d)
      })
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
        return false

      if (!s.startsWith("#!"))
        return false

      var args = s.slice(2).split(":")

      if (args[0] === "n") {
        var id = args[1]

        if (id in objects.nodes) {
          gotoNode(objects.nodes[id])
          return true
        }
      }

      if (args[0] === "l") {
        var id = args[1]

        if (id in objects.links) {
          gotoLink(objects.links[id])
          return true
        }
      }

      return false
    }

    self.start = function () {
      if (!loadState(window.location.hash))
        resetView(false)

      window.onpopstate = function (d) {
        if (!loadState(d.state))
          resetView(false)
      }
    }

    self.node = function (d) {
      return function () {
        gotoNode(d)
        saveState({ node: d })
        return false
      }
    }

    self.link = function (d) {
      return function () {
        gotoLink(d)
        saveState({ link: d })
        return false
      }
    }

    self.reset = function () {
      resetView()
      saveState()
    }

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

    return self
  }
})
