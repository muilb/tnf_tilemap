/**
 * Created by lebamui on 11/11/2016.
 */
module.exports = function (kibana) {

  return new kibana.Plugin({

    uiExports: {
      visTypes: ['plugins/tnf_tilemap/tnf_tilemap.js']
    }

  });
};
