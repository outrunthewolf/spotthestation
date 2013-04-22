// Default vars

var tracker = {
	
	api_endpoint: "/api/location.php",
	api_interval: 2000,
	api_response: true,
	
	iss_route: [],

	map_container: false,
	map: false,
	map_marker: false,
	map_zoom: 4,

	user_lon: 0,
	user_lat: 0,
	user_marker: false,

	init: function()
	{
		tracker.map_container = document.getElementById("map");
		tracker.resize();
		tracker.mapInit();

		// Set time interval for updates
		setInterval(function() {
			if(tracker.api_response)
				tracker.loadMarker();

		},  tracker.api_interval);

		// Bind window resize
		$(window).resize(function() {
			tracker.resize();
		});

		// Get the users location
		tracker.getLocation();
	},

	mapInit: function()
	{
		tracker.map = new google.maps.Map(tracker.map_container, {
			zoom: tracker.map_zoom,
			mapTypeId: google.maps.MapTypeId.TERRAIN
		});
	},

	loadMarker: function()
	{
		$.ajax({                                                                                                                                                                                                        
			type: 'GET',                                                                                                                                                                                                 
			url: tracker.api_endpoint,                                                                                                                                              
			dataType: 'json',  
			beforeSend: function()
			{
				tracker.api_response = false;
			},                                                                                                                                                                                           
			success: function(data) 
			{
				tracker.api_response = true;
				
				// get new coords
				var coords = new google.maps.LatLng(data.iss_position.latitude, data.iss_position.longitude);

				// push new coords to iss route array for tracking line
				tracker.iss_route.push(coords);
				tracker.drawRoute();

				if(!tracker.map_marker) 
				{
					tracker.map_marker =  new google.maps.Marker({
						position: coords,
						map: tracker.map,
						title: "ISS",
						icon: "http://www.n2yo.com/inc/saticon.php?t=0&s=25544&c="
					});
					tracker.map.panTo(coords);
				}
				else
				{
					tracker.map_marker.setPosition(coords);
				}
			},                                                                                                                                                                                       
			error: function(data) 
			{
				
			}                                                                                                                                     
		});
	},
	
	// resize window
	resize: function()
	{
		// Set the map to fullsize
		tracker.map_container.style.height = $(window).height() + "px";
		
		// Pan to ISS
		if(tracker.map && tracker.map_marker) {
			tracker.map.panTo(tracker.map_marker.getPosition());
		}
	},

	// Get users location and add them on the map maybe??
	getLocation: function() 
	{
		navigator.geolocation.getCurrentPosition(function(position)
		{
			tracker.user_lat = position.coords.latitude;
			tracker.user_lon = position.coords.longitude;

			var coords = new google.maps.LatLng(tracker.user_lat, tracker.user_lon);
			console.log(tracker.map);

			
			tracker.user_marker =  new google.maps.Marker({
				position: coords,
				map: tracker.map,
				title: "You are here!"
			});

		});
	},

	// Draw a route line
	drawRoute: function()
	{
		var path = new google.maps.Polyline({
			path: tracker.iss_route,
			strokeColor: "#FF0000",
			strokeOpacity: 1.0,
			strokeWeight: 2
		});

		path.setMap(tracker.map);
	}
}


$(document).ready(function()
{
	tracker.init()
});
