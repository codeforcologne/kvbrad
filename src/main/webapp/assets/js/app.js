var map, featureList, allBikesearch = [];

$(window).resize(function() {
	sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
	$(document).off("mouseout", ".feature-row", clearHighlight);
});

$(document).on(
		"mouseover",
		".feature-row",
		function(e) {
			highlight.clearLayers().addLayer(
					L.circleMarker(
							[ $(this).attr("lat"), $(this).attr("lng") ],
							highlightStyle));
		});

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
	$("#aboutModal").modal("show");
	$(".navbar-collapse.in").collapse("hide");
	return false;
});

$("#full-extent-btn").click(function() {
	map.fitBounds(allAnalysis.getBounds());
	$(".navbar-collapse.in").collapse("hide");
	return false;
});

$("#legend-btn").click(function() {
	$("#legendModal").modal("show");
	$(".navbar-collapse.in").collapse("hide");
	return false;
});

$("#login-btn").click(function() {
	$("#loginModal").modal("show");
	$(".navbar-collapse.in").collapse("hide");
	return false;
});

$("#list-btn").click(function() {
	$('#sidebar').toggle();
	map.invalidateSize();
	return false;
});

$("#nav-btn").click(function() {
	$(".navbar-collapse").collapse("toggle");
	return false;
});

$("#sidebar-toggle-btn").click(function() {
	$("#sidebar").toggle();
	map.invalidateSize();
	return false;
});

$("#sidebar-hide-btn").click(function() {
	$('#sidebar').hide();
	map.invalidateSize();
});

function sizeLayerControl() {
	$(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
	highlight.clearLayers();
}

/* Basemap Layers */
/* Offene Daten Köln */
var attr = '<h4>Attribution</h4><a href=\'https://github.com/bmcbride/bootleaf\' target=\'_blank\'>Bootleaf</a> by <a href=\'http://bryanmcbride.com\'>bryanmcbride.com</a>, '
		+ 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">, '
		+ 'Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA, '
		+ '<a href=\'http://www.offenedaten-koeln.de/\' target=\'_blank\'>Offene Daten K&ouml;ln</a>, '
		+ '<a href=\'http://getbootstrap.com/\' target=\'_blank\'>Bootstrap 3</a>, <a href=\'http://leafletjs.com/\' target=\'_blank\'>Leaflet</a>, '
		+ '<a href=\'https://www.datatables.net\' target=\'_blank\'>DataTables</a>, '
		+ '<a href="https://github.com/Leaflet/Leaflet.markercluster" target="_blank">leaflet marker cluster plugin</a>, '
		+ '<a href="http://twitter.github.io/typeahead.js/" target="_blank">typeahead.js</a>, '
		+ 'Powered by <a href="https://graphhopper.com/#directions-api">GraphHopper API</a>';
var mapquestOSM = 
	L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png', {
    	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
	
//	L.tileLayer(
//		"http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
//			maxZoom : 18,
//			subdomains : [ "otile1", "otile2", "otile3", "otile4" ],
//			attribution : attr
//		});

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
	stroke : false,
	fillColor : "#000000",
	fillOpacity : 0.0,
	radius : 20
};

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
	spiderfyOnMaxZoom : true,
	showCoverageOnHover : false,
	zoomToBoundsOnClick : true,
	disableClusteringAtZoom : 18
});

