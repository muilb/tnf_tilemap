define(function (require) {
  return function MapFactory(Private) {
    var _ = require('lodash');
    var $ = require('jquery');
    var L = require('leaflet');
    const utils = require('plugins/tnf_tilemap/utils');
    var formatcoords = require('./../lib/formatcoords/index');
    require('./../lib/leaflet.mouseposition/L.Control.MousePosition.css');
    require('./../lib/leaflet.mouseposition/L.Control.MousePosition');
    require('./../lib/leaflet.setview/L.Control.SetView.css');
    require('./../lib/leaflet.setview/L.Control.SetView');
    require('./../lib/leaflet.measurescale/L.Control.MeasureScale.css');
    require('./../lib/leaflet.measurescale/L.Control.MeasureScale');
    require('./../lib/wind/wind-js-leaflet.css');
    // var ol = require('./../lib/wind/ol-debug');

    var syncMaps = require('./sync_maps');

    var markerIcon = L.icon({
      iconUrl: require('./images/marker-icon.png'),
      iconRetinaUrl: require('./images/marker-icon-2x.png'),
      iconSize: [25, 41]
    });

    var defaultMapZoom = 3;
    var defaultMapCenter = [15, 5];
    var defaultMarkerType = 'Heatmap';

    var mapTiles = {
      url: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
      }
    };
    var markerTypes = {
      'Scaled Circle Markers': Private(require('./marker_types/scaled_circles')),
      'Shaded Circle Markers': Private(require('./marker_types/shaded_circles')),
      'Shaded Geohash Grid': Private(require('./marker_types/geohash_grid')),
      'Heatmap': Private(require('./marker_types/heatmap')),
      'Windymap': Private(require('./marker_types/windymap'))
    };

    /**
     * Tile Map Maps
     *
     * @class Map
     * @constructor
     * @param container {HTML Element} Element to render map into
     * @param params {Object} Parameters used to build a map
     */
    function TileMapMap(container, params) {
      this._container = container;
      // keep a reference to all of the optional params
      this._callbacks = _.get(params, 'callbacks');
      this._setMarkerType(params.mapType);
      const centerArray = _.get(params, 'center') || defaultMapCenter;
      this._mapCenter = L.latLng(centerArray[0], centerArray[1]);
      this._mapZoom = _.get(params, 'zoom') || defaultMapZoom;
      this._setAttr(params.attr);
      this._isEditable = params.editable || false;

      this.WindJSHelper = require('./../lib/wind/tnf-wind-js-leaflet');

      var mapOptions = {
        minZoom: 1,
        maxZoom: 18,
        noWrap: true,
        maxBounds: L.latLngBounds([-90, -220], [90, 220]),
        scrollWheelZoom: _.get(params.attr, 'scrollWheelZoom', true),
        fadeAnimation: false,
      };

      this._createMap(mapOptions);
    }

    TileMapMap.prototype._addDrawControl_oldlbmui = function () {
      if (this._boundingControl) return;

      //create Markers feature group and add saved markers
      this._drawnItems = new L.FeatureGroup();
      var self = this;
      this._attr.markers.forEach(function(point) {
        self._drawnItems.addLayer(
          L.marker(
            point,
            {icon: markerIcon}));
      });
      this.map.addLayer(this._drawnItems);
      this._layerControl.addOverlay(this._drawnItems, "Markers");

      //https://github.com/Leaflet/Leaflet.draw
      const drawOptions = {
        draw: {
          circle: false,
          marker: {
            icon: markerIcon
          },
          polygon: {},
          polyline: false,
          rectangle: {
            shapeOptions: {
              stroke: false,
              color: '#000'
            }
          }
        },
        edit: {
          featureGroup: this._drawnItems,
          edit: false
        }
      }
      //Do not show marker and remove buttons when visualization is displayed in dashboard, i.e. not editable
      if(!this._isEditable) {
        drawOptions.draw.marker = false;
        drawOptions.edit.remove = false;
      }

      this._boundingControl = new L.Control.Draw(drawOptions);
      this.map.addControl(this._boundingControl);
    };

    /**
     * lbmui: remove add marker control on map
     * @private
     */
    TileMapMap.prototype._addDrawControl = function () {
      if (this._boundingControl) return;

      // //create Markers feature group and add saved markers
      // this._drawnItems = new L.FeatureGroup();
      // var self = this;
      // this._attr.markers.forEach(function(point) {
      //   self._drawnItems.addLayer(
      //     L.marker(
      //       point,
      //       {icon: markerIcon}));
      // });
      // this.map.addLayer(this._drawnItems);
      // this._layerControl.addOverlay(this._drawnItems, "Markers");

      //https://github.com/Leaflet/Leaflet.draw
      const drawOptions = {
        draw: {
          circle: false,
          marker: false,
          polygon: {},
          polyline: false,
          rectangle: {
            shapeOptions: {
              stroke: false,
              color: '#000'
            }
          }
        },
        // edit: {
        //   featureGroup: this._drawnItems,
        //   edit: false
        // }
      }
      // //Do not show marker and remove buttons when visualization is displayed in dashboard, i.e. not editable
      // if(!this._isEditable) {
      //   drawOptions.draw.marker = false;
      //   drawOptions.edit.remove = false;
      // }

      this._boundingControl = new L.Control.Draw(drawOptions);
      this.map.addControl(this._boundingControl);
    };

    TileMapMap.prototype._addSetViewControl = function () {
      if (this._setViewControl) return;

      this._setViewControl = new L.Control.SetView();
      this.map.addControl(this._setViewControl);
    };

    TileMapMap.prototype._addMousePositionControl = function () {
      if (this._mousePositionControl) return;

      const dd = function(val) {
        return L.Util.formatNum(val, 5);
      }
      const space = "replaceMe";
      this._mousePositionControl = L.control.mousePosition({
        emptyString: '',
        lngFormatters: [
          dd,
          function(lon) {
            var dms = formatcoords(0, lon).format('DD MM ss X', {
              latLonSeparator: space,
              decimalPlaces: 2
            });
            return dms.substring(dms.indexOf(space) + space.length);
          }
        ],
        latFormatters: [
          dd,
          function(lat) {
            var dms = formatcoords(lat,0).format('DD MM ss X', {
              latLonSeparator: space,
              decimalPlaces: 2
            });
            return dms.substring(0, dms.indexOf(space));
          }
        ]
      });
      this.map.addControl(this._mousePositionControl);
    };

    /**
     * Adds label div to each map when data is split
     *
     * @method addTitle
     * @param mapLabel {String}
     * @return {undefined}
     */
    TileMapMap.prototype.addTitle = function (mapLabel) {
      if (this._label) return;

      var label = this._label = L.control();

      label.onAdd = function () {
        this._div = L.DomUtil.create('div', 'tilemap-info tilemap-label');
        this.update();
        return this._div;
      };
      label.update = function () {
        this._div.innerHTML = '<h2>' + _.escape(mapLabel) + '</h2>';
      };

      // label.addTo(this.map);
      this.map.addControl(label);
    };

    /**
     * remove css class for desat filters on map tiles
     *
     * @method saturateTiles
     * @return undefined
     */
    TileMapMap.prototype.saturateTiles = function () {
      if (!this._attr.isDesaturated) {
        $('img.leaflet-tile-loaded').addClass('filters-off');
      }
    };

    TileMapMap.prototype.updateSize = function () {
      this.map.invalidateSize({
        debounceMoveend: true
      });
    };

    TileMapMap.prototype.destroy = function () {
      if (this._label) this._label.removeFrom(this.map);
      if (this._fitControl) this._fitControl.removeFrom(this.map);
      if (this._boundingControl) this._boundingControl.removeFrom(this.map);
      if (this._markers) this._markers.destroy();
      syncMaps.remove(this.map);
      this.map.remove();
      this.map = undefined;
    };

    /**
     * Switch type of data overlay for map:
     * creates featurelayer from mapData (geoJson)
     *
     * @method _addMarkers
     */
    TileMapMap.prototype.addMarkers = function (chartData, newParams, tooltipFormatter, valueFormatter, collar) {
      this._setMarkerType(newParams.mapType);
      this._setAttr(newParams);
      this._chartData = chartData;
      this._geoJson = _.get(chartData, 'geoJson');
      this._collar = collar;

      if (this._markers) this._markers.destroy();

      this._markers = this._createMarkers({
        tooltipFormatter: tooltipFormatter,
        valueFormatter: valueFormatter,
        attr: this._attr,
        layerControl: this._layerControl
      });

      if (this._geoJson.features.length > 1) {
        this._markers.addLegend();
      }
    };

    /**
     * Display geospatial filters as map layer to provide
     * users context for all applied filters
     */
    TileMapMap.prototype.addFilters = function (filters) {
      if(this._filters) {
        this._layerControl.removeLayer(this._filters);
        this.map.removeLayer(this._filters);
      }

      const style = {
        fillColor: "#ccc",
        color: "#ccc",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.75
      }
      this._filters = L.geoJson(filters, {
        clickable: false,
        style: style
      });
      //this.map.addLayer(this._filters);
      this._layerControl.addOverlay(this._filters, "Applied Filters");
    };

    /**
     *
     */
    TileMapMap.prototype.addWmsOverlay = function (url, name, options) {
      if(this._overlay) {
        this._layerControl.removeLayer(this._overlay);
        this.map.removeLayer(this._overlay);
      }

      this._overlay = L.tileLayer.wms(url, options);
      this.map.addLayer(this._overlay);
      this._layerControl.addOverlay(this._overlay, name);
    };

    TileMapMap.prototype.addWindOverlay = function (url, overlayName) {
      var self = this;
      console.log(self);
      // check if have windy and same url, name
      if(this.WindJSHelper.windy && this.WindJSHelper.options && (this.WindJSHelper.options.url !== url || this.WindJSHelper.options.overlayName !== overlayName)) {
        this.WindJSHelper.destroyWind();
      }
      if(!this.WindJSHelper.windy) {
        var handleError = function(err){
          console.log('handleError...');
          console.log(err);
        };
        var options = {
          localMode: false,
          map: this.map,
          layerControl: this._layerControl,
          useNearest: false,
          timeISO: null,
          nearestDaysLimit: 7,
          displayValues: true,
          displayOptions: {
            displayPosition: 'bottomleft',
            displayEmptyString: 'No wind data'
          },
          overlayName: overlayName,
          url: url,
          pingUrl: url + '/alive',
          latestUrl: url + '/latest',
          nearestUrl: url + '/nearest',
          errorCallback: handleError
        }

        // don't bother setting up if the service is unavailable
        checkWind(options).then(function () {

          console.log('check wind success');

          self.WindJSHelper.init(options);
          options.layerControl.addOverlay(self.WindJSHelper.canvasOverlay, options.overlayName);
          // // view overlay on add ???
          // self.WindJSHelper.canvasOverlay.addTo(self.map);
        }).catch(function (err) {
          console.log('check wind failed..');
          options.errorCallback(err);
        });
      }
      /**
       * Ping the test endpoint to check if wind server is available
       *
       * @param options
       * @returns {Promise}
       */
      function checkWind(options) {
        console.log('test checkwind');
        return new Promise(function (resolve, reject) {

          if (options.localMode) resolve(true);

          $.ajax({
            type: 'GET',
            url: options.pingUrl,
            // data: {
            //   format: 'json'
            // },
            error: function error(err) {
              reject(err);
            },
            success: function success(data) {
              resolve(data);
            }
          });
        });
      }
    };

    TileMapMap.prototype.mapBounds = function () {
      return this.map.getBounds();
    };

    /**
     * Create the marker instance using the given options
     *
     * @method _createMarkers
     * @param options {Object} options to give to marker class
     * @return {Object} marker layer
     */
    TileMapMap.prototype._createMarkers = function (options) {
      var MarkerType = markerTypes[this._markerType];
      return new MarkerType(this.map, this._geoJson, options);
    };

    TileMapMap.prototype._setMarkerType = function (markerType) {
      this._markerType = markerTypes[markerType] ? markerType : defaultMarkerType;
    };

    TileMapMap.prototype._setAttr = function (attr) {
      this._attr = attr || {};

      //update map options based on new attributes
      if(this.map) {
        if(this._attr.scrollWheelZoom) {
          this.map.scrollWheelZoom.enable();
        } else {
          this.map.scrollWheelZoom.disable();
        }
      }
    };

    TileMapMap.prototype._attachEvents = function () {
      var self = this;
      var saturateTiles = self.saturateTiles.bind(self);

      this._tileLayer.on('tileload', saturateTiles);

      this.map.on('unload', function () {
        self._tileLayer.off('tileload', saturateTiles);
      });

      this.map.on('moveend', _.debounce(function setZoomCenter(ev) {
        if (!self.map) return;
        if (self._hasSameLocation()) return;

        // update internal center and zoom references
        self._mapCenter = self.map.getCenter();
        self._mapZoom = self.map.getZoom();

        self._callbacks.mapMoveEnd({
          chart: self._chartData,
          collar: self._collar,
          mapBounds: self.mapBounds(),
          map: self.map,
          center: self._mapCenter,
          zoom: self._mapZoom,
        });
      }, 150, false));

      this.map.on('setview:fitBounds', function (e) {
        self._fitBounds();
      });

      this.map.on('draw:created', function (e) {
        switch (e.layerType) {
          // // lbmui remove draw marker
          // case "marker":
          //   self._drawnItems.addLayer(e.layer);
          //   self._callbacks.createMarker({
          //     e: e,
          //     chart: self._chartData,
          //     latlng: e.layer._latlng
          //   });
          //   break;
          case "polygon":
            const points = [];
            e.layer._latlngs.forEach(function(latlng){
              const lat = L.Util.formatNum(latlng.lat, 5);
              const lon = L.Util.formatNum(latlng.lng, 5);
              points.push([lon, lat]);
            });
            self._callbacks.polygon({
              chart: self._chartData,
              points: points
            });
            break;
          case "rectangle":
            self._callbacks.rectangle({
              e: e,
              chart: self._chartData,
              bounds: utils.scaleBounds(e.layer.getBounds(), 1)
            });
            break;
          default:
            console.log("draw:created, unexpected layerType: " + e.layerType);
        }
      });

      this.map.on('draw:deleted', function (e) {
        self._callbacks.deleteMarkers({
          chart: self._chartData,
          deletedLayers: e.layers,
        });
      });

      this.map.on('zoomend', _.debounce(function () {
        if (!self.map) return;
        if (self._hasSameLocation()) return;
        if (!self._callbacks) return;
        self._callbacks.mapZoomEnd({
          chart: self._chartData,
          map: self.map,
          zoom: self.map.getZoom(),
        });
      }, 150, false));
    };

    TileMapMap.prototype._hasSameLocation = function () {
      const oldLat = this._mapCenter.lat.toFixed(5);
      const oldLon = this._mapCenter.lng.toFixed(5);
      const newLat = this.map.getCenter().lat.toFixed(5);
      const newLon = this.map.getCenter().lng.toFixed(5);
      let isSame = false;
      if (oldLat === newLat
        && oldLon === newLon
        && this.map.getZoom() === this._mapZoom) {
        isSame = true;
      }
      return isSame;
    }

    TileMapMap.prototype._createMap = function (mapOptions) {
      if (this.map) this.destroy();
      // lbmui: add layers control for tile layer
      this._baseMaps = this._getBaseMaps();
      // add map tiles layer, using the mapTiles object settings
      if (this._attr.wms && this._attr.wms.enabled) {
        this._tileLayer = L.tileLayer.wms(this._attr.wms.url, this._attr.wms.options);
      } else {
        this._tileLayer = this._baseMaps['Esri WorldImagery'];//L.tileLayer(mapTiles.url, mapTiles.options);
      }

      // append tile layers, center and zoom to the map options
      mapOptions.layers = this._tileLayer;
      mapOptions.center = this._mapCenter;
      mapOptions.zoom = this._mapZoom;

      this.map = L.map(this._container, mapOptions);
      this._layerControl = L.control.layers(this._baseMaps);
      this._layerControl.addTo(this.map);

      this._addSetViewControl();
      this._addDrawControl();
      this._addMousePositionControl();
      L.control.measureScale().addTo(this.map);
      this._attachEvents();
      syncMaps.add(this.map);
    };

    /**
     * zoom map to fit all features in featureLayer
     *
     * @method _fitBounds
     * @param map {Leaflet Object}
     * @return {boolean}
     */
    TileMapMap.prototype._fitBounds = function () {
      var bounds = this._getDataRectangles();
      if(bounds.length > 0) {
        this.map.fitBounds(bounds);
      }
    };

    /**
     * Get the Rectangles representing the geohash grid
     *
     * @return {LatLngRectangles[]}
     */
    TileMapMap.prototype._getDataRectangles = function () {
      if (!this._geoJson) return [];
      return _.pluck(this._geoJson.features, 'properties.rectangle');
    };

    /**
     * lbmui: Get the base tile layer map control
     * @returns {BaseMaps[]}
     * @private
     */
    TileMapMap.prototype._getBaseMaps = function () {
      /**
       * OpenStreetMap
       */
      var osmAttr = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a>';
      var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: osmAttr
      });

      /**
       * Omniscale
       */
      var omniscale = L.tileLayer.wms('https://maps.omniscale.net/v1/mapsgraph-bf48cc0b/tile', {
        layers: 'osm',
        attribution: osmAttr + ', &copy; <a href="http://maps.omniscale.com/">Omniscale</a>'
      });
      /**
       * Esri WorldImagery
       */
      var mapLink = '<a href="http://www.esri.com/">Esri</a>';
      var wholink = 'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
      var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; ' + mapLink + ', ' + wholink
      });

      /**
       *
       */
      var mapquest = L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
        attribution: osmAttr + ', <a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>',
        subdomains: ['otile1', 'otile2', 'otile3', 'otile4']
      });
      return {
        // 'Omniscale': omniscale,
        'OpenStreetMap': osm,
        // 'MapQuest': mapquest,
        'Esri WorldImagery': Esri_WorldImagery
      };
    }

    return TileMapMap;
  };
});
