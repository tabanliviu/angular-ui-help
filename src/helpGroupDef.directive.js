'use strict';

angular
  .module('ui.help')
  .directive('uiHelpGroupDef', function() {
    return {
      link: {
        pre: preLink,
        post: postLink
      },
      controller: HelpGroupDefController
    };

    function preLink(scope, element, attributes, uiHelpGroupDefController) {
      uiHelpGroupDefController.createGroup({
        name: attributes.name,
        cycle: attributes.cycle === 'true',
        focus: attributes.focus === 'true'
      })
    }

    function postLink(scope, element, attributes, uiHelpGroupDefController) {
      uiHelpGroupDefController.addGroup()
    }

    function HelpGroupDefController($scope, $uiHelp) {
      var _this = this;

      this.groupDef = {
        targets: []
      };

      this.createGroup = createGroup;
      this.addGroup = addGroup;

      function createGroup(options) {
        _this.groupDef = {
          name: options.name,
          cycle: options.cycle,
          focus: options.focus,
          targets: []
        };
      }

      function addGroup() {
        $uiHelp.addGroup(_this.groupDef);
      }
    }
  });
