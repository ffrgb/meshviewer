define(function () {
  return {
    distance: function distance(a, b) {
      return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    },

    distancePoint: function distancePoint(a, b) {
      return Math.sqrt(distance(a, b));
    },

    distanceLink: function distanceLink(p, a, b) {
      /* http://stackoverflow.com/questions/849211 */
      var l2 = distance(a, b);
      if (l2 === 0) {
        return distance(p, a);
      }
      var t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
      if (t < 0) {
        return distance(p, a);
      } else if (t > 1) {
        return distance(p, b);
      }
      return distancePoint(p, {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y)
      });
    }
  };
});
