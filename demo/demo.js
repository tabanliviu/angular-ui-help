angular
  .module('demo', ['ui.help'])
  .config(function($httpProvider) {
    // demo hack to load templates directly from src folder
    $httpProvider.interceptors.push(function($templateCache) {
      return {
        request: function(config) {
          if (config.cache === $templateCache && !$templateCache.get(config.url)) {
            config.url = '../src/' + config.url;
          }
          return config;
        }
      };
    });
  })
  .controller('DemoController', function DemoController($uiHelp, $timeout) {
    var _this = this;

    // controller variables

    this.addFeatures = addFeatures;
    this.removeFeatures = removeFeatures;
    this.getWelcomeMesssage = getWelcomeMesssage;

    $timeout(this.addFeatures, 2000);

    // $uiHelp config
    _this.$uiHelp = $uiHelp;

    var showHelpButtonTarget = {
      name: 'show-help',
      dir: 'right',
      templateName: 'generic',
      data: {
        title: 'Show Help',
        message: 'Click to show current help group, (click anywhere to go to the next help tip)'
      }
    };
    var welcomeMessageTarget = {
      name: 'welcome-message',
      dir: 'bottom',
      offset: {left: -10},
      data: {
        getWelcomeMesssage: this.getWelcomeMesssage
      }
    };
    var hideHelpButtonTarget = {
      name: 'hide-help',
      dir: 'right',
      templateName: 'generic',
      data: {
        title: 'Hide Help',
        message: 'Click to hide current help group, (click anywhere to go to the next help tip)'
      }
    };
    var addFeaturesButtonTarget = {
      name: 'add-features',
      dir: 'left',
      templateName: 'generic',
      data: {
        title: 'Add Features',
        message: 'Click to add features'
      }
    };
    var removeFeaturesButtonTarget = {
      name: 'remove-features',
      dir: 'top',
      templateName: 'generic',
      data: {
        title: 'Remove Features',
        message: 'Click to remove features'
      }
    };
    var notAvailableTarget = {
      name: 'not-available'
    };
    var dynamicTarget = {
      name: 'dynamic',
      dir: 'bottom',
      templateName: 'generic'
    };
    var featureTableTarget = {
      name: 'feature-table'
    };
    var featureTable2HtmlTarget = {
      name: 'feature-table-2-html',
      dir: 'bottom'
    };

    var groups = {
      'Main Features': {
        targets: [
          welcomeMessageTarget
        ]
      },
      'Bug Fixes': [
        featureTableTarget,
        dynamicTarget,
        featureTable2HtmlTarget,
        addFeaturesButtonTarget,
        removeFeaturesButtonTarget,
        notAvailableTarget
      ],
      'Wizard': {
        cycle: true,
        focus: true,
        targets: [
          hideHelpButtonTarget,
          showHelpButtonTarget
        ]
      }
    };

    $uiHelp.setGroups(groups);
    $uiHelp.setCurrentGroup('Main Features');
    $uiHelp.visible = true;

    $timeout(function() {
      showHelpButtonTarget.data.message += ' (Updated)';
      $uiHelp.updateTarget(showHelpButtonTarget);
    }, 1000);

    function addFeatures() {
      _this.features = [{
        name: 'static html target'
      }, {
        name: 'dynamic html target',
        help: 'dynamic'
      }];
    }

    function removeFeatures() {
      _this.features = [];
    }

    function getWelcomeMesssage() {
      return 'Welcome From Controller';
    }
  });
