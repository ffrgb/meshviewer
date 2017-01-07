[![Build Status](https://travis-ci.org/ffrgb/meshviewer.svg?branch=develop)](https://travis-ci.org/ffrgb/meshviewer)

### Main differences to https://github.com/ffnord/meshviewer
#### Some features are maybe merged

- Add modes - For example add a night layer and style
- Updates selected node or list (incl. image stats cache-breaker) - not only overview tables
- Zoom level if you click a node (`nodeZoom`) - Zoom level 22 available, but it is to close for a click
- Formatted Code
- Grunt inline for some css and js - less requests
- Icon font with only needed icons
- Upgrade to grunt v1.x (Tested with Node.js 4 LTS,6 LTS,7 Linux,OSX,W**)
  - Inline some css and js
- Bower update all components
  - Load only german locale from 101 languages from moment.js
- Right click open layermenu
- Remove ruby dependency
- FixedCenter is required
- Rewrite Scss, SASS lint and variables for easy customization/adjustments
- Improved cross browser/device support THX@BrowserStack
- Leaflet with patch to avoid IE/Edge crashes
- [A lot more in commit history](https://github.com/ffrgb/meshviewer/commits/develop)

# Demo (embedded):

https://regensburg.freifunk.net/netz/karte/

# Screenshots

> TODO new uptodate images

# Dependencies

- npm
- bower
- grunt-cli

# Installing dependencies

Install npm package-manager. On Debian-like systems run:

    sudo apt-get install npm

Execute these commands on your server as a normal user to prepare the dependencies:

    git clone https://github.com/ffrgb/meshviewer.git
    cd meshviewer
    npm install
    npm install grunt-cli

# Building

Just run the following command from the meshviewer directory:

    node_modules/.bin/grunt

This will generate `build/` containing all required files.

## Development

Use `grunt serve` for development.

## Support/Help

- IRC: irc.hackint.org #freifunkRGB
- Feel free to open an issue for a problem or a idea.

# Configure

Change `config.json`to match your community.


## Customize style

Start your development and edit files in `scss/custom/`. Additional information in comments.

## dataPath (string/array)

`dataPath` can be either a string containing the address of a Nodes.json v2 compatible backend (e.g. ffmap backend) or an array containing multiple addresses.
Don't forget the trailing slash!
Also, proxying the data through a webserver will allow GZip and thus will greatly reduce bandwidth consumption.
It may help with firewall problems too.

## siteName (string)

Change this to match your communities' name. It will be used in various places.

## showContact (bool)

Setting this to `false` will hide contact information for nodes.

## maxAge (integer)

Nodes being online for less than maxAge days are considered "new". Likewise,
nodes being offline for more than than maxAge days are considered "lost".

## nodeZoom (integer)

Max level to be applied by clicking a node or open a node. With value `18` near by buildings and streets should be visible.
Interesting if one of configured map provider has zoom-level under `18`.

## mapLayers (List)

A list of objects describing map layers. Each object has at least `name`
property and optionally `url` and `config` properties. If no `url` is supplied
`name` is assumed to name a
[Leaflet-provider](http://leaflet-extras.github.io/leaflet-providers/preview/).

### Additional arguments

#### mode (string)

Allows to load a additional style for a night mode or similar use case. Style is attached to the mapLayer.

#### start (integer)

Start a time range to put this mapLayer on first position.

#### end (integer)

End a time range for first map. Stops sort this mapLayer.

#### end (integer)

## fixedCenter (array, optional)

This option allows to fix the map at one specific coordinate depending on following case-sensitive parameters:

- `lat` latitude of the center point
- `lng` longitude of the center point
- `radius` visible radius around the center in km

Examples for `fixedCenter`:

    "fixedCenter": {
      "lat": 50.80,
      "lng": 12.07,
      "radius": 30
    }

## nodeInfos (array, optional)

This option allows to show node statistics depending on following case-sensitive parameters:

- `name` caption of statistics segment in infobox
- `href` absolute or relative URL to statistics image
- `thumbnail` absolute or relative URL to thumbnail image,
  can be the same like `href`
- `caption` is shown, if `thumbnail` is not present (no thumbnail in infobox)

To insert current node-id in either `href`, `thumbnail` or `caption`
you can use the case-sensitive template string `{NODE_ID}`, `{NODE_NAME}` and `{TIME}` as cache-breaker.

Examples for `nodeInfos`:

    "nodeInfos": [

      { "name": "Clientstatistik",
        "href": "stats/dashboard/db/node-byid?var-nodeid={NODE_ID}",
        "thumbnail": "stats/render/dashboard-solo/db/node-byid?panelId=1&fullscreen&theme=light&width=600&height=300&var-nodeid={NODE_ID}&var-host={NODE_NAME}&_t={TIME}",
        "caption": "Knoten {NODE_ID}"
      },
      { "name": "Uptime",
        "href": "stats/dashboard/db/node-byid?var-nodeid={NODE_ID}",
        "thumbnail": "stats/render/dashboard-solo/db/node-byid?panelId=2&fullscreen&theme=light&width=600&height=300&var-nodeid={NODE_ID}&_t={TIME}",
        "caption": "Knoten {NODE_ID}"
      }
    ]

In order to have statistics images available, you have to set up an instance of each [Prometheus](http://prometheus.io/) and [Grafana](http://grafana.org/).

## globalInfos (array, optional)

This option allows to show global statistics on statistics page depending on following case-sensitive parameters:

- `name` caption of statistics segment in infobox
- `href` absolute or relative URL to statistics image
- `thumbnail` absolute or relative URL to thumbnail image,
  can be the same like `href`
- `caption` is shown, if `thumbnail` is not present (no thumbnail in infobox)

In contrast to `nodeInfos` there is no template substitution in  `href`, `thumbnail` or `caption`.

Examples for `globalInfos` using Grafana server rendering:

    "globalInfos": [
      { "name": "Wochenstatistik",
        "href": "stats/render/render/dashboard-solo/db/global?panelId=1&fullscreen&theme=light&width=600&height=300",
        "thumbnail": "nodes/globalGraph.png",
        "caption": "Bild mit Wochenstatistik"
      }
    ]

## linkInfos (array, optional)

This option allows to show link statistics depending on the following case-sensitive parameters:

- `name` caption of statistics segment in infobox
- `href` absolute or relative URL to statistics image
- `thumbnail` absolute or relative URL to thumbnail image,
  can be the same like `href`
- `caption` is shown, if `thumbnail` is not present (no thumbnail in infobox)

To insert the source or target node-id in either `href`, `thumbnail` or `caption`
you can use the case-sensitive template strings `{SOURCE}`, `{TARGET}` and `{TIME}` as cache-breaker.

    "linkInfos": [
      { "href": "stats/dashboard/db/links?var-source={SOURCE}&var-target={TARGET}",
        "thumbnail": "stats/render/dashboard-solo/db/links?panelId=1&fullscreen&theme=light&width=800&height=600&var-source={SOURCE}&var-target={TARGET}&_t={TIME}"
      }
    ]

## siteNames (array, optional)

In this array name definitions for site statistics and node info can be saved. This requires one object for each site code. This object must contain:

- `site` the site code
- `name` the defined written name for this site code

If neither `siteNames` nor `showSites` are set, site statistics and node info won't be displayed

Example for `siteNames`:

    "siteNames": [
      { "site": "ffhl", "name": "Lübeck" },
      { "site": "ffeh", "name": "Entenhausen" ),
      { "site": "ffgt", "name": "Gothamcity" },
      { "site": "ffal", "name": "Atlantis" }
    ]

## Sponsoring / Supporting
- [BrowserStack](https://www.browserstack.com/) for providing a awesome testing service for hundreds of browsers
- [Travis CI](https://travis-ci.org/) for testing every push and pull request

These tools need a lot of infrastructure behind and don't charge open source software
