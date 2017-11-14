define(function () {
  'use strict';

  return function () {
    function setTitle(d) {
      var title = [config.siteName];

      if (d !== undefined) {
        title.unshift(d);
      }

      document.title = title.join(' - ');
    }

    this.resetView = function resetView() {
      setTitle();
    };

    this.gotoNode = function gotoNode(d) {
      setTitle(d.hostname);
    };

    this.gotoLink = function gotoLink(d) {
      setTitle(d[0].source.hostname + ' \u21D4 ' + d[0].target.hostname);
    };

    this.gotoLocation = function gotoLocation() {
      // ignore
    };

    this.destroy = function destroy() {
    };

    return this;
  };
});
