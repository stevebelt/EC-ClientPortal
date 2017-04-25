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
    };

    service.getFileDetails = function (sessionId, fileId, section, callback) {
        $http({
            url: "/sample-data/GetFileDetails-" + section + ".json", 
            method: "GET",
            params: { 
                      "SESSION": sessionId, 
                      "file_seq_nbr": fileId,
                      "section": section
            } 
        })
        .then(
            function (response) { // success
                callback(null, response);
            },
            function (err) { // failure
                callback(err, response);
            }
        );
    };

    service.getMessages = function (sessionId, mailbox, callback) {
        $http({
            url: "/sample-data/GetMessages-" + mailbox + ".json", 
            method: "GET",
            params: { 
                "SESSION": sessionId, 
                "mailbox": mailbox
            } 
        })
        .then(
            function (response) { // success
                callback(null, response);
            },
            function (err) { // failure
                callback(err, response);
            }
        );
    };
    
    return service;
};

function EClosingController($http, $scope, $location, EClosingDataService, currentValueService){

    this.orderByFieldname = "display-id";
    this.isReversed = false;

    this.fileList = [];
    this.currentFile = {};
    
    this.messages = {};
    
    this.details = {};

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
    
    /** *****************************************************
     * Methods related to the Closing-File List ("Home") page.
     ********************************************************/
    
    /**
     * Selects a file which will be used by the other pages.
     * 
     * @param fileId - the internal id of the selected Closing-File.
     * @param address - this should be address1 + address2 suitable for Zillow API lookup.
     * @param zipcode - zipcode which will be passed to Zillow.
     */
    this.clickFile = function(fileId, address, zipcode) {
        currentValueService.setCurrentFile({file: { id: "testvalue" }, "address": address, "zipcode": zipcode});
        $location.path('/details');
    }
    
    /**
     * Uses the EClosingDataService to fetch the list of Closing Files viewable by the current user. 
     * 
     * @param sessionId - the sessionId which will be used by the API Server to identify the currently logged-in user.
     */
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
     * Gets the details for the Details page using the EClosingDataService.
     * 
     * @param sessionId - the sessionId which will be used by the API Server to identify the currently logged-in user.
     * @param section should be: file | lender | borrower | payoffs | property
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
    
    /**
     * Gets messages using the EClosingDataService.
     * 
     * @param sessionId - the sessionId which will be used by the API Server to identify the currently logged-in user.
     * @param section should be: inbox | outbox | unread | all
     */
    this.getMessages = function(sessionId, mailbox) {
        EClosingDataService.getMessages(sessionId, mailbox, function (err, response){
            if (err){
                console.log("Failed to fetch messages: " + err);
                ref.messages = {};
            } else {
                ref.messages = response.data.response;
            }
        });
    };
    
    /**
     * Gets messages using the EClosingDataService.
     * 
     * @param sessionId - the sessionId which will be used by the API Server to identify the currently logged-in user.
     * @param section should be: inbox | outbox | unread | all
     */
    this.getDetails = function (sessionId, fileId, section) {
        EClosingDataService.getFileDetails(sessionId, fileId, section, function (err, response){
            if (err){
                console.log("Failed to fetch " + section + ": " + err);
                ref.details[section] = [];
            } else {
                ref.details[section] = response.data.response[section];
            }
        });
    };
    
};

})();