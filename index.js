'use strict';

module.exports = function (kibana) {

  return new kibana.Plugin({

    uiExports: {
      visTypes: ['plugins/tnf_tilemap/tnf_tilemap.js']
    }

  });
};
