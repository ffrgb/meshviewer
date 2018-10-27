define(['infobox/link', 'infobox/node', 'infobox/location'], function (Link, Node, location) {
  'use strict';

  return function (sidebar, linkScale) {
    var self = this;
    var el;
    var node;
    var link;

    function destroy() {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
        node = link = el = undefined;
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
      closeButton.setAttribute('aria-label', _.t('close'));
      closeButton.onclick = function () {
        router.fullUrl();
      };
      el.appendChild(closeButton);
    }

    self.resetView = destroy;

    self.gotoNode = function gotoNode(d, nodeDict) {
      create();
      node = new Node(el, d, linkScale, nodeDict);
      node.render();
    };

    self.gotoLink = function gotoLink(d) {
      create();
      link = new Link(el, d, linkScale);
      link.render();
    };

    self.gotoLocation = function gotoLocation(d) {
      create();
      location(el, d);
    };

    self.setData = function setData(d) {
      if (typeof node === 'object') {
        node.setData(d);
      }
      if (typeof link === 'object') {
        link.setData(d);
      }
    };

    return self;
  };
});
