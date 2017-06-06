"user strict";

angular.module("ico")
    .controller('HeaderController', ['$scope', function($scope) {}])
    .controller("ContentController", ["$scope", function($scope) {}])
    .controller("LoginController", ["$scope", "MainRemoteResource", "$state", function($scope, MainRemoteResource, $state){
        $scope.signinModel = {
            loading: 0,
            account: '13718961866',
            password: '123456'
        };
        $scope.validSignInInfo = function validSignInInfo(){
            let infoIsValid = $scope.signinModel.account && $scope.signinModel.password;
            return infoIsValid;
        };
        $scope.signin = function signin(){
            var credentials = {
                username: $scope.signinModel.account,
                password: $scope.signinModel.password
            };
            MainRemoteResource.getToken(credentials).then((success)=>{
                $state.go('app.subscribelist');
            }).catch((error)=>{
                console.log(error);
            });
        };
    }])
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
        $scope.validateForm = function validateForm(){
            var model = $scope.registerModel;
            var valid = !!model.phone && model.phone.length == 11;
            valid = valid && model.phoneCode;
            valid = valid && model.password && model.confirm && model.password == model.confirm;
            valid = valid && model.name && model.identifier && model.identifier.length == 18;
            valid = valid && model.front.filename && model.back.filename && model.hand.filename;
            return valid;
        };
        $scope.registerAccount = function registerAccount(){
            var uploadData = angular.extend({}, $scope.registerModel);
            if(!(uploadData.account)){
                uploadData.account = uploadData.phone;
            };
            MainRemoteResource.accountResource.signupAccount({}, uploadData).$promise
                .then(function(success){
                    console.log(success);
                }, function(error){
                    console.log(error);
                });
        };
    }])
    .controller("SubscribeController", ["$scope", function($scope) {}])
    .controller("SubscribeListController", ["$scope","MainRemoteResource", function($scope, MainRemoteResource) {
        $scope.subscribedModel = {
            subscribedItemList:[],
            action:{},
            display:{
                loading:0
            }
        };
        var model = $scope.subscribedModel;
        model.action.loadSubscribedItemList = function loadSubscribedItemList(){
            model.display.loading ++;
            MainRemoteResource.subscribeResource.query({}).$promise
                .then(function(success){
                    model.display.loading --;
                }, function(error){
                    console.log(error);
                    model.display.loading --;
                });
        };
        
        model.action.loadSubscribedItemList();
        
    }])
;
