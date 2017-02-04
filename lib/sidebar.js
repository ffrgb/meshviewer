define(function () {
  'use strict';

  return function (el) {
    var self = this;

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
      if (sidebar.classList.contains('hidden') || button.offsetHeight === 0) {
        return 0;
      }
      return sidebar.offsetWidth;
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
