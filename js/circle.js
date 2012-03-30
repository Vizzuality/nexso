/**
* A distance widget that will display a circle that can be resized and will
* provide the radius in km.
*
* @param {google.maps.Map} map The map to attach to.
*
* @constructor
*/
function DistanceWidget(map, centroidCenter, radiusCenter) {
  this.set('map', map);
  this.set('position', centroidCenter);
  this.set('zIndex', 0);

  // Create a new radius widget
  var radiusWidget = new RadiusWidget(centroidCenter, radiusCenter);

  // Bind the radiusWidget map to the DistanceWidget map
  radiusWidget.bindTo('map', this);

  // Bind the radiusWidget center to the DistanceWidget position
  radiusWidget.bindTo('center', this, 'position');

  // Bind to the radiusWidgets' distance property
  this.bindTo('distance', radiusWidget);

  // Bind to the radiusWidgets' bounds property
  this.bindTo('bounds', radiusWidget);
}

DistanceWidget.prototype = new google.maps.MVCObject();

/**
* A radius widget that add a circle to a map and centers on a marker.
*
* @constructor
*/
function RadiusWidget(centroidCenter, radiusCenter) {
  var circle = new google.maps.Circle({
    strokeColor: "#E79626",
    strokeOpacity: .5,
    strokeWeight: 1,
    fillColor: "#E79626",
    fillOpacity: 0,
    strokeWeight: 1
  });

  var distance = this.distanceBetweenPoints_(centroidCenter, radiusCenter);

  // Set the distance property value, default to 50km.
  this.set('distance', distance);

  // Bind the RadiusWidget bounds property to the circle bounds property.
  this.bindTo('bounds', circle);

  // Bind the circle center to the RadiusWidget center property
  circle.bindTo('center', this);

  // Bind the circle map to the RadiusWidget map
  circle.bindTo('map', this);

  // Bind the circle radius property to the RadiusWidget radius property
  circle.bindTo('radius', this);
}

RadiusWidget.prototype = new google.maps.MVCObject();

/**
* Update the radius when the distance has changed.
*/
RadiusWidget.prototype.distance_changed = function() {
  this.set('radius', this.get('distance') * 1000);
};


/**
* Calculates the distance between two latlng points in km.
* @see http://www.movable-type.co.uk/scripts/latlong.html
*
* @param {google.maps.LatLng} p1 The first lat lng point.
* @param {google.maps.LatLng} p2 The second lat lng point.
* @return {number} The distance between the two points in km.
* @private
*/
RadiusWidget.prototype.distanceBetweenPoints_ = function(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};
