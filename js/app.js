// Map initialization
function initialize() {
  var myOptions = {
    center: new google.maps.LatLng(-34.397, 150.644),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById("map"),
  myOptions);
}

$(function() {

  $( "#timeline .slider" ).slider({ range: true, min: 0, max: 500, step: 5, values: [ 75, 300 ], slide: function( event, ui ) { } });
  // console.log( "$" + $( "#slider-range" ).slider( "values", 0 ) + " - $" + $( "#slider-range" ).slider( "values", 1 ) );

  // generate CartoDB object linked 
  // to examples account.
  var CartoDB = Backbone.CartoDB({
    user: 'examples' // you should put your account name here
  });

  var Wifi = CartoDB.CartoDBModel.extend({

    lat: function() {
      return this.get('location').coordinates[1];
    },

    lng: function() {
      return this.get('location').coordinates[0];
    }
  });

  var WifiPlaces= CartoDB.CartoDBCollection.extend({
    model: Wifi,
    table: 'nyc_wifi', //public table
    columns: {
      'address': 'address',
      'type': 'type',
      'name': 'name',
      'location': 'the_geom'
    }

  });

  var EntryView = Backbone.View.extend({
    tagName: 'li',
    render: function() {
      var latlon = this.model.lat() + "," + this.model.lng();
      $(this.el).html(
        '<a href="http://maps.google.com/?q=' + latlon + '">' + this.model.get('address') + '</a>'
      );
      return this;
    }
  });

  // some helper view to show how to use the model
  var ListView = Backbone.View.extend({
    events: {
      'click .free': 'filter_free',
      'click .fee': 'filter_fee'
    },

    initialize: function() {
      this.wifi = this.options.wifi;
      this.wifi .bind('reset', this.render, this);
    },

    filter_free: function() {
      console.log('a');
      this.wifi.where = "type = 'Free'"
      this.$('ul').html('loading...');
      this.wifi.fetch();
    },

    filter_fee: function() {
      console.log('b');
      this.wifi.where = "type = 'Fee-based'"
      this.$('ul').html('loading...');
      this.wifi.fetch();
    },

    render: function() {
      var self = this;
      this.$('ul').html('');
      this.wifi.each(function(w) {
        self.$('ul').append(new EntryView({model: w}).render().el);
      });
    }
  });

  var wifi_places = new WifiPlaces();
  var wifi_list = new ListView({
    el:$('#wifi_list'),
    wifi: wifi_places
  });
  wifi_places.fetch();


});
