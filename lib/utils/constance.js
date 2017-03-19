define(['d3-interpolate'], function (d3Interpolate) {
  return {
    linkScale: d3Interpolate.interpolate('#F02311', '#04C714'),
    backgroundScale: d3Interpolate.interpolate('#770038', '#DC0067'),
    map: {
      node: {
        online: {
          color: '#1566A9',
          fillColor: '#1566A9',
          radius: 6,
          fillOpacity: 0.5,
          opacity: 0.5,
          weight: 2,
          className: 'stroke-first'
        },
        offline: {
          color: '#D43E2A',
          fillColor: '#D43E2A',
          radius: 3,
          fillOpacity: 0.5,
          opacity: 0.5,
          weight: 1,
          className: 'stroke-first'
        },
        lost: {
          color: '#D43E2A',
          fillColor: '#D43E2A',
          radius: 4,
          fillOpacity: 0.8,
          opacity: 0.8,
          weight: 1,
          className: 'stroke-first'
        },
        alert: {
          color: '#D43E2A',
          fillColor: '#D43E2A',
          radius: 5,
          fillOpacity: 0.8,
          opacity: 0.8,
          weight: 2,
          className: 'stroke-first'
        },
        new: {
          color: '#1566A9',
          fillColor: '#93E929',
          radius: 6,
          fillOpacity: 1.0,
          opacity: 0.5,
          weight: 2
        }
      },
      locationMarker: {
        outerCircle: {
          stroke: false,
          color: '#4285F4',
          opacity: 1,
          fillOpacity: 0.3,
          clickable: false,
          radius: 16
        },
        innerCircle: {
          stroke: true,
          color: '#ffffff',
          fillColor: '#4285F4',
          weight: 1.5,
          clickable: false,
          opacity: 1,
          fillOpacity: 1,
          radius: 7
        },
        accuracyCircle: {
          stroke: true,
          color: '#4285F4',
          weight: 1,
          clickable: false,
          opacity: 0.7,
          fillOpacity: 0.2
        }
      }
    },
    forcegraph: {
      zoomMin: 1 / 8,
      zoomMax: 3,
      force: {
        alpha: 0.3,
        distance: {
          vpn: 0,
          other: 75
        },
        strength: {
          vpn: 0.02,
          center: 0.02,
          other: 0.5
        }
      },
      node: {
        radiusDraw: 8,
        radiusDrag: 10,
        radiusHightlight: 20,
        radiusSelect: 15
      },
      link: {
        radiusDraw: 12,
        radiusSelect: 12,
        radiusHightlight: 24
      }
    }
  };
});
