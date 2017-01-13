// edit cho nhieu metric
define(function (require) {
  return function TileMapConverterFn(Private, timefilter, $compile, $rootScope) {
    var _ = require('lodash');

    var rowsToGibs = require('plugins/tnf_tilemap/wind_grib/rowsToGribs');
    // var tooltipFormatter = Private(require('plugins/tnf_tilemap/geo_json/tnf_tooltip_formatter'));

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
      // get indexs for windy component
      // can thiet lap param o vis
      // windIndex = {tempIndex, speedIndex, degIndex}
      var windIndex = _.get(vis.params, 'windIndex') !== undefined ? _.get(vis.params, 'windIndex') : undefined;

      var gribs = rowsToGibs(table, geoI, metrics, windIndex);

      return gribs;
      // return {
      //   title: table.title(),
      //   // valueFormatter: metricAgg && metricAgg.fieldFormatter(),
      //   // // lbmui: add for all metrics
      //   // valueFormatters: metricAggs,
      //   // tooltipFormatter: tooltipFormatter,
      //   // geohashGridAgg: geoAgg,
      //   geoJson: {
      //     type: 'WindGrib',
      //     // features: gribs,
      //     gribs: gribs,
      //     properties: {
      //       // min: _.min(values),
      //       // max: _.max(values),
      //       zoom: _.get(geoAgg, 'params.mapZoom'),
      //       center: _.get(geoAgg, 'params.mapCenter')
      //     }
      //   }
      // };
    };
  };
});
