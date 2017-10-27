define(['helper'], function (helper) {
  'use strict';

  return function (config, language) {
    var self = this;
    var stats = document.createTextNode('');
    var timestamp = document.createTextNode('');

    self.setData = function setData(d) {
      var totalNodes = helper.sum(d.nodes.all.map(helper.one));
      var totalOnlineNodes = helper.sum(d.nodes.all.filter(helper.online).map(helper.one));
      var totalClients = helper.sum(d.nodes.all.filter(helper.online).map(function (n) {
        return n.clients ? n.clients : 0;
      }));
      var totalGateways = helper.sum(d.nodes.all.filter(helper.online).filter(function (n) {
        return n.is_gateway;
      }).map(helper.one));

      stats.textContent = _.t('sidebar.nodes', { total: totalNodes, online: totalOnlineNodes }) + ' ' +
        _.t('sidebar.clients', { smart_count: totalClients }) + ' ' +
        _.t('sidebar.gateway', { smart_count: totalGateways });

      timestamp.textContent = _.t('sidebar.lastUpdate') + ': ' + d.timestamp.fromNow();
    };

    self.render = function render(el) {
      var h1 = document.createElement('h1');
      h1.textContent = config.siteName;
      el.appendChild(h1);

      language.languageSelect(el);

      var p = document.createElement('p');
      p.classList.add('legend');

      p.appendChild(document.createElement('br'));
      p.appendChild(stats);
      p.appendChild(document.createElement('br'));
      p.appendChild(timestamp);
      el.appendChild(p);
    };

    return self;
  };
});
