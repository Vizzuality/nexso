/**
* A radius widget that add a circle to a map and centers on a marker.
*
* @constructor
*/
function RadiusWidget(map, centroidCenter, radiusCenter, polygons, lines) {

  var distance = this.distanceBetweenPoints(centroidCenter, radiusCenter)
    , self = this;

  // Draw circle
  this.circle = new google.maps.Circle({
    strokeColor: "#E79626",
    strokeOpacity: 1,
    strokeWeight: 1,
    fillColor: "#E79626",
    fillOpacity: 0,
    center: centroidCenter,
    radius: distance * 1000,
    geodesic: true,
    polygons: polygons
  });


  // Draw line
  var agency_lines = [];
  _.each(lines, function(line,i) {
    
    if (!line) return false;

    var coordinates = $.parseJSON(line).coordinates
      , agency_center = new google.maps.LatLng(coordinates[1], coordinates[0]);


    _.each(polygons, function(polygon, i) {
      var agency_line = new google.maps.Polyline({
        path: [polygon[0].getBounds().getCenter(), agency_center],
        strokeColor: "#1872A1",
        strokeOpacity: 1,
        strokeWeight: 1,
        visible: false
      });

      agency_line.setMap(map);
      agency_lines.push(agency_line);
    });

  });



  // Append lines
  this.circle.setOptions({"lines": agency_lines});

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

    agencyName   = properties.agency_name,
    agencyURL    = properties.agency_url,

    topic_id     = properties.topic_id,
    location     = properties.location_verbatim,
    budget       = properties.budget;

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

      /*if (location) {
        $asideItems.find("li.location").show();
        $asideItems.find("li.location span").text(location);
      } else $asideItems.find("li.location").hide();
      */

      if (budget > 0) {
        $asideItems.find("li.budget").show();
        $asideItems.find("li.budget span").text(accounting.formatMoney(budget));
      } else $asideItems.find("li.budget").hide();

        if (agencyName) {
          $asideItems.find("li.agency").show();
          $asideItems.find("li.agency a").text(agencyName);
          $asideItems.find("li.agency a").on("click", function(e) {
            e.preventDefault();

            if (self.circle.lines.length > 0) {
              var latLng = self.circle.lines[0].getPath().getAt(1);
              map.panTo(latLng);
              map.setZoom(12);

              // _.each(mapView.overlays["agencies"], function(agency,i) {
              //   if (agency.getPosition().lat() != latLng.lat() &&
              //   agency.getPosition().lng() != latLng.lng()) {
              //     agency.show();  
              //   }
              // });


            }
          });

        } else $asideItems.find("li.agency").hide();

      if (solutionURL != null) {
        $asideItems.find("li.solution").show();
        $asideItems.find("li.solution a").text(solutionName).attr("href", solutionURL);
      } else $asideItems.find("li.solution").hide();

      if (moreURL) {
        $asideItems.find("li.more").show();
        $asideItems.find("li.more a").attr("href", moreURL);
      }
      else $asideItems.find("li.more").hide();


      previousZoom   = map.getZoom();
      previousCenter = map.getCenter();

      aside.show();
      Infowindow.hide();

      // Focus on the overlay with the related agency/ies
      var bounds = that.getBounds();

      _.each(self.circle.lines, function(line,i) {
        bounds.extend(line.getPath().getAt(1))
      });

      map.fitBounds(bounds);
      map.panBy(176,0);


      // Make it "selected"
      $('.aside a.close').data('project',self);
      self.markSelected();
    }

    function onInfowindowClick(e) {
      e.preventDefault();
      Timeline.hide();
      aside.hide(onHiddenAside);
    }

    // Infowindow setup
    Infowindow.setContent({name:title, overlayType: "project"});
    Infowindow.setSolutionURL(title, moreURL);
    Infowindow.setCallback(onInfowindowClick);
    Infowindow.open(event.latLng);
  });

  google.maps.event.addListener(this.circle, 'mouseover', this.onMouseOver);
  google.maps.event.addListener(this.circle, 'mouseout', this.onMouseOut);

  this.circle.setMap(map);

  return this;
}


RadiusWidget.prototype = new google.maps.MVCObject();


RadiusWidget.prototype.onMouseOver = function(ev) {
  _.each(this.polygons,function(polygon,i) {
    polygon[0].setOptions(projectsHoverStyle);
  });
  this.setOptions(circleStyleHover);
}


RadiusWidget.prototype.onMouseOut = function(ev) {
  _.each(this.polygons,function(polygon,i) {
    polygon[0].setOptions(projectsStyle);
  });
  this.setOptions(circleStyle);  
}


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
}


RadiusWidget.prototype.unMarkSelected = function() {
  google.maps.event.addListener(this.circle, 'mouseover', this.onMouseOver);
  google.maps.event.addListener(this.circle, 'mouseout', this.onMouseOut);

  // Polygons
  _.each(this.circle.polygons,function(polygon,i) {
    polygon[0].setOptions(projectsStyle);
  });
  this.circle.setOptions(circleStyle);

  // Lines
  _.each(this.circle.lines,function(line,i) {
    line.setOptions({"visible": false});
  });

  // Show rest
  this.showAll();
}


RadiusWidget.prototype.hideAll = function() {
  var that = this;

  // Agencies
  _.each(mapView.overlays["agencies"], function(agency,i) {
    if (agency.getPosition().lat() != that.circle.lines[0].getPath().getAt(1).lat() &&
        agency.getPosition().lng() != that.circle.lines[0].getPath().getAt(1).lng()) {
      agency.hide();  
    }
  });

  // Ashokas
  _.each(mapView.overlays["ashokas"], function(ashoka,i) {
    ashoka.hide();
  });

  // Projects
  _.each(mapView.circles, function(radiuswidget,i) {

    if (that != radiuswidget) {
      // Polygons
      _.each(radiuswidget.circle.polygons,function(polygon,i) {
        polygon[0].setVisible(false);
      });

      radiuswidget.circle.setVisible(false);
    }
  });
}


RadiusWidget.prototype.showAll = function() {
  var that = this;

  // Agencies
  _.each(mapView.overlays["agencies"], function(agency,i) {
    if (agency.getPosition().lat() != that.circle.lines[0].getPath().getAt(1).lat() &&
        agency.getPosition().lng() != that.circle.lines[0].getPath().getAt(1).lng()) {
      agency.show();  
    }
  });

  // Ashokas
  _.each(mapView.overlays["ashokas"], function(ashoka,i) {
    ashoka.show();
  });

  // Projects
  _.each(mapView.circles, function(radiuswidget,i) {

    if (that != radiuswidget) {
      // Polygons
      _.each(radiuswidget.circle.polygons,function(polygon,i) {
        polygon[0].setVisible(true);
      });

      radiuswidget.circle.setVisible(true);
    }
  });
}


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
