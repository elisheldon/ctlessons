var period = 0;
var allPlayers = {};
var t1Players = {};
var t2Players = {};
var teamOneName = "Team One";
var teamTwoName = "Team Two";
var anonArray=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','AA','AB','AC','AD','AE','AF','AG','AH','AI'];
var inningArray=["","1ST","2ND","3RD","4TH","5TH","6TH","7TH"]

// Initialize Firebase
var config = {
	apiKey: "AIzaSyDFhsyEfg4dc-t5LFiyl-D0npv3K70tII8",
    authDomain: "kickballstats-5dc3d.firebaseapp.com",
    databaseURL: "https://kickballstats-5dc3d.firebaseio.com",
    projectId: "kickballstats-5dc3d",
    storageBucket: "kickballstats-5dc3d.appspot.com",
    messagingSenderId: "400653778862"
};
firebase.initializeApp(config);

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

//Allow Google sign-in
var provider = new firebase.auth.GoogleAuthProvider();

var athleteIn = getParameterByName("athlete");
if(athleteIn != null){
	$("#launchNav").hide();
	$("#loadingDiv").show();
	showAthletePage(athleteIn);
}
else{
	$("#loadingDiv").hide();
	$("#launchNav").show();
}
	
function loadPlayersFromCsv(){
	//Load player data from csv file
	 $.ajax({
        type: "GET",
        url: "players.csv",
        dataType: "text",
        success: function(data) {
			var playerArray = $.csv.toObjects(data);
			//console.log(playerArray);
			uploadPlayers(playerArray);
		}
     });
}

function uploadPlayers(playerArray){
	for(i=0;i<playerArray.length;i++){
		db.collection("players").doc(playerArray[i]["first"]+playerArray[i]["last"]).set({
			first: playerArray[i]["first"],
			last: playerArray[i]["last"],
			period: parseInt(playerArray[i]["period"]),
			arm: playerArray[i]["arm"],
			foot: playerArray[i]["foot"],
			number: playerArray[i]["number"]
		})
	}
}

document.getElementById("periodSelect").onchange = function(){
	period = parseInt(document.getElementById("periodSelect").value);
	document.getElementById("newGameBtn").disabled = false;
	document.getElementById("athletesBtn").disabled = false;
};

$("#newGameBtn").click(function(){
	$("#launchNav").hide();
	$("#loadingDiv").show();
	signInAndLoad();
});

$("#athletesBtn").click(function(){
	$("#launchNav").hide();
	$("#loadingDiv").show();
	loadAthletes();
});

function loadAthletes(){
	var loadedAthletes = [];
	db.collection("players").where("period", "==", period)
    .get()
    .then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			var pl = doc.data();
			if(typeof(pl.foot) == "undefined"){pl.foot = ""};
			if(typeof(pl.arm) == "undefined"){pl.arm = ""};
			if(typeof(pl.b1) == "undefined"){pl.b1 = 0};
			if(typeof(pl.b2) == "undefined"){pl.b2 = 0};
			if(typeof(pl.b3) == "undefined"){pl.b3 = 0};
			if(typeof(pl.hr) == "undefined"){pl.hr = 0};
			if(typeof(pl.walks) == "undefined"){pl.walks = 0};
			if(typeof(pl.ab) == "undefined" || pl.ab == 0){pl.ab = .01}; //to avoid dividing by zero
			if(typeof(pl.runs) == "undefined"){pl.runs = 0};
			if(typeof(pl.er) == "undefined"){pl.er = 0};
			if(typeof(pl.ip) == "undefined" || pl.ip == 0){pl.ip = .01};
			if(typeof(pl.kickup) == "undefined"){pl.kickup = 0};
			if(typeof(pl.kickdown) == "undefined" || pl.kickdown == 0){pl.kickdown = .01};
			if(typeof(pl.kickleft) == "undefined"){pl.kickleft = 0};
			if(typeof(pl.kickmid) == "undefined" || pl.kickmid == 0){pl.kickmid = .01};
			if(typeof(pl.kickright) == "undefined"){pl.kickright = 0};
			allPlayers[doc.id] = pl; //allPlayers object contains each player as a child object
			plStats = calcStats(pl);
			document.getElementById("athletesPeriod").innerHTML = "Period " + period + " Athletes";
			document.getElementById("athleteTable").innerHTML += "<tr class='athleteRow' id='" + pl.first + pl.last +"'><td>" + pl.number + ". " + pl.first + " " + pl.last + "</td><td>" + pl.foot + "</td><td>" + pl.arm + "</td><td>" + pl.ab + "</td><td>" + plStats[0].toFixed(3) + "</td><td>" + plStats[1].toFixed(3) + "</td><td>" + pl.runs + "</td><td>" + plStats[2].toFixed(2) + "</td><td>" + plStats[3] + "</td></tr>";
			$("#loadingDiv").hide();
			$("#athletesDiv").show();
		});
		$(".athleteRow").click(function() {
			var selectedPlayer = this.id;
			$("#athletesDiv").hide();
			$("#athletePage").show();
			showAthletePage(selectedPlayer);
		});
		document.getElementById("teamTurn").innerHTML = teamOneName + ", choose a player!";
    })
    .catch(function(error) {
        console.log("Error loading players: ", error);
    });
}

$(".homeBtn").click(function(){
	window.location = window.location.href.split("?")[0]; //reload page without any query string
});

