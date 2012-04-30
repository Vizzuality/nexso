$(function () {

  var autocompleteSource = [];
  var pane = [];

  $(document).on("click", function() {
    if ($(".nav a[data-toggle='filter']").hasClass('selected')) {
      $(".nav a[data-toggle='filter']").removeClass('selected');
      $(".nav .filter").fadeOut(150);
    }
  });

  $("a[data-click='search']").on("click", function(e) {
    e.preventDefault();
    Aside.show("search");
  });

  $("a[data-click='explore']").on("click", function(e) {
    e.preventDefault();
    startExploring();
  });

  $("a[data-click='visit']").on("click", function(e) {
    e.preventDefault();
    visitPlace();
  });

  $("a[data-click='welcome']").on("click", function(e) {
    e.preventDefault();
    showWelcome();
  });

  var latLngBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(13.390290, -26.332470),
    new google.maps.LatLng(-59.450451, -109.474930));

  $("#addresspicker").geocomplete({
    details: ".input_field",
    detailsAttribute: "data-geo",
    bounds: latLngBounds
  });

  function resetAutocomplete() {
    $("#autocomplete").val('');
    $(".nav .input_field .placeholder").fadeIn(250);
  }

  function bindAutocomplete() {
    $( "#autocomplete" ).autocomplete({
      minLength: 3,
      source: autocompleteSource,

      select: function( event, ui ) {
        Aside.hide();

        resetAutocomplete();

        return false;
      },
      close: function() {
        if ($("#autocomplete").val().length === 0) {
          Aside.hide();
        }
      },
      open: function(event, ui) {

        if (Aside.isHidden()) {
          Aside.show('search');
        } else {
          Aside.change("search");
        }

        //var api = pane["search"].data('jsp');
        //api.reinitialise();

        if ($('.results .jspContainer').length > 0) {
          $('ul.ui-autocomplete').removeAttr('style').hide().appendTo('.results .jspContainer').show();
        } else {
          $('ul.ui-autocomplete').removeAttr('style').hide().appendTo('.results').show();
        }
      }
    }).data( "autocomplete" )._renderItem = function( ul, item ) {

      var $a = $("<a>" + item.label + "</a>");
      $a.on("click", function() { console.log(item); });

      return $( "<li></li>" )
      .data( "item.autocomplete", item )
      .append($a).fadeIn(250)
      .appendTo( ul );
    };

    $("#autocomplete").unbind('blur.autocomplete');
  }


  $("ul.stats li").each(function(i, li) {
    var
    el   = null,
    spin = null,
    $li  = $(li),
    id   = 'spinner_' + $li.attr('class');

    $li.append('<div id="' + id + '" class="spinner"></div>');
    el = document.getElementById(id);
    spin = new Spinner(config.BIG_SPINNER_OPTIONS).spin(el);
    $li.find('.spinner').fadeIn(250);
  });

  function updateCounter(name, count) {
    if ($(".welcome").length > 0) {

      $(".stats li." + name + " span").html(count);

      $(".stats li." + name + " .spinner ").fadeOut(250, function() {
        $(this).remove();
        $(".stats li." + name).removeClass("disabled");
      });
    }
  }

  function showWelcome() {
    Aside.hide();
    resetAutocomplete();

    $(".timeline-cover").animate({opacity:1, bottom: "23px"}, 250);

    $(".welcome, .backdrop").fadeIn(250, function() {

      $(".nav .input_field").fadeOut(300, function() {
        $(".filter-help").animate({ top: "0",  opacity:1 }, 250);
      });

      $(".nav ul.filters").animate({ right:0 }, 250);

      $(".left-side").animate( { left: "0",  opacity:1 }, 400);
      $(".right-side").animate({ left: "0", opacity:1 }, 400);
    });
  }

  function visitPlace() {

    var lat = $(".input_field input#lat").val();
    var lng = $(".input_field input#lng").val();

    if (!lat || !lng) {
      return;
    }

    startExploring(function() {
      var latLng = new google.maps.LatLng(lat, lng);

      map.panTo(latLng);
      map.setZoom(7);

      $("#addresspicker").val("");
      $(".input_field .placeholder").show();

    });
  }

  function startExploring(callback) {

    var // animation callbacks
    removeDiv = function() {
      $(this).remove();
    },
    afterHidingBackdrop = function() {
      //removeDiv();

      if (callback) {
        callback();
      }
    },
    afterHidingRightSide = function() {
      //removeDiv();
      $(".welcome, .backdrop").fadeOut(250, afterHidingBackdrop);
    },
    afterHidingTimeline = function() {
      //removeDiv();
      $(".filter-help").animate({ top: "-100px", opacity:0 }, 250);

      $(".nav ul.filters").animate({ right: "240px" }, 300, function() {
        $(".nav .input_field").fadeIn(250);
      });

      $(".left-side").animate( { left: "-200px", opacity:0 }, 400);
      $(".right-side").animate({ left: "200px",  opacity:0 }, 400, afterHidingRightSide);
      $(".pac-container").fadeOut(250);
    };

    $(".timeline-cover").animate({opacity:0, bottom: -30}, 250, afterHidingTimeline);
  }

  $(".input_field").smartPlaceholder();

  $('#addresspicker').keydown(function (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      visitPlace();
    }
  });

  if ($("ul.radio li.selected").length <= 0) {
    $("ul.radio li:first-child").addClass("selected");
  }

  $(".nav a[data-toggle='filter']").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();

    if ($(".nav ul.filters").hasClass('disabled')) {
      return;
    }

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
    solution_count = 0;

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
          o              = view.overlays[name][i][0][0],
          properties     = o.geojsonProperties,
          cLatLng        = new google.maps.LatLng(properties.centroid_lat, properties.centroid_lon),
          rLatLng        = new google.maps.LatLng(properties.radius_point_lat, properties.radius_point_lon),
          distanceWidget = new RadiusWidget(map, cLatLng, rLatLng, view.overlays[name][i], [properties.agency_position]);

          if (name === 'projects') {
            autocompleteSource.push({ circle: distanceWidget.circle, more: properties, value: properties.title, lat: properties.centroid_lat, lng: properties.centroid_lon});
          }

          view.circles.push(distanceWidget);

          if (name === "projects") {
            solution_count += properties.solution_count;
          }

        } else {
          view.overlays[name][i].setMap(map);
        }
      }
    }
    //spinner.hide();

    if (name === 'projects') {
      updateCounter("solutions", solution_count);
      bindAutocomplete();

    }

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

  Aside = (function() {
    var
    $el    = $(".aside"),
    $close = $(".aside a.close"),
    mode   = 0; // 0 = project; 1 = search

    (function() {
      $close.on('click', function(e) {
        e.preventDefault();

        if (mode === 0) { // project mode
          $(this).data('project').unMarkSelected(true); // Unselect the project
          $(this).removeData('project');
          map.setZoom(previousZoom);
          Aside.hide(Timeline.show);
        } else { // regular mode
          Aside.hide();
          resetAutocomplete();
        }

      });
    })();

    _change = function(what) {

      if (what === 'search' && mode === 0) {
        var callback = function() { Aside.show(what); };
        Aside.hide(callback);
      }

    },
    _show = function(what) {

      if (what === "project") {
        mode = 0;
        $el.find(".search").hide();
        $el.find(".project").show();
      } else {
        mode = 1;
        $el.find(".project").hide();
        $el.find(".search").show();
      }

      var projectBefore = $close.data('project');

      if (projectBefore) {
        projectBefore.unMarkSelected(true);
      }

      $el.find("ul.data li").css({opacity:0, marginLeft:150});

      $("#map").animate({ right: '352px' }, 250);

      $el.animate({ right: 0 }, 250, function() {
        $(this).removeClass("hidden");


        $el.delay(300).find("p").slideDown(350, function() {
          $el.find("ul.data li").each(function(i, li) {
            $(li).delay(i * 100).animate({marginLeft:0, opacity:1}, 200);
          });
        });

        var
          $pane        = $(".scroll-pane-" + what),
          windowHeight = $(window).height(),
          panePosition = $pane.offset().top,
          paneHeight   = windowHeight - panePosition;

        $pane.css("height", paneHeight - 120);

        if (pane[what]) { // if we loaded the pane before
          var api = pane[what].data('jsp');
          api.reinitialise();
          api.scrollTo(0, 0); // scroll to top
        } else {
          pane[what] = $pane;
          pane[what].jScrollPane();
        }

      });
    };

    _hide = function(callback) {
      $("#map").animate({ right: '0' }, 250);

      $el.animate({right:'-400px'}, 250, function() {
        $(this).addClass("hidden");
        $el.find("p").hide();

        if (callback) {
          callback();
        }

      });
    };

    _isHidden = function() {
      return $el.hasClass("hidden");
    };

    return {
      hide: _hide,
      show: _show,
      isHidden: _isHidden,
      change:_change
    };
  }());

  Timeline = (function() {
    _show = function() {
      if (Aside.isHidden()) {
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

        $(".nav .spinner").fadeOut(250, function() {
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

            updateCounter(name, data.features.length);
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
