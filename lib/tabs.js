define([], function () {
  return function () {
    var self = this

    var tabs = document.createElement("ul")
    tabs.classList.add("tabs")

    var container = document.createElement("div")

    function switchTab(ev) {
      for (var i = 0; i < tabs.children.length; i++) {
        var el = tabs.children[i]
        el.classList.remove("visible")
        el.tab.classList.remove("visible")
      }

      this.classList.add("visible")
      this.tab.classList.add("visible")

      return false
    }

    self.add = function (title, d) {
      var tab = document.createElement("div")
      tab.classList.add("tab")
      container.appendChild(tab)

      var li = document.createElement("li")
      li.textContent = title
      li.onclick = switchTab
      tab.li = li
      li.tab = tab
      tabs.appendChild(li)

      var anyVisible = false

      for (var i = 0; i < tabs.children.length; i++)
        if (tabs.children[i].classList.contains("visible")) {
          anyVisible = true
          break
        }

      if (!anyVisible) {
        tab.classList.add("visible")
        li.classList.add("visible")
      }

      d.render(tab)
    }

    self.render = function (el) {
      el.appendChild(tabs)
      el.appendChild(container)
    }

    return self
  }
})
