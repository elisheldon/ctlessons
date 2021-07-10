// Initialize Firebase
var config = {
	apiKey: "AIzaSyB4Ifje_aqjOI5g0JR8qa7Brt_XTYK_Pm8",
	authDomain: "criminaljustice-83268.firebaseapp.com",
	databaseURL: "https://criminaljustice-83268.firebaseio.com",
	projectId: "criminaljustice-83268",
	storageBucket: "criminaljustice-83268.appspot.com",
	messagingSenderId: "303271845564"
};
firebase.initializeApp(config);
var db = firebase.database();


var teamCodeIn = getParameterByName("teamCode");
if(teamCodeIn != null){
	db.ref('teams/'+teamCodeIn).once('value').then(function(snapshot) { //make sure this world code exists
		if(snapshot.val() != null){
			teamCode = teamCodeIn;
			$("#start").hide();
			populateCaseLinks();
		}
		else{
			$("#start").show();
		}
	});
}
else{
	$("#start").show();
}

document.getElementById('teamCodeInBtn').onclick=function(){ //take in team code from input box
	var teamCodeIn = document.getElementById('teamCodeIn').value.toUpperCase();
	if(teamCodeIn != ""){
		db.ref('teams/'+teamCodeIn).once('value').then(function(snapshot) { //make sure this team code exists
			if(snapshot.val() != null){
				teamCode = teamCodeIn;
				document.getElementById('teamCodeInBtn').disabled = true;
				populateCaseLinks();
				$("#start").hide();
			}
			else{
				$("#teamCodeError").show();
			}
		});
	}
}

function populateCaseLinks(){
	$("#chooseCase").show();
	var cases = ["reynolds","survey","mike","marco","franklin","swat","lawrence","assets"];
	var caseNames = ["Reynolds Wintersmith","Create Your Justice System","Mike Harrell","Marco Mendez","Franklin Lloyd","SWAT Teams","Lawrence Rakes","Asset Forfeiture (full class)"];
	for(i=0;i<cases.length;i++){
		document.getElementById("caseLinks").innerHTML += "<a href='" + cases[i] + ".html?teamCode=" + teamCode +"'>" + caseNames[i] + "</a><br><br>";
	}
}

document.getElementById('createTeamCodesBtn').onclick=function(){
	$("#start").hide();
	$("#createTeamCodes").show();
}

document.getElementById('createTeamCodeBtn').onclick=function(){
	generateTeamCode();
}
	
function generateTeamCode(){
	var teamCodeGen = ((Math.random().toString(36)+'00000000000000000').slice(2, 8)).toUpperCase(); //from http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
	db.ref('teams/'+teamCodeGen).once('value').then(function(snapshot) { //if generated code already exists, try again
		 if(snapshot.val() != null){
			generateTeamCode();
		 }
		 else{
			 var d = new Date();
			 db.ref('teams/'+teamCodeGen+'/').set({
				 created: d.toLocaleDateString("en-US")
			 });
			 document.getElementById("teamCodes").innerHTML += "<a href='criminalJustice.html?teamCode=" + teamCodeGen + "'>" + teamCodeGen +"</a><br>";
		 }
	 });
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