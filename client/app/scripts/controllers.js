"user strict";

angular.module("ico")
  .controller('HeaderController', ['$scope', function($scope) {}])
  .controller("ContentController", ["$scope", function($scope) {}])
  .controller("LoginController", ["$scope", function($scope) {}])
  .controller("RegisterController", ["$scope", 'Upload', 'baseURL', function($scope, Upload, baseURL) {
    $scope.upload = function(file) {
      Upload.upload({
        url: baseURL+'/wifiauth/upload',
        data: { file: file, 'username': $scope.username }
      }).then(function(resp) {
        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      }, function(resp) {
        console.log('Error status: ' + resp.status);
      }, function(evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
      });
    };
  }])
  .controller("SubscribeController", ["$scope", function($scope) {}]);
