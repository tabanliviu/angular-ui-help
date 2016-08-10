'use strict';

angular
  .module('ui.help')
  .directive('uiHelpTargetDef', function() {
    return {
      require: '^uiHelpGroupDef',
      link: link
    };

    function link(scope, element, attributes, uiHelpGroupController) {
      uiHelpGroupController.groupDef.targets.push({
        name: attributes.name,
        dir: attributes.dir || 'right',
        templateName: attributes.templateName,
        data: {
          title: element.find('> title').text(),
          message: element.find('> message').text()
        }
      });
    }
  });
