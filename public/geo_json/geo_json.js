// edit cho nhieu metric
define(function (require) {
  return function TileMapConverterFn(Private, timefilter, $compile, $rootScope) {
    var _ = require('lodash');

    var rowsToFeatures = require('plugins/tnf_tilemap/geo_json/rowsToFeatures');
    var tooltipFormatter = Private(require('plugins/tnf_tilemap/geo_json/tnf_tooltip_formatter'));

    return function (vis, table) {

      function columnIndex(schema) {
        return _.findIndex(table.columns, function (col) {
          return col.aggConfig.schema.name === schema;
        });
      }

      /**
       * lbmui: get all columnIndex
       * @param schema
       * @returns {Array}
       */
      function getAllcolumnIndex(schema) {
        var indexes = [], i;
        for(i = 0; i < table.columns.length; i++){
          if (table.columns[i].aggConfig.schema.name === schema) indexes.push(i);
        }

        return indexes;
      }

      function getAllAggs(indexs) {
        var aggs = [], i;
        for (i = 0; i < indexs.length; i++) {
          aggs.push(_.get(table.columns, [indexs[i], 'aggConfig']));
        }

        return aggs;
      }
      var geoI = columnIndex('segment');
      // lbmui: get all metric
      var metrics = getAllcolumnIndex('metric');
      var metricIndex = _.get(vis.params, 'metricIndex') !== undefined ? _.get(vis.params, 'metricIndex') : 0;
      metricIndex = metricIndex < metrics.length ? metricIndex : metrics.length - 1;

      var geoAgg = _.get(table.columns, [geoI, 'aggConfig']);
      // lbmui: get all aggConfig
      var metricAggs = getAllAggs(metrics);
      var metricAgg = metricAggs[metricIndex];

      var features = rowsToFeatures(table, geoI, metrics, metricIndex);
      // its Ok when change scall
      var values = features.map(function (feature) {
        return feature.properties.value;
      });

      return {
        title: table.title(),
        valueFormatter: metricAgg && metricAgg.fieldFormatter(),
        // lbmui: add for all metrics
        valueFormatters: metricAggs,
        tooltipFormatter: tooltipFormatter,
        geohashGridAgg: geoAgg,
        geoJson: {
          type: 'FeatureCollection',
          features: features,
          properties: {
            min: _.min(values),
            max: _.max(values),
            zoom: _.get(geoAgg, 'params.mapZoom'),
            center: _.get(geoAgg, 'params.mapCenter')
          }
        }
      };
    };
  };
});
