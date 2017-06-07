"user strict";

angular.module("ico").controller('HeaderController', ['$scope', function($scope) {
}]).controller("ContentController", ["$scope", function($scope) {
}]).controller("LoginController", ["$scope", "$rootScope", "MainRemoteResource", "$state", function($scope, $rootScope, MainRemoteResource, $state){
    $scope.signinModel = {
        loading: 0,
        account: '13718961866',
        password: '123456'
    };
    $scope.validSignInInfo = function validSignInInfo(){
        let infoIsValid = $scope.signinModel.account && $scope.signinModel.password;
        infoIsValid = infoIsValid && !$scope.signinModel.loading;
        return infoIsValid;
    };
    $scope.signin = function signin(){
        var credentials = {
            username: $scope.signinModel.account,
            password: $scope.signinModel.password
        };
        $scope.signinModel.loading++;
        MainRemoteResource.getToken(credentials).then(function(success){
            $state.go('app.subscribelist');
            $scope.signinModel.loading--;
        }).catch(function(error){
            console.log(error);
            $scope.signinModel.loading--;
        });
    };
    
}]).controller("RegisterController", ["$scope", 'Upload', 'baseURL',"MainRemoteResource", "$rootScope", function($scope, Upload, baseURL, MainRemoteResource, $rootScope) {
    $scope.registerModel = {
        loading:0,
        sendingSMS:0,
        front:{},
        back:{},
        hand:{},
        agreeliscense: true,
        isIntegrity: true
    };
    $scope.display = {};
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
        valid = valid && model.agreeliscense && model.isIntegrity;
        return valid;
    };
    $scope.couldSendSMS = function couldSendSMS(){
        var couldSendSMS = !$scope.registerModel.sendingSMS && $scope.registerModel.prepare;
        couldSendSMS = couldSendSMS && $scope.registerModel.phone && $scope.registerModel.phone.length == 11;
        return couldSendSMS;
    };
    $scope.sendSMS = function sendSMS(){
        $scope.registerModel.sendingSMS ++;
        var sendData = {
            uuid: $rootScope.rootUUID,
            application: "register",
            phone: $scope.registerModel.phone
        };
        MainRemoteResource.phoneResource.sendPhoneCode({}, sendData).$promise.then(function(success){
            $scope.display.sms = "短信已经发送";
        }).catch(function(error){
            $scope.registerModel.sendingSMS --;
            $scope.display.sms = "短信已经发送失败";
        });
    };
    $scope.registerAccount = function registerAccount(){
        var uploadData = angular.extend({}, $scope.registerModel);
        if(!(uploadData.account)){
            uploadData.account = uploadData.phone;
        };
        $scope.registerModel.loading++;
        MainRemoteResource.accountResource.signupAccount({}, uploadData).$promise
            .then(function(success){
                console.log(success);
                $scope.registerModel.loading--;
            }, function(error){
                console.log(error);
                $scope.registerModel.loading--;
            });
    };
    $scope.prepareSignUp = function prepareSignUp(){
        $rootScope.rootUUID = $rootScope.rootUUID || MainRemoteResource.guid();
        var prepareBody = {
            uuid: $rootScope.rootUUID,
            application: "register"
        };
        $scope.registerModel.loading++;
        MainRemoteResource.phoneResource.preparePhoneCode({}, prepareBody).$promise.then(function(success){
            $scope.registerModel.loading--;
            $scope.registerModel.prepare = success;
        }).catch(function(error){
            if(error && error.data && error.data.info && error.data.code == 1201){
                $scope.registerModel.prepare = error.data.info;
            }
            $scope.registerModel.loading--;
        });
    };
    $scope.prepareSignUp();
    
}]).controller("SubscribeController", ["$scope", "MainRemoteResource", "$state", function($scope, MainRemoteResource, $state) {
    $scope.subscribeModel = {
        loading:0,
        form:{
            bankType:'BTC'
        },
        data:{
            btc:'BTC',
            eth:'ETH'
        }
    };
    var modelForm = $scope.subscribeModel.form;
    $scope.subscribeInfoIsValid = function subscribeInfoIsValid(){
        var isValid = modelForm.bankType && modelForm.bankAccount && modelForm.bankAmount;
        isValid = isValid && angular.isNumber(modelForm.bankAmount) && modelForm.bankAmount > 0;
        // isValid = isValid && modelForm.bankAccount.length > 30;
        isValid = isValid && !$scope.subscribeModel.loading;
        return isValid;
    };
    $scope.confirmSubscribe = function confirmSubscribe(){
        $scope.subscribeModel.loading ++;
        var itemInfo = {
            subscribeAmount: modelForm.bankAmount,
            bankType: modelForm.bankType,
            bankAccount: modelForm.bankAccount,
            bankUnit: modelForm.bankType
        };
        MainRemoteResource.subscribeResource.save({},itemInfo).$promise.then(function(sucess){
            $state.go("app.subscribelist");
            $scope.subscribeModel.loading --;
        }).catch(function(error){
            $scope.subscribeModel.loading --;
        });
    };
}]).controller("SubscribeModifyController", ["$scope", "MainRemoteResource", "$state", "$stateParams", function($scope, MainRemoteResource, $state, $stateParams) {
    console.log($stateParams);
    var subid = $stateParams.get("subscribeId");
    console.log(subid);
    $scope.subscribeModel = {
        loading:0,
        subscribeAmount:0,
        data:{
        }
    };
    var model = $scope.subscribeModel;
    $scope.subscribeInfoIsValid = function subscribeInfoIsValid(){
        var isValid = model.subscribeAmount && angular.isNumber(model.subscribeAmount) && model.subscribeAmount > 0;
        // isValid = isValid && modelForm.bankAccount.length > 30;
        isValid = isValid && !model.loading;
        return isValid;
    };
    $scope.confirmSubscribe = function confirmSubscribe(){
        $scope.subscribeModel.loading ++;
        var itemInfo = {
            subscribeAmount: model.subscribeAmount
        };
        MainRemoteResource.subscribeResource.update({},itemInfo).$promise.then(function(sucess){
            $state.go("app.subscribelist");
            $scope.subscribeModel.loading --;
        }).catch(function(error){
            $scope.subscribeModel.loading --;
        });
    };
}]).controller("SubscribeListController", ["$scope","MainRemoteResource", function($scope, MainRemoteResource) {
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
                model.subscribedItemList.length = 0;
                Array.prototype.push.apply(model.subscribedItemList,success);
                model.display.loading --;
            }, function(error){
                console.log(error);
                model.display.loading --;
            });
    };
    
    model.action.loadSubscribedItemList();
    
}])
;
