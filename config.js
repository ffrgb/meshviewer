module.exports = function () {
  return {
    // Variables are NODE_ID and NODE_NAME (only a-z0-9\- other chars are replaced with _)
    'nodeInfos': [
      {
        'name': 'Clientstatistik',
        'href': 'https://regensburg.freifunk.net/netz/statistik/node/{NODE_ID}/',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000026/node?panelId=1&var-node={NODE_ID}&from=now-1d&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Clientstatistik für {NODE_ID} - weiteren Statistiken',
        'width': 650,
        'height': 350
      },
      {
        'name': 'Trafficstatistik',
        'href': 'https://regensburg.freifunk.net/netz/statistik/node/{NODE_ID}/',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000026/node?panelId=2&from=now-1d&var-node={NODE_ID}&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Trafficstatistik für {NODE_ID} - weiteren Statistiken',
        'width': 650,
        'height': 350
      },
      {
        'name': 'Systemlast',
        'href': 'https://regensburg.freifunk.net/netz/statistik/node/{NODE_ID}/',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000026/node?panelId=4&from=now-1d&var-node={NODE_ID}&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Systemlast für {NODE_ID} - weiteren Statistiken',
        'width': 650,
        'height': 350
      },
      {
        'name': 'Airtime',
        'href': 'https://regensburg.freifunk.net/netz/statistik/node/{NODE_ID}/',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000026/node?panelId=5&from=now-1d&var-node={NODE_ID}&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Airtime für {NODE_ID} - weiteren Statistiken',
        'width': 650,
        'height': 350
      }
    ],
    'linkInfos': [
      {
        'name': 'Statistik für alle Links zwischen diese Knoten',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/nvSNqoHmz/link?panelId=7&var-node={SOURCE_ID}&var-nodetolink={TARGET_ID}&from=now-1d&&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Linkstatistik des letzten Tages, min und max aller Links zwischen diesen Knoten',
        'width': 650,
        'height': 350
      }
    ],
    'globalInfos': [
      {
        'name': 'Globale Statistik',
        'href': 'https://regensburg.freifunk.net/netz/statistik',
        'image': 'https://grafana.regensburg.freifunk.net/render/d-solo/000000028/globals?panelId=2&from=now-7d&&width=650&height=350&theme=light&_t={TIME}',
        'title': 'Globale Statistik - weiteren Statistiken',
        'width': 650,
        'height': 350
      }
    ],
    // Array of data provider are supported
    'dataPath': [
      'https://regensburg.freifunk.net/data/'
    ],
    'siteName': 'Freifunk Regensburg',
    'mapLayers': [
      {
        'name': 'Wikimedia OSM Map',
        'url': 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png',
        'config': {
          'maxZoom': 20,
          'subdomains': '1234',
          'attribution': '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use" rel="noopener" target="_blank">Wikimedia maps</a><a href="http://www.openmaptiles.org/" target="_blank">&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/about/" target="_blank" rel="noopener">&copy; OpenStreetMap contributors</a>',
          'start': 6
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
