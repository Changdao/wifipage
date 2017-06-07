'use strict';
var AuthorityBroadcast = 'authorityUpdated';
var app = angular.module('ico', [
    'angularUtils.directives.dirPagination',
    'ngResource',
    'ui.router',
    'multipleSelect',
    'ngFileUpload',
    'textAngular',
    "LocalStorageModule"
]).config(function($stateProvider, $urlRouterProvider ) {
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
        .state('app.subscribelist', {
            url: 'subscribelist',
            views:{
                'content@':{
                    templateUrl:'views/subscribe_list.html',
                    controller: 'SubscribeListController'
                }
            }
        })
        .state('app.login', {
            url: 'login',
            views: {
                'content@': {
                    templateUrl: 'views/login.html',
                    controller: 'LoginController'
                }
            }
        })
        .state('app.register', {
            url: 'register',
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
        .state('app.subscribemodify', {
            url: 'subscribemodify/:subscribeId',
            views: {
                'content@': {
                    templateUrl: 'views/subscribe.html',
                    controller: 'SubscribeModifyController'
                }
            }
        })
    ;
    $urlRouterProvider.otherwise('/subscribelist');
}).config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push("AuthTokenInterceptor");
}]);
app.run(['$rootScope', 'HttpBuffer', '$state','MainRemoteResource', function($rootScope, HttpBuffer, $state, MainRemoteResource){
    $rootScope.$on('event:auth-refreshToken', function refreshToken(){
        MainRemoteResource.refreshToken();
    });
    $rootScope.$on('event:auth-loginRequired', function gotoLogin(){
        HttpBuffer.rejectAll();
        $state.go("app.login");
    });
}]);
// app.run(['', function(){

// }]);
