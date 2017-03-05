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
      sidebar.container.children[1].appendChild(el);

      el.scrollIntoView(false);
      el.classList.add('infobox');
      el.destroy = destroy;

      var closeButton = document.createElement('button');
      closeButton.classList.add('close');
      closeButton.classList.add('ion-close');
      closeButton.onclick = function () {
        router.fullUrl();
      };
      el.appendChild(closeButton);
    }

    self.resetView = destroy;

    self.gotoNode = function gotoNode(d) {
      create();
      node(config, el, router, d);
    };

    self.gotoLink = function gotoLink(d) {
      create();
      link(config, el, router, d);
    };

    self.gotoLocation = function gotoLocation(d) {
      create();
      location(config, el, router, d);
    };

    return self;
  };
});
