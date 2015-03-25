define([], function () {
  return function (el) {
    var self = this

    var sidebar = document.createElement("div")
    sidebar.classList.add("sidebar")
    el.appendChild(sidebar)

    var button = document.createElement("button")
    sidebar.appendChild(button)

    button.classList.add("sidebarhandle")
    button.onclick = function () {
      sidebar.classList.toggle("hidden")
    }

    var container = document.createElement("div")
    container.classList.add("container")
    sidebar.appendChild(container)

    self.getWidth = function () {
      var small = window.matchMedia("(max-width: 60em)");
      return small.matches ? 0 : sidebar.offsetWidth
    }

    self.add = function (d) {
      d.render(container)
    }

    self.container = container

    return self
  }
})