function showAthletePage(playerId){
	if(Object.keys(allPlayers).length === 0){
		//if athlete page was loaded via url querystring
		db.collection("players").doc(playerId).get().then(function(doc){ //extra call if we've already loaded players for this period, but so be it
			 if (doc.exists) {
				populateAthletePage(doc.data());
			} else {
				window.location = window.location.href.split("?")[0]; //reload page without query string if athlete is invalid
			}
		});
	}
	else{
		//if we came from list of athletes
		populateAthletePage(allPlayers[playerId]);
		$("#backToAthletesBtn").show();
	}
}

$("#backToAthletesBtn").click(function(){
	$("#athletesDiv").show();
	$("#athletePage").hide()
});

function populateAthletePage(pl){
	if(typeof(pl.foot) == "undefined"){pl.foot = ""};
	if(typeof(pl.arm) == "undefined"){pl.arm = ""};
	if(typeof(pl.b1) == "undefined"){pl.b1 = 0};
	if(typeof(pl.b2) == "undefined"){pl.b2 = 0};
	if(typeof(pl.b3) == "undefined"){pl.b3 = 0};
	if(typeof(pl.hr) == "undefined"){pl.hr = 0};
	if(typeof(pl.walks) == "undefined"){pl.walks = 0};
	if(typeof(pl.ab) == "undefined" || pl.ab == 0){pl.ab = .01}; //to avoid dividing by zero
	if(typeof(pl.runs) == "undefined"){pl.runs = 0};
	if(typeof(pl.er) == "undefined"){pl.er = 0};
	if(typeof(pl.ip) == "undefined" || pl.ip == 0){pl.ip = .01};
	if(typeof(pl.kickup) == "undefined"){pl.kickup = 0};
	if(typeof(pl.kickdown) == "undefined" || pl.kickdown == 0){pl.kickdown = .01};
	if(typeof(pl.kickleft) == "undefined"){pl.kickleft = 0};
	if(typeof(pl.kickmid) == "undefined"  || pl.kickmid == 0){pl.kickmid = .01};
	if(typeof(pl.kickright) == "undefined"){pl.kickright = 0};
	plStats = calcStats(pl);
	document.getElementById("athleteName").innerHTML = pl.number + ". " + pl.first + " " + pl.last;
	document.getElementById("athleteDir").innerHTML = "Kicks with " + lowerFirst(pl.foot) + ", throws with " + lowerFirst(pl.arm);
	if(plStats[3]!="Unknown"){document.getElementById("athleteDir").innerHTML += ", usually kicks " + lowerFirst(plStats[3]);}
	if(pl.ab==.01){document.getElementById("apab").innerHTML = 0}else{document.getElementById("apab").innerHTML = pl.ab;}
	document.getElementById("apb1").innerHTML = pl.b1;
	document.getElementById("apb2").innerHTML = pl.b2;
	document.getElementById("apb3").innerHTML = pl.b3;
	document.getElementById("aphr").innerHTML = pl.hr;
	document.getElementById("apwalks").innerHTML = pl.walks;
	document.getElementById("apruns").innerHTML = pl.runs;
	document.getElementById("apobp").innerHTML = plStats[0].toFixed(3);
	document.getElementById("apslg").innerHTML = plStats[1].toFixed(3);
	if(pl.ip==.01){document.getElementById("apip").innerHTML = 0}else{document.getElementById("apip").innerHTML = pl.ip.toFixed(2);}
	document.getElementById("aper").innerHTML = pl.er;
	document.getElementById("apera").innerHTML = plStats[2].toFixed(2);
	$("#loadingDiv").hide();
	$("#athletePage").show();
}

function signInAndLoad(){
	firebase.auth().signInWithPopup(provider).then(function(result) {
		var user = result.user;
		if(user.email == "eli.sheldon@greendot.org" || user.email == "eric.murphy@greendot.org" || "mrbarrow@cps.edu"){
			loadAvailablePlayers();
			//Warn on page close
			window.onbeforeunload = function () {
				return "Do you really want to close?";
			};
		}
		else{
			document.getElementById("loadingDiv").innerHTML = '<h1 style="text-align: center">Only Mr. Murphy and Mr. Sheldon can do that</h1><img src="denied.jpg" height="300px"></img>';
		}
	});
}

function loadAvailablePlayers(){
	var loadedPlayers = [];
	db.collection("players").where("period", "==", period)
	.get()
	.then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			loadedPlayers.push(doc);
		});
		populateAbsentUI(loadedPlayers);
		$("#absentUI").show();
		$("#loadingDiv").hide();
	})
	.catch(function(error) {
		console.log("Error loading players: ", error);
	});
}

function populateAbsentUI(loadedPlayers){
	presentPlayers = loadedPlayers;
	presentPlayers.forEach(function(doc) {
		var pl = doc.data();
		document.getElementById("presentPlayerTable").innerHTML += "<tr class='presentPlayerRow' id='" + pl.first + pl.last +"'><td>" + pl.number + ". " + pl.first + " " + pl.last + "</td></tr>";
	});
	$(".presentPlayerRow").click(function() { //remove absent player from table and from player array - this could be done more efficently by marking them as absent and removing them in one loop at the end
		absentId = this.id;
		presentPlayers.forEach(function(doc, index) {
			if(doc.id == absentId){
				presentPlayers.splice(index,1);
			}
		});
		$(this).remove();
	});
}

