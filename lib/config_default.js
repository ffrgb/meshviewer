define([], function () {
  return {
    'reverseGeocodingApi': 'https://nominatim.openstreetmap.org/reverse',
    'maxAge': 14,
    'maxAgeAlert': 3,
    'nodeZoom': 18,
    'labelZoom': 13,
    'clientZoom': 15,
    'fullscreen': true,
    'fullscreenFrame': true,
    'nodeAttr': [
      // value can be a node attribute (1 depth) or a a function in utils/node with prefix show
      {
        'name': 'node.status',
        'value': 'Status'
      },
      {
        'name': 'node.gateway',
        'value': 'Gateway'
      },
      {
        'name': 'node.coordinates',
        'value': 'GeoURI'
      },
      //    {
      //      "name": "node.contact",
      //      "value": "owner"
      //    },

      // Examples for functions
      // {
      //   // no name will remove first column
      //   'value': function (d) {
      //     var moment = require('moment');
      //     var V = require('snabbdom').default;
      //     return V.h('td', { props: { colSpan: 2 }, style: { background: '#49a' } },
      //       _.t('sidebar.nodeOnline') + ' translate, ' + moment(d.firstseen).get('month') +
      //       ' Month require libs like moment, access config ' + config.siteName);
      //   }
      // },
      // {
      //   'name': 'Neighbour first seen',
      //   'value': function (d, nodeDict) {
      //     return nodeDict[d.gateway_nexthop].firstseen.format() + 'access node object';
      //   }
      // },
      {
        'name': 'node.hardware',
        'value': 'model'
      },
      {
        'name': 'node.primaryMac',
        'value': 'mac'
      },
      {
        'name': 'node.firmware',
        'value': 'Firmware'
      },
      {
        'name': 'node.uptime',
        'value': 'Uptime'
      },
      {
        'name': 'node.firstSeen',
        'value': 'FirstSeen'
      },
      {
        'name': 'node.systemLoad',
        'value': 'Load'
      },
      {
        'name': 'node.ram',
        'value': 'RAM'
      },
      {
        'name': 'node.ipAddresses',
        'value': 'IPs'
      },
      {
        'name': 'node.update',
        'value': 'Autoupdate'
      },
      {
        'name': 'node.domain',
        'value': 'Domain'
      },
      {
        'name': 'node.clients',
        'value': 'Clients'
      }
    ],
    'supportedLocale': [
      'en',
      'de',
      'cz',
      'fr',
      'tr',
      'ru'
    ],
    // Color configs
    'icon': {
      'base': {
        'fillOpacity': 0.6,
        'opacity': 0.6,
        'weight': 2,
        'radius': 6,
        'className': 'stroke-first'
      },
      'online': {
        'color': '#1566A9',
        'fillColor': '#1566A9'
      },
      'offline': {
        'color': '#D43E2A',
        'fillColor': '#D43E2A',
        'radius': 3
      },
      'lost': {
        'color': '#D43E2A',
        'fillColor': '#D43E2A',
        'radius': 4
      },
      'alert': {
        'color': '#D43E2A',
        'fillColor': '#D43E2A',
        'radius': 5
      },
      'new': {
        'color': '#1566A9',
        'fillColor': '#93E929'
      }
    },
    'client': {
      'wifi24': 'rgba(220, 0, 103, 0.7)',
      'wifi5': 'rgba(10, 156, 146, 0.7)',
      'other': 'rgba(227, 166, 25, 0.7)'
    },
    'map': {
      'labelNewColor': '#459c18',
      'tqFrom': '#F02311',
      'tqTo': '#04C714',
      'highlightNode': {
        'color': '#ad2358',
        'weight': 8,
        'fillOpacity': 1,
        'opacity': 0.4,
        'className': 'stroke-first'
      },
      'highlightLink': {
        'weight': 4,
        'opacity': 1,
        'dashArray': '5, 10'
      }
    },
    'forceGraph': {
      'nodeColor': '#fff',
      'nodeOfflineColor': '#D43E2A',
      'highlightColor': 'rgba(255, 255, 255, 0.2)',
      'labelColor': '#fff',
      'tqFrom': '#770038',
      'tqTo': '#dc0067',
      'zoomModifier': 1
    },
    'locate': {
      'outerCircle': {
        'stroke': false,
        'color': '#4285F4',
        'opacity': 1,
        'fillOpacity': 0.3,
        'clickable': false,
        'radius': 16
      },
      'innerCircle': {
        'stroke:': true,
        'color': '#ffffff',
        'fillColor': '#4285F4',
        'weight': 1.5,
        'clickable': false,
        'opacity': 1,
        'fillOpacity': 1,
        'radius': 7
      },
      'accuracyCircle': {
        'stroke': true,
        'color': '#4285F4',
        'weight': 1,
        'clickable': false,
        'opacity': 0.7,
        'fillOpacity': 0.2
      }
    },
    'deprecated': ['TP-Link TL-WR740N/ND v1',
      'AP121', 'AP121U', 'D-Link DIR-615',
      'TP-Link TL-MR13U v1', 'TP-Link TL-MR3020 v1', 'TP-Link TL-MR3040 v1', 'TP-Link TL-MR3040 v2',
      'TP-Link TL-MR3220 v1', 'TP-Link TL-MR3220 v2', 'TP-Link TL-MR3420 v1', 'TP-Link TL-MR3420 v2',
      'TP-Link TL-WA701N/ND v1', 'TP-Link TL-WA701N/ND v2', 'TP-Link TL-WA730RE v1', 'TP-Link TL-WA750RE v1',
      'TP-Link TL-WA801N/ND v1', 'TP-Link TL-WA801N/ND v2', 'TP-Link TL-WA801N/ND v3',
      'TP-Link TL-WA830RE v1', 'TP-Link TL-WA830RE v2', 'TP-Link TL-WA850RE v1', 'TP-Link TL-WA860RE v1',
      'TP-Link TL-WA901N/ND v1', 'TP-Link TL-WA901N/ND v2', 'TP-Link TL-WA901N/ND v3', 'TP-Link TL-WA901N/ND v4', 'TP-Link TL-WA901N/ND v5',
      'TP-Link TL-WA7210N v2', 'TP-Link TL-WA7510N v1', 'TP-Link TL-WR703N v1', 'TP-Link TL-WR710N v2',
      'TP-Link TL-WR740N/ND v1', 'TP-Link TL-WR740N/ND v3', 'TP-Link TL-WR740N/ND v4', 'TP-Link TL-WR740N/ND v5',
      'TP-Link TL-WR741N/ND v1', 'TP-Link TL-WR741N/ND v3', 'TP-Link TL-WR741N/ND v4', 'TP-Link TL-WR741N/ND v5',
      'TP-Link TL-WR743N/ND v1', 'TP-Link TL-WR743N/ND v2',
      'TP-Link TL-WR840N v2',
      'TP-Link TL-WR841N/ND v3', 'TP-Link TL-WR841N/ND v5', 'TP-Link TL-WR841N/ND v7', 'TP-Link TL-WR841N/ND v8', 'TP-Link TL-WR841N/ND v9', 'TP-Link TL-WR841N/ND v10', 'TP-Link TL-WR841N/ND v11', 'TP-Link TL-WR841N/ND v12',
      'TP-Link TL-WR841N/ND Mod (16M) v11', 'TP-Link TL-WR841N/ND Mod (16M) v10', 'TP-Link TL-WR841N/ND Mod (16M) v8', 'TP-Link TL-WR841N/ND Mod (16M) v9', 'TP-Link TL-WR841N/ND Mod (8M) v10',
      'TP-Link TL-WR843N/ND v1',
      'TP-Link TL-WR940N v1', 'TP-Link TL-WR940N v2', 'TP-Link TL-WR940N v3', 'TP-Link TL-WR940N v4', 'TP-Link TL-WR940N v5', 'TP-Link TL-WR940N v6',
      'TP-Link TL-WR941N/ND v2', 'TP-Link TL-WR941N/ND v3', 'TP-Link TL-WR941N/ND v4', 'TP-Link TL-WR941N/ND v5', 'TP-Link TL-WR941N/ND v6',
      'A5-V11', 'D-Link DIR-615 D1', 'D-Link DIR-615 D2', 'D-Link DIR-615 D3', 'D-Link DIR-615 D4', 'D-Link DIR-615 H1',
      'VoCore 8M', 'VoCore 16M']
  };
});
