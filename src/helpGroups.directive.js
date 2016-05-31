'use strict';

angular
  .module('ui.help')
  .directive('uiHelpGroups', function() {
    return {
      templateUrl: 'helpGroups.template.html',
      scope: {},
      controllerAs: 'groups',
      controller: HelpGoupsController
    };

    function HelpGoupsController($uiHelp) {
      this.$uiHelp = $uiHelp;
    }
  });