$("#addStaffBtn").click(function(){
	document.getElementById("addStaffBtn").disabled = true;
	staffPlayers = [];
	db.collection("players").where("period", "==", 0)
	.get()
	.then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			staffPlayers.push(doc);
		});
		$("#staffTable").show();
		
		staffPlayers.forEach(function(doc) {
			var pl = doc.data();
			document.getElementById("staffTable").innerHTML += "<tr class='staffRow' id='" + pl.first + pl.last +"'><td>" + pl.number + ". " + pl.first + " " + pl.last + "</td></tr>";
		});
		$(".staffRow").click(function() { //move staff player to present player table
			var staffId = this.id;
			staffPlayers.forEach(function(doc, index) {
				if(doc.id == staffId){
					presentPlayers.push(doc);
				}
			});
			$(this).removeClass("staffRow").off("click"); //this player is claimed; remove classes and click event
			$(this).click(function(){ //add new click event so they can be removed from present players table
				absentId = this.id;
				presentPlayers.forEach(function(doc, index) {
					if(doc.id == absentId){
						presentPlayers.splice(index,1);
					}
				});
				$(this).remove();
			});
			document.getElementById("presentPlayerTable").getElementsByTagName('tbody')[0].append(this);
		});	
	})
	.catch(function(error) {
		console.log("Error loading staff: ", error);
	});
});

$("#addNewPlayer").click(function(){
	$("#newPlayerDiv").show();
});

$("#submitNewPlayer").click(function(){
	var newPlayerFirst = document.getElementById("newPlayerFirst").value;
	var newPlayerLast = document.getElementById("newPlayerLast").value;
	var newPlayerPeriod = document.getElementById("newPlayerPeriod").value;
	var newPlayerNumber = document.getElementById("newPlayerNumber").value;
	var newPlayerArm = document.getElementById("newPlayerArm").value;
	var newPlayerFoot = document.getElementById("newPlayerFoot").value;
	if(newPlayerFirst === undefined || newPlayerLast === undefined || newPlayerPeriod === undefined || newPlayerNumber === undefined || newPlayerArm === undefined || newPlayerFoot === undefined){ //make sure all required fields are filled in
		alert("Make sure you fill in everything before submitting a new player.");
	}
	else{
		db.collection("players").doc(newPlayerFirst+newPlayerLast).set({
			first: newPlayerFirst,
			last: newPlayerLast,
			period: parseInt(newPlayerPeriod),
			arm: newPlayerArm,
			foot: newPlayerFoot,
			number: newPlayerNumber
		}).then(function(){
			window.location = window.location.href.split("?")[0]; //reload page without any query string
		});
	}
});

$("#draftTeamsBtn").click(function(){
	chooseTeams(presentPlayers);
});

$("#absentAgainBtn").click(function(){
	$("#absentUI").hide();
	$("#loadingDiv").show();
	$("#staffTable").hide();
	document.getElementById("addStaffBtn").disabled = false;
	document.getElementById("staffTable").innerHTML = "<tr style='background-color: #C0C0C0'><th>Staff</th></tr>";
	document.getElementById("presentPlayerTable").innerHTML = "<tr style='background-color: #C0C0C0'><th>Present players</th></tr>";
	loadAvailablePlayers();
});

function chooseTeams(presentPlayers){
	loadedPlayersShuffled = shuffle(presentPlayers);
	loadedPlayersShuffled.forEach(function(doc) {
		var pl = doc.data();
		pl.anon = anonArray.shift(); //get the next letter for this player
		if(typeof(pl.foot) == "undefined"){pl.foot = ""};
		if(typeof(pl.arm) == "undefined"){pl.arm = ""};
		if(typeof(pl.b1) == "undefined"){pl.b1 = 0};
		if(typeof(pl.b2) == "undefined"){pl.b2 = 0};
		if(typeof(pl.b3) == "undefined"){pl.b3 = 0};
		if(typeof(pl.hr) == "undefined"){pl.hr = 0};
		if(typeof(pl.walks) == "undefined"){pl.walks = 0};
		if(typeof(pl.ab) == "undefined" || pl.ab == 0){pl.ab = .01}; //to avoid dividing by zero
		if(typeof(pl.runs) == "undefined"){pl.runs = 0};
		if(typeof(pl.er) == "undefined"){pl.er = 0};
		if(typeof(pl.ip) == "undefined"  || pl.ip == 0){pl.ip = .01};
		if(typeof(pl.kickup) == "undefined"){pl.kickup = 0};
		if(typeof(pl.kickdown) == "undefined" || pl.kickdown == 0){pl.kickdown = .01};
		if(typeof(pl.kickleft) == "undefined"){pl.kickleft = 0};
		if(typeof(pl.kickmid) == "undefined" || pl.kickmid == 0){pl.kickmid = .01};
		if(typeof(pl.kickright) == "undefined"){pl.kickright = 0};
		allPlayers[doc.id] = pl; //allPlayers object contains each player as a child object
		plStats = calcStats(pl);
		document.getElementById("availableTable").innerHTML += "<tr class='availablePlayerRow availablePlayerRowTeamOne' id='" + pl.first + pl.last +"'><td>" + "Player " + pl.anon + "</td><td>" + pl.foot + "</td><td>" + pl.arm + "</td><td>" + pl.ab + "</td><td>" + plStats[0].toFixed(3) + "</td><td>" + plStats[1].toFixed(3) + "</td><td>" + pl.runs + "</td><td>" + plStats[2].toFixed(2) + "</td><td>" + plStats[3] + "</td></tr>";
	});
	$("#absentUI").hide();
	$("#teamsUI").show();
	$(".availablePlayerRow").click(function() {
		$(this).removeClass("availablePlayerRow availablePlayerRowTeamOne availablePlayerRowTeamTwo").off("click"); //this player is claimed; remove classes and click event
		if(document.getElementById("teamTurn").innerHTML == teamOneName + ", choose a player!"){
			document.getElementById("teamOneTable").getElementsByTagName('tbody')[0].append(this);
			document.getElementById("teamTurn").innerHTML = teamTwoName + ", choose a player!";
			$(".availablePlayerRowTeamOne").addClass("availablePlayerRowTeamTwo").removeClass("availablePlayerRowTeamOne");
			t1Players[this.id] = allPlayers[this.id];
		}
		else{
			document.getElementById("teamTwoTable").getElementsByTagName('tbody')[0].append(this);
			document.getElementById("teamTurn").innerHTML = teamOneName + ", choose a player!"
			$(".availablePlayerRowTeamTwo").addClass("availablePlayerRowTeamOne").removeClass("availablePlayerRowTeamTwo");
			t2Players[this.id] = allPlayers[this.id];
		}
		
	});
	document.getElementById("teamTurn").innerHTML = teamOneName + ", choose a player!";
}

