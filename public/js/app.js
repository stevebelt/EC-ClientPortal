(function(){

var app = angular.module('eclosing', ['ngAria', 'ngAnimate', 'ngMaterial', 'ngRoute', 'ui.bootstrap']);

app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "home.htm",
        controller: ($scope) => {
        	$scope.pageName = "Active Files";
        	$scope.closings = [
				{ 
					"fileID": "2007-70",
					"closeDate": "2008-04-01",
					"loanType": "Purchase",
					"address": "15 Warren Street, Boston MA 02101"
				},
				{
					"fileID": "2007-70-C",
					"closeDate": "2007-09-09",
					"loanType": "Second Mortgage",
					"address": "Lot 16 Block 4 PIN 39094, commonly known as 5546 Mt. Acara Drive, Concord NH 03301"
				}
			];
        },
        controllerAs: "homeCtrl"
    })
    .when("/details", {
        templateUrl : "details.htm"
    })
    .when("/documents", {
        templateUrl : "documents.htm"
    })
    .when("/zillow", {
        templateUrl : "zillow.htm"
    });
});

app.directive('appHeader', [function () {
     return {
          restrict: 'EA', //E = element, A = attribute, C = class, M = comment
          replace: true,
          templateUrl: '/header.htm',
          link: function ($scope, element, attrs) { } //DOM manipulation
      };
  }]);

app.directive('sideTab', [function () {
     return {
          restrict: 'EA', //E = element, A = attribute, C = class, M = comment
          replace: true,
          templateUrl: '/sideTab.htm',
          link: function ($scope, element, attrs) { } //DOM manipulation
      };
  }]);

app.directive('appFooter', [function () {
     return {
          restrict: 'EA', //E = element, A = attribute, C = class, M = comment
          replace: true,
          templateUrl: '/footer.htm',
          link: function ($scope, element, attrs) { } //DOM manipulation
      };
  }]);

})();