function NexsoMarker(overlayType, opts, geojsonProperties) {
  this.properties = geojsonProperties;
  this.latlng_ = opts.position;
  this.opts = opts;
  this.offsetVertical_ = -7;
  this.offsetHorizontal_ = -7;
  this.overlayType_ = overlayType;
  this.width_ = 14;
  this.height_ = 14;
  this.div_ = null;
}

NexsoMarker.prototype = new google.maps.OverlayView();

NexsoMarker.prototype.draw = function() {
  var
  that = this,
  div = this.div_;

  if (!div) {
    div = this.div_ = document.createElement('DIV');
    div.className = 'marker';
    div.innerHTML = '<img src="' + this.opts.icon + '" alt="" title="" />';

    google.maps.event.addDomListener(div, 'click', function (ev) {

      if (ev) {
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
        ev.stopPropagation ? ev.stopPropagation() : window.event.cancelBubble = true;
      }

      that.properties.overlayType = that.overlayType_;

      if (that.properties.overlayType == 'project') {
        that.showInfowindow();
      } else {


        var topic_names = that.properties.topic_names;

        if (topic_names) {
          topic_names = _.compact(topic_names.split("|"));

          if (topic_names.length > 0) {
            that.properties.topic_names = topic_names.join('. ');
            that.properties.topic_names += ".";
          }
        }

        Infowindow.setContent(that.properties);
        Infowindow.open(that.latlng_);
      }
    });

    google.maps.event.addDomListener(div, 'mouseover', function (ev) {

      globalZindex++;

      $(this).css('zIndex', globalZindex).animate({
        width: '18px',
        height: '18px',
        marginTop:'-2px',
        marginLeft:'-2px'
      }, 100);
    });

    google.maps.event.addDomListener(div, 'mouseout', function (ev) {

      $(this).animate({
        width: '14px',
        height: '14px',
        marginTop:'0px',
        marginLeft:'0px'
      }, 100);
    });

    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(div);
  }

  this.setPosition();
};

NexsoMarker.prototype.setPosition = function() {
  if (this.div_) {
    var div = this.div_;
    var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (pixPosition) {
      div.style.width = this.width_ + 'px';
      div.style.left = (pixPosition.x + this.offsetHorizontal_) + 'px';
      div.style.top = (pixPosition.y  + this.offsetVertical_) + 'px';
    }
  }
};

NexsoMarker.prototype.markSelected = function() {
  // Polygons
  _.each(this.properties.polygons,function(polygon,i) {
    polygon[0].setOptions(projectsHoverStyle);
  });

  // Lines
  _.each(this.properties.lines,function(line,i) {
    line.setOptions({"visible": true});
  });

  // Hide rest
  this.hideAll();
  filterView.disable();
};

NexsoMarker.prototype.unMarkSelected = function(showAll) {

  // Polygons
  _.each(this.properties.polygons,function(polygon, i) {
    polygon[0].setOptions(projectsStyle);
  });

  // Lines
  _.each(this.properties.lines,function(line,i) {
    line.setOptions({"visible": false});
  });

  // Show the rest
  if (showAll) {
    this.showAll();
  }

  filterView.enable();
};

NexsoMarker.prototype.hideAll = function() {
  var that = this;

  /*// Agencies
  _.each(mapView.overlays["agencies"], function(agency,i) {
  if (that.circle.lines.length > 0 &&
  agency.getPosition().lat() != that.circle.lines[0].getPath().getAt(1).lat() &&
  agency.getPosition().lng() != that.circle.lines[0].getPath().getAt(1).lng()) {
  agency.hide();
  } else {
  that.specialAgencies.push(agency);
  agency.show();
  }
  });*/

  // Ashokas
  mapView.hideOverlay('ashokas');

  // Projects
  _.each(mapView.circles, function(radiuswidget,i) {

    if (that != radiuswidget) {
      // Polygons
      _.each(radiuswidget.properties.polygons,function(polygon,i) {
        polygon[0].setOptions(projectsDisabledStyle);
        polygon[0].disabled = true;
      });

      //radiuswidget.circle.setOptions(circleDisabledStyle);
      //radiuswidget.circle.disabled = true;
    }
  });
};

NexsoMarker.prototype.showAll = function() {
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
      _.each(radiuswidget.properties.polygons,function(polygon,i) {
        polygon[0].setOptions(projectsStyle);
        polygon[0].disabled = false;
      });

      //radiuswidget.circle.setOptions(circleStyle);
      //radiuswidget.circle.disabled = false;

    }
  });
};


NexsoMarker.prototype.hide = function(animate) {
  if (this.div_ && !$(this.div_).hasClass('h')) {
    var div = this.div_;
    if (animate) {
      $(div).animate({
        opacity: 0
      }, {queue: true, duration:500, complete:function(ev){
        div.style.display = "none";
        $(this).addClass('h');
      }});
    } else {
      $(div).css({opacity: 0, display: 'none'});
      $(div).addClass('h');
    }
  }
};

NexsoMarker.prototype.changeOpacity = function(opacity) {
  var div = this.div_;
  $(div).animate({
    opacity: opacity
  }, {queue: true, duration:500});
};

