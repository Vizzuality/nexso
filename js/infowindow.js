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

    var template = '<div class="box <%= overlayType %>">\
      <div class="content">\
      <div class="header">\
      <div class="hgroup">\
      <% if (overlayType == "project") { %>\
      <h4>Nexso project</h4>\
      <h2><%= name %></h2>\
      <% } else if (overlayType == "ashokas") { %>\
      <h4>Ashoka fellow</h4>\
      <h2><%= name %></h2>\
      <% } else if (overlayType == "agencies") { %>\
      <h4>Executing agency</h4>\
      <h2><%= agency_name %></h2>\
      <% } %>\
      </div>\
      </div>\
      <% if (overlayType == "project") { %>\
      <a href="#" class="btn">View project details</a>\
      <h4>Solution</h4>\
      <ul class="solutions">\
      <li><a href="#" target="_blank">…</a> </li>\
      </ul>\
      <% } else if (overlayType == "ashokas") { %>\
      <% if (solution_name) { %>\
      <h4>Solutions</h4>\
      <ul>\
      <% if (solution_name) { %>\
      <li><a href="<%= solution_url %>" target="_blank"><%= solution_name %></a> </li>\
      <% } %>\
      </ul>\
      <% } %>\
      <% if (agency_url) {  %>\
      <h4>More info</h4>\
      <ul>\
      <li><a href="<%= agency_url %>" target="_blank">Agency profile at FOMIN</a> </li>\
      </ul>\
      <% } %>\
      <% } else { %>\
      <% if (agency_url) {  %>\
      <h4>More info</h4>\
      <ul>\
      <li><a href="<%= agency_url %>" target="_blank">Agency profile at FOMIN</a> </li>\
      </ul>\
      <% } %>\
      <%   if (projects) { %><h4>Projects</h4><ul><%= projects %></ul><% } %>\
      <% } %>\
      </div>\
      <a href="#" class="close"></a>\
      <div class="t"></div><div class="b"></div>\
    </div>';

  this.template = _.template(template);

  div.innerHTML = this.template({name:'Loading…', agency_name: '', agency_url: '', overlayType:''});

  this.bindClose();

  google.maps.event.addDomListener(div, 'click', function (ev) {
    //ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
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
  this.setPosition();
};

InfoWindow.prototype.setPosition = function(callback) {
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
}

InfoWindow.prototype.bindClose = function(){
  var that = this;
  $(this.div_).find('.close').click(function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    that.hide();
  });
}

InfoWindow.prototype.setContent = function(properties){
  var name = properties.name;

  if (properties.overlayType == 'agencies') {
    var ids    = _.compact(properties.projects_ids.split("|"));
    var titles = _.compact(properties.projects_titles.split("|"));
    var geom   = _.compact(properties.projects_geom.split("|"));

    var projects = _.uniq(titles); //_.zip(ids, titles);

    if (projects) {
      var projects = _.map(projects, function(project) { return "<li><a href='#' class='project' data-lng='"+lng+"' data-lat='"+lat+"+'>" + project + "</a></li>" });
      properties.projects = projects.join("");
    }
  }

  this.div_.innerHTML = this.template(properties);

  this.bindClose();
} 

InfoWindow.prototype.setSolutionURL = function(title, url){
  $(this.div_).find(".solutions li a").html(title);
  $(this.div_).find(".solutions li a").attr("href", url);
} 

InfoWindow.prototype.setCallback = function(callback){
  $(".btn").on('click', callback);
} 

InfoWindow.prototype.open = function(latlng){
  var that = this;
  this.latlng_ = latlng;
  this.moveMaptoOpen();
  this.setPosition(function() {
    that.show();
  });     

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

  if ((pixPosition.x + 320) >= ($('#map').width())) {
    left = (pixPosition.x + 320 - $('#map').width());
  }

  if ((pixPosition.y - $(this.div_).find(".box").height()) < 200) {
    top = (pixPosition.y - $(this.div_).find(".box").height() - 130);
  }

  this.map_.panBy(left,top);
}
