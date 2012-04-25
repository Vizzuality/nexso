function InfoWindow(params) {
  this.id                = "infowindow-template";
  this.className         = "infowindow";
  this.latlng_           = new google.maps.LatLng(0, 0);
  this.template          = params.template;
  this.map_              = params.map;
  this.columns_          = null;
  this.offsetHorizontal_ = -107;
  this.width_            = 304;
  this.showDuration      = 250;
  this.setMap(params.map);
  this.params_           = params;
}

InfoWindow.prototype = new google.maps.OverlayView();

InfoWindow.prototype.draw = function () {
  var
  that = this,
  div  = this.div_;

  if (!div) {
    div = this.div_ = document.createElement('DIV');
    div.className = this.className;

    var template = $("#" + this.id).html();

    this.template = _.template(template);

    div.innerHTML = this.template({ projects: '', name: 'Loading…', agency_name: '', agency_url: '', overlayType: ''});

    this.bindClose();

    google.maps.event.addDomListener(div, 'dblclick', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    });

    google.maps.event.addDomListener(div, 'mousedown', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
      ev.stopPropagation ? ev.stopPropagation() : window.event.cancelBubble = true;
    });

    google.maps.event.addDomListener(div, 'mouseup', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    });

    google.maps.event.addDomListener(div, 'mousewheel', function (ev) {
      ev.stopPropagation ? ev.stopPropagation() : window.event.cancelBubble = true;
    });

    google.maps.event.addDomListener(div, 'DOMMouseScroll', function (ev) {
      ev.stopPropagation ? ev.stopPropagation() : window.event.cancelBubble = true;
    });

    var panes = this.getPanes();
    panes.floatPane.appendChild(div);
    div.style.opacity = 0;
  }
  this.setPosition();
};

InfoWindow.prototype.setPosition = function (callback) {
  if (this.div_) {
    var div = this.div_;
    var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (pixPosition) {
      div.style.width = this.width_ + 'px';
      div.style.left = (pixPosition.x - 38) + 'px';
      var actual_height = - $(div).find('.box').height();
      div.style.top = (pixPosition.y + actual_height - 10) + 'px';
    }
    callback && callback();
  }
};

InfoWindow.prototype.bindProjects = function () {
  var that = this;

  $(this.div_).find('.project').click(function (ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var lat = parseFloat($(this).attr('data-lat'));
    var lng = parseFloat($(this).attr('data-lng'));

    var latLng = new google.maps.LatLng(lat, lng);

    _.each(mapView.circles, function (rw, i) {

      if (rw.circle.center.lat() === latLng.lat() &&
          rw.circle.center.lng() === latLng.lng()) {
        setTimeout(function () { google.maps.event.trigger(rw.circle, 'click', {latLng: latLng}); }, 500);
      return;
      }
    });
  });
};

InfoWindow.prototype.bindClose = function () {
  var that = this;

  $(this.div_).find('.close').click(function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    that.hide();
  });
};

InfoWindow.prototype.setContent = function (properties) {
  var
  name = properties.name,
  projects = null;

  if (properties.overlayType === 'agencies') {
    var ids    = _.compact(properties.projects_ids.split("|"));
    var titles = _.compact(properties.projects_titles.split("|"));

    projects = _.uniq(titles); //_.zip(ids, titles);

    if (projects) {
      var projectID = ids[0];

      if (mapView.coordinates[projectID]) {
        var lat = mapView.coordinates[projectID][0];
        var lng = mapView.coordinates[projectID][1];
        projects = _.map(projects, function (project) { return "<li><a href='#' class='project' data-lng='" + lng + "' data-lat='" + lat + "'>" + project + "</a></li>"; });
        properties.projects = projects.join("");
      } else {
        properties.projects = "";
      }
    }
  }

  this.div_.innerHTML = this.template(properties);

  if (projects) {
    this.bindProjects();
  }
  this.bindClose();
};

InfoWindow.prototype.setSolutionURL = function (title, url) {
  $(this.div_).find(".solutions li a").html(title);
  $(this.div_).find(".solutions li a").attr("href", url);
};

InfoWindow.prototype.setCallback = function (callback) {
  $(".btn").on('click', callback);
};

InfoWindow.prototype.open = function (latlng) {
  var that = this;

  this.latlng_ = latlng;
  this.moveMaptoOpen();

  this.setPosition(function () {
    that.show();
  });
};

InfoWindow.prototype.hide = function () {
  if (this.div_) {

    var div = this.div_;

    $(div).animate({ top: '+=' + 10 + 'px', opacity: 0 }, 100, 'swing',
                   function () {
                     div.style.visibility = "hidden";
                   }
                  );
  }
};

InfoWindow.prototype.show = function () {
  if (this.div_) {
    this.div_.style.opacity = 0;

    $(this.div_).animate({ top: '-=' + 10 + 'px', opacity: 1 }, this.showDuration);
    this.div_.style.visibility = "visible";
  }
};

InfoWindow.prototype.isVisible = function (marker_id) {
  if (this.div_) {

    var div = this.div_;

    if (div.style.visibility === 'visible') {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

InfoWindow.prototype.moveMaptoOpen = function () {
  var
     left = 0,
     top = 0,
     div = this.div_,
     pixPosition = this.getProjection().fromLatLngToContainerPixel(this.latlng_);

  if ((pixPosition.x + 320) >= ($('#map').width())) {
    left = (pixPosition.x + 320 - $('#map').width());
  }

  if ((pixPosition.y - $(this.div_).find(".box").height()) < 200) {
    top = (pixPosition.y - $(this.div_).find(".box").height() - 130);
  }

  this.map_.panBy(left, top);
};