function calcStats(pl){
	obp = (pl.b1 + pl.b2 + pl.b3 + pl.hr + pl.walks)/(pl.ab);
	slg = (pl.b1 + 2*pl.b2 + 3*pl.b3 + 4*pl.hr)/(pl.ab);
	era = (pl.er/pl.ip)*3; //updated to three innings per jan 10 skype convo with eric
	if(pl.ab == .01){uk = "Unknown";}
	else{
		if(pl.kickup/(pl.kickup+pl.kickdown)){
			uk = "Up and ";
		}
		else{
			uk = "Down and ";
		}
		var kickNum = (pl.kickmid*.5 + pl.kickright)/(pl.kickleft + pl.kickmid + pl.kickright);
		if(kickNum < .333){uk += "left";}
		else if(kickNum <.667){uk += "center";}
		else{uk += "right";}
	}
	return [obp,slg,era,uk];
}

$("#showTeamsWithNames").click(function() {
	$("#selectTeams").hide();
	$("#teamsWithNames").show();
	Object.entries(t1Players).forEach(function(obj){
		var pl = obj[1];
		if(typeof(pl.foot) == "undefined"){pl.foot = ""};
		if(typeof(pl.arm) == "undefined"){pl.arm = ""};
		if(typeof(pl.b1) == "undefined"){pl.b1 = 0};
		if(typeof(pl.b2) == "undefined"){pl.b2 = 0};
		if(typeof(pl.b3) == "undefined"){pl.b3 = 0};
		if(typeof(pl.hr) == "undefined"){pl.hr = 0};
		if(typeof(pl.walks) == "undefined"){pl.walks = 0};
		if(typeof(pl.ab) == "undefined" || pl.ab == 0){pl.ab = .01}; //to avoid dividing by zero
		if(typeof(pl.runs) == "undefined"){pl.runs = 0};
		if(typeof(pl.er) == "undefined"){pl.er = 0};
		if(typeof(pl.ip) == "undefined"  || pl.ip == 0){pl.ip = .01};
		if(typeof(pl.kickup) == "undefined"){pl.kickup = 0};
		if(typeof(pl.kickdown) == "undefined" || pl.kickdown == 0){pl.kickdown = .01};
		if(typeof(pl.kickleft) == "undefined"){pl.kickleft = 0};
		if(typeof(pl.kickmid) == "undefined" || pl.kickmid == 0){pl.kickmid = .01};
		if(typeof(pl.kickright) == "undefined"){pl.kickright = 0};
		plStats = calcStats(pl);
		document.getElementById("teamOneTableWithNames").innerHTML += "<tr><td>" + pl.number + ". " + pl.first + " " + pl.last + "</td><td>" + pl.foot + "</td><td>" + pl.arm + "</td><td>" + pl.ab + "</td><td>" + plStats[0].toFixed(3) + "</td><td>" + plStats[1].toFixed(3) + "</td><td>" + pl.runs + "</td><td>" + plStats[2].toFixed(2) + "</td><td>" + plStats[3] + "</td></tr>";
	});
	Object.entries(t2Players).forEach(function(obj){
		var pl = obj[1];
		if(typeof(pl.foot) == "undefined"){pl.foot = ""};
		if(typeof(pl.arm) == "undefined"){pl.arm = ""};
		if(typeof(pl.b1) == "undefined"){pl.b1 = 0};
		if(typeof(pl.b2) == "undefined"){pl.b2 = 0};
		if(typeof(pl.b3) == "undefined"){pl.b3 = 0};
		if(typeof(pl.hr) == "undefined"){pl.hr = 0};
		if(typeof(pl.walks) == "undefined"){pl.walks = 0};
		if(typeof(pl.ab) == "undefined" || pl.ab == 0){pl.ab = .01}; //to avoid dividing by zero
		if(typeof(pl.runs) == "undefined"){pl.runs = 0};
		if(typeof(pl.er) == "undefined"){pl.er = 0};
		if(typeof(pl.ip) == "undefined"  || pl.ip == 0){pl.ip = .01};
		if(typeof(pl.kickup) == "undefined"){pl.kickup = 0};
		if(typeof(pl.kickdown) == "undefined" || pl.kickdown == 0){pl.kickdown = .01};
		if(typeof(pl.kickleft) == "undefined"){pl.kickleft = 0};
		if(typeof(pl.kickmid) == "undefined" || pl.kickmid == 0){pl.kickmid = .01};
		if(typeof(pl.kickright) == "undefined"){pl.kickright = 0};
		plStats = calcStats(pl);
		document.getElementById("teamTwoTableWithNames").innerHTML += "<tr><td>" + pl.number + ". " + pl.first + " " + pl.last + "</td><td>" + pl.foot + "</td><td>" + pl.arm + "</td><td>" + pl.ab + "</td><td>" + plStats[0].toFixed(3) + "</td><td>" + plStats[1].toFixed(3) + "</td><td>" + pl.runs + "</td><td>" + plStats[2].toFixed(2) + "</td><td>" + plStats[3] + "</td></tr>";
	});
	
});

