self.addEventListener('install', function (event) {
  var offlineRequest = new Request('offline.html');
  event.waitUntil(
    fetch(offlineRequest).then(function (response) {
      return caches.open('offline').then(function (cache) {
        return cache.put(offlineRequest, response);
      });
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.open('offline').then(function (cache) {
          return cache.match('offline.html');
        });
      })
    );
  }
});
