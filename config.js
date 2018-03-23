module.exports = function () {
  return {
    // Variables are NODE_ID and NODE_NAME (only a-z0-9\- other chars are replaced with _)
    'nodeInfos': [
      {
        'name': 'Clientstatistik',
        'href': 'https://regensburg.freifunk.net/netz/statistik/node/{NODE_ID}/',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000026/node?panelId=1&var-node={NODE_ID}&from=now-1d&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Clientstatistik für {NODE_ID} - weiteren Statistiken'
      },
      {
        'name': 'Trafficstatistik',
        'href': 'https://regensburg.freifunk.net/netz/statistik/node/{NODE_ID}/',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000026/node?panelId=2&from=now-1d&var-node={NODE_ID}&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Trafficstatistik für {NODE_ID} - weiteren Statistiken'
      },
      {
        'name': 'Systemlast',
        'href': 'https://regensburg.freifunk.net/netz/statistik/node/{NODE_ID}/',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000026/node?panelId=4&from=now-1d&var-node={NODE_ID}&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Systemlast für {NODE_ID} - weiteren Statistiken'
      },
      {
        'name': 'Airtime',
        'href': 'https://regensburg.freifunk.net/netz/statistik/node/{NODE_ID}/',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000026/node?panelId=5&from=now-1d&var-node={NODE_ID}&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Airtime für {NODE_ID} - weiteren Statistiken'
      }
    ],
    'linkInfos': [
      {
        'name': 'Statistik für alle Links zwischen diese Knoten',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/nvSNqoHmz/link?panelId=7&var-node={SOURCE_ID}&var-nodetolink={TARGET_ID}&from=now-1d&&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Linkstatistik des letzten Tages, min und max aller Links zwischen diesen Knoten'
      }
    ],
    'globalInfos': [
      {
        'name': 'Globale Statistik',
        'href': 'https://regensburg.freifunk.net/netz/statistik',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000028/globals?panelId=2&from=now-7d&&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Globale Statistik - weiteren Statistiken'
      }
    ],
    // Array of data provider are supported
    'dataPath': [
      'https://regensburg.freifunk.net/data/'
    ],
    'reverseGeocodingApi': 'https://regensburg.freifunk.net/geocoding/reverse',
    'siteName': 'Freifunk Regensburg',
    'mapLayers': [
      {
        'name': 'Freifunk Regensburg',
        // Please ask Freifunk Regensburg before using its tile server c- example with retina tiles
        'url': 'https://{s}.tiles.ffrgb.net/{z}/{x}/{y}{retina}.png',
        'config': {
          'maxZoom': 20,
          'subdomains': '1234',
          'attribution': '<a href="http://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/about/" target="_blank">&copy; OpenStreetMap contributors</a>',
          'start': 6
        }
      },
      {
        'name': 'Freifunk Regensburg Night',
        // Please ask Freifunk Regensburg before using its tile server - example with retina and dark tiles
        'url': 'https://{s}.tiles.ffrgb.net/n/{z}/{x}/{y}{retina}.png',
        'config': {
          'maxZoom': 20,
          'subdomains': '1234',
          'attribution': ' <a href="http://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/about/" target="_blank">&copy; OpenStreetMap contributors</a>',
          'mode': 'night',
          'start': 19,
          'end': 7
        }
      }
    ],
    // Set a visible frame
    'fixedCenter': [
      // Northwest
      [
        49.3522,
        11.7752
      ],
      // Southeast
      [
        48.7480,
        12.8917
      ]
    ],
    'domainNames': [
      {
        'domain': 'ffrgb-bat15',
        'name': 'Regensburg'
      },
      {
        'domain': 'ffrgb',
        'name': 'Regensburg'
      }
    ],
    'linkList': [
      {
        'title': 'Impressum',
        'href': '/verein/impressum/'
      },
      {
        'title': 'Datenschutz',
        'href': '/verein/datenschutz/'
      }
    ]
  };
};
