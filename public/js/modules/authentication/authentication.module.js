(function() {
    var aapp = angular.module('sbAuthentication', ['ngCookies']);
      
    aapp.controller('LoginController',
        ['$scope', '$rootScope', '$location', 'AuthenticationService', function ($scope, $rootScope, $location, AuthenticationService) {
            // reset login status
            AuthenticationService.ClearCredentials();
      
            $scope.login = function () {
                $scope.dataLoading = true;
                AuthenticationService.login($scope.username, $scope.password, function(err, response) {
                    if(response.data.session.status === 'OK') {
                        AuthenticationService.setCredentials($scope.username, $scope.password);
                        $location.path('/');
                    } else {
                        $scope.error = response.message;
                        $scope.dataLoading = false;
                    }
                });
            };
        }]);

    aapp.factory('AuthenticationService',['Base64', '$http', '$cookieStore', '$rootScope', '$timeout', function (Base64, $http, $cookieStore, $rootScope, $timeout) {

        var service = {};
        
        /* Dummy authentication for testing, uses $timeout to simulate api call
        ----------------------------------------------*/
        service.mocklogin = function (sessionId, callback) {
            $timeout(function(){
                    var response = { 
                            success: true,
                            sessionId: "CQXIDS",
                            user: {
                                id: "193475",
                                username: "rrabbit",
                                firstName: "Roger",
                                lastName: "Rabbit",
                                displayName: "Roger Rabbit, Esq.",
                                userType: "Originator"
                            },
                            company: {
                                id: "96877",
                                name: "Acme Corp",
                                phone: "(603) 555-1983",
                                logoUrl: "/images/acmecorp_logo.png",
                                bannerColor: "#9a280c"
                            }
                        };
                    if(!response.success) {
                        callback('Username or password is incorrect', null);
                    } else {
                        callback(null, response);
                    }
                }, 1000);
        };
        
        /* Use this for real authentication
        ----------------------------------------------*/
        service.login = function (sessionId, password, callback) {
            $http({
                url: "/sample-data/GetCurrentUser.json", 
                method: "GET",
                params: {"SESSION": sessionId} 
            })
                .then(
                        function (response) { // success
                            callback(null, response);
                        },
                        function (err) { // failure
                            callback(err, response);
                        }
                );
        }
         
        service.setCredentials = function (username, password) {
            var authdata = Base64.encode(username + ':' + password);
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: authdata }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };
      
        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };
      
        return service;
    }]);
      
    aapp.factory('Base64', function () {
        var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        return {
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;
                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                        keyStr.charAt(enc1) +
                        keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) +
                        keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);
                return output;
            },
      
            decode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;
                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/\=]/g;
                if (base64test.exec(input)) {
                    window.alert("There were invalid base64 characters in the input text.\n" +
                        "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                        "Expect errors in decoding.");
                }
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                do {
                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
      
                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
      
                } while (i < input.length);
      
                return output;
            }
        };
    });

})();