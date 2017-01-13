define(function (require) {
  const _ = require('lodash');
  const $ = require('jquery');

  function optionsDirective() {
    require('ui/modules')
      .get('app/visualize')
      .directive('visEditorVisOptions', function (Private, $timeout, $compile) {
        return {
          restrict: 'E',
          template: require('plugins/kibana/visualize/editor/vis_options.html'),
          scope: {
            vis: '=',
            savedVis: '=',
          },
          link: function ($scope, $el) {
            const $optionContainer = $el.find('.visualization-options');
            const $editor = $compile($scope.vis.type.params.editor)($scope);
            $optionContainer.append($editor);

            $scope.$watch('vis.type.schemas.all.length', function (len) {
              $scope.alwaysShowOptions = len === 0;
            });
            $scope.testChange = function () {
              console.log('test change is Ok on vis_option.js');
            }
          }
        };
      });
  }

  function addSelectMetricEvent() {
    var el = document.getElementById('metricsOptions');
    $('#metricsOptions').one('focus', function () {
      var ddl = $(this);
      ddl.data('previous', ddl.val());
      console.log('test one focus on vis_option', ddl.data('previous'));
    }).on('change', function () {
      var ddl = $(this);
      var previous = ddl.data('previous');
      ddl.data('previous', ddl.val());
      console.log('test on change on vis_option', ddl.data('previous'));
    });


  }
  return {
    extend: optionsDirective(),
    addEvent: addSelectMetricEvent()
  }
});
