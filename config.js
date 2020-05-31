module.exports = function () {
  return {
    'nodeInfos': [
      {
        'name': 'Clientstatistik',
        'href': 'https://data.meshviewer.org/d/000000002/node?var-node={NODE_ID}',
        'image': 'https://multi.meshviewer.org/graph/000000002/node?panelId=1&var-node={NODE_ID}&from=now-86399s&width=650&height=350&theme=light',
        'title': 'Entwicklung der Anzahl der Clients innerhalb des letzten Tages'
      },
      {
        'name': 'Hardwareauslastung',
        'href': 'https://data.meshviewer.org/d/000000002/node?var-node={NODE_ID}',
        'image': 'https://multi.meshviewer.org/graph/000000002/node?panelId=4&var-node={NODE_ID}&from=now-86399s&width=650&height=350&theme=light',
        'title': 'Loadavg und Arbeitspeicherauslastung innerhalb des letzten Tages'
      }
    ],
    'linkInfos': [
      {
        'name': 'Statistik für alle Links zwischen diese Knoten',
        'href': 'https://data.meshviewer.org/d/000000002/node?var-node={SOURCE_ID}&var-nodetolink={TARGET_ID}',
        'image': 'https://multi.meshviewer.org/graph/000000002/node?panelId=7&var-node={SOURCE_ID}&var-nodetolink={TARGET_ID}&from=now-86399s&width=650&height=350&theme=light',
        'title': 'Linkstatistik des letzten Tages, min und max aller Links zwischen diesen Knoten'
      }
    ],
    'linkTypeInfos': [
      {
        'name': 'Statistik für {TYPE}',
        'href': 'https://data.meshviewer.org/d/nvSNqoHmz/link?var-node={SOURCE_ID}&var-nodetolink={TARGET_ID}&var-source_mac={SOURCE_MAC}&var-target_mac={TARGET_MAC}',
        'image': 'https://multi.meshviewer.org/graph/nvSNqoHmz/link?panelId=8&var-node={SOURCE_ID}&var-nodetolink={TARGET_ID}&var-source_mac={SOURCE_MAC}&var-target_mac={TARGET_MAC}&from=now-86399s&width=650&height=350&theme=light',
        'title': 'Linkstatistik des letzten Tages des einzelnen Links in beide Richtungen'
      }
    ],
    'globalInfos': [
      {
        'name': 'Wochenstatistik',
        'href': 'https://data.meshviewer.org/d/000000001/global',
        'image': 'https://multi.meshviewer.org/graph/000000001/global?panelId=1&from=now-7d&width=650&height=400&theme=light',
        'title': 'Entwicklung der Anzahl der Knoten und der Clients innerhalb der letzten 7 Tage'
      }
    ],
    'maxAge': 2,
    // Array of data provider are supported
    'dataPath': ['https://multi.meshviewer.org/data/'],
    'siteName': 'Freifunk Multiple Communities',
    'mapLayers': [
      {
        'name': 'Freifunk Regensburg',
        // Please ask Freifunk Regensburg before using its tile server c- example with retina tiles
        'url': 'https://multi.meshviewer.org/d/{z}/{x}/{y}{r}.png',
        'config': {
          'maxZoom': 20,
          'subdomains': '1234',
          'attribution': '<a href="http://www.openmaptiles.org/" target="_blank" rel="noopener">&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/about/" target="_blank" rel="noopener">&copy; OpenStreetMap contributors</a>'
        }
      }
    ],
    // Set a visible frame
    'fixedCenter': [
      // Northwest
      [
        54.8449,
        6.07543
      ],
      // Southeast
      [
        47.8721,
        13.9526
      ]
    ],
    'domainNames': [
      {
        'domain': 'nordwest',
        'name': 'Nordwest',
        'web': 'https://ffnw.de/',
        'map': 'https://map.ffnw.de/'
      }, {
        'domain': 'aachen',
        'name': 'Aachen',
        'web': 'https://freifunk-aachen.de/'
      }, {
        'domain': 'altdorf',
        'name': 'Altdorf',
        'web': 'https://www.freifunk-altdorf.de/'
      }, {
        'domain': 'bremen',
        'name': 'Bremen',
        'web': 'https://bremen.freifunk.net/',
        'map': 'https://map.bremen.freifunk.net/'
      }, {
        'domain': 'darmstadt',
        'name': 'Darmstadt',
        'web': 'https://darmstadt.freifunk.net/',
        'map': 'https://meshviewerDarmstadt.freifunk.net/'
      }, {
        'domain': 'einbeck',
        'name': 'Einbeck',
        'web': 'https://freifunk-einbeck.de/',
        'map': 'http://vpn1.freifunk-einbeck.de/meshviewer/'
      }, {
        'domain': 'ennepetal',
        'name': 'Ennepe-Ruhr-Kreis (Ennepetal)',
        'web': 'https://www.freifunk-en.de/',
        'map': 'https://map.ff-en.de/ennepetal/'
      }, {
        'domain': 'hattingen',
        'name': 'Ennepe-Ruhr-Kreis (Hattingen)',
        'web': 'https://www.freifunk-en.de/',
        'map': 'https://map.ff-en.de/hattingen/'
      }, {
        'domain': 'en-kreis',
        'name': 'Ennepe-Ruhr-Kreis (EN-Kreis)',
        'web': 'https://www.freifunk-en.de/',
        'map': 'https://map.ff-en.de/enkreis/'
      }, {
        'domain': 'sprockhoevel',
        'name': 'Ennepe-Ruhr-Kreis (Sprockhoevel)',
        'web': 'https://www.freifunk-en.de/',
        'map': 'https://map.ff-en.de/sprockhoevel/'
      }, {
        'domain': 'wetter',
        'name': 'Ennepe-Ruhr-Kreis (Wetter)',
        'web': 'https://www.freifunk-en.de/',
        'map': 'https://map.ff-en.de/wetter/'
      }, {
        'domain': 'witten',
        'name': 'Ennepe-Ruhr-Kreis (Witten)',
        'web': 'https://www.freifunk-en.de/',
        'map': 'https://map.ff-en.de/witten/'
      }, {
        'domain': 'erfurt',
        'name': 'Erfurt',
        'web': 'https://erfurt.freifunk.net/',
        'map': 'https://map.erfurt.freifunk.net/'
      }, {
        'domain': 'essen',
        'name': 'Essen',
        'web': 'https://freifunk-essen.de/',
        'map': 'https://map.freifunk-essen.de/'
      }, {
        'domain': 'frankenberg',
        'name': 'Frankenberg',
        'web': 'https://www.freifunk-frankenberg.de/',
        'map': 'https://map.freifunk-fkb.de/'
      }, {
        'domain': 'frankfurt',
        'name': 'Frankfurt',
        'web': 'https://ffm.freifunk.net/',
        'map': 'https://map.ffm.freifunk.net/'
      }, {
        'domain': 'gera-greiz',
        'name': 'Gera-Greiz',
        'web': 'https://www.freifunk-gera-greiz.de/',
        'map': 'https://www.freifunk-gera-greiz.de/meshviewer/'
      }, {
        'domain': 'hannover',
        'name': 'Hannover',
        'web': 'https://hannover.freifunk.net/',
        'map': 'https://hannover.freifunk.net/karte/'
      }, {
        'domain': 'hennef',
        'name': 'Hennef',
        'web': 'https://www.freifunk-hennef.de/',
        'map': 'https://map.freifunk-hennef.de/'
      },      {
        'domain': 'hochstift',
        'name': 'Hochstift',
        'web': 'https://hochstift.freifunk.net/',
        'map': 'https://map.hochstift.freifunk.net/'
      }, {
        'domain': 'karlsruhe',
        'name': 'Karlsruhe',
        'web': 'https://karlsruhe.freifunk.net/',
        'map': 'https://map.karlsruhe.freifunk.net/'
      }, {
        'domain': 'kiel',
        'name': 'Kiel',
        'web': 'https://freifunk.in-kiel.de/'
      }, {
        'domain': 'leverkusen',
        'name': 'Leverkusen',
        'web': 'http://freifunk-leverkusen.de/',
        'map': 'https://map.fflev.de/'
      }, {
        'domain': 'lueneburg',
        'name': 'Lüneburg',
        'web': 'http://freifunk-lueneburg.de/',
        'map': 'http://map.freifunk-lueneburg.de/meshviewer/'
      }, {
        'domain': 'mwu',
        'name': 'Mainz, Wiesbaden und Umgebung',
        'web': 'https://www.freifunk-mainz.de/',
        'map': 'https://map.freifunk-mwu.de/'
      }, {
        'domain': 'koeln',
        'name': 'Köln, Bonn und Umgebung',
        'web': 'https://kbu.freifunk.net/',
        'map': 'https://map.kbu.freifunk.net/'
      }, {
        'domain': 'niersufer',
        'name': 'Niersufer',
        'web': 'http://freifunk-niersufer.de/'
      }, {
        'domain': 'nord',
        'name': 'Nord',
        'web': 'https://nord.freifunk.net/',
        'map': 'https://mesh.freifunknord.de/'
      }, {
        'domain': 'regensburg',
        'name': 'Regensburg',
        'web': 'https://regensburg.freifunk.net/',
        'map': 'https://regensburg.freifunk.net/meshviewer/'
      }, {
        'domain': 'rhein-neckar',
        'name': 'Rhein-Neckar',
        'web': 'https://ffrn.de/',
        'map': 'https://map.ffrn.de/'
      }, {
        'domain': 'suedholstein',
        'name': 'Südholstein',
        'web': 'https://www.freifunk-suedholstein.de/',
        'map': 'https://map.freifunk-suedholstein.de/'
      }, {
        'domain': 'trier',
        'name': 'Trier',
        'web': 'https://trier.freifunk.net/',
        'map': 'http://maps.tackin.de/'
      }, {
        'domain': 'troisdorf',
        'name': 'Troisdorf',
        'web': 'https://freifunk-troisdorf.de/',
        'map': 'https://map.freifunk-troisdorf.de/'
      }, {
        'domain': 'vogtland',
        'name': 'Vogtland',
        'web': 'https://vogtland.freifunk.net/map/'
      }, {
        'domain': 'wels',
        'name': 'Wels',
        'web': 'http://wels.funkfeuer.at/',
        'map': 'http://leto.wels.funkfeuer.at:8080/meshviewer/meshviewer/build/'
      }, {
        'domain': 'westpfalz',
        'name': 'Westpfalz',
        'web': 'https://www.freifunk-westpfalz.de/',
        'map': 'https://map.freifunk-westpfalz.de/'
      }, {
        'domain': 'winterberg',
        'name': 'Winterberg',
        'web': 'https://www.freifunk-winterberg.net/',
        'map': 'https://map.freifunk-winterberg.net/'
      }, {
        'domain': 'guetersloh',
        'name': 'Gütersloh',
        'web': 'https://freifunk-kreisgt.de/'
      }, {
        'domain': 'ruhr',
        'name': 'Ruhrgebiet West',
        'map': 'https://map.freifunk.ruhr/'
      }, {
        'domain': 'greifswald',
        'name': 'Greifswald',
        'web': 'https://ffhgw.de/',
        'map': 'https://map.ffhgw.de/'
      }, {
        'domain': 'koenigswinter',
        'name': 'Königswinter',
        'web': 'https://freifunk-koenigswinter.de/',
        'map': 'http://map.freifunk-koenigswinter.de/'
      }, {
        'domain': 'roenkhausen',
        'name': 'Rönkhausen'
      }
    ],
    'linkList': [
      {
        'title': 'Impressum',
        'href': 'https://regensburg.freifunk.net/verein/impressum/'
      },
      {
        'title': 'Datenschutz',
        'href': 'https://regensburg.freifunk.net/verein/datenschutz/'
      }
    ]
  };
};
