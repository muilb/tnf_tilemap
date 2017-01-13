// eidt cho nhieu metric
// view default value at index 0.
define(function (require) {
  var decodeGeoHash = require('ui/utils/decode_geo_hash');
  var AggConfigResult = require('ui/Vis/AggConfigResult');
  var _ = require('lodash');
  const DperR = 180 / Math.PI;
  const RperD = Math.PI / 180;

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

  function convertWindCompRowsToGibs(table, geoI, metrics, windIndex) {
    var temp = {
      header:  {
        "discipline": 0,
        "disciplineName": "Meteorological products",
        "gribEdition": 2,
        "gribLength": 48873,
        "center": 7,
        "centerName": "US National Weather Service - NCEP(WMC)",
        "subcenter": 0,
        "refTime": "2016-12-28T18:00:00.000Z",
        "significanceOfRT": 1,
        "significanceOfRTName": "Start of forecast",
        "productStatus": 0,
        "productStatusName": "Operational products",
        "productType": 1,
        "productTypeName": "Forecast products",
        "productDefinitionTemplate": 0,
        "productDefinitionTemplateName": "Analysis/forecast at horizontal level/layer at a point in time",
        "parameterCategory": 0,
        "parameterCategoryName": "Temperature",
        "parameterNumber": 0,
        "parameterNumberName": "Temperature",
        "parameterUnit": "K",
        "genProcessType": 2,
        "genProcessTypeName": "Forecast",
        "forecastTime": 3,
        "surface1Type": 1,
        "surface1TypeName": "Ground or water surface",
        "surface1Value": 0,
        "surface2Type": 255,
        "surface2TypeName": "Missing",
        "surface2Value": 0,
        "gridDefinitionTemplate": 0,
        "gridDefinitionTemplateName": "Latitude_Longitude",
        "numberPoints": 65160,
        "shape": 6,
        "shapeName": "Earth spherical with radius of 6,371,229.0 m",
        "gridUnits": "degrees",
        "resolution": 48,
        "winds": "true",
        "scanMode": 0,
        "nx": 360,
        "ny": 181,
        "basicAngle": 0,
        "subDivisions": 0,
        "lo1": 0,
        "la1": 90,
        "lo2": 359,
        "la2": -90,
        "dx": 1,
        "dy": 1
      }
    };
    var uComp = {
      header:   {
        "discipline": 0,
        "disciplineName": "Meteorological products",
        "gribEdition": 2,
        "gribLength": 76325,
        "center": 7,
        "centerName": "US National Weather Service - NCEP(WMC)",
        "subcenter": 0,
        "refTime": "2016-12-28T18:00:00.000Z",
        "significanceOfRT": 1,
        "significanceOfRTName": "Start of forecast",
        "productStatus": 0,
        "productStatusName": "Operational products",
        "productType": 1,
        "productTypeName": "Forecast products",
        "productDefinitionTemplate": 0,
        "productDefinitionTemplateName": "Analysis/forecast at horizontal level/layer at a point in time",
        "parameterCategory": 2,
        "parameterCategoryName": "Momentum",
        "parameterNumber": 2,
        "parameterNumberName": "U-component_of_wind",
        "parameterUnit": "m.s-1",
        "genProcessType": 2,
        "genProcessTypeName": "Forecast",
        "forecastTime": 3,
        "surface1Type": 103,
        "surface1TypeName": "Specified height level above ground",
        "surface1Value": 10,
        "surface2Type": 255,
        "surface2TypeName": "Missing",
        "surface2Value": 0,
        "gridDefinitionTemplate": 0,
        "gridDefinitionTemplateName": "Latitude_Longitude",
        "numberPoints": 65160,
        "shape": 6,
        "shapeName": "Earth spherical with radius of 6,371,229.0 m",
        "gridUnits": "degrees",
        "resolution": 48,
        "winds": "true",
        "scanMode": 0,
        "nx": 360,
        "ny": 181,
        "basicAngle": 0,
        "subDivisions": 0,
        "lo1": 0,
        "la1": 90,
        "lo2": 359,
        "la2": -90,
        "dx": 1,
        "dy": 1
      }
    };
    var vComp = {
      header:  {
        "discipline": 0,
        "disciplineName": "Meteorological products",
        "gribEdition": 2,
        "gribLength": 76352,
        "center": 7,
        "centerName": "US National Weather Service - NCEP(WMC)",
        "subcenter": 0,
        "refTime": "2016-12-28T18:00:00.000Z",
        "significanceOfRT": 1,
        "significanceOfRTName": "Start of forecast",
        "productStatus": 0,
        "productStatusName": "Operational products",
        "productType": 1,
        "productTypeName": "Forecast products",
        "productDefinitionTemplate": 0,
        "productDefinitionTemplateName": "Analysis/forecast at horizontal level/layer at a point in time",
        "parameterCategory": 2,
        "parameterCategoryName": "Momentum",
        "parameterNumber": 3,
        "parameterNumberName": "V-component_of_wind",
        "parameterUnit": "m.s-1",
        "genProcessType": 2,
        "genProcessTypeName": "Forecast",
        "forecastTime": 3,
        "surface1Type": 103,
        "surface1TypeName": "Specified height level above ground",
        "surface1Value": 10,
        "surface2Type": 255,
        "surface2TypeName": "Missing",
        "surface2Value": 0,
        "gridDefinitionTemplate": 0,
        "gridDefinitionTemplateName": "Latitude_Longitude",
        "numberPoints": 65160,
        "shape": 6,
        "shapeName": "Earth spherical with radius of 6,371,229.0 m",
        "gridUnits": "degrees",
        "resolution": 48,
        "winds": "true",
        "scanMode": 0,
        "nx": 360,
        "ny": 181,
        "basicAngle": 0,
        "subDivisions": 0,
        "lo1": 0,
        "la1": 90,
        "lo2": 359,
        "la2": -90,
        "dx": 1,
        "dy": 1
      }
    };
    var geoIndex = geoI;
    // phai sap xep lai theo geohash lat lon
    table.rows.sort(sortLatLng(geoI));

    setHeader(table.rows, geoI, temp, uComp, vComp);

    var tempData = [],
      uCompData = [],
      vCompData = [],
      tempIndex = metrics[windIndex.tempIndex],
      speedIndex = metrics[windIndex.speedIndex],
      degIndex = metrics[windIndex.degIndex],
      i;
    for (i = 0; i < table.rows.length; i++) {
      var row = table.rows[i];

      var uv = speedAndDegToVector(row[speedIndex], row[degIndex]);
      tempData.push(unwrap(row[tempIndex]));
      uCompData.push(uv.uComp);
      vCompData.push(uv.vComp);
    }

    temp.data = tempData;
    uComp.data = uCompData;
    vComp.data = vCompData;
    // con can tinh lai cac gia tri o header
    return [temp, uComp, vComp];
  }

  function setHeader(rows, geoI, temp, u, v) {
    // lay gia tri lat lon dau tien va cuoi cung
    var firstRow = rows[0],
      secondRow = rows[1],
      lastRow = rows[rows.length -1];
    var geohash0 = unwrap(firstRow[geoI]),
      geohash1 = unwrap(secondRow[geoI]),
      geohashLast = unwrap(lastRow[geoI]);
    var location0 = decodeGeoHash(geohash0),
      location1 = decodeGeoHash(geohash1),
      locationLast = decodeGeoHash(geohashLast);
    console.log('test location ', location0, location1);
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
    }
  }

  function speedAndDegToVector(speed, deg) {
    var uComp = -speed * Math.sin(deg * RperD);
    var vComp = -speed * Math.cos(deg * RperD);
    return {
      uComp: uComp.toFixed(2),
      vComp: vComp.toFixed(2)
    }
  }

  function convertWindCompRowsToGibs1(table, geoI, metrics, windCompIndex) {
    var rowIndex = metrics[windCompIndex];
    return _.transform(table.rows, function (features, row) {
      var value = unwrap(row[rowIndex]);
      features.push(value);
    }, []);
  }

  return convertWindCompRowsToGibs;
});
