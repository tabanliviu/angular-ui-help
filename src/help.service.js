'use strict';

angular
  .module('ui.help')
  .provider('$uiHelp', function() {
    var provider = {};

    provider.$get = $get;
    provider.getTemplateUrl = getTemplateUrl;

    return provider;

    function getTemplateUrl(activeTarget) {
      return activeTarget.templateUrl || 'help/' + (activeTarget.templateName || activeTarget.name) + '.help.html';
    }

    function $get($window, $q, $compile, $timeout, $templateRequest, $position) {
      var service = {};

      service.visible = false;
      service.groups = {};
      service.activeGroup = {};
      service.availableTargets = [];

      service.show = show;
      service.hide = hide;
      service.updateTarget = updateTarget;
      service.setGroups = setGroups;
      service.setCurrentGroup = setCurrentGroup;
      service.getNextActiveTargetName = getNextActiveTargetName;
      service.onTargetAvailable = onTargetAvailable;
      service.onUpdateCurrentGroup = onUpdateCurrentGroup;

      angular.element($window).on('resize', redraw);

      return service;

      function setGroups(groups) {
        service.groups = {};
        service.groupNames = [];
        angular.forEach(groups, function(targets, name) {
          if (name === 'next') {
            throw Error('Group name "next" is reserved!');
          }
          service.groups[name] = {
            name: name,
            targets: targets
          };
          service.groupNames.push(name);
        });
        service.setCurrentGroup(service.groupNames[0]);
      }

      function getNextActiveTargetName() {
        var currentIndex = service.groupNames.indexOf(service.activeGroupName);
        var nextIndex = currentIndex + 1;
        if (nextIndex >= service.groupNames.length) {
          nextIndex = 0;
        }
        return service.groupNames[nextIndex];
      }

      function setCurrentGroup(groupName) {
        groupName = groupName || service.activeGroupName;

        if (groupName === 'next') {
          return service.setCurrentGroup(service.nextGroupName);
        }

        angular.forEach(service.availableTargets, hideAvailableTarget);

        service.activeGroupName = groupName;
        service.activeGroup = service.groups[groupName];
        service.nextGroupName = service.getNextActiveTargetName();
        service.show();
      }

      function onUpdateCurrentGroup() {
        setCurrentGroup(service.activeGroupName);
      }

      function onTargetAvailable(scope, element, target, targetArgs) {
        var availableTarget = parseTarget(scope, element, target, targetArgs);

        if (!availableTarget) {
          return;
        }

        service.availableTargets.push(availableTarget);

        if (service.visible) {
          showAvailableTarget(availableTarget);
        }

        return offTargetAvailable;

        function offTargetAvailable() {
          var indexOfHelpTarget = service.availableTargets.indexOf(availableTarget);
          if (indexOfHelpTarget !== -1) {
            service.availableTargets[indexOfHelpTarget].$destroy();
            service.availableTargets[indexOfHelpTarget] = null;
            service.availableTargets = service.availableTargets.filter(function(a) {
              return a;
            });
          }
        }
      }

      function redraw() {
        if (service.visible) {
          angular.forEach(service.availableTargets, showAvailableTarget);
        }
      }

      function show() {
        service.visible = true;
        redraw();
      }

      function updateTarget(target) {
        var activeTarget = service.availableTargets.filter(function(availableTarget) {
          return availableTarget.name === target.name;
        });

        if (activeTarget[0]) {
          var availableTarget = angular.extend(activeTarget[0], target);
          if (service.visible) {
            $timeout(function() {
              redrawActiveTarget(availableTarget);
            }, false);
          }
        }
      }

      function redrawActiveTarget(activeTarget) {
        if (activeTarget.helpElement) {
          activeTarget.targetElement.addClass('ui-help-highlight');
          activeTarget.helpElement.show();
          var coords = $position.positionElements(activeTarget.targetElement, activeTarget.helpElement, activeTarget.dir, true);
          var offset = angular.extend({
            top: 0,
            left: 0
          }, activeTarget.offset);
          coords.top += offset.top;
          coords.left += offset.left;
          activeTarget.helpElement.css(coords);
        }
      }

      function getActiveTarget(availableTarget) {
        var foundTarget = service.activeGroup.targets.filter(function(activeTarget) {
          return activeTarget.name === availableTarget.name;
        });

        if (foundTarget[0]) {
          return angular.extend(availableTarget, {dir: 'right'}, foundTarget[0]);
        }
      }

      function showAvailableTarget(availableTarget) {
        availableTarget.$create();
        var activeTarget = getActiveTarget(availableTarget);
        if (!activeTarget) {
          return;
        }

        var templatePromise;
        var templateUrl = provider.getTemplateUrl(activeTarget);
        if (activeTarget.helpElement) {
          activeTarget.helpElement.show();
          templatePromise = $q.when(activeTarget);
        }
        else {
          templatePromise = $templateRequest(templateUrl, true)
            .then(function(template) {
              var $body = angular.element('body');
              var helpElement = angular.element(template);
              activeTarget.helpElement = helpElement;
              activeTarget.helpElement.css({left: -9999});
              activeTarget.helpElement.addClass([activeTarget.arrowDir || activeTarget.dir, 'ui-help'].join(' '));
              $body.append(helpElement);
              activeTarget.linkFn = $compile(activeTarget.helpElement)(activeTarget.scope);
            });
        }

        templatePromise.then(function() {
          $timeout(function() {
            redrawActiveTarget(activeTarget);
          }, false)
        });
      }

      function hide() {
        angular.forEach(service.availableTargets, hideAvailableTarget);
        service.visible = false;
      }

      function hideAvailableTarget(availableTarget) {
        availableTarget.targetElement.removeClass('ui-help-highlight');
        if (availableTarget && availableTarget.helpElement) {
          availableTarget.helpElement.css({left: -9999});
          availableTarget.helpElement.hide();
        }
      }
    }

    function parseTarget(scope, element, target, targetArgs) {
      var parsed;
      var availableTarget = {
        $create: angular.noop,
        $destroy: angular.noop,
        targetElement: element,
        helpElement: null
      };

      parsed = target.replace(/\n/g, ' ').match(/^([^(]+?)\s*(\((.*)\))?$/);

      if (!parsed || parsed.length !== 4) {
        return;
      }

      availableTarget.$create = $create;

      function $create() {
        availableTarget.name = parsed[1];
        availableTarget.scope = scope.$new();

        availableTarget.getArgs = function() {
          return availableTarget.scope.$eval(targetArgs) || {};
        };

        availableTarget.scope.getData = function() {
          return availableTarget.getArgs().data || availableTarget.data;
        };

        availableTarget.$create = angular.noop;
        availableTarget.$destroy = $destroy;

        return availableTarget;
      }

      function $destroy() {
        availableTarget.targetElement.removeClass('ui-help-highlight');
        availableTarget.scope.$destroy();
        availableTarget.scope = null;
        if (availableTarget.helpElement) {
          availableTarget.helpElement.remove();
          availableTarget.helpElement = null;
        }
        availableTarget.$create = $create;
        availableTarget.$destroy = angular.noop;
      }

      return availableTarget;
    }
  });
