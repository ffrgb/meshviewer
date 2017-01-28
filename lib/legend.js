define(['helper'], function (helper) {
  'use strict';

  return function (config) {
    var self = this;
    var stats = document.createTextNode('');
    var timestamp = document.createTextNode('');

    self.setData = function setData(d) {
      var totalNodes = helper.sum(d.nodes.all.map(helper.one));
      var totalOnlineNodes = helper.sum(d.nodes.all.filter(helper.online).map(helper.one));
      var totalClients = helper.sum(d.nodes.all.filter(helper.online).map(function (n) {
        return n.statistics.clients ? n.statistics.clients : 0;
      }));
      var totalGateways = helper.sum(d.nodes.all.filter(helper.online).filter(function (n) {
        return n.flags.gateway;
      }).map(helper.one));

      stats.textContent = _.t('sidebar.nodes', {total: totalNodes, online: totalOnlineNodes}) + ' ' +
        _.t('sidebar.clients', {smart_count: totalClients}) + ' ' +
        _.t('sidebar.gateway', {smart_count: totalGateways});

      timestamp.textContent = _.t('sidebar.lastUpdate') + ': ' + d.timestamp.format('DD.MM.Y HH:mm');
    };

    self.render = function render(el) {
      var h2 = document.createElement('h2');
      h2.textContent = config.siteName;
      el.appendChild(h2);

      var p = document.createElement('p');
      p.classList.add('legend');
      p.innerHTML = '<span class="legend-new"><span class="symbol"></span> ' + _.t('sidebar.nodeNew') + '</span>' +
        '<span class="legend-online"><span class="symbol"></span> ' + _.t('sidebar.nodeOnline') + '</span>' +
        '<span class="legend-offline"><span class="symbol"></span> ' + _.t('sidebar.nodeOffline') + '</span>';
      el.appendChild(p);

      p.appendChild(document.createElement('br'));
      p.appendChild(stats);
      p.appendChild(document.createElement('br'));
      p.appendChild(timestamp);
    };

    return self;
  };
});
