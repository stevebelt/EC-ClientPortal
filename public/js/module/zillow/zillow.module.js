/**
 * 
 */
(function() {
'use strict';

var zapp = angular.module('sbZillow', []);
zapp.controller('ZillowController', ZillowController);
zapp.factory('ZillowDataFactory', ZillowDataFactory); // fetches data from Zillow

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        return args[n];
    });
};

var formatNumber = (numberAsString) => {
    return numeral(numberAsString).format('0,0')
};

var monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
function ZillowDataFactory($http){

    var factory = {};
    
    factory.getBasicInfo = function(encAddress, encCityStateZip) {
        return $http.get("/zillow/basic?address={0}&citystatezip={1}&format=json".format(encAddress, encCityStateZip));
    }
    
    factory.getDeepCompInfo = function(zpid) {
        return $http.get("/zillow/comps/{0}?format=json".format(zpid));
    }

    return factory;
};

function ZillowController($http, $scope, ZillowDataFactory){
    
    this.zpid = {};
    this.zillowBasicRaw = {};
    this.zillowCompsRaw = {};
    this.zillowBasic = {};
    this.zillowComps = new Array();
    this.propertyDescription = "";
    
    this.markers = new Array();
    this.currentMarker = null;
    this.currentMarkerIdx = -1;

    var handle = this; // so that functions can access the controller's 'this.' variables.

    this.extractBasics = function( raw ){
        let root = raw.data['SearchResults:searchresults'].response[0].results[0].result[0];
        handle.zillowBasic.street = root.address[0].street[0];
        handle.zillowBasic.city = root.address[0].city[0];
        handle.zillowBasic.state = root.address[0].state[0];
        handle.zillowBasic.useCode = root.useCode[0];
        handle.zillowBasic.finishedSqFt = formatNumber(root.finishedSqFt[0]);
        handle.zillowBasic.yearBuilt = root.yearBuilt[0];
        handle.zillowBasic.estimate = formatNumber(root.zestimate[0].amount[0]['_']);
        handle.zillowBasic.lastSoldDate = new Date(root.lastSoldDate[0]);
        handle.zillowBasic.lastSoldPrice = formatNumber(root.lastSoldPrice[0]['_']);
        handle.zillowBasic.valueChange = formatNumber(root.zestimate[0].valueChange[0]['_']);
        handle.zillowBasic.valueChangeDays = root.zestimate[0].valueChange[0]['$'].duration;
        handle.zillowBasic.taxAssessmentYear = root.taxAssessmentYear[0];
        handle.zillowBasic.taxAssessment = formatNumber(root.taxAssessment[0]);        
    };
    
    this.hoverComp = function( index ) {
        if (handle.currentMarkerIdx === index + 1)
            return;
        if (handle.currentMarker != null)
            handle.currentMarker.setAnimation(null);
        handle.markers[index + 1].setAnimation(google.maps.Animation.BOUNCE);
        handle.currentMarker = handle.markers[index + 1];
        handle.currentMarkerIdx = index + 1;
    }
    
    this.processComps = function( raw ){
        // the comps returns additional info about this property.
        handle.zillowBasic.rentEstimate = formatNumber(raw.data['Comps:comps'].response[0].properties[0].principal[0].rentzestimate[0].amount[0]['_']);
        handle.zillowBasic.rentChange = formatNumber(raw.data['Comps:comps'].response[0].properties[0].principal[0].rentzestimate[0].valueChange[0]['_']);
        handle.zillowBasic.rentChangedInDays = raw.data['Comps:comps'].response[0].properties[0].principal[0].rentzestimate[0].valueChange[0]['$'].duration;
        for (let i = 0; i < raw.data['Comps:comps'].response[0].properties[0].comparables[0].comp.length; i++){
            let comp = {};
            let root = raw.data['Comps:comps'].response[0].properties[0].comparables[0].comp[i];
            comp.street = root.address[0].street[0];
            comp.city = root.address[0].city[0];
            comp.state = root.address[0].state[0];
            comp.finishedSqFt = formatNumber(root.finishedSqFt[0]);
            comp.yearBuilt = root.yearBuilt[0];
            comp.estimate = formatNumber(root.zestimate[0].amount[0]['_']);
            comp.lastSoldDate = new Date(root.lastSoldDate[0]);
            comp.lastSoldPrice = formatNumber(root.lastSoldPrice[0]['_']);
            comp.valueChange = formatNumber(root.zestimate[0].valueChange[0]['_']);
            comp.valueChangeDays = root.zestimate[0].valueChange[0]['$'].duration;
            comp.taxAssessmentYear = root.taxAssessmentYear[0];
            comp.taxAssessment = formatNumber(root.taxAssessment[0]);        
            handle.zillowComps.push(comp);
        }
    };
    
    this.setPropertyDescription = function(){
        handle.propertyDescription = handle.zillowBasic.street + 
        ", " + handle.zillowBasic.city + 
        ", " + handle.zillowBasic.state + 
        " is a " + handle.zillowBasic.useCode + " home" +
        " that contains " + handle.zillowBasic.finishedSqFt + " sq ft " +
        "and was built in " + handle.zillowBasic.yearBuilt + 
        ". " +
        "It contains " + handle.zillowBasic.bedrooms + " bedrooms" +
        " and " + handle.zillowBasic.bathrooms + " bathrooms. " +
        "This home last sold for $" + handle.zillowBasic.lastSoldPrice + " in " + monthName[handle.zillowBasic.lastSoldDate.getMonth()] + " of " + handle.zillowBasic.lastSoldDate.getFullYear() + ".<br/>" + 
        "<br/>" +
        "The Zestimate for this house is $" + handle.zillowBasic.estimate + ", which has changed by $" + handle.zillowBasic.valueChange + " in the last " + handle.zillowBasic.valueChangeDays + " days." + 
        "The Rent Zestimate for this home is $" + handle.zillowBasic.rentEstimate + "/mo, which has increased by $" + handle.zillowBasic.rentChange + "/mo in the last " + handle.zillowBasic.rentChangedInDays + " days." + 
        "<br/><br/>" +
        "The tax assessment in " + handle.zillowBasic.taxAssessmentYear + " was $" + handle.zillowBasic.taxAssessment + ".";
    }
    
    // Begin Google Maps support
    var initMap = function (centerOnLat, centerOnLong){
        var mapOptions = {
                zoom: 12,
                center: new google.maps.LatLng(centerOnLat, centerOnLong),
                mapTypeId: google.maps.MapTypeId.HYBRID
        };
        $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
        handle.markers = [];
        var infoWindow = new google.maps.InfoWindow();
    }
    
    var markerOverlay;
    PriceOverlay.prototype = new google.maps.OverlayView();
    
    var createMarker = function (info, key){
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.lat, info.long),
            title: info.address + ", " + info.city
        });
        
        marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';
        var bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(parseFloat(info.lat), parseFloat(info.long)),
                new google.maps.LatLng(parseFloat(info.lat) + .0014, parseFloat(info.long) + .0028));
        //markerOverlay = new PriceOverlay("$100", bounds, $scope.map);
        if (key < 1){
            marker.setIcon(new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|f0e54e"));
            marker.setAnimation(google.maps.Animation.DROP);
        } else {
           // marker.setLabel( key.toString() );
        }
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });
        handle.markers.push(marker);
    }
    
    function PriceOverlay(txt, bounds, map) {
        this.txt_ = txt;
        this.bounds_ = bounds;
        this.map_ = map;
        this.div_ = null;
        this.setMap(map);
    }
    
    PriceOverlay.prototype.onAdd = function() {
        var div = document.createElement('div');
        div.style.borderStyle = 'none';
        div.style.padding = '4px';
        div.style.borderWidth = '0px';
        div.style.backgroundColor = '#000000';
        div.style.borderRadius = "3px";
        div.style.position = 'absolute';
        var p = document.createElement('p');
        p.style.fontSize = '12px';
        p.style.color = '#ffffff';
        p.textContent = this.txt_;
        div.appendChild(p);
        this.div_ = div;
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
    }
    
    PriceOverlay.prototype.draw = function() {
        var overlayProjection = this.getProjection();
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
        var div = this.div_;
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
        div.style.width = (ne.x - sw.x) + 'px';
        div.style.height = (sw.y - ne.y) + 'px';
    }
    
    PriceOverlay.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
      };
    
    // End Google Maps support

    
    var updateMap = function (property, isBounce){
        var item = {
                address: property.address[0].street[0],
                city: property.address[0].city[0],
                description: "Principal Location",
                lat: property.address[0].latitude[0],
                long: property.address[0].longitude[0]
        };
        createMarker(item, isBounce);
    };
    
    ZillowDataFactory.getBasicInfo(encodeURIComponent("53 Fisherville Rd."), encodeURIComponent("03303")) // get basic info
        .then( function(content) {
            handle.zillowBasicRaw = content;
            handle.extractBasics(content);
            handle.zpid = content.data['SearchResults:searchresults'].response[0].results[0].result[0].zpid;
            initMap(
                    content.data['SearchResults:searchresults'].response[0].results[0].result[0].address[0].latitude[0],
                    content.data['SearchResults:searchresults'].response[0].results[0].result[0].address[0].longitude[0]
            );
            updateMap(content.data['SearchResults:searchresults'].response[0].results[0].result[0], -1);
            ZillowDataFactory.getDeepCompInfo( handle.zpid ) // get comps
                .then( function(content2) {
                    handle.zillowCompsRaw = content2;
                    for (let i = 0; i < content2.data['Comps:comps'].response[0].properties[0].comparables[0].comp.length; i++){
                        updateMap(content2.data['Comps:comps'].response[0].properties[0].comparables[0].comp[i], i + 1);
                    }
                    handle.processComps(content2);
                    handle.setPropertyDescription();
                });
        });

};

})();