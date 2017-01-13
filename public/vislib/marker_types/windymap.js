
define(function (require) {
  return function WindymapMarkerFactory(Private) {
    let d3 = require('d3');
    let _ = require('lodash');
    let L = require('leaflet');

    let BaseMarker = Private(require('./base_marker'));

    /**
     * Map overlay: canvas layer with leaflet.heat plugin
     *
     * @param map {Leaflet Object}
     * @param geoJson {geoJson Object}
     * @param params {Object}
     */
    _.class(WindymapMarker).inherits(BaseMarker);
    function WindymapMarker(map, geoJson, params) {
      let self = this;
      this._disableTooltips = true;
      WindymapMarker.Super.apply(this, arguments);
      // set layer Control
      this._layerControl = params.layerControl;

      var handleError = function(err){
        console.log('handleError...');
        console.log(err);
      };
      // lbmui kiem tra bang data o location
      var url = 'http://104.196.235.102:8201';
      this._options = {
        localMode: false,
        map: self.map,
        data: _.get(self.geoJson, 'gribs'),
        layerControl: self._layerControl,
        useNearest: false,
        timeISO: null,
        nearestDaysLimit: 7,
        displayValues: true,
        displayOptions: {
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data'
        },
        overlayName: 'Windy',
        url: url,
        pingUrl: url + '/alive',
        latestUrl: url + '/latest',
        nearestUrl: url + '/nearest',
        errorCallback: handleError
      };

      this._createMarkerGroup({});
    }

    /**
     * Does nothing, Windymaps don't have a legend
     *
     * @method addLegend
     * @return {undefined}
     */
    WindymapMarker.prototype.addLegend = _.noop;

    WindymapMarker.prototype._createMarkerGroup = function (options) {
      var self = this;
      this._markerGroup = require('./wind-js-leaflet');

      console.log('before init windy');
      this._markerGroup.init(self._options);
      console.log('after inint');
      this._addToMap();
    };

    WindymapMarker.prototype.destroy = function () {
      let self = this;

      this._stopLoadingGeohash();

      // remove popups
      self.popups = self.popups.filter(function (popup) {
        popup.off('mouseover').off('mouseout');
      });
      self._hidePopup();

      if (self._legend) {
        self.map.removeControl(self._legend);
        self._legend = undefined;
      }

      // remove marker layer from map
      if (self._markerGroup) {
        self._markerGroup.destroyWind();
        self._markerGroup = undefined;
      }
    };

    WindymapMarker.prototype._addToMap = function () {
      this._options.layerControl.addOverlay(this._markerGroup.canvasOverlay, this._options.overlayName);
      // // view overlay on add
      this._markerGroup.canvasOverlay.addTo(this.map);
    };

    return WindymapMarker;
  };
});
