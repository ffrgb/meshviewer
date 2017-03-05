# Meshviewer
[![Build Status](https://img.shields.io/travis/ffrgb/meshviewer/develop.svg?style=flat-square)](https://travis-ci.org/ffrgb/meshviewer)
[![Scrutinizer Code Quality](https://img.shields.io/scrutinizer/g/ffrgb/meshviewer/develop.svg?style=flat-square)](https://scrutinizer-ci.com/g/ffrgb/meshviewer/?branch=develop)
[![Documentation](https://img.shields.io/badge/gitbooks.io-documentation-brightgreen.svg?style=flat-square)](https://meshviewer.gitbooks.io/documentation/content/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/agpl-3.0)

Meshviewer is an online visualization app to represent nodes and links on a map for Freifunk open mesh network.

#### Main differences to https://github.com/ffnord/meshviewer
_Some similar features might have been implemented/merged_

- Replaced router - including language, mode, node, link, location
- Leaflet upgraded to v1 - faster on mobile
- Forcegraph rewrite with d3.js v4
- Map layer modes (Allow to set a default layer based on time combined with a stylesheet)
- Automatic updates for selected node or list (incl. image stats cache-breaker)
- Node filter
- Zoom level for clicking on a node (`nodeZoom`) is definable independently from the maximum zoom level 22
- Formatted Code
- Translation support - https://crowdin.com/project/meshviewer - Contact us for new languages
  - Currently available: en, de, fr & ru
- Gulp inline for some css and js - fewer requests and instant load indicator
- Icon font with needed icons only
- Switch to Gulp (Tested with Node.js 4/6 LTS, 7 on Linux, 7 OSX & W**)
  - css and some js moved inline
- Yarn/npm in favour of bower
  - Load only moment.js without languages (Languages are included in translations)
  - unneeded components removed (es6-shim, tablesort, numeraljs, leaflet-providers, leaflet-label jshashes, chroma-js)
- RBush v2 - performance boost in last versions (positions, labels and clients on the map)
- Ruby dependency removed
- FixedCenter is required
- Sass-lint, scss and variables rewritten for easy customizations/adjustments
- Cross browser/device support improved (THX@BrowserStack)
- Yarn package manager in favour of npm (npm still works)
- Configurable reverse geocoding server
- [A lot more in the commit history](https://github.com/ffrgb/meshviewer/commits/develop)

### Demo

Embedded: https://regensburg.freifunk.net/netz/karte/  
Standalone: https://regensburg.freifunk.net/meshviewer/

## Documentation

Documentation moved to [meshviewer.gitbooks.io](https://meshviewer.gitbooks.io/documentation/content/).

- Read: https://meshviewer.gitbooks.io/documentation/content/
- PDF, Mobi, ePub & edit: https://www.gitbook.com/book/meshviewer/documentation/details

#### Why move the documentation?

- Search available
- Multiple pages
- Less doc commits, faster changes
- Export as PDF, Mobi, ePub

## Sponsoring / Supporting

- [BrowserStack](https://www.browserstack.com/) for providing an awesome testing service for hundreds of browsers
- [Travis CI](https://travis-ci.org/) for building meshviewer on every push and pull request
- [Scrutinizer CI](https://scrutinizer-ci.com/g/ffrgb/meshviewer/) for testing code quality on every push and pull request
- [Crowdin](https://crowdin.com/) for providing an easy non-developer translation environment

These tools need a lot of infrastructures and provide a free account for open source software.
