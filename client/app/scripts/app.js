'use strict';
var AuthorityBroadcast = 'authorityUpdated';
var app = angular.module('ico', [
    'ngResource',
    'ui.router',
    'multipleSelect',
    'ngFileUpload',
    'angular-md5',
    "monospaced.qrcode",
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
        .state('app.checking', {
            url: 'checking/:phone',
            views:{
                'content@':{
                    templateUrl:'views/checking_list.html',
                    controller: 'CheckingListController'
                }
            }
        })
        .state('app.lastchecking', {
            url: 'lastchecking',
            views:{
                'content@':{
                    templateUrl:'views/last_check.html',
                    controller: 'LastCheckController'
                }
            }
        })
        .state('app.smsprepared', {
            url: 'smsprepared',
            views:{
                'content@':{
                    templateUrl:'views/sms_prepared.html',
                    controller: 'SMSPreparedController'
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
                    templateUrl: 'views/login.html',
                    controller: 'LoginController'
                }
            }
        })
        .state('app.findpassword', {
            url: 'findpassword',
            views: {
                'content@': {
                    templateUrl: 'views/findPassword.html',
                    controller: 'FindLostPasswordController'
                }
            }
        })
        .state('app.register.accountprototype', {
            url: 'register/accountprototype',
            views: {
                'content@': {
                    templateUrl: 'views/account_prototype.html'
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
        .state('app.showpdf', {
            url: 'showpdf/:pdfname',
            views: {
                'content@': {
                    templateUrl: 'views/show_pdf.html',
                    controller: 'ShowPdfController'
                }
            }
        })
        .state('app.publicity', {
            url: 'publicity/:domain',
            views: {
                'content@': {
                    templateUrl: 'views/publicity.html',
                    controller: 'PublicityController'
                }
            }
        })
        .state('app.distribute', {
            url: 'distribute',
            views: {
                'content@': {
                    templateUrl: 'views/distribute_ubc.html',
                    controller: 'DistributeController'
                }
            }
        })
    ;
    $urlRouterProvider.otherwise('/subscribelist');
}).config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push("AuthTokenInterceptor");
}]);
app.run(['$rootScope', 'HttpBuffer', '$state','MainRemoteResource', 'ULStorageService', function($rootScope, HttpBuffer, $state, MainRemoteResource, ULStorageService){
    $rootScope.$on('event:auth-refreshToken', function refreshToken(){
        MainRemoteResource.refreshToken();
    });
    $rootScope.$on('event:auth-loginRequired', function gotoLogin(){
        HttpBuffer.rejectAll();
        $state.go("app.login");
    });
    $rootScope.icoEnv = {
        couldLogin:true,
        couldLogout:false,
        couldList:false,
        couldSubscribe:false
    };
    $rootScope.logout = function logout(){
        $rootScope.icoEnv = {
            couldLogin:true,
            couldLogout:false,
            couldList:false,
            couldSubscribe:false
        };
        ULStorageService.remove("token");
        $state.go("app.login");
    };
}]);
// app.run(['', function(){

// }]);