//////////////////////////////////////////

$("#startGame").click(function(){
	newGame();
	$("#teamsWithNames").hide();
	$("#gameUI").show();
	t1Runs = 0;
	t2Runs = 0;
	inning = 1;
	outs = 0;
	
});

function newGame(){
	$("#bottomInning").hide();
	kickTeam = 1;
	switchTeams();
	$("#kickPlacement").hide();
	var chargeSound = new Audio('charge.mp3').play()
}

function switchTeams(){
	outs = 0;
	document.getElementById("outCount").innerHTML = "0 OUTS";
	document.getElementById("pitchSelect").value = "empty";
	document.getElementById("kickSelect").value = "empty";
	document.getElementById("runOneSelect").value = "empty";
	document.getElementById("runTwoSelect").value = "empty";
	document.getElementById("runThreeSelect").value = "empty";
	document.getElementById("runFourSelect").value = "empty";
	if(kickTeam==1){
		populateUpSelect(t1Players,"kickSelect");
		populateUpSelect(t2Players,"pitchSelect");
	}
	else{
		populateUpSelect(t2Players,"kickSelect");
		populateUpSelect(t1Players,"pitchSelect");
	}
}

function nextPlay(){
	dimButtons("playButton",true);
	dimButtons("runButton",true);
	dimButtons("outButton",true);
	dimButtons("kickButton",true);
	$("#kickPlacement").hide(200);
	document.getElementById("kickSelect").value = "empty";
	kickThisPlay = null;
	runsThisPlay = null;
	outsThisPlay = null;
	dirThisPlay = null;
	$("#runOneDiv").hide(200);
	$("#runTwoDiv").hide(200);
	$("#runThreeDiv").hide(200);
	$("#runFourDiv").hide(200);
	document.getElementById("nextPlayError").innerHTML = "";
}

function dimButtons(buttonsName,reset){
	var buttons = document.getElementsByClassName(buttonsName)
	for(i=0;i<buttons.length;i++){
		if(reset){
			buttons[i].style.opacity = 1;
		}
		else{
			buttons[i].style.opacity = .4;
		}
	}
}

$(".playButton").click(function(){
	dimButtons("playButton",false);
	this.style.opacity = 1;
	if(this.id != "playWalk" && this.id != "playOut"){
		$("#kickPlacement").show(200);
	}
	else{
		$("#kickPlacement").hide(200);
	}
});

$(".runButton").click(function(){
	dimButtons("runButton",false);
	this.style.opacity = 1;
});

$(".outButton").click(function(){
	dimButtons("outButton",false);
	this.style.opacity = 1;
});

$(".kickButton").click(function(){
	dimButtons("kickButton",false);
	this.style.opacity = 1;
});

$("#nextPlayBtn").click(function(){
	var validation = validatePlay();
	if(validation == "valid"){
		preparePlayData();
		nextPlay();
	}
	else{
		document.getElementById("nextPlayError").innerHTML = "Error: " + validation;
		//console.log(validation);
	}
});

$("#runZero").click(function(){
	runsThisPlay = 0;
	$("#runOneDiv").hide(200);
	$("#runTwoDiv").hide(200);
	$("#runThreeDiv").hide(200);
	$("#runFourDiv").hide(200);
	document.getElementById("runOneSelect").value = "empty";
	document.getElementById("runTwoSelect").value = "empty";
	document.getElementById("runThreeSelect").value = "empty";
});

$("#runOne").click(function(){
	runsThisPlay = 1;
	if(kickTeam==1){
		populateUpSelect(t1Players,"runOneSelect");
	}
	else{
		populateUpSelect(t2Players,"runOneSelect");
	}
	$("#runOneDiv").show(200);
	$("#runTwoDiv").hide(200);
	$("#runThreeDiv").hide(200);
	$("#runFourDiv").hide(200);
	document.getElementById("runTwoSelect").value = "empty";
	document.getElementById("runThreeSelect").value = "empty";
});

