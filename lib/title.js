define(function () {
  'use strict';

  return function (config) {
    function setTitle(d) {
      var title = [config.siteName];

      if (d !== undefined) {
        title.push(d);
      }

      document.title = title.join(': ');
    }

    this.resetView = function resetView() {
      setTitle();
    };

    this.gotoNode = function gotoNode(d) {
      if (d) {
        setTitle(d.nodeinfo.hostname);
      }
    };

    this.gotoLink = function gotoLink(d) {
      if (d) {
        setTitle((d.source.node ? d.source.node.nodeinfo.hostname : d.source.id) + ' – ' + d.target.node.nodeinfo.hostname);
      }
    };

    this.gotoLocation = function gotoLocation() {
      // ignore
    };

    this.destroy = function destroy() {
    };

    return this;
  };
});
