'use strict';

angular
  .module('ui.help')
  .directive('uiHelpCurrentGroup', function($uiHelp) {
    return link;

    function link(scope, element, attrs) {
      element.on('click.uiHelpCurrentGroup', setCurrentGroup);

      scope.$on('$destroy', function() {
        element.off('click.uiHelpCurrentGroup', setCurrentGroup);
      });

      function setCurrentGroup() {
        scope.$apply(function() {
          if (attrs.uiHelpCurrentGroup === '$next') {
            $uiHelp.activeGroup.next();
          }
          else {
            $uiHelp.setCurrentGroup(attrs.uiHelpCurrentGroup);
          }
        });
      }
    }
  });