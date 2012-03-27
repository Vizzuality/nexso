/**
* CartoDB Infowindow
* Needed:
*  user_name, table_name, map_canvas, map_key??(no)
**/

function InfoWindow(params) {
  this.latlng_ = new google.maps.LatLng(0,0);
  this.template = params.template;
  this.map_ = params.map;
  this.columns_;
  this.offsetHorizontal_ = -107;
  this.width_ = 304;
  this.setMap(params.map);
  this.params_ = params;
};


InfoWindow.prototype = new google.maps.OverlayView();

InfoWindow.prototype.draw = function() {
  var that = this;

  var div = this.div_;
  if (!div) {
    div = this.div_ = document.createElement('DIV');
    div.className = "infowindow";

    this.template = _.template('<div class="box golden">\
    <div class="content">\
                <div class="header">\
                    <hgroup>\
                    <h4>Executing agency</h4>\
                    <h2><%= name %></h2>\
                    </hgroup>\
                </div>\
                <h4>Solutions</h4>\
                <ul>\
                    <li><a href="#">Irrigation in extreme unfertile terrain</a> </li>\
                    <li><a href="#">Other solution name</a> </li>\
                </ul>\
                <h4>More info</h4>\
                <ul>\
                    <li><a href="#">Agency profile at FOMIN</a> </li>\
                </ul>\
            </div>\
            <a href="#" class="close"></a>\
            <div class="t"></div><div class="b"></div>\
        </div>');

    div.innerHTML = this.template({name:'Loading…'});

    this.bindClose();

    google.maps.event.addDomListener(div, 'click', function (ev) {
      ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    });
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

  this.updateInfowindowPosition(div);
};


InfoWindow.prototype.updateInfowindowPosition = function(div) {
  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
  if (pixPosition) {
    div.style.width = this.width_ + 'px';
    div.style.left = (pixPosition.x - 131) + 'px';
    var actual_height = - $(div).find('.box').height();
    div.style.top = (pixPosition.y + actual_height - 20) + 'px';
  }
}

InfoWindow.prototype.setPosition = function() {
  if (this.div_) { 
    var div = this.div_;
    this.updateInfowindowPosition(div);
    this.show();
  }
}


InfoWindow.prototype.bindClose = function(){
  var that = this;
  $(this.div_).find('.close').click(function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    that.hide();
  });
}

InfoWindow.prototype.setContent = function(name){
  this.div_.innerHTML = this.template({name:name});
  this.bindClose();
} 

InfoWindow.prototype.open = function(latlng){
  var that = this;
  that.latlng_ = latlng;
  //that.moveMaptoOpen();
  that.setPosition();     
} 


InfoWindow.prototype.hide = function() {
  if (this.div_) {
    var div = this.div_;
    $(div).animate({
      top: '+=' + 10 + 'px',
      opacity: 0},
      100, 'swing',
      function () {
        div.style.visibility = "hidden";
      }
    );
  }
}


InfoWindow.prototype.show = function() {
  if (this.div_) {
    this.div_.style.opacity = 0;
    $(this.div_).animate({
      top: '-=' + 10 + 'px',
      opacity: 1},
      250
    );
    this.div_.style.visibility = "visible";
  }
}


InfoWindow.prototype.isVisible = function(marker_id) {
  if (this.div_) {
    var div = this.div_;
    if (div.style.visibility == 'visible') {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}


InfoWindow.prototype.moveMaptoOpen = function() {
  var left = 0;
  var top = 0;
  var div = this.div_;
  var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.latlng_);

  if ((pixPosition.x + this.offsetHorizontal_) < 0) {
    left = (pixPosition.x + this.offsetHorizontal_ - 20);
  }

  if ((pixPosition.x + 180) >= ($('#'+this.params_.cartodb_map_canvas).width())) {
    left = (pixPosition.x + 180 - $('#'+this.params_.cartodb_map_canvas).width());
  }

  if ((pixPosition.y - $(div).height()) < 0) {
    top = (pixPosition.y - $(div).height() - 30);
  }

  this.map_.panBy(left,top);
}