function onEachFeatureBike(feature, layer) {
	if (feature.properties) {
		var content = "<table class='table table-striped table-bordered table-condensed'>"
				+ "<tr><th>Name</th><td>"
				+ feature.properties.name
				+ "</td></tr>"
				+ "<tr><th>Number</th><td>"
				+ feature.properties.number
				+ "</td></tr>"
				+ "<tr><th>Timestamps</th><td>"
				+ feature.properties.timestamp
				+ "</td></tr>"
				+ "<tr><th>letzte Nutzung</th><td>"
				+ (feature.properties.unused * -1) + " (Tage)"
				+ "</td></tr>"
				+ "<tr><th>Coordinates</th><td>"
				+ feature.geometry.coordinates
				+ "</td></tr>" + "<table>";
		layer.on({
			click : function(e) {
				$("#feature-title").html(feature.properties.number);
				$("#feature-info").html(content);
				$("#featureModal").modal("show");
				highlight.clearLayers().addLayer(
						L.circleMarker([ feature.geometry.coordinates[1],
								feature.geometry.coordinates[0] ],
								highlightStyle));
			}
		});
		$("#feature-list tbody")
				.append(
						'<tr class="feature-row" id="'
								+ L.stamp(layer)
								+ '" lat="'
								+ feature.geometry.coordinates[1]
								+ '" lng="'
								+ feature.geometry.coordinates[0]
								+ '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/denkmal.png"></td><td class="feature-name">'
								+ layer.feature.properties.kurzbezeichnung
								+ '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
		allBikesearch.push({
			number : layer.feature.properties.number,
			timestamp : layer.feature.properties.timestamp,
			source : "Bikes",
			id : L.stamp(layer),
			lat : layer.feature.geometry.coordinates[1],
			lng : layer.feature.geometry.coordinates[0]
		});
	}
}

var allAnalysisLayer = L.geoJson(null);
var allAnalysis = L.geoJson(null, {
	style : function (feature) {
		return {
	    	color :feature.properties.color,
	    	"opacity": 1.0
		};
	}
});
$.getJSON("/kvbradanalysis/service/data?geojson", function(data) {
	allAnalysis.addData(data);
	allAnalysis.eachLayer(function (layer) {
	  if(layer.feature.properties.index > 0.8) {    
	    layer.setStyle({fillColor :'#d7191c'}) 
	  }
	});
	map.addLayer(allAnalysis);
});

function pointToLayer(feature, latlng) {

    var fillColor = '';
    if (feature.properties.unused > -2) {
        fillColor = '#1a9641';
    } else if (feature.properties.unused > -4) {
    	fillColor = '#fdae61';
    } else if (feature.properties.unused > -7) {
    	fillColor = '#d7191c';
    } else {
    	fillColor = '#777777';
    }

    return L.circleMarker(latlng, {
        radius : 10,
        fillColor : fillColor,
        color : '#000',
        weight : 1,
        opacity : 0.5,
        fillOpacity : 0.5
    });
}

var allbikeslatestpositionLayer = L.geoJson(null);
var allbikeslatestposition = L.geoJson(null, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeatureBike
});
$.getJSON("/kvbradpositions/service/allbikeslatestposition?geojson", function(data) {
	allbikeslatestposition.addData(data);
	map.addLayer(allbikeslatestposition);
});


map = L.map("map", {
	zoom : 15,
	center : [ 50.94135, 6.95819 ],
	layers : [ mapquestOSM, markerClusters, highlight ],
	zoomControl : false,
	attributionControl : false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
	if (e.layer === allAnalysisLayer) {
		markerClusters.addLayer(allAnalysis);
	}
});

