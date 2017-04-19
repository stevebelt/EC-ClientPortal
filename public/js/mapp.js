(function() {
	var mapp = angular.module('MaterialApp', ['ngRoute','ngAria', 'ngAnimate', 'ngMaterial', 'ngSanitize', 'sbUploadDialog', 'sbZillow', 'sbXedit', 'sbAuthentication']);
	
	mapp.config(function($routeProvider) {
	    $routeProvider
	    .when("/datasheet", {
	        templateUrl : "mockup-datasheet.htm"
	    })
	    .when("/messages", {
	        templateUrl : "mockup-messages.htm"
	    })
	    .when("/details", {
	    	templateUrl : "mockup-originator-details.htm"
	    })
	    .when("/fee-calculator", {
	        templateUrl : "mockup-fee-calculator.htm"
	    })
	    .when("/zillow", {
	    	templateUrl : "mockup-zillow.htm",
	    	controller: "ZillowController",
	    	controllerAs: "zillowCtrl"
	    })
	    .when("/xedit", {
	        templateUrl : "mockup-xedit.htm",
	        controller: "XeditController",
	        controllerAs: "EditableRowCtrl"
	    })
	    .otherwise({
	        templateUrl : "mockup-originator-home.htm"
	    });
	});
	
	mapp.controller('MainController', function($scope, $location, AuthenticationService){
	    
		this.currentUser = {"name": "loading...", "id": 10010010 };
		this.bannerColor = "000080";
		
		this.isActive = function( viewLocation ){
            return viewLocation === $location.path();
		}
		var ref = this;
		
		AuthenticationService.login("test", "test", (response) => {
		    if(response.success) {
                AuthenticationService.setCredentials("test", "test");
                ref.currentUser = {"name": response.user.displayName, "id": response.user.id };
                ref.bannerColor = response.company.bannerColor;
                $location.path('/');
            } else {
                $scope.error = response.message;
                $scope.dataLoading = false;
            }
		});
		
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
	        templateUrl: '/pageHeader.htm',
	      	// controller: rankCntrlr,     //Embed a custom controller in the directive
	      	// controllerAs: 'nameCntrl',
	        link: function ($scope, element, attrs) { }
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
            templateUrl: '/datasheet.html',
            // controller: rankCntrlr,     //Embed a custom controller in the directive
            // controllerAs: 'nameCntrl',
            link: function ($scope, element, attrs) { }
        };
    });
    
    mapp.directive('datasheetProperty', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/datasheet-property.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetLender', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/datasheet-lender.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetBorrower', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/datasheet-borrower.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetSeller', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/datasheet-seller.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetFinancial', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/datasheet-financial.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
    mapp.directive('datasheetPayoffs', function () {
        return {
            restrict: 'EA', //E = element, A = attribute, C = class, M = comment
            replace: true,
            templateUrl: '/datasheet-payoffs.html',
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
            templateUrl: '/datasheet-notes.html',
            link: function ($scope, element, attrs) { } //DOM manipulation
        };
	});
    
})();