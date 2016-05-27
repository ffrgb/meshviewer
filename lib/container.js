define([], function () {
  "use strict";

  return function (tag) {
    if (!tag) {
      tag = "div";
    }

    var self = this;

    var container = document.createElement(tag);

    self.add = function (d) {
      d.render(container);
    };

    self.render = function (el) {
      el.appendChild(container);
    };

    return self;
  };
});
