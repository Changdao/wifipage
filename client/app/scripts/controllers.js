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
    
}]).controller("RegisterController", ["$scope", 'Upload', 'baseURL',"MainRemoteResource", "$rootScope", "$state", "md5","$interval", function($scope, Upload, baseURL, MainRemoteResource, $rootScope, $state, md5,$interval) {
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
    $scope.verify = {};
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
        // valid = valid && model.front.filename && model.back.filename && model.hand.filename;
        valid = valid && model.agreeliscense && model.isIntegrity;
        return valid;
    };
    $scope.couldSendSMS = function couldSendSMS(){
        var couldSendSMS = !$scope.registerModel.sendingSMS && $scope.registerModel.prepare;
        couldSendSMS = couldSendSMS && $scope.registerModel.verifyCode && $scope.registerModel.verifyCode.length==6;
        var validphone = $scope.registerModel.phone && $scope.registerModel.phone.trim();
        validphone = validphone && validphone.length == 11;
        couldSendSMS = couldSendSMS && validphone;
        return couldSendSMS;
    };
    $scope.sendSMS = function sendSMS(){
        $scope.registerModel.sendingSMS ++;
        var sendData = {
            id: $scope.verify.id,
            uuid: $rootScope.rootUUID,
            application: "register",
            phone: $scope.registerModel.phone,
            verifyCode: $scope.registerModel.verifyCode.toLocaleLowerCase()
        };
        MainRemoteResource.phoneResource.sendPhoneCode({}, sendData).$promise.then(function(success){
            $scope.display.sms = "短信已经发送";
            var sendCounting  = 0;
            var countInterval = $interval(function resetSmsCounting(){
                sendCounting += 1;
                if(sendCounting == 120){
                    $scope.registerModel.sendingSMS = 0;
                    if(typeof countInterval != 'undefined'){
                        $interval.cancel(countInterval);
                    };
                };
            },  100, 122);
            $scope.display.error = undefined;
        }).catch(function(error){
            $scope.registerModel.sendingSMS --;
            $scope.display.sms = "短信已经发送失败";
            if(error && error.data && error.data.code){
                $scope.display.error = error.data;
            }
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
            $scope.verify.id = success.id;
            $scope.verify.uuid = $rootScope.rootUUID;
            $scope.prepareVerify();
        }).catch(function(error){
            if(error && error.data && error.data.info && error.data.code == 1201){
                $scope.registerModel.prepare = error.data.info;
            }
            $scope.registerModel.loading--;
        });
    };
    $scope.prepareVerify = function(){
        $rootScope.rootUUID = $rootScope.rootUUID || MainRemoteResource.guid();
        $scope.registerModel.loading++;
        return MainRemoteResource.phoneResource.refreshVerifyCode({},{id:$scope.verify.id, uuid: $rootScope.rootUUID}).$promise.then(function(success){
            $scope.registerModel.loading--;
            $scope.verify.timestamp = success.timestamp;
        }).catch(function(error){
            if(error && error.data && error.data.code){
                $scope.display.error = error.data;
            }
            $scope.registerModel.loading--;
        });
    };
    $scope.prepareSignUp();
}]).controller("FindLostPasswordController",["$scope","$rootScope","MainRemoteResource", "md5","$state","$interval", function($scope,$rootScope,MainRemoteResource, md5, $state, $interval){
    var base = {
        verify:{},
        resetData:{},
        display:{},
        sendingSMS:0
    };
    $scope.lostModel = {
        loading:0,
        database: base
    };
    $scope.prepareResetPassword = function(){
        $rootScope.rootUUID = $rootScope.rootUUID || MainRemoteResource.guid();
        var prepareBody = {
            uuid: $rootScope.rootUUID,
            application: "resetPassword"
        };
        $scope.lostModel.loading++;
        MainRemoteResource.phoneResource.preparePhoneCode({}, prepareBody).$promise.then(function(success){
            $scope.lostModel.loading--;
            base.prepare = success;
            base.verify.id = success.id;
            base.verify.uuid = $rootScope.rootUUID;
            $scope.prepareVerify();
        }).catch(function(error){
            if(error && error.data && error.data.info && error.data.code == 1201){
                base.prepare = error.data.info;
                base.verify.id = error.data.info.id;
                base.verify.uuid = $rootScope.rootUUID;
                $scope.prepareVerify();
            }
            $scope.lostModel.loading--;
        });
    };
    $scope.prepareVerify = function(){
        $rootScope.rootUUID = $rootScope.rootUUID || MainRemoteResource.guid();
        $scope.lostModel.loading++;
        return MainRemoteResource.phoneResource.refreshVerifyCode({},{id:base.verify.id, uuid: $rootScope.rootUUID}).$promise.then(function(success){
            $scope.lostModel.loading--;
            base.verify.timestamp = success.timestamp;
        }).catch(function(error){
            if(error && error.data && error.data.code){
                base.display.error = error.data;
            }
            $scope.lostModel.loading--;
        });
    };
    $scope.couldSendSMS = function couldSendSMS(){
        var couldSendSMS = !base.sendingSMS && base.prepare;
        couldSendSMS = couldSendSMS && base.resetData.verifyCode && base.resetData.verifyCode.length==6;
        var validphone = base.resetData.account && base.resetData.account.trim();
        validphone = validphone && validphone.length == 11;
        couldSendSMS = couldSendSMS && validphone;
        return couldSendSMS;
    };
    $scope.sendSMS = function sendSMS(){
        base.sendingSMS ++;
        var sendData = {
            id: base.verify.id,
            uuid: $rootScope.rootUUID,
            application: "resetPassword",
            phone: base.resetData.account,
            verifyCode: base.resetData.verifyCode.toLocaleLowerCase()
        };
        MainRemoteResource.phoneResource.sendPhoneCode({}, sendData).$promise.then(function(success){
            base.display.sms = "短信已经发送";
            var sendCounting  = 0;
            var countInterval = $interval(function resetSmsCounting(){
                sendCounting += 1;
                if(sendCounting == 120){
                    base.sendingSMS = 0;
                    if(typeof countInterval != 'undefined'){
                        $interval.cancel(countInterval);
                    };
                };
            },  100, 122);
            base.display.error = undefined;
        }).catch(function(error){
            base.sendingSMS --;
            base.display.sms = "短信发送失败";
            if(error && error.data && error.data.code){
                base.display.error = error.data;
            }
        });
    };
    $scope.couldResetPassword = function(){
        var couldReset = base.resetData.account && base.resetData.verifyCode && base.resetData.phoneCode && base.resetData.password && base.resetData.confirm;
        couldReset = couldReset && (base.resetData.password == base.resetData.confirm);
        couldReset = couldReset && (base.resetData.account && base.resetData.account.trim() && base.resetData.account.trim().length == 11);
        return couldReset;
    };
    $scope.resetPassword = function(){
        var sendData = {
            account: base.resetData.account,
            verifyCode: base.resetData.verifyCode,
            phoneCode: base.resetData.phoneCode,
            password: md5.createHash(base.resetData.password),
            confirm: md5.createHash(base.resetData.confirm)
        };
        MainRemoteResource.accountResource.resetPassword({}, sendData).$promise.then(function(success){
            $state.go("app.login");
            
        }).catch(function(error){
        });
    };
    $scope.prepareResetPassword();
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
}]).controller("SMSPreparedController", ["$scope", "MainRemoteResource", "$state", "$stateParams", function($scope, MainRemoteResource, $state, $stateParams){
    $scope.smsModel = {
        data:[],
        display:{}
    };
    var model = $scope.smsModel;
    $scope.getPreparedSMS = function getPreparedSMS(){
        MainRemoteResource.smsResource.queryPreparedSMS({}).$promise.then(function(success){
            model.data.length = 0;
            model.data.push.apply(model.data, success.preparedMessageData);
        });
    };
    $scope.sendSMS = function sendSMS(smsItem){
        MainRemoteResource.smsResource.sentSMSToPhone({phone:smsItem.account}, smsItem).$promise.then(function(success){
            if(success){
                smsItem.status = 'sent';
            }
        });
    };
    $scope.getPreparedSMS();
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
}]).controller("SubscribeListController", ["$scope","MainRemoteResource","$rootScope","$timeout", function($scope, MainRemoteResource, $rootScope, $timeout) {
    $scope.subscribedModel = {
        subscribedItemList:[],
        action:{},
        display:{
            loading:0,
            showPagination:false,
            start:0,
            hasMore:false,
            showStart: false,
            saved:0
        },
        ubc:{
            amount:0,
            address:'',
            status:''
        }
    };
    $rootScope.icoEnv = {
        couldLogin:false,
        couldLogout:true,
        couldList:false,
        couldSubscribe:true
    };
    var model = $scope.subscribedModel;
    model.action.loadSubscribedItemList = function loadSubscribedItemList(start, limit){
        model.display.loading ++;
        MainRemoteResource.subscribeResource.get({start:(start || 0),limit:(limit || 3)}).$promise
            .then(function(success){
                model.subscribedItemList.length = 0;
                Array.prototype.push.apply(model.subscribedItemList,success.arrayData);
                model.display.loading --;
                model.display.showPagination = start || (success.arrayData.length >= (limit||0));
                model.display.hasMore = success.arrayData.length >= (limit||0);
                model.display.showStart = !!start;
                model.display.start = start;
            }, function(error){
                console.log(error);
                model.display.loading --;
            });
    };
    var pagelimit = 50;
    model.action.loadSubscribedItemList(0, pagelimit);
    model.action.pageSubscribeItemList = function pageSubscribeItemList(isNext){
        if(isNext){
            model.action.loadSubscribedItemList(model.display.start + 1, pagelimit);
        }else{
            model.action.loadSubscribedItemList(model.display.start - 1, pagelimit);
        }
    };
    model.action.getChecked = function getChecked(){
        MainRemoteResource.subscribeResource.getChecked({}).$promise.then(function(success){
            model.checked = success.checkedArray;
            model.checked.forEach(function(ele, idx, array){
                switch(ele.bankType){
                case 'BTC':
                    model.ubc.amount += (ele.confirmedAmount || ele.amountIn || 0) * 230000;
                    break;
                case 'ETH':
                    model.ubc.amount += (ele.confirmedAmount || ele.amountIn || 0) * 28000;
                    break;
                };
            });
        });
    };
    model.action.getUBCAddress = function getUBCAddress(){
        MainRemoteResource.subscribeResource.getUBCAddress({}).$promise.then(function(success){
            var ubcAddress = success.data[0];
            if(ubcAddress){
                model.ubc.address = ubcAddress.address;
                model.ubc.amount = ubcAddress.amount;
                model.ubc.status = ubcAddress.status;
            }
        });
    };
    model.action.getChecked();
    model.action.getUBCAddress();
    $scope.saveUBCAddress = function saveUBCAddress(targetStatus, failedStatus){
        model.display.loading ++;
        model.display.saved = 0;
        MainRemoteResource.subscribeResource.saveUBCAddress({},{
            address: model.ubc.address,
            status: targetStatus || 'waiting'
        }).$promise.then(function(success){
            model.display.loading --;
            model.ubc.status = targetStatus;
            model.display.saved = 1;
            $timeout(function(){
                model.display.saved = 0;
            }, 2000);
        }).catch(function(err){
            model.display.loading --;
            model.ubc.status = failedStatus || 'waiting';
        });
    };
    $scope.confirmUBCAddress = function confirmUBCAddress(){
        console.log("info");
        model.ubc.status = 'confirming';
        $scope.saveUBCAddress('confirm');
    };
    
}]).controller("CheckingListController", ["$scope","MainRemoteResource","$rootScope", "$stateParams", "$state", function($scope, MainRemoteResource, $rootScope, $stateParams,$state) {
    var targePhone = $stateParams["phone"];
    $scope.subscribedModel = {
        subscribedItemList:[],
        action:{},
        display:{
            loading:0,
            showPagination:false,
            start:0,
            hasMore:false,
            showStart: false
        },
        ubc:{
            amount:0,
            address:''
        }
    };
    $rootScope.icoEnv = {
        couldLogin:false,
        couldLogout:true,
        couldList:false,
        couldSubscribe:true
    };
    var model = $scope.subscribedModel;
    model.action.loadSubscribedItemList = function loadSubscribedItemList(start, limit){
        model.display.loading ++;
        MainRemoteResource.subscribeResource.testSubscribeList({phone:targePhone,start:(start || 0),limit:(limit || 3)}).$promise
            .then(function(success){
                model.subscribedItemList.length = 0;
                Array.prototype.push.apply(model.subscribedItemList,success.arrayData);
                model.display.loading --;
                model.display.showPagination = start || (success.arrayData.length >= (limit||0));
                model.display.hasMore = success.arrayData.length >= (limit||0);
                model.display.showStart = !!start;
                model.display.start = start;
            }, function(error){
                console.log(error);
                model.display.loading --;
            });
    };
    var pagelimit = 50;
    model.action.loadSubscribedItemList(0, pagelimit);
    model.action.pageSubscribeItemList = function pageSubscribeItemList(isNext){
        if(isNext){
            model.action.loadSubscribedItemList(model.display.start + 1, pagelimit);
        }else{
            model.action.loadSubscribedItemList(model.display.start - 1, pagelimit);
        }
    };
    model.action.getChecked = function getChecked(){
        MainRemoteResource.subscribeResource.testCheckedList({phone:targePhone}).$promise.then(function(success){
            model.checked = success.checkedArray;
            model.checked.forEach(function(ele, idx, array){
                switch(ele.bankType){
                case 'BTC':
                    model.ubc.amount += (ele.confirmedAmount || ele.amountIn || 0) * 230000;
                    break;
                case 'ETH':
                    model.ubc.amount += (ele.confirmedAmount || ele.amountIn || 0) * 28000;
                    break;
                };
            });
        }).catch(function(err){
            $state.go("app.subscribelist");
        });
    };
    model.action.getChecked();
    $scope.saveUBCAddress = function saveUBCAddress(){
        MainRemoteResource.subscribeResource.saveUBCAddress({},{
            address: model.ubc.address,
            phone: targePhone
        }).$promise.then(function(success){
        });
    };
    
}]).controller("ShowPdfController", ["$scope","$stateParams", function($scope, $stateParams){
    var filename = $stateParams["pdfname"];
    $scope.showModel = {
        filepath:"/wifidocs/"+ filename+".pdf"
    };
}]).controller("PublicityController", ["$scope", "$stateParams", function($scope, $stateParams){
    var domain = $stateParams["domain"];
    $scope.isInit = true;
    $scope.publicityModel = {
        files:[
            {file:"uwifi_whitepaper.pdf", name:"优WiFi白皮书",desc:""}, {file:"uwifi_introduction.pdf", name:"WIFI业务说明",desc:""}
              ],
        peking:[
	{ file: 'UNADJUSTEDNONRAW_thumb_289.jpg',
    name: '活动现场',
    desc: 'UNADJUSTEDNONRAW_thumb_289.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_28a.jpg',
    name: '签到处',
    desc: 'UNADJUSTEDNONRAW_thumb_28a.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_286.jpg',
    name: '中关村创业街',
    desc: 'UNADJUSTEDNONRAW_thumb_286.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_287.jpg',
    name: '布置会场',
    desc: 'UNADJUSTEDNONRAW_thumb_287.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_28b.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_28b.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_292.jpg',
    name: '会前准备',
    desc: 'UNADJUSTEDNONRAW_thumb_292.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_294.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_294.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_29b.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_29b.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_29d.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_29d.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2a1.jpg',
    name: 'COO亲自欢迎',
    desc: 'UNADJUSTEDNONRAW_thumb_2a1.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2a3.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_2a3.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2a4.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_2a4.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2a5.jpg',
    name: '王博士入场',
    desc: 'UNADJUSTEDNONRAW_thumb_2a5.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2a6.jpg',
    name: '宝爷入场',
    desc: 'UNADJUSTEDNONRAW_thumb_2a6.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2a7.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_2a7.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2b0.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_2b0.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2ba.jpg',
    name: '美女主持人',
    desc: 'UNADJUSTEDNONRAW_thumb_2ba.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2bb.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_2bb.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2c0.jpg',
    name: '嘉宾',
    desc: 'UNADJUSTEDNONRAW_thumb_2c0.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2c1.jpg',
    name: '会场讨论',
    desc: 'UNADJUSTEDNONRAW_thumb_2c1.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2c2.jpg',
    name: '现场交流',
    desc: 'UNADJUSTEDNONRAW_thumb_2c2.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2c3.jpg',
    name: '现场交流',
    desc: 'UNADJUSTEDNONRAW_thumb_2c3.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2c5.jpg',
    name: '现场交流',
      desc: 'UNADJUSTEDNONRAW_thumb_2c5.jpg' },
	{ file: 'UNADJUSTEDNONRAW_thumb_2c4.jpg',
    name: '现场交流',
    desc: 'UNADJUSTEDNONRAW_thumb_2c4.jpg' }
        ],
        pekingLiveShow:[
            {file:"http://www.huajiao.com/l/128554347", name:"创业团队见面会-直播回放（花椒）", desc:"北京站"},
            {file:"http://v.youku.com/v_show/id_XMjg1NjI2OTg2MA==.html?sharefrom=iphone#paction", name:"优Wi-Fi 创始人 吴斌 ICO 北京路演（优酷）", desc:"北京站"}
        ],
        domain:domain
    };
    function changeDomain(domanName){
        //$scope.publicityModel.files.length = 0;
        var newDomain = {
            files:[
            ]
        };
        //$scope.publicityModel.files.push.apply($scope.publicityModel.files, newDomain.files);
    }
    changeDomain(domain);
}]).controller("DistributeController", ["$scope","MainRemoteResource","$state", function($scope, MainRemoteResource, $state){
    $scope.distributeModel = {
        action:{},
        display:{},
        data:[],
        loading:0
    };
    var model = $scope.distributeModel;
    model.action.queryUBCAddress = function queryUBCAddress(){
        model.loading ++;
        MainRemoteResource.subscribeResource.queryUBCAddress({}).$promise.then(function(success){
            model.data.length = 0;
            model.data.push.apply(model.data, success.data);
            model.loading --;
        }).catch(function(err){
            model.loading--;
            $state.go("app.subscribelist");
        });
    };
    model.action.queryUBCAddress();
    $scope.completeUBC = function completeUBC(ubcAddress){
        model.loading ++;
        MainRemoteResource.subscribeResource.saveUBCAddress({},{
            address: ubcAddress.address,
            phone: ubcAddress.account,
            status: 'complete'
        }).$promise.then(function(success){
            model.loading --;
            ubcAddress.status= 'complete';
        }).catch(function(err){
            model.loading --;
            console.log(err);
            ubcAddress.status = 'failed';
        });
    };
}])
;
