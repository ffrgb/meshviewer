# Meshviewer
[![Build Status](https://img.shields.io/travis/com/ffrgb/meshviewer/develop.svg?style=flat-square)](https://travis-ci.com/ffrgb/meshviewer)
[![Scrutinizer Code Quality](https://img.shields.io/scrutinizer/g/ffrgb/meshviewer/develop.svg?style=flat-square)](https://scrutinizer-ci.com/g/ffrgb/meshviewer/?branch=develop)
[![License: AGPL v3](https://img.shields.io/github/license/ffrgb/meshviewer.svg?style=flat-square)](https://www.gnu.org/licenses/agpl-3.0)

Meshviewer is an online visualization app to represent nodes and links on a map for Freifunk open mesh network.

### Demo

Embedded: https://regensburg.freifunk.net/netz/karte/  
Standalone: https://regensburg.freifunk.net/meshviewer/

## Sponsoring / Supporting

- [BrowserStack](https://www.browserstack.com/) for providing an awesome testing service for hundreds of browsers
- [Travis CI](https://travis-ci.com/) for building meshviewer on every push and pull request
- [Scrutinizer CI](https://scrutinizer-ci.com/g/ffrgb/meshviewer/) for testing code quality on every push and pull request
- [POEditor](https://poeditor.com/join/project/VZBjPNNic9) for providing an easy non-developer translation environment

These tools need a lot of infrastructures and provide a free account for open source software.

## Building / Running

Required tools:
* yarn
* gulp

1st install the dependencies by running
```
yarn
```

Then you can start a development server with
```
gulp serve
```

To build a release, run
```
gulp
```

The result will be in the "build" folder afterwards.