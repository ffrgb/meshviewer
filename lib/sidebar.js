define(function () {
  "use strict";

  return function (el) {
    var self = this;

    var sidebar = document.createElement("div");
    sidebar.classList.add("sidebar");
    el.appendChild(sidebar);

    var button = document.createElement("button");
    sidebar.appendChild(button);

    button.classList.add("sidebarhandle");
    button.onclick = function () {
      sidebar.classList.toggle("hidden");
    };

    var container = document.createElement("div");
    container.classList.add("container");
    sidebar.appendChild(container);

    self.getWidth = function () {
      if (sidebar.classList.contains("hidden")) {
        return 0;
      }

      var small = window.matchMedia("(max-width: 630pt)");
      return small.matches ? 0 : sidebar.offsetWidth;
    };

    self.add = function (d) {
      d.render(container);
    };

    self.ensureVisible = function () {
      sidebar.classList.remove("hidden");
    };

    self.hide = function () {
      container.classList.add("hidden");
    };

    self.reveal = function () {
      container.classList.remove("hidden");
    };

    self.container = sidebar;

    return self;
  };
});
