$(function () {

  var
    autocompleteSource = [],
    pane               = [],
    startYear,
    endYear;

  $(document).keyup(function(e) {
    if (e.keyCode === 27) {  // esc
      Infowindow.hide();
      $(".nav .filter").fadeOut(150);
    }
  });

  $(window).resize(function() {
    resizeScroll();
  });

  $(document).on("click", function() {
    if ($(".nav a[data-toggle='filter']").hasClass('selected')) {
      $(".nav a[data-toggle='filter']").removeClass('selected');
      $(".nav .filter").fadeOut(150);
    }
  });

  $('.addresspicker').keydown(function(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();
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

  $(".nav a[data-click='search']").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    visitPlace();
  });

  $(".welcome a[data-click='search']").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    visitPlace();
  });

  $("a[data-click='explore']").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();

      var
        lat = $("input[data-geo='lat']").val(),
        lng = $("input[data-geo='lng']").val();

      if (!lat || !lng) {
        startExploring();
      } else {

        Aside.hide();
        resetLastSearch();

        startExploring(function() {
          var latLng = new google.maps.LatLng(lat, lng);

          map.panTo(latLng);
          map.setZoom(6);

          searchInBounds(true);
        });
      }
  });

  $("a[data-click='welcome']").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    showWelcome();
  });

  var latLngBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(13.390290, -26.332470),
    new google.maps.LatLng(-59.450451, -109.474930));

    $(".addresspicker").geocomplete({
      details: ".input_field",
      detailsAttribute: "data-geo",
      bounds: latLngBounds
    });

    function resetLastSearch() {
      $(".input_field input.lat").val('');
      $(".input_field input.lng").val('');
    }

    function resetAutocomplete() {
      $(".addresspicker").val('');
      $(".input_field input.lat").val('');
      $(".input_field input.lng").val('');
      $(".input_field .placeholder").fadeIn(250);
    }

    function resizeScroll() {
      var what = "project";

      if ($(".aside").hasClass('search')) {
        what = "search";
      }

      var
        $pane        = $(".scroll-pane-" + what),
        windowHeight = $(window).height(),
        panePosition = $pane.offset().top,
        paneHeight   = windowHeight - panePosition;

      $pane.css("height", paneHeight - 20);

      if (pane[what]) { // if we loaded the pane before
        var api = pane[what].data('jsp');
        api.reinitialise();
        api.scrollTo(0, 0); // scroll to top
      } else {
        pane[what] = $pane;
        pane[what].jScrollPane();
      }

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

    function resetMap() {
      var latLng = new google.maps.LatLng(config.LAT, config.LNG);
      map.panTo(latLng);
      map.setZoom(config.ZOOM);
    }

    function showWelcome() {
      Aside.hide();
      resetAutocomplete();

      unMarkProject();

      resetMap();

      $(".timeline-cover").animate({opacity:1, bottom: "23px"}, 250);

      $(".welcome").fadeIn(250);
      $(".backdrop").fadeIn(250, function() {

        $(".nav .input_field").fadeOut(300, function() {
          $(".filter-help").animate({ top: "0",  opacity:1 }, 250);
        });

        $(".nav ul.filters").animate({ right:0 }, 250);

        $(".left-side").animate( { left: "0",  opacity:1 }, 400);
        $(".right-side").animate({ left: "0", opacity:1 }, 400);
      });
    }

    function visitPlace() {

      var
        lat = $("input[data-geo='lat']").val(),
        lng = $("input[data-geo='lng']").val();

      if (!lat || !lng) {
        return;
      }

      Aside.hide();
      resetLastSearch();

      startExploring(function() {
        var latLng = new google.maps.LatLng(lat, lng);

        map.panTo(latLng);
        map.setZoom(6);

        searchInBounds(true);
      });
    }

    function unMarkProject() {
      var
        $asideToggle = $(".aside .toggle");
        data         = $asideToggle.data('project');

      if (data) {
        data.unMarkSelected(true); // Unselect the project
        $asideToggle.removeData('project');
      }
    }

    function searchInBounds(open) {
      var
        results = [],
        bounds  = map.getBounds();

        unMarkProject();

      _.each(autocompleteSource, function(project) {

        var latLng = new google.maps.LatLng(project.lat, project.lng);

        if (bounds.contains(latLng)) {
          results.push(project);
        }
      });

      $(".results li").each(function(i, p) {
        $(p).remove();
      });

      if (results <= 0) {
        $(".aside").find(".counter").html("No projects found on the screen");
      } else if (results.length > 0) {

        var resultTitle = results.length + " " + (results.length === 1 ? ' project on screen' : ' projects on screen');
        $(".aside").find(".counter").html(resultTitle);

        _.each(results, function(result, i) {
          var $a = $('<a href="#">' + result.value + '</a>');

          what = 'search';

          if (!pane[what]) { // if we loaded the pane before
            pane[what] = $(".scroll-pane-" + what);
            pane[what].jScrollPane();
          }

          var api = pane[what].data('jsp');
          api.getContentPane().append( $("<li></li>").append($a).delay(i*50).animate({opacity:1}));
          api.reinitialise();

          $a.on("click", function(e) {
            e.preventDefault();

            google.maps.event.trigger(result.circle, 'click', {
              autoopen: true,
              latLng: null
            });
            result.circle.parent.markSelected();
          });

        });

        resetLastSearch();

        if (open) {
          Aside.show("search");
        }
      }
    }

    function startExploring(callback) {

      var // animation callbacks
      hideBackdrop = function() {
        if (callback) {
          callback();
        }
      },
      hideRightSide = function() {
        $(".backdrop").fadeOut(250);
        $(".welcome").fadeOut(250, hideBackdrop);
      },
      hideTimeline = function() {
        $(".filter-help").animate({ top: "-100px", opacity:0 }, 250);

        $(".nav ul.filters").animate({ right: "240px" }, 300, function() {
          $(".nav .input_field").fadeIn(250);
        });

        $(".left-side").animate( { left: "-200px", opacity:0 }, 400);
        $(".right-side").animate({ left: "200px",  opacity:0 }, 400, hideRightSide);
        $(".pac-container").fadeOut(250);
      };

      $(".timeline-cover").animate({opacity:0, bottom: -30}, 250, hideTimeline);
    }

    $(".input_field").smartPlaceholder();

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
    function showFeature(view, name, geojson, style) {
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
        solution_count     = 0,
        polygons           = [],
        agencies           = [],
        zIndex             = 0;

        autocompleteSource = [];

      if (view.overlays[name].length) {
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

            zIndex += 10;

            var
              o              = view.overlays[name][i][0][0],
              properties     = o.geojsonProperties,
              cLatLng        = new google.maps.LatLng(properties.centroid_lat, properties.centroid_lon),
              rLatLng        = new google.maps.LatLng(properties.radius_point_lat, properties.radius_point_lon),
              distanceWidget = new RadiusWidget(map, cLatLng, rLatLng, view.overlays[name][i], [properties.agency_position], zIndex);

            if (name === 'projects') {
              autocompleteSource.push({ circle: distanceWidget.circle, more: properties, value: properties.title, lat: properties.centroid_lat, lng: properties.centroid_lon});
              solution_count += properties.solution_count;
            }

            view.circles.push(distanceWidget);

          } else {
            view.overlays[name][i].setMap(map);
          }
        }
      }

      //spinner.hide();

      if (name === 'projects') {
        updateCounter("solutions", solution_count);
      }

      view.enableFilters();
    }

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
      $el     = $(".aside"),
      $toggle = $(".aside a.toggle"),
      mode    = 0; // 0 = project; 1 = search

      (function() {
        $toggle.on('click', function(e) {
          e.preventDefault();

          if ($toggle.hasClass("closed")) {
            searchInBounds();
            Aside.show("search");
          } else {

              if (mode === 0) { // project mode
                unMarkProject();
                map.setZoom(previousZoom);
                Aside.hide(Timeline.show);
              } else { // regular mode
                Aside.hide();
                resetAutocomplete();
              }
            }

        });
      })();

      _show = function(what) {

        if (what === "project") {
          mode = 0;
          resetAutocomplete();
          $el.find(".search").hide();
          $el.find(".project").show();
          $el.removeClass('search');
        } else {
          mode = 1;
          $el.find(".project").hide();
          $el.find(".search").show();
          $el.addClass('search');
        }

        $el.find("ul.data li").css({opacity:0, marginLeft:150});

        $("#map").animate({ right: '352px' }, 250);

        $el.animate({ right: 0 }, 250, function() {

          $toggle.removeClass("closed");

          resizeScroll();

          $el.delay(300).find("p").slideDown(350, function() {

            setTimeout(function() { resizeScroll(); }, $el.find("ul.data > li").length * 100);

            $el.find("ul.data > li").each(function(i, li) {
              $(li).delay(i * 100).animate({ marginLeft:0, opacity:1 }, 200);
            });
          });

        });
      };

      _hide = function(callback) {
        $("#map").animate({ right: '0' }, 250);

        $el.animate({ right:'-330px' }, 250, function() {
          $el.find("p").hide();

          $toggle.addClass("closed");
          $el.removeClass('search'); // this removes the line pattern

          if (callback) {
            callback();
          }

        });
      };

      _isHidden = function() {
        return $toggle.hasClass("closed");
      };

      return {
        hide: _hide,
        show: _show,
        isHidden: _isHidden
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

        var min = (ui.values[0]/30) + 1;
        var max = (ui.values[1]/30);

        startYear = config.YEARS[min - 1];
        endYear   = config.YEARS[max - 1];

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

      google.maps.event.addDomListener(map, 'dragend', function() {
        if (!Aside.isHidden()) {
          searchInBounds();
        }
      });

      google.maps.event.addListener(map, 'zoom_changed', function() {

        if (!Aside.isHidden()) {
          searchInBounds();
        }
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

          var that = this;

          setTimeout(function() {

            mapView.removeOverlay("ashokas");
            $("#ashokas").removeClass("selected");

          }, 500);

        },
        enableFilters: function() {
          if (!disabledFilters) {
            return;
          }

          setTimeout(function() {
            disabledFilters = false;

            $(".nav .spinner").fadeOut(250, function() {
              $(this).parent().removeClass("loading");
              $(this).remove();
            });
          }, 250);

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

          if (this.overlays[name]) {
            for (var i = 0; i < this.overlays[name].length; i++){
              this.overlays[name][i].hide(true);
            }

            this.enableFilters();
          }
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

          if (!visibleOverlays["ashokas"]) {
            return;
          }

          this.disableFilters();

          if (this.overlays.ashokas) { // If we load the ashokas before, just show them
            _.each(this.overlays.ashokas, function(el, i) {

              // The topic come from the db separated by | (ej.: 1|2|3, 1, 3|1)
              var topic_ids = el.properties.topic_ids.split("|");
              if (!_.isArray(topic_ids)) topic_ids = [topic_ids];

              // Ids should be integer
              topic_ids = _.map(topic_ids, function(el) { return parseInt(el, 10); });

              // Intersection. If topicMatches is not null, we have matches
              var topicMatches = _.intersect(topics, topic_ids);

              if (((solutionFilter === "solutions" && el.properties.solution_id) || solutionFilter === "all") && (topicMatches.length > 0)) {
                el.show(true);
              }
              else {
                el.hide(true);
              }
            });

            this.enableFilters();

          } else { // Load the ashokas
            this.addOverlay("ashokas", queries.GET_ASHOKAS);
          }
        },
        addAgencies: function() {

          if (!visibleOverlays["agencies"]) {
            return;
          }

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

          if (!visibleOverlays["projects"]) {
            return;
          }

          if (!startYear) {
            startYear = config.START_YEAR;
          }

          if (!endYear) {
            endYear = config.END_YEAR;
          }

          // Build filters by topic & solution
          var topicsCondition   = (topics.length > 0) ? " P.topic_id  IN (" + topics.join(',') + ") AND " : " P.topic_id = 0 AND ";
          var solutionCondition = (solutionFilter === 'solutions') ? " P.solution_id IS NOT NULL AND " : "";

          var template = _.template(queries.GET_PROJECTS_QUERY_TEMPLATE);
          var query    = template({ startYear: startYear, endYear: endYear, topicsCondition: topicsCondition, solutionCondition: solutionCondition });

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

              if (name === 'projects' && !Aside.isHidden()) {
                searchInBounds();
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
          Infowindow.hide();
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

            mapView.removeOverlay("projects");

            autocompleteSource = [];

            if (!Aside.isHidden()) {
              searchInBounds();
            }

            mapView.addProjects();
            mapView.addAgencies();
            mapView.addAshokas();
          } else {

            autocompleteSource = [];

            if (!Aside.isHidden()) {
              searchInBounds();
            }

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
          Infowindow.hide();

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
          Infowindow.hide();
          setupSpinner($el);

          $el.toggleClass("selected");

          var id = $el.attr('id').trim();
          var c  = $el.attr('class').replace(/selected/, "").trim();

          if ($el.hasClass('selected')) { // Shows the desired overlay

            visibleOverlays[id] = true;

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

            visibleOverlays[id] = false;

            if (id === "projects" || id === "agencies" || id === "ashokas") {

              if (id === 'projects') {
                autocompleteSource = [];

                if (!Aside.isHidden()) {
                  searchInBounds();
                }

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
