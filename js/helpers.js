var config = {
    CARTODB_USER:     "nexso2",
    CARTODB_ENDPOINT: "https://nexso2.cartodb.com/api/v2/sql",
    ZOOM:             3,
    MINZOOM:          3,
    MAXZOOM:          16,
    LAT:              3.162456,
    LNG:              -73.476563,
    MONTHNAMES:       ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    YEARS:            [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014],
    DATE_FORMAT:      "yyyy-MM-dd",
    DATE_SUFFIXES:    ["th", "st", "nd", "rd"]
};

config.START_YEAR = config.YEARS[0];
config.END_YEAR   =  config.YEARS[config.YEARS.length - 1];

var // DEFAULTS
    Infowindow,
    Timeline,
    Aside,
    mapView,
    filterView,
    debug            = true,
    previousZoom     = 3,
    topics           = [1, 2, 3, 4, 5, 6],
    solutionFilter   = "all",
    previousCenter,
    disabledFilters  = false,
    globalZindex     = 300;

var // Map styles
    projectsStyle               = { strokeColor: "#E79626", strokeOpacity: 0.4, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0.2 },
    projectsHoverStyle          = { strokeColor: "#E79626", strokeOpacity: 1.0, strokeWeight: 2, fillColor: "#E79626", fillOpacity: 0.7 },
    projectsDisabledStyle       = { strokeColor: "#E79626", strokeOpacity: 0.2, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0.1 },
    projectsDisabledHoverStyle  = { strokeColor: "#E79626", strokeOpacity: 0.2, strokeWeight: 2, fillColor: "#E79626", fillOpacity: 0.2 },
    circleStyleHover            = { strokeColor: "#1872A1", strokeOpacity: 1.0, strokeWeight: 2, fillColor: "#1872A1", fillOpacity: 0.3 },
    circleStyle                 = { strokeColor: "#E79626", strokeOpacity: 1.0, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0.0 },
    circleDisabledStyle         = { strokeColor: "#E79626", strokeOpacity: 0.5, strokeWeight: 1, fillColor: "#E79626", fillOpacity: 0.0 },
    circleDisabledHoverStyle    = { strokeColor: "#1872A1", strokeOpacity: 0.5, strokeWeight: 2, fillColor: "#1872A1", fillOpacity: 0.2 };

var mapStyles = [{
   featureType: "water",
   stylers: [
     { saturation: -11 },
     { lightness: 25 }
   ]
 },{
   featureType: "poi",
   stylers: [
     { saturation: -95 },
     { lightness: 61 }
   ]
 },{
   featureType: "administrative",
   stylers: [
     { saturation: -99 },
     { gamma: 3.51 }
   ]
 },{
   featureType: "road",
   stylers: [
     { visibility: "off" }
   ]
 },{
   featureType: "road",
   stylers: [
     { visibility: "off" }
   ]
 },{
   featureType: "landscape",
   stylers: [
     { saturation: -85 },
     { lightness: 53 }
   ]
 },{
 }
];

