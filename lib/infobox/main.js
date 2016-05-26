define(["infobox/link", "infobox/node", "infobox/location"], function (Link, Node, Location) {
  "use strict";

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

      el = document.createElement("div");
      sidebar.container.insertBefore(el, sidebar.container.firstChild);

      el.scrollIntoView(false);
      el.classList.add("infobox");
      el.destroy = destroy;

      var closeButton = document.createElement("button");
      closeButton.classList.add("close", "ion-android-close");
      closeButton.onclick = router.reset;
      el.appendChild(closeButton);
    }

    self.resetView = destroy;

    self.gotoNode = function (d) {
      create();
      Node(config, el, router, d);
    };

    self.gotoLink = function (d) {
      create();
      Link(config, el, router, d);
    };

    self.gotoLocation = function (d) {
      create();
      Location(config, el, router, d);
    };

    return self;
  };
});
