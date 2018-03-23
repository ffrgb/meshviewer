module.exports = function () {
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
      // {
      //   'name': 'node.systemLoad',
      //   'value': 'Load'
      // },
      // {
      //   'name': 'node.ram',
      //   'value': 'RAM'
      // },
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
    'cacheBreaker': '<!-- inject:cache-breaker -->'
  };
};
