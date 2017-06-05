"user strict";

angular.module("ico")
    .controller('HeaderController', ['$scope', function($scope) {}])
    .controller("ContentController", ["$scope", function($scope) {}])
    .controller("LoginController", ["$scope", function($scope) {}])
    .controller("RegisterController", ["$scope", 'Upload', 'baseURL',"MainRemoteResource", function($scope, Upload, baseURL, MainRemoteResource) {
        $scope.registerModel = {
            front:{},
            back:{},
            hand:{}
        };
        $scope.upload = function(file, receiverObject) {
            var nofile = !file || file.length == 0 || !file[0];
            if(nofile){
                return;
            }
            Upload.upload({
                url: baseURL+'/wifiauth/upload',
                data: { file: file[0], 'username': $scope.username }
            }).then(function(resp) {
                //success
                angular.extend(receiverObject, resp.data);
            }, function(error) {
                //error
            }, function(evt) {
                //process
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            });
        };
        $scope.registerAccount = function registerAccount(){
            var uploadData = angular.extend({}, $scope.registerModel);
            MainRemoteResource.accountResource.signupAccount({}, uploadData).$promise
                .then(function(success){
                    console.log(success);
                }, function(error){
                    console.log(error);
                });
        };
    }])
    .controller("SubscribeController", ["$scope", function($scope) {}]);
