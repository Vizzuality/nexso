var debug = true;

var // DEFAULTS
lat          = 3.162456,
lng          = -73.476563,
zoom         = 3,
minZoom      = 3,
maxZoom      = 16,
previousZoom = 3,
topics      = [1,2,3,4,5,6],
previousCenter,
mapView;

var years = [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];
var beginYear = years[0];
var endYear   = years[years.length - 1];

$(function() {

  /*
   * SPINNER
   */
  var spinner = (function() {
    var options = {
          lines: 7, // The number of lines to draw
          length: 0, // The length of each line
          width: 3, // The line thickness
          radius: 4, // The radius of the inner circle
          rotate: 0, // The rotation offset
          color: '#000', // #rgb or #rrggbb
          speed: 1, // Rounds per second
          trail: 55, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 'auto', // Top position relative to parent in px
          left: 'auto' // Left position relative to parent in px
        }
      , el
      , spin;

    function _initialize() {
      el = document.getElementById('minispinner_wrapper');
      spin = new Spinner(options).spin(el);
    }

    function _show() {
      $(el).fadeIn();
      _bindEvents();
    }

    function _hide() {
      $(el).fadeOut(function(){
        _unbindEvents();
      });
    }

    function _disable() {
      $(el).css('opacity',0)
    }

    function _enable() {
      $(el).css('opacity',1)
    }

    function _bindEvents() {
      $(document).mousemove( function(e) {
        spinner.positionate(e.pageX + 10,e.pageY + 10);
      });
      $(document).mouseleave( function(e) {
        _disable();
      });
      $(document).mouseenter( function(e) {
        _enable();
      });
    }

    function _unbindEvents() {
      $(document).unbind('mousemove mouseleave mouseenter');
    }

    function _positionate(x,y) {
      $(el).css({'top':y + 'px', 'left': x + 'px'});
    }

    _initialize(options);

    return {
      show: _show,
      hide: _hide,
      positionate: _positionate
    }
  }());

  
  
  // Key binding
  $(document).keyup(function(e) {
    if (e.keyCode == 27) {  // esc
      Infowindow.hide();
      $(".nav .filter").fadeOut(150);
    } 
  });

  $(".aside .close").on('click', function(e) {
    e.preventDefault();
    aside.hide(Timeline.show);
    map.setZoom(previousZoom);
    map.panTo(previousCenter);
  });

  aside = (function() {
    _show = function() {
      $(".aside").find("li").css({opacity:0, marginLeft:150});
      $(".aside").animate({ right: 0 }, 250, function() {
        $(this).removeClass("hidden");
        $(this).find("li").each(function(i, el) {
          $(el).delay(i * 120).animate({marginLeft:0, opacity:1}, 200);
        });
      });
    }
    _hide = function(callback) {
      $(".aside").animate({right:'-400px'}, 250, function() {
        $(this).addClass("hidden");
        callback && callback();
      });
    }
    return {
      hide: _hide,
      show: _show
    };
  })();

  Timeline = (function() {
    _show = function() {
      if ($(".aside").hasClass("hidden"))
        $("#timeline").animate({bottom:19, opacity:1}, 300);
    }
    _hide = function(callback) {
      $("#timeline").animate({bottom:-19, opacity:0}, 250, function() {
        callback && callback();
      });
    }
    return {
      hide: _hide,
      show: _show
    };
  })();

  // Slider
  $( "#timeline .slider" ).slider({ range: true, min: 0, max: 13*30, step: 30, values: [0, 500], 
    stop: function(event, ui) {

      mapView.beginYear = beginYear;
      mapView.endYear   = endYear;

      mapView.removeOverlay("projects");
      mapView.addProjects();
    },
    slide: function( event, ui ) {
      $('#timeline li').removeClass("selected");

      var min = (ui.values[0]/30) + 1;
      var max = (ui.values[1]/30);

      beginYear = years[min - 1];
      endYear   = years[max - 1];

      for (var i = min; i<=max; i++) {
        $('#timeline li:nth-child('+i+')').addClass("selected");
      }
    }});

    // Map
    var mapOptions = {
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      center: new google.maps.LatLng(lat, lng),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    google.maps.event.addDomListener(map, 'tilesloaded', function() {
      // setTimeout(function() { if ($(".aside").hasClass("hidden")) showTimeline(); }, 700);
    });

    function zoomIn(controlDiv, map) {
      controlDiv.setAttribute('class', 'zoom_in');

      google.maps.event.addDomListener(controlDiv, 'mousedown', function() {
        var zoom = map.getZoom() + 1;
        if (zoom<20) {
          map.setZoom(zoom);
        }
      });
    }

    function zoomOut(controlDiv, map) {
      controlDiv.setAttribute('class', 'zoom_out');

      google.maps.event.addDomListener(controlDiv, 'mousedown', function() {
        var zoom = map.getZoom() - 1;
        if (zoom>2) {
          map.setZoom(zoom);
        }
      });
    }

    var overlayID =  document.getElementById("zoom_controls");

    // zoomIn
    var zoomInControlDiv = document.createElement('DIV');
    overlayID.appendChild(zoomInControlDiv);
    var zoomInControl = new zoomIn(zoomInControlDiv, map);
    zoomInControlDiv.index = 1;

    // zoomOut
    var zoomOutControlDiv = document.createElement('DIV');
    overlayID.appendChild(zoomOutControlDiv);
    var zoomOutControl = new zoomOut(zoomOutControlDiv, map);
    zoomOutControlDiv.index = 2;

    map.mapTypes.set('nexsoStyle', nexsoStyle);
    map.setMapTypeId('nexsoStyle');

    google.maps.event.addListener(map, 'zoom_changed', function() {
      Infowindow.hide();

      $(".stations").css({width:$(document).width(), height:$(document).height(), top:0, left:0});
    });

    // We reuse the same Infowindow 
    Infowindow = new InfoWindow({map:map});

    // generate CartoDB object linked to examples account.
    var CartoDB = Backbone.CartoDB({
      user: 'nexso2' // you should put your account name here
    });

    var Point = CartoDB.CartoDBModel.extend({
      topic_id: function() {
        return this.get('topic_id');
      },
      name: function() {
        return this.get('name');
      },

      lat: function() {
        if (!this.get('location')) return 0;
        return this.get('location').coordinates[1];
      },

      lng: function() {
        if (!this.get('location')) return 0;
        return this.get('location').coordinates[0];
      }
    });

    var Ashoka = CartoDB.CartoDBCollection.extend({
      model: Point,
      table: 'v1_ashoka', //public table
      columns: {
        'name': 'name',
        'location': 'the_geom',
        'topic_id': 'topic_id'
      }
    });

    var Agencies = CartoDB.CartoDBCollection.extend({
      model: Point,
      table: 'v1_agencies', //public table
      columns: {
        'name': 'name',
        'location': 'the_geom'
      }
    });

    // some helper view to show how to use the model
    var MapView = Backbone.View.extend({
      events: {
      },

      initialize: function() {
        this.state = 1;
        this.overlays = [];
        this.circles = [];
        this.addAgencies();
        this.addAshokas();
        this.addProjects();
      },

      removeOverlay: function(name) {
        if (name == "ashokas" || name == "agencies") {
          for (var i = 0; i < this.overlays[name].length; i++){
            this.overlays[name][i].setMap(null);
          }
        } else if (name == 'projects') {

          // Remove circles
          if (this.circles.length > 0) {
            for (var i = 0; i < this.circles.length; i++){
              this.circles[i].circle.setMap(null);
            }
          }

          // Remove projects
          if (this.overlays[name].length){
            for (var i = 0; i < this.overlays[name].length; i++){
              if (this.overlays[name][i].length){
                for (var j = 0; j < this.overlays[name][i].length; j++){
                  this.overlays[name][i][j][0].setMap(null);
                }
              }
            }
          }
        }
      },
      addAshokas: function() {

        var query = "SELECT A.the_geom, A.ashoka_url AS url, A.topic_id AS topic, A.name, " 
        + "S1.name name1, S2.name name2, S3.name name3, "
        + "S1.nexso_url url1, S2.nexso_url url2, S3.nexso_url url3 "
        + "FROM v1_ashoka AS A " 
        + "LEFT JOIN "
        + "    v1_solutions S1 ON (S1.cartodb_id = A.solution_id)"
        + "LEFT JOIN"
        + "    v1_solutions S2 ON (S2.cartodb_id = A.solution1_id)"
        + "LEFT JOIN"
        + "    v1_solutions S3 ON (S3.cartodb_id = A.solution2_id)"
        + "WHERE A.the_geom IS NOT NULL AND topic_id IS NOT NULL";

        this.addOverlay("ashokas", query);

      },
      addAgencies: function() {

        var query = "SELECT the_geom, external_url AS url, name "
        + "FROM v1_agencies "
        + "WHERE the_geom IS NOT NULL";

        this.addOverlay("agencies", query);

      },
      addProjects: function() {

        if (!this.beginYear) this.beginYear = 2002;
        if (!this.endYear)   this.endYear   = 2014;

        // Filters by topic
        var topicsCondition = (topics.length > 0) ? " P.topic_id  IN (" + topics.join(',') + ") AND " : "";

        var query = "WITH qu AS ( "
          +"    WITH hull as ( "
            +"        SELECT  "
            +"            P.title, P.approval_date, P.fixed_approval_date, P.external_project_url,  "
            +"            P.location_verbatim, P.topic_id, P.budget,  "
            +"            ST_Collect(PWA.the_geom) AS the_geom  "
            +"        FROM  "
            +"            v1_projects AS P,  "
            +"            v1_project_work_areas AS PWA  "
            +"        WHERE  "
            +"            P.cartodb_id = PWA.project_id AND  "
            +             topicsCondition
            +"            EXTRACT(YEAR FROM P.fixed_approval_date) >= " + this.beginYear + " AND  "
            +"            EXTRACT(YEAR FROM P.fixed_approval_date) <= " + this.endYear + "  "
            +"        GROUP BY  "
            +"            title, approval_date, fixed_approval_date,  "
            +"            external_project_url, location_verbatim, topic_id, budget "
    +"    )  "
    +"    SELECT *, ST_ConvexHull(the_geom) AS hull_geom FROM hull "
    +" "
    +")  "
    +"SELECT  "
    +"    title, approval_date, fixed_approval_date, external_project_url,  "
    +"    location_verbatim, topic_id, budget, the_geom,  "
    +"    ST_X(ST_Centroid(hull_geom)) AS centroid_lon,  "
    +"    ST_Y(ST_Centroid(hull_geom)) AS centroid_lat,  "
    +"    ST_X(ST_EndPoint(ST_LongestLine(ST_Centroid(hull_geom),hull_geom))) AS radius_point_lon,  "
    +"    ST_Y(ST_EndPoint(ST_LongestLine(ST_Centroid(hull_geom), hull_geom))) AS radius_point_lat "
    +"FROM qu  "
    +"ORDER BY "
    +"    ST_Area(hull_geom) desc";


    this.addOverlay("projects", query, function() { Timeline.show(); });

      },
      addOverlay: function(name, query, callback) {
        var that = this;

        spinner.show();

        $.ajax({
          url: "https://nexso2.cartodb.com/api/v2/sql",
          data: { q: query, format:"geojson" },
          dataType: 'jsonp',
          success: function(data) {

            if (data.features.length <= 0) return; 

            function showFeature(geojson, style){
              try {
                var data = JSON.parse(geojson);
              } catch ( e ) {
                var data = geojson;
              }

              // Clone style hash so 'style' is not overwritten
              var overlayStyle = $.extend({}, style);

              that.overlays[name] = new GeoJSON(data, name, overlayStyle || null);

              if (that.overlays[name].type && that.overlays[name].type == "Error"){
                return;
              }

              var polygons;

              if (that.overlays[name].length){
                for (var i = 0; i < that.overlays[name].length; i++) {
                  if (that.overlays[name][i].length){

                    polygons = [];

                    // Draws polygons
                    for (var j = 0; j < that.overlays[name][i].length; j++) {
                      var overlay = that.overlays[name][i][j][0];
                      overlay.setMap(map);

                      polygons.push(overlay);
                    }

                    // Draws circles
                    var o = that.overlays[name][i][0][0]
                    , cLatLng = new google.maps.LatLng(o.geojsonProperties.centroid_lat, o.geojsonProperties.centroid_lon)
                    , rLatLng = new google.maps.LatLng(o.geojsonProperties.radius_point_lat, o.geojsonProperties.radius_point_lon)
                    , distanceWidget = new RadiusWidget(map, cLatLng, rLatLng, that.overlays[name][i]);

                    that.circles.push(distanceWidget);

                  } else {
                    that.overlays[name][i].setMap(map);
                  }

                  if (that.overlays[name][i].geojsonProperties) {
                    Infowindow.setup(that.overlays[name][i], name);
                  }
                }
              }
              spinner.hide();
            }
            showFeature(data, projectsStyle);
            callback && callback();
          }
        });
      }
    });

    var agencies = new Agencies();
    var ashoka   = new Ashoka();

    mapView = new MapView({
      el:$('#map'),
      ashoka: ashoka,
      agencies: agencies
    });

    // some helper view to show how to use the model
    var FilterView = Backbone.View.extend({
      initialize: function() {

        this.$(".filter.filters ul.ticks li").on("click", function(e) {
          e.stopPropagation();
          $(this).toggleClass("selected");
          var id = $(this).attr('id').trim();
          var c  = parseInt($(this).attr('class').replace(/selected/, "").replace("t", "").trim());

          if ($(this).hasClass('selected')) { // Shows the desired overlay
            topics.push(c);
          } else {
            topics = _.without(topics, c);
          }

          if (topics.length > 0) {
            $(".filter.view ul.ticks li#projects").addClass("selected"); // in case it was turned off
            mapView.removeOverlay("projects");
            mapView.addProjects();
          } else {
            mapView.removeOverlay("projects");
          }

        });

        this.$(".filter.view ul.ticks li").on("click", function(e) {
          e.stopPropagation();

          $(this).toggleClass("selected");

          var id = $(this).attr('id').trim();
          var c  = $(this).attr('class').replace(/selected/, "").trim();

          if ($(this).hasClass('selected')) { // Shows the desired overlay

            if (id == "agencies")       mapView.addAgencies();
            else if (id == "ashokas")   mapView.addAshokas();
            else if (id == "projects")  mapView.addProjects();

          } else { // Removes the desired overlay

            if (id == "projects" || id == "agencies" || id == "ashokas") {

              if (id == 'projects') Timeline.hide(); Infowindow.hide(); 
              mapView.removeOverlay(id);

            } 
          }
        });
      }
    });

    var filterView = new FilterView({
      el:$('.nav .content')
    });
});
