var // Globals
Infowindow, Timeline, aside;

var config = {
    CARTODB_USER:     "nexso2",
    CARTODB_ENDPOINT: "https://nexso2.cartodb.com/api/v2/sql"
};

var // DEFAULTS
    debug            = true,
    lat              = 3.162456,
    lng              = -73.476563,
    zoom             = 3,
    minZoom          = 3,
    maxZoom          = 16,
    previousZoom     = 3,
    topics           = [1, 2, 3, 4, 5, 6],
    solutionFilter   = "all",
    previousCenter,
    mapView,
    filterView,
    disabledFilters = false,
    globalZindex = 300,
    monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    years      = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
    startYear  = years[0],
    endYear    = years[years.length - 1];

var // Map styles
    projectsStyle               = { strokeColor: "#E79626", strokeOpacity: 0.4, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0.2 },
    projectsHoverStyle          = { strokeColor: "#E79626", strokeOpacity: 1.0, strokeWeight: 2, fillColor: "#E79626", fillOpacity: 0.7 },
    projectsDisabledStyle       = { strokeColor: "#E79626", strokeOpacity: 0.2, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0.1 },
    projectsDisabledHoverStyle  = { strokeColor: "#E79626", strokeOpacity: 0.2, strokeWeight: 2, fillColor: "#E79626", fillOpacity: 0.2 },
    circleStyleHover            = { strokeColor: "#1872A1", strokeOpacity: 1.0, strokeWeight: 2, fillColor: "#1872A1", fillOpacity: 0.3 },
    circleStyle                 = { strokeColor: "#E79626", strokeOpacity: 1.0, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0.0 },
    circleDisabledStyle         = { strokeColor: "#E79626", strokeOpacity: 0.5, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0.0 },
    circleDisabledHoverStyle    = { strokeColor: "#1872A1", strokeOpacity: 0.5, strokeWeight: 2, fillColor: "#1872A1", fillOpacity: 0.2 };

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

String.prototype.splice = function( idx, rem, s ) {
  return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

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
};
