/**
* A radius widget that add a circle to a map and centers on a marker.
*
* @constructor
*/
function RadiusWidget(map, centroidCenter, radiusCenter, polygons, lines, zIndex) {

  var
    distance = this.distanceBetweenPoints(centroidCenter, radiusCenter),
    self     = this;

  this.specialAgencies = [];

  // Draw circle
  this.circle = new google.maps.Circle({
    parent: self,
    strokeColor: "#E79626",
    strokeOpacity: .6,
    strokeWeight: 1,
    fillColor: "#E79626",
    fillOpacity: 0,
    center: centroidCenter,
    radius: distance * 1000,
    geodesic: true,
    polygons: polygons,
    zIndex:zIndex,
    visible:false
  });

  this.circle.setMap(map);

  return this;
}

RadiusWidget.prototype = new google.maps.MVCObject();

RadiusWidget.prototype.onMouseOver = function(ev) {
  _.each(this.polygons,function(polygon,i) {
    if (polygon[0].disabled) polygon[0].setOptions(projectsDisabledHoverStyle);
    else polygon[0].setOptions(projectsHoverStyle);
  });
  if (this.disabled) this.setOptions(circleDisabledHoverStyle);
  else this.setOptions(circleStyleHover);
};

RadiusWidget.prototype.onMouseOut = function(ev) {
  _.each(this.polygons,function(polygon,i) {
    if (polygon[0].disabled) polygon[0].setOptions(projectsDisabledStyle);
    else polygon[0].setOptions(projectsStyle);
  });

  if (this.disabled) this.setOptions(circleDisabledStyle);
  else this.setOptions(circleStyle);
};

RadiusWidget.prototype.markSelected = function() {
  google.maps.event.clearListeners(this.circle, 'mouseover');
  google.maps.event.clearListeners(this.circle, 'mouseout');

  // Polygons
  _.each(this.circle.polygons,function(polygon,i) {
    polygon[0].setOptions(projectsHoverStyle);
  });

  this.circle.setOptions(circleStyleHover);

  // Lines
  _.each(this.circle.lines,function(line,i) {
    line.setOptions({"visible": true});
  });

  // Hide rest
  this.hideAll();
  filterView.disable();
};

RadiusWidget.prototype.unMarkSelected = function(showAll) {
  google.maps.event.addListener(this.circle, 'mouseover', this.onMouseOver);
  google.maps.event.addListener(this.circle, 'mouseout', this.onMouseOut);

  // Polygons
  _.each(this.circle.polygons,function(polygon, i) {
    polygon[0].setOptions(projectsStyle);
  });

  this.circle.setOptions(circleStyle);

  // Lines
  _.each(this.circle.lines,function(line,i) {
    line.setOptions({"visible": false});
  });

  // Show the rest
  if (showAll) {
    this.showAll();
  }

  filterView.enable();
};

RadiusWidget.prototype.hideAll = function() {
  var that = this;

  // Agencies
  _.each(mapView.overlays["agencies"], function(agency,i) {
    if (that.circle.lines.length > 0 &&
      agency.getPosition().lat() != that.circle.lines[0].getPath().getAt(1).lat() &&
      agency.getPosition().lng() != that.circle.lines[0].getPath().getAt(1).lng()) {
        agency.hide();
      } else {
        that.specialAgencies.push(agency);
        agency.show();
      }
  });

  // Ashokas
  mapView.hideOverlay('ashokas');

  // Projects
  _.each(mapView.circles, function(radiuswidget,i) {

    if (that != radiuswidget) {
      // Polygons
      _.each(radiuswidget.circle.polygons,function(polygon,i) {
        polygon[0].setOptions(projectsDisabledStyle);
        polygon[0].disabled = true;
      });

      radiuswidget.circle.setOptions(circleDisabledStyle);
      radiuswidget.circle.disabled = true;
    }
  });
};

RadiusWidget.prototype.showAll = function() {
  var that = this;

  _.each(this.specialAgencies, function(agency) {
    agency.hide();
  });

  this.specialAgencies = [];

  // Agencies
  mapView.addAgencies();

  // Ashokas
  mapView.addAshokas();

  // Projects
  _.each(mapView.circles, function(radiuswidget,i) {

    if (that != radiuswidget) {
      // Polygons
      _.each(radiuswidget.circle.polygons,function(polygon,i) {
        polygon[0].setOptions(projectsStyle);
        polygon[0].disabled = false;
      });

      radiuswidget.circle.setOptions(circleStyle);
      radiuswidget.circle.disabled = false;

    }
  });
};

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
RadiusWidget.prototype.distanceBetweenPoints = function(p1, p2) {
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

  //if (d < config.MIN_PROJECT_RADIUS) {
    //d = d + config.MIN_PROJECT_RADIUS;
  //}

  return d;
};
