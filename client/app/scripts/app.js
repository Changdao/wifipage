'use strict';
var AuthorityBroadcast = 'authorityUpdated';
var app = angular.module('ico', [
        'angularUtils.directives.dirPagination',
        'ngResource',
        'ui.router',
        'multipleSelect',
        'ngFileUpload',
        'textAngular',
        // 'ae-datetimepicker'
    ])
    .config(function($stateProvider, $urlRouterProvider ) {
        $stateProvider
            .state('app', {
                url: '/',
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: 'HeaderController'
                    },
                    'content': {
                        templateUrl: 'views/home.html',
                        controller: 'ContentController'
                    },
                    'footer': {
                        templateUrl: 'views/footer.html'
                    }
                }
            })
            .state('app.index', {
                url: '^/index'
            })
            .state('app.login', {
                url: '^/login',
                views: {
                    'content@': {
                        templateUrl: 'views/login.html',
                        controller: 'LoginController'
                    }
                }
            })
            .state('app.register', {
                url: '^/register',
                views: {
                    'content@': {
                        templateUrl: 'views/register.html',
                        controller: 'RegisterController'
                    }
                }
            })
            .state('app.subscribe', {
                url: 'subscribe',
                views: {
                    'content@': {
                        templateUrl: 'views/subscribe.html',
                        controller: 'SubscribeController'
                    }
                }
            })
          ;
        $urlRouterProvider.otherwise('/register');
    })
    .config(['$provide', function($provide){
        // this demonstrates how to register a new tool and add it to the default toolbar
        $provide.decorator('taOptions', ['$delegate', function(taOptions){
            // $delegate is the taOptions we are decorating
            // here we override the default toolbars and classes specified in taOptions.
            taOptions.toolbar = [
                ['p', 'pre', 'quote'],
                ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
                ['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
                [ 'insertImage', 'insertLink', 'wordcount', 'charcount']
            ];
            return taOptions; // whatever you return will be the taOptions
        }]);
    }]);

// app.run(['', function(){

// }]);
