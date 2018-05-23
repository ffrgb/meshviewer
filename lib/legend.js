define(['helper'], function (helper) {
  'use strict';

  return function (language) {
    var self = this;
    var stats = document.createTextNode('');
    var timestamp = document.createTextNode('');

    self.setData = function setData(d) {
      var totalNodes = Object.keys(d.nodeDict).length;
      var totalOnlineNodes = d.nodes.online.length;
      var totalClients = helper.sum(d.nodes.online.map(function (n) {
        return n.clients;
      }));
      var totalGateways = helper.sum(d.nodes.online.filter(function (n) {
        return n.is_gateway;
      }).map(helper.one));

      stats.textContent = _.t('sidebar.nodes', { total: totalNodes, online: totalOnlineNodes }) + ' ' +
        _.t('sidebar.clients', { smart_count: totalClients }) + ' ' +
        _.t('sidebar.gateway', { smart_count: totalGateways });

      timestamp.textContent = _.t('sidebar.lastUpdate') + ' ' + d.timestamp.fromNow();
    };

    self.render = function render(el) {
      var h1 = document.createElement('h1');
      h1.textContent = config.siteName;
      el.appendChild(h1);

      language.languageSelect(el);

      var p = document.createElement('p');
      p.classList.add('legend');

      p.appendChild(stats);
      p.appendChild(document.createElement('br'));
      p.appendChild(timestamp);

      if (config.linkList) {
        p.appendChild(document.createElement('br'));
        config.linkList.forEach(function (link) {
          var a = document.createElement('a');
          a.innerText = link.title;
          a.href = link.href;
          p.appendChild(a);
        });
      }

      el.appendChild(p);
    };

    return self;
  };
});