$("#runTwo").click(function(){
	runsThisPlay = 2;
	if(kickTeam==1){
		populateUpSelect(t1Players,"runOneSelect");
		populateUpSelect(t1Players,"runTwoSelect");
	}
	else{
		populateUpSelect(t2Players,"runOneSelect");
		populateUpSelect(t2Players,"runTwoSelect");
	}
	$("#runOneDiv").show(200);
	$("#runTwoDiv").show(200);
	$("#runThreeDiv").hide(200);
	$("#runFourDiv").hide(200);
	document.getElementById("runThreeSelect").value = "empty";
});

$("#runThree").click(function(){
	runsThisPlay = 3;
	if(kickTeam==1){
		populateUpSelect(t1Players,"runOneSelect");
		populateUpSelect(t1Players,"runTwoSelect");
		populateUpSelect(t1Players,"runThreeSelect");
	}
	else{
		populateUpSelect(t2Players,"runOneSelect");
		populateUpSelect(t2Players,"runTwoSelect");
		populateUpSelect(t2Players,"runThreeSelect");
	}
	$("#runOneDiv").show(200);
	$("#runTwoDiv").show(200);
	$("#runThreeDiv").show(200);
	$("#runFourDiv").hide(200);
});

$("#runFour").click(function(){
	runsThisPlay = 4;
	if(kickTeam==1){
		populateUpSelect(t1Players,"runOneSelect");
		populateUpSelect(t1Players,"runTwoSelect");
		populateUpSelect(t1Players,"runThreeSelect");
		populateUpSelect(t1Players,"runFourSelect");
	}
	else{
		populateUpSelect(t2Players,"runOneSelect");
		populateUpSelect(t2Players,"runTwoSelect");
		populateUpSelect(t2Players,"runThreeSelect");
		populateUpSelect(t2Players,"runFourSelect");
	}
	$("#runOneDiv").show(200);
	$("#runTwoDiv").show(200);
	$("#runThreeDiv").show(200);
	$("#runFourDiv").show(200);
});

$("#outZero").click(function(){
	outsThisPlay = 0;
});

$("#outOne").click(function(){
	outsThisPlay = 1;
});

$("#outTwo").click(function(){
	outsThisPlay = 2;
});

$("#outThree").click(function(){
	outsThisPlay = 3;
});

$("#kickUpLeft").click(function(){
	dirThisPlay = "upLeft";
});

$("#kickUpMid").click(function(){
	dirThisPlay = "upMid";
});

$("#kickUpRight").click(function(){
	dirThisPlay = "upRight";
});

$("#kickDownLeft").click(function(){
	dirThisPlay = "downLeft";
});

$("#kickDownMid").click(function(){
	dirThisPlay = "downMid";
});

$("#kickDownRight").click(function(){
	dirThisPlay = "downRight";
});

$("#playSingle").click(function(){
	kickThisPlay = "single";
});

$("#playDouble").click(function(){
	kickThisPlay = "double";
});

$("#playTriple").click(function(){
	kickThisPlay = "triple";
});

$("#playHomeRun").click(function(){
	kickThisPlay = "homerun";
	$("#gameUI").fireworks(); //from https://github.com/csudcy/jquery.fireworks
	setTimeout(function(){$("#gameUI").fireworks("destroy")},3000);
});

$("#playWalk").click(function(){
	kickThisPlay = "walk";
});

$("#playOut").click(function(){
	kickThisPlay = "out";
	var outSound = new Audio('out.mp3').play();
	$("#ump").show();
	setTimeout(function(){$("#ump").hide()},1000);
});

function populateUpSelect(tPlayers,upSelect){
	var x = document.getElementById(upSelect);
	var xl = x.length;
	for(i=1;i<xl;i++){ //first clear out existing players
		x.remove(1);
	}
	Object.entries(tPlayers).forEach(function(obj){
		var pl = obj[1]
		var option = document.createElement("option");
		option.text = pl.number + ". " + pl.first + " " + pl.last;
		option.value = pl.first+pl.last;
		x.add(option);
	});
}

