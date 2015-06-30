# Change Log

## v3

### Implemented enhancements:

- Make clients in map start at a random angle
- On statistics page: show how many nodes supply geoinformation
- Allow additional statistics (global and per node) configured in config.js
- Improve node count information (total, online, clients, ...)
- Show hardware model in link infobox
- Introduce maxAge setting
- Graph: show VPN links in grayscale

### Removed features:

- Don't show contact information in node lists

### Fixed bugs:

- Fixed off-by-one when drawing clients
- Match labels order to node order in map
- Statistics: count only nodes that are present

## v2

### General changes:

- License change from GPL 3 to AGPL 3

### Implemented enhancements:

- Improved performance on Firefox
- Labels in graph view
- infobox: link to geouri with node's coordinates
- infobox: show node id
- map: locate user
- map: adding custom layers from leaflet.providers
- nodelist: sort by uptime fixed
- graph: circles for clients

### Fixed bugs:

- Links disappeared on graph on refresh 
