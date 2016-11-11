/**
 * Created by lebamui on 11/11/2016.
 */
/**
 * this provider is edit tileMap.js from plugins/kbn_vislib_vis_types/public/tileMap.js
 * remove listeners
 * remove splits option
 */
define(function (require) {
  require('plugins/tnf_tilemap/tnf_tilemap.css');
  // require('plugins/tnf_tilemap/directives/bands.js');
  require('plugins/tnf_tilemap/tnf_tilemapController');

  function TNFTileMapProvider(Private, getAppState, courier, config) {
    // const _ = require('lodash');
    const supports = require('ui/utils/supports');
    const TemplateVisType = Private(require('ui/template_vis_type/template_vis_type'));
    const Schemas = Private(require('ui/vis/schemas'));
    const geoJsonConverter = Private(require('ui/agg_response/geo_json/geo_json'));

    return new TemplateVisType({
      name: 'tnf_tilemap',
      title: 'example custom Tile map',
      icon: 'fa-map-marker',
      description: 'Tile map plugin use enhanced tile map.',
      template: require('plugins/tnf_tilemap/tnf_tilemap.html'),
      params: {
        defaults: {
          mapType: 'Heatmap',
          collarScale: 1.5,
          scaleType: 'dynamic',
          scaleBands: [{
            low: 0,
            high: 10,
            color: '#ffffcc'
          }],
          scrollWheelZoom: true,
          isDesaturated: true,
          addTooltip: true,
          heatMaxZoom: 16,
          heatMinOpacity: 0.1,
          heatRadius: 25,
          heatBlur: 15,
          heatNormalizeData: true,
          mapZoom: 2,
          mapCenter: [15, 5],
          markers: [],
          wms: config.get('visualization:tileMap:WMSdefaults')
        },
        mapTypes: ['Scaled Circle Markers', 'Shaded Circle Markers', 'Shaded Geohash Grid', 'Heatmap'],
        scaleTypes: ['dynamic', 'static'],
        canDesaturate: !!supports.cssFilters,
        editor: require('plugins/tnf_tilemap/options.html')
      },
      hierarchicalData: function (vis) {
        return false;
      },
      responseConverter: geoJsonConverter,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Value',
          min: 1,
          max: 1,
          aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality'],
          defaults: [
            { schema: 'metric', type: 'avg' }
          ]
        },
        {
          group: 'buckets',
          name: 'segment',
          title: 'Geo Coordinates',
          aggFilter: 'geohash_grid',
          min: 1,
          max: 1
        }
      ])
    });
  }
  require('ui/registry/vis_types').register(TNFTileMapProvider);
  return TNFTileMapProvider;
});
