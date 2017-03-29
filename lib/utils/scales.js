define(['d3-interpolate'], function (d3Interpolate) {
  return {
    link: d3Interpolate.interpolate(config.constance.scales.link[0], config.constance.scales.link[1]),
    background: d3Interpolate.interpolate(config.constance.scales.background[0], config.constance.scales.background[1])
  };
});
