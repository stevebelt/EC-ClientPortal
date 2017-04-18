/**
 * 
 */
(function() {
'use strict';

var xapp = angular.module('ngXedit', ['xeditable']);
xapp.controller('XeditController', XeditController);

function XeditController($http, $scope, $filter){
    $scope.payoffs = [
        {id: 1, type: 'Commission', remitTo: 'Marvin Martial', address: '53 Warner Rd.', city: 'Concord', state: 'NH', zipcode: '03303', accountNumber: '25-11221', balance: 1234.00},
        {id: 2, type: 'Inspection', remitTo: 'Wile E. Coyote', address: '2200 Runner Pkwy.', city: 'Hollywood', state: 'CA', zipcode: '92121', accountNumber: '333-23-9589', balance: 238.57},
        {id: 3, type: 'Title Insurance', remitTo: 'Pete Puma', address: 'Bunny Lane, Suite 300', city: 'Elmer', state: 'WY', zipcode: '72154', accountNumber: '003987', balance: 300.00}
      ]; 
    $scope.states = [
        {value: "AL", text: 'Alabama'},
        {value: "AK", text: 'Alaska'},
        {value: "AZ", text: 'Arizona'},
        {value: "AR", text: 'Arkansas'},
        {value: "CA", text: 'California'},
        {value: "CO", text: 'Colorado'},
        {value: "CT", text: 'Connecticut'},
        {value: "DE", text: 'Delaware'},
        {value: "DC", text: 'District Of Columbia'},
        {value: "FL", text: 'Florida'},
        {value: "GA", text: 'Georgia'},
        {value: "HI", text: 'Hawaii'},
        {value: "ID", text: 'Idaho'},
        {value: "IL", text: 'Illinois'},
        {value: "IN", text: 'Indiana'},
        {value: "IA", text: 'Iowa'},
        {value: "NH", text: 'New Hampshire'},
        {value: "WY", text: 'Wyoming'},
    ];
    
    $scope.types = [
        {value: "Commission", text: "Commission"},
        {value: "Inspection", text: "Inspection"},
        {value: "Title Insurance", text: "Title Insurance"},
        {value: "Home Owners Insurance", text: "Home Owners Insurance"}
    ];
    
      $scope.users = [
            {id: 1, name: 'Wile E. Coyote', status: 1, group: 4, groupName: 'admin', address: '9899 Road Runner Hwy.', city: 'Melville',  state: 'WY', zipcode: '57897', accountNumber: '976757-87', balance: 12535.47},
            {id: 2, name: 'Elmer Fudd', status: undefined, group: 2, groupName: 'vip', address: '2200 Bugs Bunny Circle', city: 'DeWabbit',  state: 'AL', zipcode: '87878', accountNumber: 'CA-23326', balance: 632.98},
            {id: 3, name: 'Pete Puma', status: 3, group: null, address: '99 Coffee Rd.', city: 'Concord',  state: 'NH', zipcode: '03301',  accountNumber: '00033488', balance: 300.00},
        ]; 

      $scope.statuses = [
        {value: 1, text: 'Realtor Commission'},
        {value: 2, text: 'Title Fee'},
        {value: 3, text: 'Inspection'},
        {value: 4, text: 'Misc.'}
      ]; 

      $scope.groups = [];
      $scope.loadGroups = function() {
        return $scope.groups.length ? null : $http.get('/groups').success(function(data) {
          $scope.groups = data;
        });
      };

      $scope.showState = function(user) {
        if(user.state && $scope.states.length) {
          var selected = $filter('filter')($scope.states, {value: user.state});
          return selected.length ? selected[0].value : '';
        } else {
          return user.state || '';
        }
      };

      $scope.showGroup = function(user) {
          if(user.group && $scope.groups.length) {
              var selected = $filter('filter')($scope.groups, {id: user.group});
              return selected.length ? selected[0].text : 'Not set';
          } else {
              return user.groupName || 'Not set';
          }
      };
      
      $scope.showStatus = function(user) {
        var selected = [];
        if(user.status) {
          selected = $filter('filter')($scope.statuses, {value: user.status});
        }
        return selected.length ? selected[0].text : 'Not set';
      };

      $scope.checkName = function(data, id) {
        if (id === 2 && data !== 'awesome') {
          return "Username 2 should be `awesome`";
        }
      };

      $scope.saveUser = function(data, id) {
        //$scope.user not updated yet
        angular.extend(data, {id: id});
        return //$http.post('/saveUser', data);
      };

      // remove user
      $scope.removeUser = function(index) {
        $scope.users.splice(index, 1);
      };

      // add user
      $scope.addUser = function() {
        $scope.inserted = {
          id: $scope.users.length+1,
          name: '',
          status: null,
          group: null 
        };
        $scope.users.push($scope.inserted);
      };


};

})();