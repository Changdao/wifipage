"user strict";

var app = angular.module("ico");
app.constant('baseURL', 'http://localhost:10010');
// app.constant('baseURL', '');

app.service("MainRemoteResource", ["$resource","baseURL", function($resource, baseURL) {
    function generateUrl(path){
        return baseURL + path;
    };
    
    return {
        accountResource : $resource(generateUrl("/wifiauth/signup"), {}, {
            signupAccount: {method:"POST", isArray:false}
        })    
    };
}]);

/**
 * upload about
 */
app.service("uploadService", function() {
});