NexsoMarker.prototype.show = function(animate) {
  if (this.div_ && $(this.div_).hasClass('h')) {
    var div = this.div_;
    if (animate) {
      div.style.display = "block";
      div.style.opacity = 0;

      $(div).animate({
        opacity: 0.99
      }, {queue: true, duration:500, complete:function() {
        $(this).removeClass('h');
      }});
    } else {
      $(div).css({opacity: 0.99, display: 'block'});
      $(div).removeClass('h');
    }
  }
};

NexsoMarker.prototype.showContent = function() {
  if (this.div_) {
    google.maps.event.trigger(this.div_, 'click');
  }
};

NexsoMarker.prototype.getPosition = function() {
  return this.latlng_;
};


NexsoMarker.prototype.showInfowindow = function() {
  var that = this;

  if (that.distanceWidget) {
    that.distanceWidget.circle.setMap(null);
    delete that.distanceWidget;
  }

  that.distanceWidget = new RadiusWidget(map, that.properties.cLatLng, that.properties.rLatLng, that.properties.polygons, that.properties.lines, that.properties.zIndex);

  // Draw line
  var agency_lines = [];

  _.each([that.properties.agency_position], function(line,i) {

    if (!line) return false;

    var
    coordinates   = $.parseJSON(line).coordinates,
    agency_center = new google.maps.LatLng(coordinates[1], coordinates[0]);


    _.each(that.properties.polygons, function(polygon, i) {
      var agency_line = new google.maps.Polyline({
        path: [polygon[0].getBounds().getCenter(), agency_center],
        strokeColor: "#1872A1",
        strokeOpacity: .6,
        strokeWeight: 1,
        visible: false
      });

      agency_line.setMap(window.map);
      agency_lines.push(agency_line);
    });

    return true;

  });

  // Append lines
  that.properties.lines = agency_lines;

  var
  properties = that.properties,
  title             = properties.title,
  approvalDate      = properties.approval_date,
  fixedApprovalDate = properties.approval_date,
  moreURL           = config.MIF_URL + properties.nexso_code,

  solutionName      = properties.solution_name,
  solutionURL       = properties.solution_url,

  agencyName        = properties.agency_name,
  agencyURL         = properties.agency_url,

  nexsoCode         = properties.nexso_code,

  topicName         = properties.topic_name,
  location          = properties.location_verbatim,
  budget            = properties.budget;


  function onInfowindowClick(e) {
    if (e) {
      e.preventDefault();
    }

    Timeline.hide();
    Aside.hide(function() {
      that.onHiddenAside(that);
    });
  }

  if (event.autoopen) {
    onInfowindowClick();
  } else {
    // Infowindow setup
    Infowindow.setContent({ name: title, overlayType: "project", agencyName: agencyName, solution_name: solutionName, solution_url: solutionURL });
    Infowindow.setCallback(onInfowindowClick);
    Infowindow.open(that.latlng_);
  }

};

NexsoMarker.prototype.onHiddenAside = function(that) {

  var
  properties        = that.properties,
  title             = properties.title,
  approvalDate      = properties.approval_date,
  fixedApprovalDate = properties.approval_date,
  moreURL           = config.MIF_URL + properties.nexso_code,

  solutionName      = properties.solution_name,
  solutionURL       = properties.solution_url,

  agencyName        = properties.agency_name,
  agencyURL         = properties.agency_url,

  nexsoCode         = properties.nexso_code,

  topicName         = properties.topic_name,
  location          = properties.location_verbatim,
  budget            = properties.budget;

  var
  $asideContent = $(".aside .content"),
  $asideItems = $asideContent.find("ul.data");

  $asideContent.find(".header h2").html(title);

  var prettyApprovalDate = prettifyDate(approvalDate);

  function setItem(itemName, content) {
    var $item = $asideItems.find("li." + itemName);

    if (content !== null && typeof content === 'object') {
      if (content.text !== null && content.url !== null) {
        $item.find("a").text(content.text).attr("href", content.url);
        $item.show();
      } else if (content.text !== null) {
        $item.find("a").text(content.text).attr("href", "#");
        $item.show();
      } else $item.hide();

    } else if (content) {
      $item.find("span").text(content);
      $item.show();
    } else $item.hide();
  }

  var parsedDate = parseDate(approvalDate);

  setItem("approvalDate", prettyApprovalDate);
  setItem("topic", topicName);
  setItem("nexso_code", nexsoCode);
  setItem("location", location);
  setItem("budget", accounting.formatMoney(budget));
  setItem("more", { url: moreURL, text: "External link" });
  setItem("solution", { url: solutionURL, text: solutionName });
  setItem("agency", { url: agencyURL, text: agencyName });

  previousZoom   = window.map.getZoom();
  previousCenter = window.map.getCenter();

  Aside.show("project");
  Infowindow.hide();

  // Focus on the overlay with the related agency/ies
  var bounds = that.distanceWidget.circle.getBounds();

  _.each(that.properties.lines, function(line,i) {
    bounds.extend(line.getPath().getAt(1));
  });

  window.map.fitBounds(bounds);
  window.map.panBy(176, 0);

  if (that.distanceWidget) {
    that.distanceWidget.circle.setMap(null);
    delete that.distanceWidget;
  }

  // Make it "selected"
  var projectBefore = $(".aside a.toggle").data('project');

  if (projectBefore) {
    projectBefore.unMarkSelected();
  }

  $('.aside a.toggle').data('project', that);
  that.markSelected();
}
