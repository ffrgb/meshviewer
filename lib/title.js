define(function () {
   return function (config) {
    function setTitle(d) {
      var title = [config.siteName];

      if (d !== undefined)
        title.push(d);

      document.title = title.join(": ");
    }

    this.resetView = function () {
      setTitle();
    };

    this.gotoNode = function (d) {
      if (d)
        setTitle(d.nodeinfo.hostname);
    };

    this.gotoLink = function (d) {
      if (d)
        setTitle((d.source.node ? d.source.node.nodeinfo.hostname : d.source.id) + " – " + d.target.node.nodeinfo.hostname);
    };

    this.gotoLocation = function() {
      //ignore
    };

    this.destroy = function () {
    };

    return this;
  };
});
