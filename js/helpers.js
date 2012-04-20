var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

String.prototype.splice = function( idx, rem, s ) {
  return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

// Map styles
var projectsStyle      = { strokeColor: "#E79626", strokeOpacity: .4, strokeWeight: 1, fillColor: "#E79626", fillOpacity: .2 };
var projectsHoverStyle = { strokeColor: "#E79626", strokeOpacity: 1, strokeWeight: 2, fillColor: "#E79626", fillOpacity: .7 };
var circleStyleHover = { strokeColor: "#1872A1", strokeOpacity: 1, strokeWeight: 2, fillColor: "#1872A1", fillOpacity: .3 };
var circleStyle = { strokeColor: "#E79626", strokeOpacity: 1, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0 };
var mapStyles = [{
   featureType: "water",
   stylers: [
     { saturation: -11 },
     { lightness: 25 }
   ]
 },{
   featureType: "poi",
   stylers: [
     { saturation: -95 },
     { lightness: 61 }
   ]
 },{
   featureType: "administrative",
   stylers: [
     { saturation: -99 },
     { gamma: 3.51 }
   ]
 },{
   featureType: "road",
   stylers: [
     { visibility: "off" }
   ]
 },{
   featureType: "road",
   stylers: [
     { visibility: "off" }
   ]
 },{
   featureType: "landscape",
   stylers: [
     { saturation: -85 },
     { lightness: 53 }
   ]
 },{
 }
];

var nexsoStyle = new google.maps.StyledMapType(mapStyles, {name: "Nexso Style"});

// Transform YYYYMMDD date into something similar to: July 14th, 2006
function prettifyDate(date) {
  var parsedDate = Date.parseExact(date.splice(4, 0, "-" ).splice(7, 0, "-" ), "yyyy-MM-dd");

  if (parsedDate) {
    var day = parsedDate.getDate();
    var month = parsedDate.getMonth();
    var year = parsedDate.getFullYear();

    var prefixes = ["th", "st", "nd", "rd"];
    var prefix = day > 3 ? prefixes[0] : prefixes[day];

    return monthNames[month] + " " + day + prefix + ", " + year;
  }
  return null;
}


google.maps.Polygon.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds();
  var paths = this.getPaths();
  var path;        
  for (var i = 0; i < paths.getLength(); i++) {
    path = paths.getAt(i);
    for (var ii = 0; ii < path.getLength(); ii++) {
      bounds.extend(path.getAt(ii));
    }
  }
  return bounds;
}