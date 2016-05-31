'use strict';

angular
  .module('ui.help')
  .directive('uiHelpTarget', function($uiHelp) {
    return link;

    function link(scope, element, attrs) {
      var target = attrs.uiHelpTarget;
      var targetArgs = attrs.uiHelpTargetArgs;
      if (target) {
        scope.$on('$destroy', $uiHelp.onTargetAvailable(scope, element, target, targetArgs));
      }
    }
  });
