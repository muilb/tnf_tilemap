/**
 * Created by lebamui on 11/11/2016.
 */

define(function (require) {
  const _ = require('lodash');

  function filterToGeoJson(filter, field) {
    var features = [];
    if (_.has(filter, 'bool.should')) {
      _.get(filter, 'bool.should', []).forEach(function (it) {
        features = features.concat(filterToGeoJson(it, field));
      });
    } else if (_.has(filter, 'geo_bounding_box.' + field)) {
      const topLeft = _.get(filter, 'geo_bounding_box.' + field + '.top_left');
      const bottomRight = _.get(filter, 'geo_bounding_box.' + field + '.bottom_right');
      if (topLeft && bottomRight) {
        const coords = [];
        coords.push([topLeft.lon, topLeft.lat]);
        coords.push([bottomRight.lon, topLeft.lat]);
        coords.push([bottomRight.lon, bottomRight.lat]);
        coords.push([topLeft.lon, bottomRight.lat]);
        features.push({
          type: 'Polygon',
          coordinates: [coords]
        });
      }
    } else if (_.has(filter, 'geo_polygon.' + field)) {
      const points = _.get(filter, 'geo_polygon.' + field + '.points', []);
      const coords = [];
      points.forEach(function (point) {
        const lat = point[1];
        const lon = point[0];
        coords.push([lon, lat]);
      });
      if (coords.length > 0) {
        features.push({
          type: 'Polygon',
          coordinates: [coords]
        });
      }
    } else if (_.has(filter, 'geo_shape.' + field)) {
      const type = _.get(filter, 'geo_shape.' + field + '.shape.type');
      if (type.toLowerCase() === 'envelope') {
        const envelope = _.get(filter, 'geo_shape.' + field + '.shape.coordinates');
        const tl = envelope[0]; //topleft
        const br = envelope[1]; //bottomright
        const coords = [];
        coords.push([tl[0], tl[1]]);
        coords.push([br[0], tl[1]]);
        coords.push([br[0], br[1]]);
        coords.push([tl[0], br[1]]);
        features.push({
          type: 'Polygon',
          coordinates: [coords]
        });
      } else {
        features.push({
          type: type,
          coordinates: _.get(filter, 'geo_shape.' + field + '.shape.coordinates')
        });
      }
    }
    return features;
  }

  return {
    getGeoExtents: function (visData) {
      return {
        min: visData.geoJson.properties.min,
        max: visData.geoJson.properties.max
      };
    },
    /*
     * @param bounds {LatLngBounds}
     * @param scale {number}
     * @return {object}
     */
    scaleBounds: function (bounds, scale) {
      var safeScale = scale;
      if (safeScale < 1) scale = 1;
      if (safeScale > 5) scale = 5;
      safeScale = safeScale - 1;

      const topLeft = bounds.getNorthWest();
      const bottomRight = bounds.getSouthEast();
      var latDiff = _.round(Math.abs(topLeft.lat - bottomRight.lat), 5);
      var lonDiff = _.round(Math.abs(bottomRight.lng - topLeft.lng), 5);
      //map height can be zero when vis is first created
      if (latDiff === 0) latDiff = lonDiff;

      const latDelta = latDiff * safeScale;
      var topLeftLat = _.round(topLeft.lat, 5) + latDelta;
      if (topLeftLat > 90) topLeftLat = 90;
      var bottomRightLat = _.round(bottomRight.lat, 5) - latDelta;
      if (bottomRightLat < -90) bottomRightLat = -90;
      const lonDelta = lonDiff * safeScale;
      var topLeftLon = _.round(topLeft.lng, 5) - lonDelta;
      if (topLeftLon < -180) topLeftLon = -180;
      var bottomRightLon = _.round(bottomRight.lng, 5) + lonDelta;
      if (bottomRightLon > 180) bottomRightLon = 180;

      //console.log('scale:' + safeScale + ', latDelta: ' + latDelta + ', lonDelta: ' + lonDelta);
      //console.log('top left lat ' + _.round(topLeft.lat, 5) + ' -> ' + topLeftLat);
      //console.log('bottom right lat ' + _.round(bottomRight.lat, 5) + ' -> ' + bottomRightLat);
      //console.log('top left lon ' + _.round(topLeft.lng, 5) + ' -> ' + topLeftLon);
      //console.log('bottom right lon ' + _.round(bottomRight.lng, 5) + ' -> ' + bottomRightLon);

      return {
        'top_left': {lat: topLeftLat, lon: topLeftLon},
        'bottom_right': {lat: bottomRightLat, lon: bottomRightLon}
      };
    },
    contains: function (collar, bounds) {
      //test if bounds top_left is inside collar
      if (bounds.top_left.lat > collar.top_left.lat
        || bounds.top_left.lon < collar.top_left.lon) return false;

      //test if bounds bottom_right is inside collar
      if (bounds.bottom_right.lat < collar.bottom_right.lat
        || bounds.bottom_right.lon > collar.bottom_right.lon) return false;

      // both corners are inside collar so collar contains
      return true;
    },
    filterToGeoJson: filterToGeoJson,
    getMapStateFromVis: function (vis) {
      const mapState = {
        center: [15, 5],
        zoom: 2
      }
      if (vis.hasUiState()) {
        const uiStateCenter = vis.uiStateVal('mapCenter');
        if (uiStateCenter) mapState.center = uiStateCenter;
        const uiStateZoom = vis.uiStateVal('mapZoom');
        if (uiStateZoom) mapState.zoom = uiStateZoom;
      }
      return mapState;
    },
    isGeoFilter: function (filter, field) {
      if (filter.meta.key === field
        || _.has(filter, 'geo_bounding_box.' + field)
        || _.has(filter, 'geo_polygon.' + field)
        || _.has(filter, 'geo_shape.' + field)
        || _.has(filter, 'bool.should[0].geo_bounding_box.' + field)
        || _.has(filter, 'bool.should[0].geo_polygon.' + field)
        || _.has(filter, 'bool.should[0].geo_shape.' + field)) {
        return true;
      } else {
        return false;
      }
    }
  }
});
