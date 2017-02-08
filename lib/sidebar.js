define(function () {
  'use strict';

  return function (el) {
    var self = this;

    // Needed to avoid render blocking
    var gridBreakpoints = {
      lg: [992, 446],
      xl: [1200, 560]
    };

    var sidebar = document.createElement('div');
    sidebar.classList.add('sidebar');
    el.appendChild(sidebar);

    var button = document.createElement('button');
    sidebar.appendChild(button);

    button.classList.add('sidebarhandle', 'shadow');
    button.onclick = function onclick() {
      sidebar.classList.toggle('hidden');
    };

    var container = document.createElement('div');
    container.classList.add('container');
    sidebar.appendChild(container);

    self.getWidth = function getWidth() {
      if (gridBreakpoints.lg[0] < window.innerWidth) {
        return 0;
      } else if (gridBreakpoints.xl[0] < window.innerWidth) {
        return gridBreakpoints.lg[1];
      }
      return gridBreakpoints.xl[1];
    };

    self.add = function add(d) {
      d.render(container);
    };

    self.ensureVisible = function ensureVisible() {
      sidebar.classList.remove('hidden');
    };

    self.hide = function hide() {
      container.classList.add('hidden');
    };

    self.reveal = function reveal() {
      container.classList.remove('hidden');
    };

    self.container = sidebar;

    return self;
  };
});
