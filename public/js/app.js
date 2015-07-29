var app = angular.module("scheduleApp", ['ui.calendar', 'ngRoute'])

var clientList;
var appointmentsArr = [];

//Sets up routes to the different views
app.config(function ($routeProvider) {
	$routeProvider
		.when('/dashboard',
			{
				controller: 'CalendarController',
				templateUrl: '../templates/dashboard.html'
			})
		.when('/calendar', 
			{
				controller: 'CalendarController',
				templateUrl: '../templates/calendar.html'
			})
		.when('/clients',
			{
				controller: 'ClientController',
				templateUrl: '../templates/clients.html'
			})
		.when('/calls', 
			{
				controller: 'CallsController',
				templateUrl: '../templates/calls.html'
			})
		.otherwise({ redirectTo: '/dashboard'})
});


// Client Controller
app.controller("ClientController", function($scope, $http){

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

	// Header stuff for user auth
	$http.defaults.headers.post = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }


	// GET request that populates the client list
	$http.get('http://bookmefish.herokuapp.com/clients.json').
	  success(function(data) {
	    $scope.clients = data.clients;
	    clientList = data.clients;
	    console.log("success");
	  }).
	  error(function(data) {
	    console.log("error", data)
	  });

	  $scope.currentClient;
	  $scope.searchId;
	  $scope.clientNotes;

	  $scope.addNewVoicemail = function(newVM) {
	  	console.log(newVM)
	  }

	  $scope.updateClient = function(activeClient) {
	  	$scope.currentClient = activeClient;
	  	console.log($scope.currentClient)
	  	
	  	// Send note info to the server

	  	/*
	  	$http.post('http://bookmefish.herokuapp.com/client', {
	  		client: { 
	  			first_name: , 
	  			last_name:, 
	  			address:, 
	  			zip:, 
	  			display_phone:, 
	  			county:, 
	  			family_size:, 
	  			account_number:, 
	  			email: 
	  		}
	  	}).success(function(data){
	  		console.log("client added")
	  	}).error(function(data){
	  		console.log("error! client didn't post", data)
	  	})
	  	$scope.currentClient.notes.push({info: newNote});

	  	*/
	  }

	  $scope.searchClients = function(newVM) {

	  	$http.get('http://bookmefish.herokuapp.com/clients/search?q=' + newVM.first_name + " " + newVM.last_name + " " + newVM.display_phone).
	  		success(function(data) {
	  			console.log("sucess", data)
	  		}).
	  		error(function(data) {
	  			console.log("error", data)
	  		})

	   }


	  $scope.addNewNote = function(activeClient) {
	  	$scope.currentClient = activeClient;
	  	var newNote = $("#new-note").val();
	  	console.log($scope.currentClient);
	  	// Send note info to the server
	  	$http.post('http://bookmefish.herokuapp.com/voicemails/' + $scope.currentClient.id + "/notes", {
	  		note: {
		  		info: newNote
	  		}
	  	}).success(function(data){
	  		console.log("note added")
	  	}).error(function(data){
	  		console.log("error! note didn't post", data)
	  	})
	  	$scope.currentClient.notes.push({info: newNote});
	  }

	  // Searches existing client list for matching name
	  $scope.getClientId = function(activeClient) {
	  	$scope.currentClient = activeClient;
	  	console.log($scope.currentClient)
	  	var result = _.findWhere(clientList, {
	  		first_name: $scope.currentClient.client.first_name,
	  		last_name: $scope.currentClient.client.last_name
	  	});
	  	// If no clients match the name:
	  	if (!result) {
	  		alert("No clients match that name");
	  	}
	  	//note: maybe change this down the road to search by ID

	  	var searchId = result.id;
	  	console.log(result, searchId);

	  	// Otherwise, if match found:
	  	if (searchId) {
	  		alert("Found! Client ID: " + searchId);
	  	} 
	}

})

app.controller("CalendarController", function($scope, $http) {

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

	// Header stuff for user auth
	$http.defaults.headers.post = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }


	// Sets what today is
	$scope.today = moment();
	$scope.formattedToday = moment().format("MMM Do");

	// GET request that populates appointments
	$http.get('http://bookmefish.herokuapp.com/appointments.json').
	  success(function(data) {
	  
	    $scope.appointments = data.appointments;
	    console.log("success");

	    // Sets up appointments array for today to display on the dashboard
	    $scope.todaysAppts = []; 

	    for (var i = 0; i < $scope.appointments.length; i++) {
			var currentAppt = $scope.appointments[i];

			// Formats the appointments data for use with the calendar
			appointmentsArr.push({
				title: currentAppt.last_name + ", " + currentAppt.first_name,
				start: moment(currentAppt.date_time).format("YYYY-MM-DD"),
				editable: true
			})

			// Formats each date into human-friendly format
			currentAppt.date_time = moment(currentAppt.date_time).format("MMM Do");

			// Populates todays appointments for dashboard
			if (currentAppt.date_time === $scope.formattedToday) {
				$scope.todaysAppts.push(currentAppt);
			}

	    }	

	    // Renders every appointment in the calendar    
	    $("#calendar").fullCalendar( 'addEventSource', appointmentsArr);

	  }).
	  error(function(data) {
	    console.log("error", data)
	  });

})


// Calls Controller
app.controller("CallsController", function($scope, $http, $filter) {

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

// Header stuff for user auth
	$http.defaults.headers.post = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }


	// Sets up array of people you need to call (unresolved calls)
	$scope.toCall = [];

	// GET request that popluates voicemail list
	$http.get('http://bookmefish.herokuapp.com/voicemails.json').
		success(function(data) {
			$scope.calls = data.voicemails;
			
			// Populates the toCall array (dashboard)
			for (var i = 0; i < $scope.calls.length; i++) {
				if ($scope.calls[i].resolved === false) {
					$scope.toCall.push($scope.calls[i]);
				}
			}

		}).
	  error(function(data) {
	    console.log("error", data)
	  });

	  //Sets up activeClient variable on $scope
	  $scope.activeClient;

	  // Grabs info for the modal (pop-up) when you click the little green phone icon
	  $scope.makeActive = function(voicemail) {
	  	$scope.activeClient = voicemail;
	  	$scope.activeClient.client.next_allowable_appointment = moment($scope.activeClient.client.next_allowable_appointment).format("MMM Do YYYY")
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	console.log(voicemail.id)
	  	$('#more-info').modal();
	  }

	  // Opens modal window to add or edit notes
	  $scope.toggleEditNoteMode = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	console.log(activeClient.id)
	  	$('#edit-note').modal();
	  }

	  //Toggles Edit Client mode
	  $scope.toggleEditClientMode = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	$('#edit-client').modal();
	  }

	  // Cancels edit
	  $scope.cancelEdit = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	console.log(activeClient)
	  	$('#more-info').modal();
	  }

	  $scope.openVM = function() {
	  	console.log("clicked!")
	  	$("#add-vm").modal();

	  }
})

// effect for sticking the menu to the top of the page on scoll up
$("#link-list").sticky();





