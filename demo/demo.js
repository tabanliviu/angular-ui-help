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
      dir: 'bottom',
      templateName: 'generic',
      data: {
        title: 'Show Help',
        message: 'Click to show current help group'
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
        message: 'Click to hide current help group'
      }
    };
    var notAvailableTarget = {
      name: 'not-available'
    };
    var dynamicTarget = {
      name: 'dynamic',
      dir: 'top',
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
      'Main Features': [
        welcomeMessageTarget,
        showHelpButtonTarget,
        hideHelpButtonTarget
      ],
      'Bug Fixes': [
        dynamicTarget,
        featureTableTarget,
        featureTable2HtmlTarget,
        notAvailableTarget
      ]
    };

    $uiHelp.setGroups(groups);
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
