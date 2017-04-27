(function() {
'use strict';

var dapp = angular.module('sbUploadDialog', ['ngMaterial', 'angularFileUpload'])
    .controller('UploadController', ['$scope', 'FileUploader', UploadController]);

dapp.controller('FileUploadController', FileUploadController);

function FileUploadController($element, $mdPanel) {
  this._mdPanel = $mdPanel;
  this.displayText = "here is some text";
  this.disableParentScroll = false;
  
  var ref = this;
  
  // setup the drag-n-drop popover
  var el = $element[0];
  el.addEventListener(
      'dragenter',
      function(ev){
          console.log('dragenter!');
          ref.showDialog();
      }
  );
  el.addEventListener(
      'dragleave',
      function(ev){
          console.log('dragleave!');
      }
  );

  this.showDialog = function() {
      var position = this._mdPanel.newPanelPosition()
          .absolute()
          .center();
    
      var config = {
        attachTo: angular.element(document.body),
        controller: PanelDialogCtrl,
        controllerAs: 'ctrl',
        disableParentScroll: this.disableParentScroll,
        templateUrl: '/js/modules/fileupload/upload.dialog.htm',
        hasBackdrop: true,
        panelClass: 'upload-dialog',
        position: position,
        trapFocus: true,
        zIndex: 150,
        clickOutsideToClose: true,
        escapeToClose: true,
        focusOnOpen: true
      };
      this._mdPanel.open(config);
    };

}

function PanelDialogCtrl(mdPanelRef) {
  this._mdPanelRef = mdPanelRef;
}

PanelDialogCtrl.prototype.closeDialog = function() {
  var panelRef = this._mdPanelRef;

  panelRef && panelRef.close().then(function() {
    angular.element(document.querySelector('.dialog-open-button')).focus();
    panelRef.destroy();
  });
};

function UploadController($scope, FileUploader) {
    var uploader = $scope.uploader = new FileUploader({
        url: 'upload.php'
    });
    
    // FILTERS
  
    // a sync filter
    uploader.filters.push({
        name: 'syncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            console.log('syncFilter');
            return this.queue.length < 10;
        }
    });
  
    // an async filter
    uploader.filters.push({
        name: 'asyncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options, deferred) {
            console.log('asyncFilter');
            setTimeout(deferred.resolve, 1e3);
        }
    });

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
    };

    console.info('uploader', uploader);
}

})();