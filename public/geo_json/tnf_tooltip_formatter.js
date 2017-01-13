/**
 * edit for view all metrics value
 */
define(function (require) {
  return function TileMapTooltipFormatter($compile, $rootScope, Private) {
    var $ = require('jquery');
    var _ = require('lodash');

    var fieldFormats = Private(require('ui/registry/field_formats'));
    var $tooltipScope = $rootScope.$new();
    var $el = $('<div>').html(require('plugins/tnf_tilemap/geo_json/_tooltip.html'));
    $compile($el)($tooltipScope);

    return function tooltipFormatter(feature) {
      if (!feature) return '';

      var acr = feature.properties.aggConfigResult;
      var vis = acr.aggConfig.vis;

      var geoFormat = _.get(vis.aggs, 'byTypeName.geohash_grid[0].format');
      if (!geoFormat) geoFormat = fieldFormats.getDefaultInstance('geo_point');
      // lbmui: view tooltip for all metrics
      var details = [], i;
      var values = feature.properties.values;
      var metricIndex = feature.properties.metricIndex;
      var acrs = feature.properties.aggConfigResults;

      details.push({
        label: acrs[metricIndex].aggConfig.makeLabel(),
        value: acrs[metricIndex].aggConfig.fieldFormatter()(values[metricIndex]),
        isSelected: 'tnf-warning-bg'
      });

      for (i = 0; i < values.length; i ++) {
        if(metricIndex != i) {
          var metricAgg = acrs[i].aggConfig;
          // var isSelected = metricIndex == i ? 'tnf-warning-bg' : '';
          details.push({
            label: metricAgg.makeLabel(),
            value: metricAgg.fieldFormatter()(values[i]),
            isSelected: ''
          });
        }
      }
      details.push({
        label: 'Center',
        value: geoFormat.convert({
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0]
        }),
        isSelected: ''
      });
      $tooltipScope.details = details;

      $tooltipScope.$apply();

      return $el.html();
    };
  };
});
