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

    function $get($window, $q, $compile, $templateRequest, $position, $timeout) {
      var service = {};

      service.visible = false;
      service.groups = {};
      // service.activeGroup = {};
      service.availableTargets = [];

      service.show = show;
      service.hide = hide;
      // service.showNextTarget = cycle;
      // service.focusTarget = focusTarget;
      service.updateTarget = updateTarget;
      service.setGroups = setGroups;
      service.setCurrentGroup = setCurrentGroup;
      // service.getNextActiveTargetName = getNextActiveTargetName;
      // service.getPreviousActiveTargetName = getPreviousActiveTargetName;
      service.onTargetAvailable = onTargetAvailable;
      service.onUpdateCurrentGroup = onUpdateCurrentGroup;

      angular.element($window).on('resize.uiHelp', redraw);

      return service;

      function createGroup(name, targets) {
        var group = targets;
        if (angular.isArray(targets)) {
          group = {
            name: name,
            targets: targets
          };
        }
        group.name = group.name || name;
        group.targetIndex = group.targetIndex || 0;
        return group;
      }

      function setGroups(groups) {
        service.groups = service.groups || {};
        service.groupNames = [];
        angular.forEach(groups, function(targets, name) {
          service.groups[name] = createGroup(name, targets);
          service.groupNames.push(name);
        });
        service.setCurrentGroup(service.groupNames[0]);
      }

      function setCurrentGroup(groupName) {
        groupName = groupName || service.activeGroupName;

        service.activeGroupName = groupName;
        service.activeGroup = service.groups[service.activeGroupName];

        hideHighlight();
        angular.forEach(service.availableTargets, hideAvailableTarget);

        service.show();
      }

      function onUpdateCurrentGroup(groupName) {
        setCurrentGroup(groupName);
      }

      function onTargetAvailable(scope, element, target, targetArgs) {
        var availableTarget = parseTarget(service.activeGroup, scope, element, target, targetArgs);

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
            redrawActiveTarget(availableTarget);
          }
        }
      }

      function getMargin(element) {
        var computed = getComputedStyle(element);

        return {
          top: parseFloat(computed.marginTop.replace('px', '')),
          left: parseFloat(computed.marginLeft.replace('px', '')),
          bottom: parseFloat(computed.marginBottom.replace('px', '')),
          right: parseFloat(computed.marginRight.replace('px', ''))
        };
      }

      function redrawActiveTarget(activeTarget) {
        if (activeTarget.helpElement) {
          $timeout(function() {
            activeTarget.helpElement.show();
            var margin = getMargin(activeTarget.targetElement.get(0));
            var dirParts = activeTarget.dir.split('-');
            var coords = $position.positionElements(activeTarget.targetElement, activeTarget.helpElement, activeTarget.dir, true);
            var offset = angular.extend({
              top: 0,
              left: 0
            }, activeTarget.offset);

            var topOffset = 0;
            var leftOffset = 0;

            switch (dirParts[0]) {
              case 'top':
                topOffset = -margin.top;
                break;
              case 'bottom':
                topOffset = margin.bottom;
                break;
              case 'left':
                leftOffset = -margin.left;
                break;
              case 'right':
                leftOffset = margin.right;
                break;
            }

            coords.top += offset.top + topOffset;
            coords.left += offset.left + leftOffset;
            activeTarget.helpElement.css(coords);

            if (activeTarget.focus || service.activeGroup.focus) {
              highlightElement(activeTarget.targetElement);
            }
          }, 0, false);
        }
      }

      function getActiveTarget(availableTarget) {
        var foundTarget;
        var targets = service.activeGroup.targets;

        if (service.activeGroup.cycle) {
          targets = [service.activeGroup.targets[service.activeGroup.targetIndex]];
        }

        foundTarget = targets.filter(function(activeTarget) {
          return activeTarget && activeTarget.name === availableTarget.name;
        })[0];

        if (foundTarget) {
          return angular.extend(availableTarget, {dir: 'right'}, foundTarget);
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
          redrawActiveTarget(activeTarget);
        });
      }

      function hide() {
        hideHighlight();
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

      function focusTarget(availableTarget) {
        if (availableTarget.focus || service.activeGroup.focus) {
          angular.forEach(service.availableTargets, hideAvailableTarget);
          showAvailableTarget(availableTarget);
          highlightElement(availableTarget.targetElement);
        }
      }

      function getNextActiveTargetName() {
        var currentIndex = service.groupNames.indexOf(service.activeGroupName);
        var nextIndex = currentIndex + 1;
        if (nextIndex >= service.groupNames.length) {
          nextIndex = 0;
          service.cycleCount += 1;
        }
        return service.groupNames[nextIndex];
      }

      function getPreviousActiveTargetName() {
        var currentIndex = service.groupNames.indexOf(service.activeGroupName);
        var previousIndex = currentIndex - 1;
        if (previousIndex < 0) {
          previousIndex = service.groupNames.length - 1;
        }
        return service.groupNames[previousIndex];
      }
    }

    function parseTarget(activeGroup, scope, element, target, targetArgs) {
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

        availableTarget.scope.getGroup = function() {
          return activeGroup;
        };

        availableTarget.scope.getTarget = function() {
          return availableTarget;
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

    function hideHighlight() {
      angular.element('.ui-help-focus').addClass('hide');
    }

    function highlightElement($element) {
      $element.addClass('ui-help-highlight');
      var parentOffset = $element.parent().offset();
      var position = $element.position();
      var offset = {
        top: parentOffset.top + position.top,
        left: parentOffset.left + position.left
      };
      var $parent = angular.element(window);
      var parentDimension = {
        width: $parent.width(),
        height: $parent.height()
      };
      var dimension = {
        height: $element.outerHeight(true),
        width: $element.outerWidth(true)
      };
      angular.element('.ui-help-focus.ui-help-focus-top').css({
        height: offset.top
      }).removeClass('hide');

      angular.element('.ui-help-focus.ui-help-focus-left').css({
        top: offset.top,
        width: offset.left,
        height: dimension.height
      }).removeClass('hide');

      angular.element('.ui-help-focus.ui-help-focus-right').css({
        top: offset.top,
        width: parentDimension.width - (offset.left + dimension.width),
        height: dimension.height
      }).removeClass('hide');

      angular.element('.ui-help-focus.ui-help-focus-bottom').css({
        top: offset.top + dimension.height,
        height: parentDimension.height - (offset.top + dimension.height)
      }).removeClass('hide');
    }
  });
