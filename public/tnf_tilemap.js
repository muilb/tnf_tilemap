/**
 * Created by lebamui on 12/11/2016.
 */
import _ from 'lodash';
import supports from 'ui/utils/supports';
import FilterBarPushFilterProvider from 'ui/filter_bar/push_filter';

define(function (require) {

  require('plugins/tnf_tilemap/tnf_tilemap.less');
  require('plugins/tnf_tilemap/directives/bands.js');
  require('plugins/tnf_tilemap/tnf_tilemapController');

  function TNFTileMapVisProvider(Private, getAppState, courier, config) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));

    return new TemplateVisType({
      name: 'tnf_tilemap',
      title: 'Example Tile map',
      icon: 'fa-map-marker',
      description: 'extend enhanced tile map',
      template: require('plugins/tnf_tilemap/tnf_tilemap.html'),
      params: {
        defaults: {
          mapType: 'Heatmap',
          collarScale: 1.5,
          scaleType: 'dynamic',
          scaleBands: [{
            low: 0,
            high: 10,
            color: "#ffffcc"
          }],
          scrollWheelZoom: true,
          isDesaturated: true,
          addTooltip: true,
          heatMaxZoom: 16,
          heatMinOpacity: 0.35,
          heatRadius: 45,
          heatBlur: 15,
          heatNormalizeData: true,
          mapZoom: 4,
          mapCenter: [15, 5],
          // markers: [],
          // lbmui: add params to set metric view index
          metricIndex: 0,
          metricParams: [],
          // add windIndex params
          windIndex: {
            tempIndex: 0,
            speedIndex: 0,
            degIndex: 0
          },
          // add params for wind overlay
          overlay: {
            wind: {
              enabled: false,
              url: '',
              displayName: 'Wind'
            }
          },
          // end add
          wms: config.get('visualization:tileMap:WMSdefaults')
        },
        mapTypes: ['Scaled Circle Markers', 'Shaded Circle Markers', 'Shaded Geohash Grid', 'Heatmap', 'Windymap'],
        scaleTypes: ['dynamic', 'static'],
        canDesaturate: !!supports.cssFilters,
        // lbmui: add metrics list
        metrics: [{
          index: 0,
          name: 'avg'
        }],
        // and add
        editor: require('plugins/tnf_tilemap/options.html')
      },
      hierarchicalData: function (vis) {
        return false;
      },
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Value',
          min: 1,
          max: 3,
          aggFilter: ['count', 'avg', 'sum', 'min', 'max', 'cardinality'],
          defaults: [
            { schema: 'metric', type: 'count' }
          ]
        },
        {
          group: 'buckets',
          name: 'segment',
          title: 'Geo Coordinates',
          aggFilter: ['geohash_grid'],
          min: 1,
          max: 1
        }
        // ,
        // {
        //   group: 'buckets',
        //   name: 'segment1',
        //   title: 'Tool tip label',
        //   aggFilter: ['terms'],
        //   min: 1,
        //   max: 1
        // }
      ])
    });
  }

  require('ui/registry/vis_types').register(TNFTileMapVisProvider);

  return TNFTileMapVisProvider;
});
