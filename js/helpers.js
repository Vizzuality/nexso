var monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

String.prototype.splice = function( idx, rem, s ) {
  return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

// Map styles
var nexsoStyle         = new google.maps.StyledMapType(mapStyles, {name: "Nexso Style"});
var projectsStyle      = { strokeColor: "#E79626", strokeOpacity: .5, strokeWeight: 1, fillColor: "#E79626", fillOpacity: .3 };
var projectsHoverStyle = { strokeColor: "#E79626", strokeOpacity: 1, strokeWeight: 2, fillColor: "#E79626", fillOpacity: .6 };
var mapStyles = [
 {
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
