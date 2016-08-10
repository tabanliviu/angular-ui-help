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

    var welcomeMessageTarget = {
      name: 'welcome-message',
      dir: 'bottom',
      offset: {left: -10},
      data: {
        getWelcomeMesssage: this.getWelcomeMesssage
      }
    };

    $uiHelp.addGroup({
      name: 'Main Features',
      targets: [
        welcomeMessageTarget
      ]
    });
    $uiHelp.setCurrentGroup('Main Features');
    $uiHelp.visible = true;

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
