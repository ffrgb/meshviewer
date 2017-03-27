module.exports = function (gulp, plugins, config) {
  return function javascript(cb) {
    plugins.realFavicon.generateFavicon({
      masterPicture: 'assets/logo.svg',
      dest: 'assets/favicon',
      iconsPath: '.',
      design: {
        ios: {
          pictureAspect: 'backgroundAndMargin',
          backgroundColor: '#000000',
          margin: '14%',
          assets: {
            ios6AndPriorIcons: false,
            ios7AndLaterIcons: false,
            precomposedIcons: false,
            declareOnlyDefaultIcon: true
          },
          appName: 'Meshviewer'
        },
        desktopBrowser: {},
        windows: {
          pictureAspect: 'noChange',
          backgroundColor: '#dc0067',
          onConflict: 'override',
          assets: {
            windows80Ie10Tile: false,
            windows10Ie11EdgeTiles: {
              small: true,
              medium: true,
              big: true,
              rectangle: false
            }
          },
          appName: 'Meshviewer'
        },
        androidChrome: {
          // pictureAspect: 'shadow',
          themeColor: '#dc0067',
          manifest: {
            name: 'Meshviewer',
            display: 'standalone',
            orientation: 'notSet',
            onConflict: 'override',
            declared: true
          },
          assets: {
            legacyIcon: false,
            lowResolutionIcons: false
          }
        },
        safariPinnedTab: {
          pictureAspect: 'silhouette',
          themeColor: '#dc0067'
        }
      },
      settings: {
        compression: 2,
        scalingAlgorithm: 'Mitchell',
        errorOnImageTooSmall: false
      },
      markupFile: config.faviconData
    });
    return cb();
  };
};
