(function() {
	var mapp = angular.module('MaterialApp', ['ngRoute','ngAria', 'ngAnimate', 'ngMaterial', 'ngSanitize', 'sbUploadDialog', 
	                                            'sbZillow', 'sbXedit', 'sbAuthentication', 'sbEClosing']);
	
	mapp.config(function($routeProvider) {
	    $routeProvider
	    .when("/login", {
	        templateUrl : "/js/modules/authentication/login.htm",
            controller: "LoginController", 
            controllerAs: "loginCtrl"
	    })
	    .when("/datasheet", {
	        templateUrl : "/js/modules/eclosing/mockup-datasheet.htm",
            controller: "EClosingController", 
            controllerAs: "eclosingCtrl"
	    })
	    .when("/messages", {
	        templateUrl : "/js/modules/eclosing/mockup-messages.htm",
            controller: "EClosingController", 
            controllerAs: "eclosingCtrl"
	    })
	    .when("/details", {
	    	templateUrl : "/js/modules/eclosing/mockup-details.htm",
            controller: "EClosingController", 
            controllerAs: "eclosingCtrl"
	    })
	    .when("/fee-calculator", {
	        templateUrl : "/js/modules/eclosing/mockup-fee-calculator.htm"
	    })
	    .when("/zillow", {
	    	templateUrl : "/js/modules/zillow/mockup-zillow.htm",
	    	controller: "ZillowController",
	    	controllerAs: "zillowCtrl"
	    })
	    .when("/xedit", {
	        templateUrl : "mockup-xedit.htm",
	        controller: "XeditController",
	        controllerAs: "EditableRowCtrl"
	    })
	    .otherwise({
	        templateUrl : "/js/modules/eclosing/mockup-file-list.htm",
	        controller: "EClosingController", 
	        controllerAs: "eclosingCtrl",
	    });
	});
	
	mapp.controller('MainController', function($scope, $location, AuthenticationService, currentValueService){
	    
		this.currentUser = {"name": "loading...", "id": 10010010 };
		this.bannerColor = "000080";
		
		this.showNavigation = function(){
		    console.log("path is: '" + $location.path() + "': " + ($location.path() === "/login"));
		    return $location.path() !== "/login";
		}
		
		this.isActive = function( viewLocation ){
		    return viewLocation === $location.path();
		}
		var ref = this;
		
		// static call to Authentication Service
		AuthenticationService.login("SID9879", null, (err, response) => {
		    if(err) {
                $scope.error = response.message;
                $scope.dataLoading = false;
            } else {
                AuthenticationService.setCredentials("test", "test");
                ref.currentUser = {"name": response.data.response.user['display-name'], "id": response.data.response.user.id };
                ref.bannerColor = response.data.response.company['banner-color'];
                $location.path('/');
            }
		});
		
	});
	
	mapp.factory("currentValueService", function(){
	    var saveCurrentFile = {};
	    var saveCurrentUser = {};
	    
	    service = {};
	    
	    service.setCurrentUser = function (currentUser){
	        saveCurrentUser = currentUser;
	    }
	    
	    service.getCurrentUser = function (){
	        return saveCurrentUser;
	    }
	    
	    service.setCurrentFile = function (currentFile){
	        saveCurrentFile = currentFile;
	    }
	    
	    service.getCurrentFile = function (){
	        return saveCurrentFile;
	    }
	    
	    return service;
	    
	});
	
	mapp.config(function($mdIconProvider) {
	    $mdIconProvider
	      .icon("zillow", "/images/zillow_logo.svg", 24);
	});
	
    mapp.directive('header', function(){
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            scope: { currentuser: '=', //@ reads the attribute value, = provides two-way binding, & works with functions
                     bannercolor: '@'
                   },
            templateUrl: '/layout/pageHeader.htm',
            // controller: rankCntrlr,     //Embed a custom controller in the directive
            // controllerAs: 'nameCntrl',
            link: function ($scope, element, attrs) { }
        };
    });
    
    mapp.directive('footer', function(){
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/layout/pageFooter.htm'
        };
    });
    
	mapp.directive('navPills', function(){
	    return {
	        restrict: 'EA', //E = element, A = attribute, C = class, M = comment
	        replace: true,
	        //scope: { currentuser: '='} //@ reads the attribute value, = provides two-way binding, & works with functions
	        templateUrl: '/layout/navigation.htm',
	        controller: "EClosingController",     //Embed a custom controller in the directive
	        controllerAs: "eclosingCtrl",
	        link: function ($scope, element, attrs) { }
	    };
	});
	
	mapp.directive('infoCard', function($compile){
	    return {
	        restrict: 'EA', //E = element, A = attribute, C = class, M = comment
	        replace: true,
	        link: function (scope, element, attrs) {
	            var inner = element.html();
	            var htm = '<div class="info-card-' + attrs.color + '">' +
                            '<h2><i class="fa ' + attrs.icon + '"></i>&nbsp;' + attrs.title + '</h2>' +
                            '<p><strong>' + attrs.heading + '</strong><br/>' +
                                attrs.subHeading + '</p>' + 
                                inner +
                                (attrs.detailsHref ? '<p><a class="btn btn-secondary" href="' + attrs.detailsHref + '" role="button">View details &raquo;</a></p>': '') +
                           '</div>';
	            element.html(htm);
	            $compile(element.contents())(scope);
	        }
	    };
	});
	
	mapp.directive('xeditTable', function(){
	    return {
	        restrict: 'EA', //E = element, A = attribute, C = class, M = comment
	        replace: true,
	        scope: { currentuser: '=' }, //@ reads the attribute value, = provides two-way binding, & works with functions
	        templateUrl : "mockup-xedit.htm",
            controller: "XeditController",
            controllerAs: "EditableRowCtrl",
	        // controller: rankCntrlr,     //Embed a custom controller in the directive
	        // controllerAs: 'nameCntrl',
	        link: function ($scope, element, attrs) { }
	    };
	});
	
    mapp.directive('datasheet', function(){
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            scope: { currentuser: '=' }, //@ reads the attribute value, = provides two-way binding, & works with functions
            templateUrl: '/js/modules/eclosing/datasheet.html',
            // controller: rankCntrlr,     //Embed a custom controller in the directive
            // controllerAs: 'nameCntrl',
            link: function ($scope, element, attrs) { }
        };
    });
    
    mapp.directive('datasheetProperty', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/js/modules/eclosing/datasheet-property.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetLender', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/js/modules/eclosing/datasheet-lender.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetBorrower', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/js/modules/eclosing/datasheet-borrower.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetSeller', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/js/modules/eclosing/datasheet-seller.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetFinancial', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/js/modules/eclosing/datasheet-financial.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetPayoffs', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/js/modules/eclosing/datasheet-payoffs.html',
            controller: function() {
                	this.payoffs = [
                		{
                			type: 'First Mortgage',
                			remitTo: 'Steve B.',
                			remitAddress: '22 Main Street, Suite# 203',
                			remitCity: 'New York',
                			remitState: 'NY',
                			remitZipcode: '02202',
                			accountNumber: '09709870-89',
                			balance: 21457.23
                		},
                		{
                			type: 'Second Mortgage',
                			remitTo: 'Alexander Hamilton',
                			remitAddress: '22 Main Street, Suite# 203',
                			remitCity: 'New York',
                			remitState: 'NY',
                			remitZipcode: '02202',
                			accountNumber: '09709870-89',
                			balance: 11609.87
                		}
                	];
            	},
            controllerAs: 'payoffsCtrl',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetNotes', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/js/modules/eclosing/datasheet-notes.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
})();