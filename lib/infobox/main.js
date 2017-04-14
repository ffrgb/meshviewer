define(['infobox/link', 'infobox/node', 'infobox/location'], function (link, node, location) {
  'use strict';

  return function (config, sidebar, router) {
    var self = this;
    var el;

    function destroy() {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
        el = undefined;
        sidebar.reveal();
      }
    }

    function create() {
      destroy();
      sidebar.ensureVisible();
      sidebar.hide();

      el = document.createElement('div');
      sidebar.container.children[1].append(el);

      el.scrollIntoView(false);
      el.classList.add('infobox');
      el.destroy = destroy;

      var closeButton = document.createElement('button');
      closeButton.classList.add('close');
      closeButton.classList.add('ion-close');
      closeButton.onclick = router.reset;
      el.appendChild(closeButton);
    }

    function clear() {
      var closeButton = el.firstChild;
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      el.appendChild(closeButton);
    }

    self.resetView = destroy;

    self.gotoNode = function gotoNode(d, update) {
      if (update !== true) {
        create();
      } else {
        clear();
      }
      node(config, el, router, d);
    };

    self.gotoLink = function gotoLink(d, update) {
      if (update !== true) {
        create();
      } else {
        clear();
      }
      link(config, el, router, d);
    };

    self.gotoLocation = function gotoLocation(d) {
      create();
      location(config, el, router, d);
    };

    return self;
  };
});