var queries = {
  GET_ASHOKAS: "SELECT A.the_geom, A.ashoka_url AS agency_url, A.topic_id AS topic_id, A.name, "  +
            "A.solution_id, S1.name solution_name, S1.nexso_url solution_url " +
            "FROM v1_ashoka AS A "  +
            "LEFT JOIN v1_solutions S1 ON (S1.cartodb_id = A.solution_id)" +
            "WHERE A.the_geom IS NOT NULL AND topic_id IS NOT NULL",

 GET_AGENCIES: "SELECT A.the_geom, A.external_url AS agency_url, A.name AS agency_name, P.solution_id, P.topic_id, " +
            "array_to_string(array(SELECT P.cartodb_id FROM v1_projects AS P WHERE P.agency_id = a.cartodb_id), '|') as projects_ids, " +
            "array_to_string(array(SELECT P.title FROM v1_projects AS P WHERE P.agency_id = a.cartodb_id), '|') as projects_titles " +
            "FROM v1_agencies AS A LEFT JOIN v1_projects AS P ON (A.cartodb_id = P.agency_id) LEFT JOIN v1_projects ON (A.cartodb_id = P.solution_id)",

 GET_PROJECTS_QUERY_TEMPLATE: "WITH qu AS ( " +
   "    WITH hull as ( " +
   "        SELECT  " +
   "            COUNT(S.cartodb_id) AS solution_count, P.cartodb_id AS project_id, P.title, P.approval_date, P.fixed_approval_date, P.external_project_url,  " +
   "            P.location_verbatim, P.topic_id, P.solution_id AS solution_id, P.budget, S.name AS solution_name, S.nexso_url AS solution_url,  " +
   "            A.external_url AS agency_url, A.name AS agency_name, ST_AsGeoJSON(A.the_geom) AS agency_position, " +
   "            ST_Collect(PWA.the_geom) AS the_geom  " +
   "        FROM  " +
   "            v1_projects P LEFT JOIN v1_solutions S ON (P.solution_id = S.cartodb_id) " +
   "            LEFT JOIN v1_agencies A ON (P.agency_id = A.cartodb_id),  " +
   "            v1_project_work_areas AS PWA  " +
   "        WHERE  " +
   "            P.cartodb_id = PWA.project_id AND <%= topicsCondition %> <%= solutionCondition %>" +
   "            EXTRACT(YEAR FROM P.fixed_approval_date) >= <%= startYear %> AND  " +
   "            EXTRACT(YEAR FROM P.fixed_approval_date) <= <%= endYear %> " +
   "        GROUP BY  " +
   "            P.cartodb_id, title, approval_date, fixed_approval_date,  " +
   "            external_project_url, location_verbatim, topic_id, solution_id, budget, A.external_url, A.name, " +
   "            solution_name, solution_url, agency_position" +
   "    )  " +
   "    SELECT *, ST_ConvexHull(the_geom) AS hull_geom FROM hull " +
   " " +
   ")  " +
   "SELECT  " +
   "    solution_count, project_id, title, approval_date, fixed_approval_date, external_project_url,  " +
   "    location_verbatim, topic_id, budget, agency_name, agency_url, the_geom, agency_position, solution_id, solution_name, solution_url,  " +
   "    ST_X(ST_Centroid(hull_geom)) AS centroid_lon,  " +
   "    ST_Y(ST_Centroid(hull_geom)) AS centroid_lat,  " +
   "    ST_X(ST_EndPoint(ST_LongestLine(ST_Centroid(hull_geom),hull_geom))) AS radius_point_lon,  " +
   "    ST_Y(ST_EndPoint(ST_LongestLine(ST_Centroid(hull_geom), hull_geom))) AS radius_point_lat " +
   "FROM qu  " +
   "ORDER BY " +
   "    ST_Area(hull_geom) desc"
};

String.prototype.splice = function( idx, rem, s ) {
  return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

if (typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

var nexsoStyle = new google.maps.StyledMapType(mapStyles, {name: "Nexso Style"});

function isEmpty(str) {
  return !str.match(/\S/g);
}

// Transform a date into something similar to: July 14th, 2006
function prettifyDate(date) {
  var parsedDate = Date.parseExact(date.splice(4, 0, "-" ).splice(7, 0, "-" ), config.DATE_FORMAT);

  if (parsedDate) {

    var
    day      = parsedDate.getDate(),
    month    = parsedDate.getMonth(),
    year     = parsedDate.getFullYear(),
    prefixes = config.DATE_SUFFIXES,
    prefix   = day > 3 ? prefixes[0] : prefixes[day];

    return config.MONTHNAMES[month] + " " + day + prefix + ", " + year;
  }
  return null;
}

google.maps.Polygon.prototype.getBounds = function() {
  var
  bounds = new google.maps.LatLngBounds(),
  paths = this.getPaths(),
  path;

  for (var i = 0; i < paths.getLength(); i++) {
    path = paths.getAt(i);
    for (var ii = 0; ii < path.getLength(); ii++) {
      bounds.extend(path.getAt(ii));
    }
  }
  return bounds;
};
