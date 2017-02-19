# Meshviewer
[![Build Status](https://img.shields.io/travis/ffrgb/meshviewer/develop.svg?style=flat-square)](https://travis-ci.org/ffrgb/meshviewer)
[![Scrutinizer Code Quality](https://img.shields.io/scrutinizer/g/ffrgb/meshviewer/develop.svg?style=flat-square)](https://scrutinizer-ci.com/g/ffrgb/meshviewer/?branch=develop)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/agpl-3.0)

Web-app to visualize nodes and links on a map for Freifunk open mesh network.

#### Main differences to https://github.com/ffnord/meshviewer
_Some similar features might have been implemented/merged_

- Map layer modes (Allow to set a default layer based on time combined with a stylesheet)
- Automatic updates for selected node or list (incl. image stats cache-breaker)
- Node filter
- Zoom level for a node (`nodeZoom`) - Zoom level 22 available, but it is to close for a click
- Formatted Code
- Translation support - https://crowdin.com/project/meshviewer - Contact us for new languages
  - Currently available: en, de & fr
- Grunt inline for some css and js - less requests
- Icon font with needed icons only
- Grunt upgraded to v1.x (Tested with Node.js 4/6 LTS, 7 on Linux, 7 OSX & W**)
  - css and some js moved inline
- Yarn/npm in favour of bower
  - Load only moment.js without languages (Languages are included in translations)
  - unneeded components removed (es6-shim, tablesort, numeraljs, leaflet-providers, jshashes)
- RBush v2 - performance boost in last versions (Positions labels and clients on the map)
- Ruby dependency removed
- FixedCenter is required
- Sass-lint, scss and variables rewritten for easy customization/adjustments
- Cross browser/device support improved (THX@BrowserStack)
- Leaflet fork with a patch to avoid IE/Edge crashes
- Yarn package manager in favor of npm (npm still works)
- Configurable reverse geocoding server
- [A lot more in the commit history](https://github.com/ffrgb/meshviewer/commits/develop)

## Demo:

Embedded: https://regensburg.freifunk.net/netz/karte/<br>
Standalone: https://regensburg.freifunk.net/meshviewer/

## Known instances

| Community               | Instance                                  | Repo GitHub                                                                             |
| ---                     | ---                                       | ---                                                                                     |
| Freifunk Bremen         | https://map.bremen.freifunk.net/          | [FreifunkBremen/meshviewer-ffrgb](https://github.com/FreifunkBremen/meshviewer-ffrgb)   |


## Dependencies

- yarn (npm fallback)
- grunt-cli

### Installing dependencies

_npm is still possible to use, but yarn is much faster https://yarnpkg.com/_

Install yarn package-manager:

    Chosse your OS and install yarn https://yarnpkg.com/en/docs/install

Execute these commands on your server as a normal user to prepare the dependencies:

```bash
git clone https://github.com/ffrgb/meshviewer.git
cd meshviewer
yarn
# Only needed when no global grunt is installed
yarn global add grunt-cli
```

## Building

Just run the following command from the meshviewer directory:

```bash
grunt
```

This will generate `build/` containing all required files.

## Development

Use `grunt serve` for development.

## Support/Help

- IRC on irc.hackint.org
    - [#freifunkRGB](irc://irc.hackint.org/freifunkRGB)
    - [#meshviewer](irc://irc.hackint.org/meshviewer) (development-channel)
- Feel free to open an [issue](https://github.com/ffrgb/meshviewer/issues/new) for a problem or an idea.

## Customize style

Start your development and edit files in `scss/custom/`. Additional information in file comments.

## Configure

Change `config.json`to match your community.

### dataPath (string/array)

`dataPath` can be either a string containing the address of a Nodes.json v2 compatible backend (e.g. ffmap backend) or an array containing multiple addresses.
Don't forget the trailing slash!
Also, proxying the data through a webserver will allow GZip and thus will greatly reduce bandwidth consumption.
It may help with firewall problems too.

### siteName (string)

Change this to match your communities' name. It will be used in various places.

### maxAge (integer)

Nodes being online for less than maxAge days are considered "new". Likewise,
nodes being offline for more than than maxAge days are considered "lost".

### maxAgeAlert (integer)

Nodes being offline for more than than maxAge days are considered "lost".
Lost will be splitted in alert and lost.

### nodeZoom (integer)

Max level to be applied by clicking a node or open a node. With value `18` near by buildings and streets should be visible.
Interesting if one of configured map provider has zoom-level under `18`.

### labelZoom (integer)

Min. level for node labels shown on the map. Labels aren't shown in first zoom levels and need performance.

### clientZoom (integer)

Min. level to set starting layer for client dots on map.

### nodeInfobox

#### contact (bool, optional)

Setting this to `false` will hide contact information for nodes.

#### hardwareUsage (bool, optional)

Setting this to `false` will hide bars of memory usage and load avg for nodes.

### mapLayers (List)

A list of objects describing map layers. Each object has at least `name`, `url` and `config` properties. [Example layers and configuration](http://leaflet-extras.github.io/leaflet-providers/preview/) (map against config.json).

#### mode (string, optional)

Allows to load a additional style for a night mode or similar use case. Possible are inline style or link. 
Inline avoids re-rendering and maybe issues with label-layer update. Important are class "css-mode mode-name" and media "not".

_Default is night.css inline in index.html_

```html
 <link rel="stylesheet" class="css-mode mode-name" media="not" href="mode-name.css">
```

or

```html
<style class="css-mode mode-name" media="not">
   <inline src="mode-name.css" />
</style>
```

#### start (integer, optional)

Start a time range to put this mapLayer on first position.

#### end (integer, optional)

End a time range for first map. Stops sort this mapLayer.

### fixedCenter (array[array, array])

Choose a rectangle that must be displayed on the map. Set 2 Locations and everything between will displayed.

Examples for `fixedCenter`:

```json
// Set a visible frame
"fixedCenter": [
  [
    49.3522,
    11.7752
  ],
  [
    48.7480,
    12.8917
  ]
],
```

### nodeInfos (array, optional)

This option allows to show node statistics depending on following case-sensitive parameters:

- `name` header of statistics segment in infobox
- `href` absolute or relative URL to statistics image
- `image` `(required)` absolute or relative URL to image,
  can be the same like `href`
- `title` for the image

To insert current variables in either `href`, `image` or `title`
you can use the case-sensitive template string `{NODE_ID}`, `{NODE_NAME}`, `{LOCALE}` and `{TIME}` as cache-breaker.

Examples for `nodeInfos`:

```json
"nodeInfos": [
  { 
    "name": "Clientstatistik",
    "href": "stats/dashboard/db/node-byid?var-nodeid={NODE_ID}",
    "image": "stats/render/dashboard-solo/db/node-byid?panelId=1&fullscreen&theme=light&width=600&height=300&var-nodeid={NODE_ID}&var-host={NODE_NAME}&_t={TIME}",
    "title": "Knoten {NODE_ID}"
  },
  {
    "name": "Uptime",
    "href": "stats/dashboard/db/node-byid?var-nodeid={NODE_ID}",
    "image": "stats/render/dashboard-solo/db/node-byid?panelId=2&fullscreen&theme=light&width=600&height=300&var-nodeid={NODE_ID}&_t={TIME}",
    "title": "Knoten {NODE_ID}"
  }
]
```

In order to have statistics images available, you have to set up an instance of each [Prometheus](http://prometheus.io/) and [Grafana](http://grafana.org/).

### globalInfos (array, optional)

This option allows to show global statistics on statistics page depending on following case-sensitive parameters:

- `name` header of statistics segment in infobox
- `href` absolute or relative URL to statistics image
- `image` `(required)` absolute or relative URL to image,
  can be the same like `href`
- `title` for the image

In contrast to `nodeInfos` there is no template substitution in  `href`, `image` or `title`.

Examples for `globalInfos` using Grafana server rendering:

```json
"globalInfos": [
  { 
    "name": "Wochenstatistik",
    "href": "stats/render/render/dashboard-solo/db/global?panelId=1&fullscreen&theme=light&width=600&height=300",
    "image": "nodes/globalGraph.png",
    "title": "Bild mit Wochenstatistik"
  }
]
```

### linkInfos (array, optional)

This option allows to show link statistics depending on the following case-sensitive parameters:

- `name` header of statistics segment in infobox
- `href` absolute or relative URL to statistics image
- `image` `(required)` absolute or relative URL to image,
  can be the same like `href`
- `title` for the image

To insert the source or target variable in either `href`, `image` or `title`
you can use the case-sensitive template strings `{SOURCE_ID}`, `{TARGET_ID}`, `{SOURCE_NAME}`, `{TARGET_NAME}`, `{LOCALE}` and `{TIME}` as cache-breaker.

```json
"linkInfos": [
  {
    "name": "Linkstatistik",
    "href": "stats/dashboard/db/links?var-source={SOURCE_ID}&var-target={TARGET_ID}",
    "image": "stats/render/dashboard-solo/db/links?panelId=1&fullscreen&theme=light&width=800&height=600&var-source={SOURCE_ID}&var-target={TARGET_ID}&_t={TIME}",
    "title": "Bild mit Linkstatistik"
  }
]
```

### siteNames (array, optional)

In this array name definitions for site statistics and node info can be saved. This requires one object for each site code. This object must contain:

- `site` the site code
- `name` the defined written name for this site code

If neither `siteNames` nor `showSites` are set, site statistics and node info won't be displayed

Example for `siteNames`:

```json
  "siteNames": [
    {
      "site": "ffrgb",
      "name": "Regensburg"
    },
    {
      "site": "ffrgb-dummy",
      "name": "Regensburg Test"
    }
  ],
```
    
    
### supportedLocale (array)

Add supported locale (with matching language file in locales/*.json) and it will be matched against the browser language setting. Fallback is the first language in the array.

Example for `supportedLocale`:

```json
"supportedLocale": [
  "en",
  "de",
  "fr"
]
```
    
### cacheBreaker (string)

Will be replaced in every build to avoid missing or outdated language strings, because language.json isn't up to date.

_Fixed value (y0z)._

## Sponsoring / Supporting
- [BrowserStack](https://www.browserstack.com/) for providing an awesome testing service for hundreds of browsers
- [Travis CI](https://travis-ci.org/) for building meshviewer on every push and pull request
- [Scrutinizer CI](https://scrutinizer-ci.com/g/ffrgb/meshviewer/) for testing code quality on every push and pull request
- [Crowdin](https://crowdin.com/) for providing an easy non-developer translation environment

These tools need a lot of infrastructure and provide a free account for open source software.
