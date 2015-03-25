define(["infobox/link", "infobox/node"], function (Link, Node) {
  return function (config, sidebar, router) {
    var self = this
    el = undefined

    function destroy() {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el)
        el = undefined
      }
    }

    function create() {
      destroy()

      el = document.createElement("div")
      sidebar.container.insertBefore(el, sidebar.container.firstChild)

      el.scrollIntoView(false)
      el.classList.add("infobox")
      el.destroy = destroy

      var closeButton = document.createElement("button")
      closeButton.classList.add("close")
      closeButton.onclick = router.reset
      el.appendChild(closeButton)
    }

    self.resetView = destroy

    self.gotoNode = function (d) {
      create()
      new Node(config, el, router, d)
    }

    self.gotoLink = function (d) {
      create()
      new Link(config, el, router, d)
    }

    return self
  }
})