function validatePlay(){
	//make sure everything is filled out
	if(document.getElementById("kickSelect").value == "empty"){
		return "Make sure you fill in who is kicking!";
	}
	if(document.getElementById("pitchSelect").value == "empty"){
		return "Make sure you fill in who is pitching!";
	}
	if(typeof kickThisPlay == "undefined"){
		return "Make sure you select what happened this play!";
	}
	if(document.getElementById("kickPlacement").style.display == "" && typeof dirThisPlay == "undefined"){
		return "Make sure you select where the ball was kicked!";
	}
	if(typeof runsThisPlay == "undefined"){
		return "Make sure you select how many runs were scored this play!";
	}
	if(typeof outsThisPlay == "undefined"){
		return "Make sure you select how many outs there were this play!";
	}
	
	//make sure scorers are entered
	switch(runsThisPlay){
		case 1:
			if(document.getElementById("runOneSelect").value == "empty"){
				return "Make sure you've filled in which player scored!";
			}
			break;
		case 2:
			if(document.getElementById("runOneSelect").value == "empty" || document.getElementById("runTwoSelect").value == "empty"){
				return "Make sure you've filled in everyone that scored!";
			}
			break;
		case 3:
			if(document.getElementById("runOneSelect").value == "empty" || document.getElementById("runTwoSelect").value == "empty" || document.getElementById("runThreeSelect").value == "empty"){
				return "Make sure you've filled in everyone that scored!";
			}
			break;
		case 4:
			if(document.getElementById("runOneSelect").value == "empty" || document.getElementById("runTwoSelect").value == "empty" || document.getElementById("runThreeSelect").value == "empty" || document.getElementById("runFourSelect").value == "empty"){
				return "Make sure you've filled in everyone that scored!";
			}
			break;
	}
	
	//check for duplicate scorers
	switch(runsThisPlay){
		case 2:
			if(document.getElementById("runOneSelect").value == document.getElementById("runTwoSelect").value){
				return "Make sure you haven't listed the same player as scoring more than once!";
			}
			break;
		case 3:
			if(document.getElementById("runOneSelect").value == document.getElementById("runTwoSelect").value || document.getElementById("runOneSelect").value == document.getElementById("runThreeSelect").value || document.getElementById("runThreeSelect").value == document.getElementById("runTwoSelect").value){
				return "Make sure you haven't listed the same player as scoring more than once!";
			}
			break;
		case 4:
			if(document.getElementById("runOneSelect").value == document.getElementById("runTwoSelect").value || document.getElementById("runOneSelect").value == document.getElementById("runThreeSelect").value || document.getElementById("runOneSelect").value == document.getElementById("runFourSelect").value || document.getElementById("runTwoSelect").value == document.getElementById("runThreeSelect").value || document.getElementById("runTwoSelect").value == document.getElementById("runFourSelect").value || document.getElementById("runThreeSelect").value == document.getElementById("runFourSelect").value){
				return "Make sure you haven't listed the same player as scoring more than once!";
			}
			break;
	}
	
	//make sure a home run leads to at least one run
	if(kickThisPlay == "homerun" && runsThisPlay == 0){
		return "You can't kick a home run and not have any runs score!"
	}
	
	//make sure a kicker out leads to at least one out
	if(kickThisPlay == "out" && outsThisPlay == 0){
		return "Make sure you include the out from the kicker!"
	}
	
	return "valid"; //only runs if nothing else was hit
}

function preparePlayData(){
	kicker = allPlayers[document.getElementById("kickSelect").value];
	pitcher = allPlayers[document.getElementById("pitchSelect").value];
	kicker.ab = Math.floor(kicker.ab+1); //to deal with first-ever at-bat being set to .01
	switch(kickThisPlay){
		case "single":
			kicker.b1++;
			break;
		case "double":
			kicker.b2++;
			break;
		case "triple":
			kicker.b3++;
			break;
		case "homerun":
			kicker.hr++;
			break;
		case "walk":
			kicker.walks++;
			break;
	}
	if(typeof dirThisPlay != "undefined" && kickThisPlay != "walk" && kickThisPlay != "out"){ //double-check that inputter didn't add this info and then change play type
		switch(dirThisPlay){
			case "upLeft":
				kicker.kickup++;
				kicker.kickleft++;
				break;
			case "upMid":
				kicker.kickup++;
				kicker.kickmid = Math.floor(kicker.kickmid+1);
				break;
			case "upRight":
				kicker.kickup++;
				kicker.kickright++;
				break;
			case "downLeft":
				kicker.kickdown++;
				kicker.kickleft++;
				break;
			case "downMid":
				kicker.kickdown++;
				kicker.kickmid = Math.floor(kicker.kickmid+1);
				break;
			case "downRight":
				kicker.kickdown++;
				kicker.kickright++;
				break;
		}
	}
	if(kickTeam==1){
		t1Runs+=runsThisPlay;
		document.getElementById("t1Score").innerHTML = "TEAM ONE &nbsp;&nbsp; " + t1Runs;
	}
	else{
		t2Runs+=runsThisPlay;
		document.getElementById("t2Score").innerHTML = "TEAM TWO &nbsp;&nbsp; " + t2Runs;
	}
	switch(runsThisPlay){
		case 1:
			scorer1 = allPlayers[document.getElementById("runOneSelect").value];
			scorer1.runs++;
			break;
		case 2:
			scorer1 = allPlayers[document.getElementById("runOneSelect").value];
			scorer1.runs++;
			scorer2 = allPlayers[document.getElementById("runTwoSelect").value];
			scorer2.runs++;
			break;
		case 3:
			scorer1 = allPlayers[document.getElementById("runOneSelect").value];
			scorer1.runs++;
			scorer2 = allPlayers[document.getElementById("runTwoSelect").value];
			scorer2.runs++;
			scorer3 = allPlayers[document.getElementById("runThreeSelect").value];
			scorer3.runs++;
			break;
		case 4:
			scorer1 = allPlayers[document.getElementById("runOneSelect").value];
			scorer1.runs++;
			scorer2 = allPlayers[document.getElementById("runTwoSelect").value];
			scorer2.runs++;
			scorer3 = allPlayers[document.getElementById("runThreeSelect").value];
			scorer3.runs++;
			scorer4 = allPlayers[document.getElementById("runFourSelect").value];
			scorer4.runs++;
			break;
	}
	pitcher.er+=runsThisPlay;
	outs+=outsThisPlay;
	switch(outsThisPlay){
		case 1:
			pitcher.ip = Math.round((pitcher.ip+.333)*3)/3;
			break;
		case 2:
			pitcher.ip = Math.round((pitcher.ip+.666)*3)/3;
			break;
		case 3:
			pitcher.ip++;
			break;
	}
	switch(outs){
		case 0:
			break;
		case 1:
			document.getElementById("outCount").innerHTML = "1 OUT";
			break;
		case 2:
			document.getElementById("outCount").innerHTML = "2 OUTS";
			break;
		default:
			if(kickTeam==1){
				kickTeam = 2;
				$("#topInning").hide();
				$("#bottomInning").show();
			}
			else{
				kickTeam = 1;
				inning++;
				if(inning>7){
					endGame();
				}
				document.getElementById("inningNum").innerHTML = inningArray[inning];
				$("#topInning").show();
				$("#bottomInning").hide();
			}
			switchTeams(); //check later that this isn't too early in this function and messing things up!
	}
	allPlayers[kicker.first+kicker.last] = kicker;
	allPlayers[pitcher.first+pitcher.last] = pitcher;
	updatePlayerData(kicker);
	updatePlayerData(pitcher);
	if(typeof scorer1 != "undefined"){
		allPlayers[scorer1.first+scorer1.last] = scorer1;
		updatePlayerData(scorer1);
	}
	if(typeof scorer2 != "undefined"){
		allPlayers[scorer2.first+scorer2.last] = scorer2;
		updatePlayerData(scorer2);
	}
	if(typeof scorer3 != "undefined"){
		allPlayers[scorer3.first+scorer3.last] = scorer3;
		updatePlayerData(scorer3);
	}
	if(typeof scorer4 != "undefined"){
		allPlayers[scorer4.first+scorer4.last] = scorer4;
		updatePlayerData(scorer4);
	}
}