map.on("overlayremove", function(e) {
	if (e.layer === allAnalysisLayer) {
		markerClusters.removeLayer(allAnalysis);
	}
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function(e) {
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
	highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
	$.each(map._layers, function(index, layer) {
		if (layer.getAttribution) {
			$("#attribution").html((layer.getAttribution()));
		}
	});
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
	position : "bottomright"
});
attributionControl.onAdd = function(map) {
	var div = L.DomUtil.create("div", "leaflet-control-attribution");
	div.innerHTML = "<span class='hidden-xs'>Developed by <a href='https://github.com/codeforcologne/kvbrad' target='_blank'>Wolfram Eberius</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
	return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
	position : "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control
		.locate(
				{
					position : "bottomright",
					drawCircle : true,
					follow : true,
					setView : true,
					keepCurrentZoomLevel : true,
					markerStyle : {
						weight : 1,
						opacity : 0.8,
						fillOpacity : 0.8
					},
					circleStyle : {
						weight : 1,
						clickable : false
					},
					icon : "fa fa-location-arrow",
					metric : false,
					strings : {
						title : "Hier bin ich.",
						popup : "Sie befinden sich in einem Radius von {distance} {unit} von diesem Punkt.",
						outsideMapBoundsMsg : "Offensichtlich sind Sie ausserhalb der Karte."
					},
					locateOptions : {
						maxZoom : 18,
						watch : true,
						enableHighAccuracy : true,
						maximumAge : 10000,
						timeout : 10000
					}
				}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
	var isCollapsed = true;
} else {
	var isCollapsed = false;
}

var baseLayers = {
	"Street Map" : mapquestOSM
};


/* Highlight search box text on click */
$("#searchbox").click(function() {
	$(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function(e) {
	if (e.which == 13) {
		e.preventDefault();
	}
});

$("#featureModal").on("hidden.bs.modal", function(e) {
	$(document).on("mouseout", ".feature-row", clearHighlight);
});

// Typeahead search functionality
$(document)
		.one(
				"ajaxStop",
				function() {
					$("#loading").hide();
					sizeLayerControl();
					featureList = new List("features", {
						valueNames : [ "feature-name" ]
					});
					// featureList.sort("feature-name", {order:"asc"});

					var allBikesBH = new Bloodhound({
						name : "Bikes",
						datumTokenizer : function(d) {
							return Bloodhound.tokenizers.whitespace(d.number);
						},
						queryTokenizer : Bloodhound.tokenizers.whitespace,
						local : allBikesearch,
						limit : 10
					});

					allBikesBH.initialize();

					// instantiate the typeahead UI
					$("#searchbox")
							.typeahead({
										minLength : 3,
										highlight : true,
										hint : false
									}, {
										name : "Bikes",
										displayKey : "number",
										source : allBikesBH.ttAdapter(),
										templates : {
											header : "<h4 class='typeahead-header'><img src='assets/img/logo_kvb_37.png' width='24' height='28'>&nbsp;Bikes</h4>",
											suggestion : Handlebars.compile([ "<small>{{number}}</small></br><i>{{timestamp}}</i></small>" ].join(""))
										}
									})
							.on("typeahead:selected", function(obj, datum) {
								map.setView([ datum.lat, datum.lng ], 18);
								if (!map.hasLayer(allbikeslatestposition)) {
									map.addLayer(allbikeslatestposition);
								}
								if (map._layers[datum.id]) {
									map._layers[datum.id].fire("click");
								}
								if ($(".navbar-collapse").height() > 50) {
									$(".navbar-collapse").collapse("hide");
								}
							}).on("typeahead:opened", function() {
								$(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
								$(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
							}).on("typeahead:closed", function() {
								$(".navbar-collapse.in").css("max-height", "");
								$(".navbar-collapse.in").css("height", "");
							});
					$(".twitter-typeahead").css("position", "static");
					$(".twitter-typeahead").css("display", "block");
				});

// Leaflet patch to make layer control scrollable on touch browsers
//var container = $(".leaflet-control-layers")[0];
//if (!L.Browser.touch) {
//	L.DomEvent.disableClickPropagation(container).disableScrollPropagation(
//			container);
//} else {
//	L.DomEvent.disableClickPropagation(container);
//}

// datatable
$(document).ready(function() {
	$('#bikes').DataTable({
		"ajax" : "/kvbradpositions/service/allbikeslatestposition?datatables",
		"columns" : [ {
			"data" : "number"
		}, {
			"data" : "name"
		}, {
			"data" : "timestamp"
		}, {
			"data" : "time"
		}, {
			"data" : "distance"
		}, {
			"data" : "count"
		} ]
	});
});
