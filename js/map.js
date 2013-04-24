var tracker = {
	
	api_endpoint: "api/location.php",
	api_interval: 2000,
	api_response: true,
	
	iss_route: [],
	iss_velocity: {lon: 0, lat: 0},
	iss_distance: 0, // Distance (Kilometers) between API calls
	iss_last_call_time: 0,
	iss_previous_coords: false,

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
		
		// Switch to running interface
		$("body").removeClass("start").addClass("running");

		// load all tracking data in
		tracker.loadMarker();

		// Estimate position
		setInterval(function() 
		{
			if(tracker.api_response)
				tracker.estimatePosition();

		},  tracker.api_interval);
		

		//tracker.loadMarker();

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
				
				// Store the current time
				var current_time = new Date().getTime();

				tracker.iss_previous_coords = tracker.iss_route[tracker.iss_route.length-1];

				console.log(tracker.iss_previous_coords);

				tracker.iss_velocity.lon = data.iss_position.longitude - tracker.iss_previous_coords.lng();
				tracker.iss_velocity.lat = data.iss_position.latitude - tracker.iss_previous_coords.lat();
				
				// Calculate the distance the iss has travelled.
				tracker.iss_distance = google.maps.geometry.spherical.computeDistanceBetween(previous_coords,coords) / 1000;

				if(tracker.iss_last_call_time > 0)
				{
					var time_since = current_time - tracker.iss_last_call_time;
					var speed = tracker.iss_distance / ((time_since / 1000) / 60 / 60);
					console.log(speed + " Km/h");
				}
				

				tracker.iss_last_call_time = current_time;

				tracker.updateMarker(coords);
			},                                                                                                                                                                                       
			error: function(data) 
			{
				
			}                                                                                                                                     
		});
	},

	updateMarker: function(coords)
	{
		// update tracker map marker
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

		// Draw the route based on only 2 coords
		tracker.drawRoute(coords);
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

			tracker.user_marker =  new google.maps.Marker({
				position: coords,
				map: tracker.map,
				title: "You are here!"
			});

		});
	},

	// Draw a route line
	drawRoute: function(coords)
	{
		if(tracker.iss_route.length > 1)
			tracker.iss_route.shift();

		tracker.iss_route.push(coords); 

		var path = new google.maps.Polyline({
			path: tracker.iss_route,
			strokeColor: "#FF0000",
			strokeOpacity: 1.0,
			strokeWeight: 2
		});

		path.setMap(tracker.map);
	},
	
	// estimate ISS position based on mean velocity
	estimatePosition: function()
	{						
		var coords = new google.maps.LatLng
		(
			tracker.iss_previous_coords.lat() + tracker.iss_velocity.lat, 
			tracker.iss_previous_coords.lng() + tracker.iss_velocity.lon
		);

		// update the map marker and route
		tracker.updateMarker(coords);

		console.log('shift pos est');
	}
}


$(document).ready(function()
{
	tracker.init()
});
