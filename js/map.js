// Default vars
var tracker = {
	mapContainer: false,
	map: false,
	marker: false,
	
	init: function()
	{
		tracker.mapContainer = document.getElementById("map");
		tracker.resize();
		tracker.mapInit();
		tracker.loadMarker();
		
		// Switch to running interface
		$("body").removeClass("start").addClass("running");
	},

	mapInit: function()
	{
		tracker.map = new google.maps.Map(tracker.mapContainer, {
			zoom: 5,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		});
	},

	loadMarker: function()
	{
		$.ajax({                                                                                                                                                                                                        
			type: 'GET',                                                                                                                                                                                                 
			url: 'api/location.php',                                                                                                                                              
			dataType: 'json',                                                                                                                                                                                                
			success: function(data) {
				var coords = new google.maps.LatLng(data.iss_position.latitude, data.iss_position.longitude);
				if(!tracker.marker) 
				{
					tracker.marker =  new google.maps.Marker({
						position: coords,
						map: tracker.map,
						title: "ISS",
						icon: "http://www.n2yo.com/inc/saticon.php?t=0&s=25544&c="
					});
					tracker.map.panTo(coords);
				}
				else
				{
					tracker.marker.setPosition(coords);
				}
				
				tracker.loadMarker();
			},                                                                                                                                                                                       
			error: function(data) {
				tracker.loadMarker();
			}                                                                                                                                     
		});
	},
	
	resize: function()
	{
		// Set the map to fullsize
		tracker.mapContainer.style.height = $(window).height() + "px";
		
		// Pan to ISS
		if(tracker.map && tracker.marker) {
			tracker.map.panTo(tracker.marker.getPosition());
		}
	}
}
$(document).ready(function()
{
	tracker.init()
});

$(window).resize(function()
{
	tracker.resize();
});