"user strict";

angular.module("ico").controller('HeaderController', ['$scope', function($scope) {
}]).controller("ContentController", ["$scope", function($scope) {
}]).controller("LoginController", ["$scope", "$rootScope", "MainRemoteResource", "$state","md5", function($scope, $rootScope, MainRemoteResource, $state, md5){
    $scope.signinModel = {
        loading: 0,
        account: '',
        password: ''
    };
    $scope.display = {};
    $scope.validSignInInfo = function validSignInInfo(){
        var infoIsValid = $scope.signinModel.account && $scope.signinModel.password;
        infoIsValid = infoIsValid && !$scope.signinModel.loading;
        return infoIsValid;
    };
    $scope.signin = function signin(){
        var credentials = {
            username: $scope.signinModel.account,
            password: md5.createHash($scope.signinModel.password)
        };
        $scope.signinModel.loading++;
        MainRemoteResource.getToken(credentials).then(function(success){
            $state.go('app.subscribelist');
            $scope.signinModel.loading--;
            $scope.display.error = undefined;
        }).catch(function(error){
            console.log(error);
            $scope.signinModel.loading--;
            if(error && error.data && error.data.code){
                $scope.display.error = error.data;
            };
        });
    };
    $rootScope.icoEnv = {
        couldLogin:true,
        couldLogout:false,
        couldList:false,
        couldSubscribe:false
    };
    
}]).controller("RegisterController", ["$scope", 'Upload', 'baseURL',"MainRemoteResource", "$rootScope", "$state", "md5", function($scope, Upload, baseURL, MainRemoteResource, $rootScope, $state, md5) {
    $scope.registerModel = {
        loading:0,
        sendingSMS:0,
        front:{},
        back:{},
        hand:{},
        agreeliscense: true,
        isIntegrity: true
    };
    $rootScope.icoEnv = {
        couldLogin:true,
        couldLogout:false,
        couldList:false,
        couldSubscribe:false
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
        var validphone = $scope.registerModel.phone && $scope.registerModel.phone.trim();
        validphone = validphone && validphone.length == 11;
        couldSendSMS = couldSendSMS && validphone;
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
        uploadData.password = md5.createHash(uploadData.password);
        $scope.registerModel.loading++;
        MainRemoteResource.accountResource.signupAccount({}, uploadData).$promise
            .then(function(success){
                console.log(success);
                $scope.display.error = undefined;
                $scope.registerModel.loading--;
                $state.go("app.login");
            }, function(error){
                console.log(error);
                $scope.registerModel.loading--;
                if(error && error.data && error.data.code){
                    $scope.display.error = error.data;
                }
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
    
}]).controller("SubscribeController", ["$scope", "MainRemoteResource", "$state", "$rootScope", function($scope, MainRemoteResource, $state, $rootScope) {
    $scope.subscribeModel = {
        loading:0,
        form:{
            bankType:'BTC'
        },
        data:{
            btc:'BTC',
            eth:'ETH',
            bankBTC: "1Ch9BL6SRn6Z7YqTuBSSaEXBjqq5VdpPSL",
            bankETH: "0xECC472Db4A32Fd84F3BbAa261bF4598B66fC6cf2"
        }
    };
    $scope.getBankAccount = function getBankAccount(){
        switch($scope.subscribeModel.form.bankType){
        case "BTC":
            return $scope.subscribeModel.data.bankBTC;
        case "ETH":
            return $scope.subscribeModel.data.bankETH;
        };
        return undefined;
    };
    $scope.getMinBlockConfirm = function getMinBlockConfirm(){
        switch($scope.subscribeModel.form.bankType){
        case "BTC":
            return '充值到账可能需要 120';
        case "ETH":
            return '充值到账至少需要 12';
        };
        return undefined;
    };
    $scope.getBankCheckLink = function getBankCheckLink(){
        switch($scope.subscribeModel.form.bankType){
        case "BTC":
            return "https://etherscan.io/search?q="+$scope.subscribeModel.data.bankETH;
        case "ETH":
            return "https://etherscan.io/search?q="+$scope.subscribeModel.data.bankETH;
        };
        return undefined;
    };
    $scope.getMinTimeDelay = function getMinTimeDelay(){
        switch($scope.subscribeModel.form.bankType){
        case "BTC":
            return "1-3 小时";
        case "ETH":
            return "1-3分钟";
        };
        return undefined;
    };
    $scope.copyAddress = function copyAddress(){
        var info = $("#bankAccountInput");
        copyToClipboard(info[0]);
    };
    function copyToClipboard(elem) {
	    // create hidden text element, if it doesn't already exist
        var targetId = "_hiddenCopyText_";
        var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
        var origSelectionStart, origSelectionEnd;
        if (isInput) {
            // can just use the original source element for the selection and copy
            target = elem;
        } else {
            // must use a temporary form element for the selection and copy
            target = document.getElementById(targetId);
            if (!target) {
                var target = document.createElement("textarea");
                target.style.position = "absolute";
                target.style.left = "-9999px";
                target.style.top = "0";
                target.id = targetId;
                document.body.appendChild(target);
            }
            target.textContent = elem.textContent;
        }
        // select the content
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);
        
        // copy the selection
        var succeed;
        try {
    	    succeed = document.execCommand("copy");
        } catch(e) {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }
        origSelectionStart = target.selectionStart;
        origSelectionEnd = target.selectionEnd;
        
        if (isInput) {
            // restore prior selection
            elem.setSelectionRange(origSelectionStart, origSelectionEnd);
        } else {
            // clear temporary content
            target.textContent = "";
        }
        return succeed;
    }
    $rootScope.icoEnv = {
        couldLogin:false,
        couldLogout:true,
        couldList:true,
        couldSubscribe:false
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
            $scope.subscribeModel.data.error = undefined;
        }).catch(function(error){
            $scope.subscribeModel.loading --;
            $scope.subscribeModel.data.error = error.data;
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
}]).controller("SubscribeListController", ["$scope","MainRemoteResource","$rootScope", function($scope, MainRemoteResource, $rootScope) {
    $scope.subscribedModel = {
        subscribedItemList:[],
        action:{},
        display:{
            loading:0
        }
    };
    $rootScope.icoEnv = {
        couldLogin:false,
        couldLogout:true,
        couldList:false,
        couldSubscribe:true
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
    
}]).controller("ShowPdfController", ["$scope","$stateParams", function($scope, $stateParams){
    var filename = $stateParams["pdfname"];
    $scope.showModel = {
        filepath:"/wifidocs/"+ filename+".pdf"
    };
}])
;