function updatePlayerData(pl){
	if((pl.ip%1).toFixed(2)=="0.01"){pl.ip=Math.round(pl.ip)}; //round numbers ending in .01
	if((pl.ab%1).toFixed(2)=="0.01"){pl.ab=Math.round(pl.ab)};
	db.collection("players").doc(pl.first+pl.last).update({
		ab: pl.ab,
		b1: pl.b1,
		b2: pl.b2,
		b3: pl.b3,
		er: pl.er,
		hr: pl.hr,
		ip: pl.ip,
		kickdown: Math.floor(pl.kickdown),
		kickleft: pl.kickleft,
		kickmid: Math.floor(pl.kickmid),
		kickright: pl.kickright,
		kickup: pl.kickup,
		runs: pl.runs,
		walks: pl.walks
	})
}

$("#endGameBtn").click(function(){
	endGame();
});

function endGame(){
	$("#gameUI").hide();
	$("#loadingDiv").show();
	document.getElementById("athletesText").innerHTML = "The final score is Team One " + t1Runs + ", Team Two " + t2Runs + ". Check out your updated stats below!";
	loadAthletes();
}

$("#advancedMenuImg").click(function() {
	$("#advancedMenu").toggle();
});

$("#t1RunsPlus").click(function() {
	t1Runs++;
	document.getElementById("t1Score").innerHTML = "TEAM ONE &nbsp;&nbsp; " + t1Runs;
});

$("#t2RunsPlus").click(function() {
	t2Runs++;
	document.getElementById("t2Score").innerHTML = "TEAM TWO &nbsp;&nbsp; " + t2Runs;
});

$("#t1RunsMinus").click(function() {
	if(t1Runs>0){
		t1Runs--;
		document.getElementById("t1Score").innerHTML = "TEAM ONE &nbsp;&nbsp; " + t1Runs;
	}
});

$("#t2RunsMinus").click(function() {
	if(t2Runs>0){
		t2Runs--;
		document.getElementById("t2Score").innerHTML = "TEAM TWO &nbsp;&nbsp; " + t2Runs;
	}
});

$("#outsPlus").click(function() {
	if(outs<2){
		outs++;
		document.getElementById("outCount").innerHTML = outs + " OUTS";
		if(document.getElementById("outCount").innerHTML == "1 OUTS"){document.getElementById("outCount").innerHTML = "1 OUT"};
	}
});

$("#outsMinus").click(function() {
	if(outs>0){
		outs--;
		document.getElementById("outCount").innerHTML = outs + " OUTS";
		if(document.getElementById("outCount").innerHTML == "1 OUTS"){document.getElementById("outCount").innerHTML = "1 OUT"};
	}
});

$("#inningPlus").click(function() {
	if(kickTeam==1){
		kickTeam = 2;
		$("#topInning").hide();
		$("#bottomInning").show();
	}
	else{
		kickTeam = 1;
		inning++;
		if(inning>7){
			endGame();
		}
		document.getElementById("inningNum").innerHTML = inningArray[inning];
		$("#topInning").show();
		$("#bottomInning").hide();
	}
	switchTeams(); //check later that this isn't too early in this function and messing things up!
});

$("#inningMinus").click(function() {
	if(kickTeam==2){
		kickTeam = 1;
		$("#topInning").show();
		$("#bottomInning").hide();
		document.getElementById("inningNum").innerHTML = inningArray[inning];
		switchTeams(); //check later that this isn't too early in this function and messing things up!
	}
	else{
		if(inning>1){
			kickTeam = 2;
			inning--;
			document.getElementById("inningNum").innerHTML = inningArray[inning];
			$("#topInning").hide();
			$("#bottomInning").show();
			switchTeams(); //check later that this isn't too early in this function and messing things up!
		}
	}
});

function shuffle(array) { //from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function lowerFirst(string) //from https://paulund.co.uk/capitalize-first-letter-string-javascript
{
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function getParameterByName(name, url) { //from https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
