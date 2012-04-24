$(function () {

  $(document).on("click", function() {
    if ($(".nav a[data-toggle='filter']").hasClass('selected')){
      $(".nav a[data-toggle='filter']").removeClass('selected');
      $(".nav .filter").fadeOut(150);
    }
  });

  if ($("ul.radio li.selected").length <= 0) {
    $("ul.radio li:first-child").addClass("selected");
  }

  $(".nav a[data-toggle='filter']").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();

    $(".nav a[data-toggle='filter'].selected").not(this).removeClass("selected");
    $(this).toggleClass("selected");

    $(".nav a[data-toggle='filter']").not(this).parent().find(".filter").fadeOut(250);
    $(this).parent().find(".filter").fadeToggle(150);
  });

  $(".nav .filter ul.radio li").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).parent().find("li").each(function() {
      var id = $(this).attr('id');
    });

    $(this).parent().find("li").removeClass("selected");
    $(this).addClass("selected");
  });

  $(".nav .filter").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
  });

  /*
   * SPINNER
   */
  var spinner = (function () {
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
    },
    el,
    spin;

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
      $(el).css('opacity', 0);
    }

    function _enable() {
      $(el).css('opacity', 1);
    }

    function _bindEvents() {
      $(window).mousemove( function(e) {
        spinner.positionate(e.pageX + 10,e.pageY + 10);
      });
      $(window).mouseleave( function(e) {
        _disable();
      });
      $(window).mouseenter( function(e) {
        _enable();
      });
    }

    function _unbindEvents() {
      $(window).unbind('mousemove mouseleave mouseenter');
    }

    function _positionate(x,y) {
      $(el).css({'top':y + 'px', 'left': x + 'px'});
    }

    _initialize(options);

    return {
      show: _show,
      hide: _hide,
      positionate: _positionate
    };
  }());

  // Shows the circle, marker or polygon
  function showFeature(view, name, geojson, style){
    var data = null;
    try {
      data = JSON.parse(geojson);
    } catch ( e ) {
      data = geojson;
    }

    // Clone style hash so 'style' is not overwritten
    var overlayStyle = $.extend({}, style);

    view.overlays[name] = new GeoJSON(data, name, overlayStyle || null);

    if (view.overlays[name].type && view.overlays[name].type === "Error"){
      view.enableFilters();
      return;
    }

    var
    polygons = [];
    agencies = [];

    if (view.overlays[name].length){
      for (var i = 0; i < view.overlays[name].length; i++) {
        if (view.overlays[name][i].length){

          polygons = [];
          agencies = [];

          // Draws polygons
          for (var j = 0; j < view.overlays[name][i].length; j++) {
            var overlay = view.overlays[name][i][j][0];
            overlay.setMap(map);
            polygons.push(overlay);

            var projectID = overlay.geojsonProperties.project_id;
            view.coordinates[projectID] = [view.overlays[name][i][0][0].geojsonProperties.centroid_lat, view.overlays[name][i][0][0].geojsonProperties.centroid_lon];
          }

          // Draws circles
          var
          o = view.overlays[name][i][0][0],
          cLatLng = new google.maps.LatLng(o.geojsonProperties.centroid_lat, o.geojsonProperties.centroid_lon),
          rLatLng = new google.maps.LatLng(o.geojsonProperties.radius_point_lat, o.geojsonProperties.radius_point_lon),
          distanceWidget = new RadiusWidget(map, cLatLng, rLatLng, view.overlays[name][i], [o.geojsonProperties.agency_position]);

          view.circles.push(distanceWidget);

        } else {
          view.overlays[name][i].setMap(map);
        }
      }
    }
    //spinner.hide();
    view.enableFilters();
  }

  // Key binding
  $(document).keyup(function(e) {
    if (e.keyCode === 27) {  // esc
      Infowindow.hide();
      $(".nav .filter").fadeOut(150);
    }
  });

  function setupSpinner($el) {
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
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      left: -22,
      top:0
    };

    $el.addClass("loading");

    var
    el      = document.getElementById($el.attr('id')),
    spinner = new Spinner(options).spin(el);

    $(spinner.el).fadeIn(250);
  }

  $(".aside .close").on('click', function(e) {
    e.preventDefault();

    // Unselect the project
    var project = $(this).data('project');
    project.unMarkSelected(true);
    $(this).removeData('project');

    Aside.hide(Timeline.show);
    map.setZoom(previousZoom);
  });

  Aside = (function() {
    _show = function() {
      var projectBefore = $('.aside a.close').data('project');

      if (projectBefore) {
        projectBefore.unMarkSelected(true);
      }

      $(".aside").find("li").css({opacity:0, marginLeft:150});

      $("#map").animate({ right: '352px' }, 250);

      $(".aside").animate({ right: 0 }, 250, function() {
        $(this).removeClass("hidden");
        $(this).find("li").each(function(i, el) {
          $(el).delay(i * 120).animate({marginLeft:0, opacity:1}, 200);
        });
      });
    };

    _hide = function(callback) {
      $("#map").animate({ right: '0' }, 250);

      $(".aside").animate({right:'-400px'}, 250, function() {
        $(this).addClass("hidden");

        if (callback) {
          callback();
        }

      });
    };

    return {
      hide: _hide,
      show: _show
    };
  }());

  Timeline = (function() {
    _show = function() {
      if ($(".aside").hasClass("hidden")) {
        $("#timeline").animate({bottom:19, opacity:1}, 300);
      }
    };

    _hide = function(callback) {

      $("#timeline").animate({bottom:-90, opacity:0}, 250, function() {

        if (callback) {
          callback();
        }

      });
    };

    return {
      hide: _hide,
      show: _show
    };
  }());

  // Slider
  $( "#timeline .slider" ).slider({
    range: true,
    min: 0,
    max: 13*30,
    step: 30,
    values: [0, 500],
    stop: function(event, ui) {

      mapView.startYear = config.START_YEAR;
      mapView.endYear   = config.END_YEAR;

      mapView.removeOverlay("projects");
      mapView.addProjects();

    },
    slide: function( event, ui ) {
      $('#timeline li').removeClass("selected");

      var min = (ui.values[0]/30) + 1;
      var max = (ui.values[1]/30);

      startYear = config.YEARS[min - 1];
      endYear   = config.YEARS[max - 1];

      for (var i = min; i<=max; i++) {
        $('#timeline li:nth-child('+i+')').addClass("selected");
      }
    }});

    // Map
    var mapOptions = {
      zoom:             config.ZOOM,
      minZoom:          config.MINZOOM,
      maxZoom:          config.MAXZOOM,
      center:           new google.maps.LatLng(config.LAT, config.LNG),
      mapTypeId:        google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    function ZoomIn(controlDiv, map) {
      controlDiv.setAttribute('class', 'zoom_in');

      google.maps.event.addDomListener(controlDiv, 'mousedown', function() {
        var zoom = map.getZoom() + 1;
        if (zoom<20) {
          map.setZoom(zoom);
        }
      });
    }

    function ZoomOut(controlDiv, map) {
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
    var zoomInControl = new ZoomIn(zoomInControlDiv, map);
    zoomInControlDiv.index = 1;

    // zoomOut
    var zoomOutControlDiv = document.createElement('DIV');
    overlayID.appendChild(zoomOutControlDiv);
    var zoomOutControl = new ZoomOut(zoomOutControlDiv, map);
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
      user: config.CARTODB_USER
    });

    var Point = CartoDB.CartoDBModel.extend({
      topic_id: function() {
        return this.get('topic_id');
      },
      name: function() {
        return this.get('name');
      },
      lat: function() {
        if (!this.get('location')) {
          return 0;
        }
        return this.get('location').coordinates[1];
      },
      lng: function() {
        if (!this.get('location')) {
          return 0;
        }
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
        this.coordinates = [];
        this.addAgencies();
        this.addAshokas();
        this.addProjects();
      },
      enableFilters: function() {
        if (!disabledFilters) {
          return;
        }

        disabledFilters = false;

        $(".spinner").fadeOut(250, function() {
          $(this).parent().removeClass("loading");
          $(this).remove();
        });

      },
      disableFilters: function() {
        if (disabledFilters) {
          return;
        }
        disabledFilters = true;
      },
      removeOverlay: function(name) {

        if (name === "ashokas" || name === "agencies") {
          this.removeMarkers(name);
        }
        else if (name === 'projects') {
          this.removeProjects(name);
        }

      },
      removeMarkers:function(name) {

        for (var i = 0; i < this.overlays[name].length; i++){
          this.overlays[name][i].hide(true);
        }

        this.enableFilters();
      },
      removeProjects: function(name) {
        if (this.circles.length > 0) { // Remove circles
          for (var i = 0; i < this.circles.length; i++){
            this.circles[i].circle.setMap(null);
          }
        }

        if (this.overlays[name].length){ // Remove projects
          for (i = 0; i < this.overlays[name].length; i++) {
            if (this.overlays[name][i].length) {
              for (var j = 0; j < this.overlays[name][i].length; j++) {
                this.overlays[name][i][j][0].setMap(null);
              }
            }
          }
        }

        this.enableFilters();
      },
      changeOpacity: function(name, opacity) {
        _.each(mapView.overlays[name], function(el) {
          el.changeOpacity(opacity);
        });
      },
      hideOverlay: function(name) {
        _.each(mapView.overlays[name], function(el) {
          el.hide(true);
        });
      },
      addAshokas: function() {
        this.disableFilters();

        if (this.overlays.ashokas) { // If we load the ashokas before, just show them
          _.each(this.overlays.ashokas, function(el,i) {
            if (((solutionFilter === "solutions" && el.properties.solution_id) || solutionFilter === "all") && (_.include(topics, el.properties.topic_id))) {
              el.show(true);
            }
            else {
              el.hide(true);
            }
          });

          this.enableFilters();

        } else { // Load the ashokas
          var query = "SELECT A.the_geom, A.ashoka_url AS agency_url, A.topic_id AS topic_id, A.name, "  +
            "A.solution_id, S1.name solution_name, S1.nexso_url solution_url " +
            "FROM v1_ashoka AS A "  +
            "LEFT JOIN v1_solutions S1 ON (S1.cartodb_id = A.solution_id)" +
            "WHERE A.the_geom IS NOT NULL AND topic_id IS NOT NULL";
          this.addOverlay("ashokas", queries.GET_ASHOKAS);
        }
      },
      addAgencies: function() {
        this.disableFilters();

        if (this.overlays.agencies) { // If we load the agencies before, just show them
          _.each(this.overlays.agencies, function(el,i) {
            if (((solutionFilter === "solutions" && el.properties.solution_id) || solutionFilter === "all") && (_.include(topics, el.properties.topic_id))) {
              el.show(true);
            }
            else {
              el.hide(true);
            }
          });

          this.enableFilters();

        } else { // Load the agencies
          this.addOverlay("agencies", queries.GET_AGENCIES);
        }
      },
      addProjects: function() {
        this.disableFilters();

        if (!this.startYear) {
          this.startYear = config.START_YEAR;
        }

        if (!this.endYear) {
          this.endYear = config.END_YEAR;
        }

        // Build filters by topic & solution
        var topicsCondition   = (topics.length > 0) ? " P.topic_id  IN (" + topics.join(',') + ") AND " : "";
        var solutionCondition = (solutionFilter === 'solutions') ? " P.solution_id IS NOT NULL AND " : "";

        var template = _.template(queries.GET_PROJECTS_QUERY_TEMPLATE);
        var query    = template({ startYear: this.startYear, endYear: this.endYear, topicsCondition: topicsCondition, solutionCondition: solutionCondition });

        this.addOverlay("projects", query, function() { Timeline.show(); });
      },
      addOverlay: function(name, query, callback) {
        var that = this;

        //spinner.show();
        this.disableFilters();

        $.ajax({
          url: config.CARTODB_ENDPOINT,
          data: { q: query, format:"geojson" },
          dataType: 'jsonp',
          success: function(data) {

            if (data.features.length <= 0) {
              that.enableFilters();
              return;
            }

            showFeature(that, name, data, projectsStyle);

            if (callback) {
              callback();
            }

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
        var that = this;

        // Filter by solution & topic
        this.$("#solution-filter li").on("click", function(e) {
          e.preventDefault();
          e.stopPropagation();

          that.filterBySolution($(this));
        });

        this.$("#topic-filter li").on("click", function(e) {
          e.preventDefault();
          e.stopPropagation();

          that.filterByTopic($(this));
        });

        this.$("#type-filter li").on("click", function(e) {
          e.preventDefault();
          e.stopPropagation();

          that.filterByType($(this));
        });
      },
      disable: function(){
        $(".cancel").on("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
        });

        $("ul.filters").addClass("disabled");
        $(".cancel").show();
      },
      enable: function () {
        $("ul.filters").removeClass("disabled");
        $(".cancel").hide();
      },
      filterByTopic: function($el) {
        if (disabledFilters) {
          return;
        }

        mapView.disableFilters();
        setupSpinner($el);

        $el.toggleClass("selected");
        var id = $el.attr('id').trim();
        var c  = parseInt($el.attr('class').replace(/selected/, "").replace("t", "").trim(), 10);

        if ($el.hasClass('selected')) { // Shows the desired overlay
          topics.push(c);
        } else {
          topics = _.without(topics, c);
        }

        if (topics.length > 0) {
          $("#projects").addClass("selected"); // in case it was turned off
          mapView.removeOverlay("projects");
          mapView.addProjects();
          mapView.addAgencies();
          mapView.addAshokas();
        } else {
          mapView.removeOverlay("projects");
          mapView.removeOverlay("agencies");
          mapView.removeOverlay("ashokas");
        }
      },
      filterBySolution: function($el) {

        if (disabledFilters) {
          return;
        }

        mapView.disableFilters();

        setupSpinner($el);

        solutionFilter = $el.attr('id').trim();

        mapView.removeOverlay("projects");
        mapView.addProjects();
        mapView.addAgencies();
        mapView.addAshokas();

      },
      filterByType: function($el) {
        if (disabledFilters) {
          return;
        }

        mapView.disableFilters();
        setupSpinner($el);

        $el.toggleClass("selected");

        var id = $el.attr('id').trim();
        var c  = $el.attr('class').replace(/selected/, "").trim();

        if ($el.hasClass('selected')) { // Shows the desired overlay

          if (id === "agencies") {
            mapView.addAgencies();
          }
          else if (id === "ashokas") {
            mapView.addAshokas();
          }
          else if (id === "projects") {
            mapView.addProjects();
          }

        } else { // Removes the desired overlay

          if (id === "projects" || id === "agencies" || id === "ashokas") {

            if (id === 'projects') {
              Timeline.hide();
            }

            Infowindow.hide();
            mapView.removeOverlay(id);

          }
        }
      }
    });

    filterView = new FilterView({
      el:$('.nav .content')
    });
});
