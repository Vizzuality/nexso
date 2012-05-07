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

      var topic_names = that.properties.topic_names.split("|");
      that.properties.topic_names = topic_names.join('. ') + ".";

      Infowindow.setContent(that.properties);
      Infowindow.open(that.latlng_);
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
