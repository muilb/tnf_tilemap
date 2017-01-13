// eidt cho nhieu metric
// view default value at index 0.
define(function (require) {
  var decodeGeoHash = require('ui/utils/decode_geo_hash');
  var AggConfigResult = require('ui/Vis/AggConfigResult');
  var _ = require('lodash');

  function getAcr(val) {
    return val instanceof AggConfigResult ? val : null;
  }

  /**
   * lbmui: get all aggConfigResult for all metrics
   * @param row
   * @param indexs
   * @returns {Array}
   */
  function getAllAcrs(row, indexs) {
    var acrs = [], i;
    for (i = 0; i < indexs.length; i++) {
      var val = row[indexs[i]];
      var acr = val instanceof AggConfigResult ? val : null;
      acrs.push(acr);
    }

    return acrs;
  }
  function unwrap(val) {
    return getAcr(val) ? val.value : val;
  }

  /**
   * lbmui: get all values for all metrics
   * @param row
   * @param indexs
   * @returns {Array}
   */
  function getAllValues(row, indexs) {
    var values = [], i;
    for (i = 0; i < indexs.length; i++) {
      var val = row[indexs[i]];
      var value = getAcr(val) ? val.value : val;

      values.push(value);
    }

    return values;
  }

  function convertRowsToFeatures(table, geoI, metricI) {
    return _.transform(table.rows, function (features, row) {
      var geohash = unwrap(row[geoI]);
      if (!geohash) return;

      // fetch latLn of northwest and southeast corners, and center point
      var location = decodeGeoHash(geohash);

      var centerLatLng = [
        location.latitude[2],
        location.longitude[2]
      ];

      // order is nw, ne, se, sw
      var rectangle = [
        [location.latitude[0], location.longitude[0]],
        [location.latitude[0], location.longitude[1]],
        [location.latitude[1], location.longitude[1]],
        [location.latitude[1], location.longitude[0]],
      ];

      // geoJson coords use LngLat, so we reverse the centerLatLng
      // See here for details: http://geojson.org/geojson-spec.html#positions
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: centerLatLng.slice(0).reverse()
        },
        properties: {
          geohash: geohash,
          value: unwrap(row[metricI]),
          aggConfigResult: getAcr(row[metricI]),
          center: centerLatLng,
          rectangle: rectangle
        }
      });
    }, []);
  }

  function convertAllMetricRowsToFeatures(table, geoI, metrics, metricIndex) {
    // // lbmui add to test
    // table.rows.sort(sortLatLng(geoI));
    return _.transform(table.rows, function (features, row) {
      var geohash = unwrap(row[geoI]);
      if (!geohash) return;

      // fetch latLn of northwest and southeast corners, and center point
      var location = decodeGeoHash(geohash);

      var centerLatLng = [
        location.latitude[2],
        location.longitude[2]
      ];

      // order is nw, ne, se, sw
      var rectangle = [
        [location.latitude[0], location.longitude[0]],
        [location.latitude[0], location.longitude[1]],
        [location.latitude[1], location.longitude[1]],
        [location.latitude[1], location.longitude[0]],
      ];

      // geoJson coords use LngLat, so we reverse the centerLatLng
      // See here for details: http://geojson.org/geojson-spec.html#positions
      var values = getAllValues(row, metrics);
      var aggConfigResults = getAllAcrs(row, metrics);

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: centerLatLng.slice(0).reverse()
        },
        properties: {
          geohash: geohash,
          value: values[metricIndex],
          aggConfigResult: aggConfigResults[metricIndex],
          // lbmui: add for all metric
          values: values,
          aggConfigResults: aggConfigResults,
          metricIndex: metricIndex,
          // end add
          center: centerLatLng,
          rectangle: rectangle
        }
      });
    }, []);
  }

  // ham sort
  function sortLatLng(geoI) {
    // lat tu cao den thap
    // long tu thap den cao
    return function (a, b) {
      var geohashA = unwrap(a[geoI]),
        geohashB = unwrap(b[geoI]);
      var locationA = decodeGeoHash(geohashA),
        locationB = decodeGeoHash(geohashB);
      // test sort voi latitude
      if(locationA.latitude[0] < locationB.latitude[0]) {
        return 1;
      }
      if(locationA.latitude[0] > locationB.latitude[0]) {
        return -1;
      }
      // sort voi longitude
      if(locationA.longitude[0] < locationB.longitude[0]) {
        return -1;
      }
      if(locationA.longitude[0] > locationB.longitude[0]) {
        return 1;
      }
      return 0;
      // if (locationA.latitude[0] != locationB.latitude[0]) {
      //   return (locationA.longitude[0] - locationB.longitude[0]);
      // } else {
      //   return (locationA.latitude[0] - locationB.latitude[0]);
      // }
    }
  }

  return convertAllMetricRowsToFeatures;
});
