/**
 * 
 */
(function() {
'use strict';

var ecapp = angular.module('sbEClosing', []);
ecapp.controller('EClosingController', EClosingController);
ecapp.factory('EClosingDataService', EClosingDataService); // fetches data from Zillow

function EClosingDataService($http){

    var service = {};
    
    service.listFiles = function (sessionId, callback) {
        $http({
            url: "/sample-data/GetFileList.json", 
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

    service.getFileDetails = function (sessionId, fileId, section, callback) {
        $http({
            url: "/sample-data/GetFileDetails.json", 
            method: "GET",
            params: { 
                      "SESSION": sessionId, 
                      "file_seq_nbr": fileId,
                      "section": section} 
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
    
    return service;
};

function EClosingController($http, $scope, $location, EClosingDataService, currentValueService){
    
    this.orderByFieldname = "display-id";
    this.isReversed = false;
    
    this.fileList = [];
    this.currentFile = {};
    var ref = this;
    
    this.clearCurrentFile = function(){
        this.currentFile = {
                file: {},
                lender: {},
                borrower: {},
                payoffs: {}
            };    
    }
    
    this.initHome = function(sessionId){
        ref.clearCurrentFile();
        ref.getFileList(sessionId);
    }
    
    this.hasCurrentFile = function (){
        let currentFile = currentValueService.getCurrentFile();
        return currentFile.file && currentFile.file.id;
    }
    
    this.clickSort = function(field){
        if (field === ref.orderByFieldname){
            ref.isReversed = !ref.isReversed;
        } else {
            ref.orderByFieldname = field;
            ref.isReversed = false;
        }
    };
    
    this.clickFile = function(fileId, address, zipcode) {
        currentValueService.setCurrentFile({file: { id: "testvalue" }, "address": address, "zipcode": zipcode});
        $location.path('/details');
    }
    
    this.getFileList = function(sessionId) {
        currentValueService.setCurrentFile({}); // clear-out the last selected file.
        EClosingDataService.listFiles(sessionId, function (err, response){
            if (err){
                console.log("Failed to fetch file list: " + err);
                ref.fileList = [];
            } else {
                ref.fileList = response.data.response.files;
            }
        });
    };

    /**
     * section should be: file | lender | borrower | payoffs | property
     */
    this.getFileDetails = function(sessionId, section) {
        EClosingDataService.getFileDetails(sessionId, fileId, section, function (err, response){
            if (err){
                console.log("Failed to fetch file list: " + err);
                fileList = {};
            } else {
                ref.currentFile[section] = response;
            }
        });
    };
    

};

})();