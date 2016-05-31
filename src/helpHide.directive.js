'use strict';

angular
  .module('ui.help')
  .directive('uiHelpHide', function($uiHelp) {
    return link;

    function link(scope, element) {
      element.on('click.uiHelpHide', hide);

      scope.$on('$destroy', function() {
        element.off('click.uiHelpHide', hide);
      });

      function hide() {
        scope.$apply(function() {
          $uiHelp.hide();
        });
      }
    }
  });
