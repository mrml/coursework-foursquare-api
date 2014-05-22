// These variables are stored outside of the main function so we can call upon them later
var selected_cats = new Array;
var map;

//	Declare the function as a variable so we can call from within the function later
var a = (function(){
	
// Creates a map object in order to display venue markers on
	map = L.map('map');
	
// Initialises an array to hold the id's of all of the venues
	var venue_ids = [];
	var venues = [];

// Initialises an array to hold the id's of all of the recommended id's [not used in this example]
	var rec_venue_ids = [];
	var rec_venues = [];

// Holds the relevant information for each venue category
// Category: ['categoryName', 'categoryID', 'iconURL']
	var categories = [
		["shops", "4d4b7105d754a06378d81259", "img/new/shop.png"],
		["drinks", "4d4b7105d754a06376d81259", "img/new/drink.png"],
		["food", "4d4b7105d754a06374d81259", "img/new/food.png"]
	];

	// http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
	function getURLParameter(name, location) {
		return decodeURIComponent((new RegExp('[?|&|#]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location)||[,""])[1].replace(/\+/g, '%20'))||null;
	}

	function doAuth() {
		// Gets our access token when we connect the app to our account
		// and return to the app from the return URL
		auth = getURLParameter('access_token', window.location.hash);
		// console.log(auth);
		if(auth !== null) {
			// Uses localStorage to store our access token for foursquare
			localStorage.foursquareauth = auth;
		}
	}

//	This function can check if a value is in an array. It is used to see if the category of venue is
//	selected in our checkboxes filters
	function inArray(variable, array){
	//	Returns true if the variables index in the array is greater than one, else returns false
		return array.indexOf(variable) > -1;
	}

    function hideShowMarkers() {
        $.each(venues, function(i, ven) {
		//	As we now store venues as an array in the venues and rec_venues array, we want to select the marker
		//	from the venue so we set the venue variable to the marker, rather than the array
			var venue = ven[0];
		//	It still checks if the marker is in the map boundaries, and then we check if the venue category is in our
		//	selected category filters
            if(map.getBounds().contains(venue.getLatLng()) && inArray(ven[1], selected_cats)) {
			//	If a marker is in the boundaries and the filter category is selected.
                map.addLayer(venue);
            } else {
				map.removeLayer(venue);
			}
        });
        $.each(rec_venues, function(i, ven) {
		//	Same as when cycling through the venues array.
			var venue = ven[0];
            if(map.getBounds().contains(venue.getLatLng()) && inArray(ven[1], selected_cats)) {
                map.addLayer(venue);
            } else {
				map.removeLayer(venue);
			}
        });
    }

	function addRecommendedVenue(venue, index) {
	//	If we don't have this venue already in the array, we want to create an a marker for the icon
		if(rec_venue_ids.indexOf(venue.id) <= -1) {
			var myIcon = L.icon({
				iconUrl: 'img/new/rec.png',
				iconSize: [32,32],
				popupAnchor: [0, -24]
			});
			var marker = new L.marker([venue.venue.location.lat, venue.venue.location.lng], {
				title: venue.venue.name,
				icon: myIcon,
				xIndexOffset: 1000
			});

		//	Create the content for the popup
			var popupstr = "";
			popupstr += "<img class='marker' style='float:left; padding:4px' src='img/new/rec.png' /><img class='marker' style='float:left; padding:4px' src='" + categories[index][2] + "' />";

			var id =  venue.venue.id;

		//	Checks the localStorage to see if we have an alternative name for the venue with this id
			if(localStorage.getItem(id)){
			//	If we have an alternative name stored, we want to display that name in the popup
				popupstr += "<h1>" + localStorage.getItem(id) + "</h1><h3>(aka. " + venue.venue.name + ")</h3>";
			} else {
			//	If there is no stored alternative name, we want to display the venue's name and the fields in order to add an alternative name for the venue
			//	We have a text input field, which we can input an alternative name for the venue, and a button which calls the storeName() function to add the name to the localStorage
				popupstr += '<h1>' + venue.venue.name + '</h1><input type="text" id="nickname"><button id="addName" onclick="storeName(\'' + id + '\');" >Add Name</button>';
			}

			//	Create a popup object, in order to set a minimum width to avoid any styling issues with the input and button fields
			var popup = L.popup({minWidth:250})
				.setContent(popupstr);

			// bind the popup to the array
			marker.bindPopup(popup);

			rec_venue_ids.push(venue.venue.id);
			rec_venues.push([
				marker,
				categories[index][0]
			]);            
		} else {
		//	If we already have the rec_venue id stored, we want to use the category and marker from the venue stored
			var ven = rec_venues[venue_ids.indexOf(venue.venue.id)],
				marker = ven[0],
				category = ven[1];
				
		//	close the popup in case it is open and remove it from the marker
			marker.closePopup();
			marker.unbindPopup();

		//	re-create the content for the popup
			var popupstr = "";
			popupstr += "<img class='marker' style='float:left; padding:4px' src='img/new/rec.png' /><img class='marker' style='float:left; padding:4px' src='" + categories[index][2] + "' />";

			var id =  venue.venue.id;

		//	Checks the localStorage to see if we have an alternative name for the venue with this id
			if(localStorage.getItem(id)){
			//	If we have an alternative name stored, we want to display that name in the popup
				popupstr += "<h1>" + localStorage.getItem(id) + "</h1><h3>(aka. " + venue.venue.name + ")</h3>";
			} else {
			//	If there is no stored alternative name, we want to display the venue's name and the fields in order to add an alternative name for the venue
			//	We have a text input field, which we can input an alternative name for the venue, and a button which calls the storeName() function to add the name to the localStorage
				popupstr += '<h1>' + venue.venue.name + '</h1><input type="text" id="nickname"><button id="addName" onclick="storeName(\'' + id + '\');" >Add Name</button>';
			}

			//	Create a popup object, in order to set a minimum width to avoid any styling issues with the input and button fields
			var popup = L.popup({minWidth:250})
				.setContent(popupstr);

			// bind the popup to the array
			marker.bindPopup(popup);

			// Then we push the category and the marker to the same index as it originally was
			rec_venues[rec_venue_ids.indexOf(venue.venue.id)] = [marker,category];
		}
	}

	
	function addVenue(venue, index) {
	//	Searches our venue_ids array to see if we already have stored the venue
		if (venue_ids.indexOf(venue.id) <= -1) {
		//	If we don't already have the venue stored we want to create an icon and a marker for the venue
			var myIcon = L.icon({
			//	Get the icon URL from the categories array depending on the type of venue
				iconUrl: categories[index][2],
				iconSize: [32,32],
				popupAnchor: [0, -16]
			});
			var marker = new L.marker([venue.location.lat, venue.location.lng], {
				title: venue.name,
				icon: myIcon
			});
		} else {
		//	If the venue has already been stored we want to get the current marker and category from the arrays
			var ven = venues[venue_ids.indexOf(venue.id)],
				marker = ven[0],
				category = ven[1];
				
		//	close and remove the popup from the marker
			marker.closePopup();
			marker.unbindPopup();
		}

	//	Creates the content of the popup
		var popupstr = "";
		popupstr += "<img class='marker' style='float:left; padding:4px' src='" + categories[index][2] + "' />";

		var id =  venue.id;

	//	Checks if we have stored an alternative name for the venue
		if(localStorage.getItem(id)){
		//	if so we want to add that name to the popup
			popupstr += "<h1>" + localStorage.getItem(id) + "</h1><h3>(aka. " + venue.name + ")</h3>";
		} else {
		//	if not, we want to add our input text field and button to store possible names
			popupstr += '<h1>' + venue.name + '</h1><input type="text" id="nickname"><button id="addName" onclick="storeName(\'' + id + '\');" >Add Name</button>';
		}

	// Creates a popup object from the popup content
		var popup = L.popup({minWidth:250})
			.setContent(popupstr);
			
	//	binds the popup to the marker object
		marker.bindPopup(popup);

	//	If we didn't have the array stored originally, push these values to the array
		if (venue_ids.indexOf(venue.id) <= -1) {
			venue_ids.push(venue.id);
			venues.push([marker,categories[index][0]]);
		} else {
			//	if we did have the venue previously stored, we want to add the new marker to the same index	where it previously was
			venues[venue_ids.indexOf(venue.id)] = [marker,category];
		}
	}

//	Keeps the search API request seperate, to call it with different categoryIds
	function apiSearch(ll, index){
		$.getJSON("https://api.foursquare.com/v2/venues/search", {
			ll: ll,
			radius: 500,
			intent: "browse",
			// This gets the categoryID from our categories array for this category
			categoryId: categories[index][1],
			client_id: "CLIENT_ID",
			client_secret: "CLIENT_SECRET",
			v: 20140218
		}).done(function(data){		
			$.each(data.response.venues, function(i, venue) {
			//	sends the venue and index of the category to the addVenue function
				addVenue(venue, index);
			});
			hideShowMarkers();
		});
	}

//	Keeps the explore API request seperate, to call it with different sections
	function apiExplore(ll, index){
		$.getJSON("https://api.foursquare.com/v2/venues/explore", {
			ll: ll,
			radius: 500,
		//	Get the name of the section from the category array
			section: categories[index][0],
			limit: 50,
			oauth_token: localStorage.foursquareauth,
			v: 20140218 
		}).done(function(data){
			$.each(data.response.groups, function(i, group){
				$.each(group.items, function(j, item) {
					//console.log(item);
				//	passes the venue and the category index to the addRecommendedVenue function
					addRecommendedVenue(item, index);
				});
			});
			hideShowMarkers();
		});
	}

	function onMoveEnd() {
	//	set up a temporary array to store which checkboxes are active
		var temp = [];
		if($('.drinks').prop('checked')){
			temp.push('drinks');
		} 
		if($('.shops').prop('checked')){
			temp.push('shops');
		}
		if($('.food').prop('checked')){
			temp.push('food');
		}
	//	set the selected category array to this new array, after all the checkboxes have been checked
		selected_cats = temp;
		
		var centre = map.getCenter();
		var ll = centre.lat + "," + centre.lng;

		// Cycles through the specified categories
		for (current = 0; current < categories.length; current++){
		// 	calls the search function on the specified category index
			apiSearch(ll, current);
		}

		if(localStorage.foursquareauth) {
			for (current = 0; current < categories.length; current++){
			// 	calls the explore function on the specified category index
				apiExplore(ll, current);
			}
		}
	}

//	initialises the map the same as before
	function initmap() {
		var tileURL = 'http://{s}.tile.cloudmade.com/CLOUDMADE_API_KEY/997/256/{z}/{x}/{y}.png';
		var attribString = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
		var tileLayer = new L.tileLayer(tileURL, {
			attribution: attribString,
			minZoom: 8,
			maxZoom: 18
		});

		map.addLayer(tileLayer);
		map.locate({setView: true, maxZoom: 16});

		map.on('moveend', onMoveEnd);

		doAuth();
	}

	initmap();

//	We have the function return functions, in order to recall certain functions outside of this initial run of the function.
	return {
	//	when we call the reloadMarkers function on the variable holding this function, it will run the onMoveEnd() function
		reloadMarkers: function(){
			onMoveEnd();
		}
	}
})();

//	We can call these functions at any time within our application
function viewMarkers(){
	a.reloadMarkers();
}

function storeName(id){
	//	gets the value set as the alternative name for a venue and stores it in the localStorage
	localStorage.setItem(id, document.getElementById('nickname').value);
	map.closePopup();
	//	Reloads the markers on the page, with the new names and popups for each marker
	a.reloadMarkers();
	return;
}

// clears all of the localStorage except for the foursquareauth if it has been stored
function clearNames(){
	if(localStorage.foursquareauth){
		auth = localStorage.foursquareauth;
		localStorage.clear();
		localStorage.foursquareauth = auth;
	} else {
		localStorage.clear();
	}
//	reload the markers without their alternative names
	a.reloadMarkers();
}