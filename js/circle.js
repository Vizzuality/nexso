/**
* A radius widget that add a circle to a map and centers on a marker.
*
* @constructor
*/
function RadiusWidget(map, centroidCenter, radiusCenter, polygons) {

  var distance = this.distanceBetweenPoints(centroidCenter, radiusCenter);

  this.circle = new google.maps.Circle({
    strokeColor: "#E79626",
    strokeOpacity: .5,
    strokeWeight: 1,
    fillColor: "#E79626",
    fillOpacity: 0,
    strokeWeight: 1,
    center: centroidCenter,
    radius: distance * 1000,
    geodesic: true,
    polygons: polygons
  });

  google.maps.event.addListener(this.circle, 'click', function(event) {

    var 
    that         = this,
    properties   = this.polygons[0][0].geojsonProperties,
    title        = properties.title,
    approvalDate = properties.approval_date,
    fixedApprovalDate = properties.approval_date,
    moreURL      = properties.external_project_url,
    solutionName = properties.solution_name,
    solutionURL  = properties.solution_url,
    topic_id     = properties.topic_id,
    location     = properties.location_verbatim,
    budget       = properties.budget;
    // agencyName   = properties.agency_name,
    // agencyURL    = properties.agency_url,

    console.log(properties);

    function onHiddenAside() {
      var 
      $asideContent = $(".aside .content"),
      $asideItems = $asideContent.find("ul");

      $asideContent.find(".header h2").html(title);

      var prettyApprovalDate = prettifyDate(approvalDate);
      if (prettyApprovalDate) {
        $asideItems.find("li.approvalDate").show();
        $asideItems.find("li.approvalDate span").text(prettyApprovalDate);
      }
      else $asideItems.find("li.approvalDate").hide();

      if (location) $asideItems.find("li.location span").text(location);
      if (budget)   $asideItems.find("li.budget span").text(accounting.formatMoney(budget));

      if (solutionName && solutionURL) {
        $asideItems.find("li.solution").show();
        $asideItems.find("li.solution a").text(solutionName).attr("href", solutionURL);
      } else $asideItems.find("li.solution").show();

      if (moreURL) {
        $asideItems.find("li.more").show();
        $asideItems.find("li.more a").attr("href", moreURL);
      }
      else $asideItems.find("li.more").hide();

      aside.show();
      Infowindow.hide();

      previousZoom = map.getZoom();
      previousCenter = map.getCenter();

      // Focus on the overlay
      var bounds = that.getBounds();
      map.fitBounds(bounds)
    }

    function onInfowindowClick(e) {
      e.preventDefault();
      Timeline.hide();
      aside.hide(onHiddenAside);
    }

    // Infowindow setup
    Infowindow.setContent(title, "project");
    Infowindow.setSolutionURL(title, moreURL);
    Infowindow.setCallback(onInfowindowClick);
    Infowindow.open(event.latLng);
  });

  google.maps.event.addListener(this.circle, 'mouseover', function(ev) {
    for (var i = 0, length_ = this.polygons.length; i<length_; i++) {
      var polygon = this.polygons[i][0];
      polygon.setOptions(projectsHoverStyle);
    }
    this.setOptions(circleStyleHover);
  });

  google.maps.event.addListener(this.circle, 'mouseout', function(ev) {
    for (var i = 0, length_ = this.polygons.length; i<length_; i++) {
      var polygon = this.polygons[i][0];
      polygon.setOptions(projectsStyle);
    }
    this.setOptions(circleStyle);
  });

  this.circle.setMap(map);

  return this;
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
  return d;
};
