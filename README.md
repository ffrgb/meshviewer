# Meshviewer
[![Build Status](https://img.shields.io/github/workflow/status/freifunk-ffm/meshviewer/Build%20Meshviewer?style=flat-square)](https://github.com/freifunk-ffm/meshviewer/actions?query=workflow%3A%22Build+Meshviewer%22)
[![Release](https://img.shields.io/github/v/release/freifunk-ffm/meshviewer?style=flat-square)](https://github.com/freifunk-ffm/meshviewer/releases)
[![Scrutinizer Code Quality](https://img.shields.io/scrutinizer/g/freifunk-ffm/meshviewer/develop.svg?style=flat-square)](https://scrutinizer-ci.com/g/freifunk-ffm/meshviewer/?branch=develop)
[![License: AGPL v3](https://img.shields.io/github/license/freifunk-ffm/meshviewer.svg?style=flat-square)](https://www.gnu.org/licenses/agpl-3.0)

Meshviewer is an online visualization app to represent nodes and links on a map for Freifunk open mesh network.

** This is a fork of https://github.com/ffrgb/meshviewer with some adjustments **

## Installation
This fork of the new meshviewer has a new installation method:
- Go to the [release page](https://github.com/freifunk-ffm/meshviewer/releases) and download the current build
- Let your webserver serve this build
- Add a config.json to the webdir (based on config.json.example)

### Build yourself
- Clone this repository
- Run `npm install`
- Run `npm run build`
- A production build will be in /build

## Configuration
The configuration documentation is nowhere near finished.

#### Deprecation Warning
The deprecation warning can be turned of with `"deprecation_enabled": false` - but we wouldn't suggest it.

You can insert your own HTML into the deprecation warning via `"deprecation_text":""`.
