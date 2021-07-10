var myTeam = null; //temp start as britain
//var worldCode = "Y50WTA"; //temp hardcoded world
//var worldCode = "3HVLUW";
var worldCode = null;
var squares = []; //to hold all map squares
var claimableSquares = []; //to hold claimable map squares
var year = 0;
var nextUp = "";
var years = [1500, 1600, 1700, 1800, 1815, 1830, 1845, 1860, 1875, 1885, 1895, 1900];
var claims = 0;
var turnCountdown = null;
var squaresThisTurn = "";
var turnHistory = "";
var claimableSecondAttempt = false;
var firstLoad = true;
var numTeams = 0;
var tutorialMode = false;
var timeLeft = 0;
var teacherMode = false;
var paused = false;

$(document).ready(function() {
	//Load map data from csv file
	$.ajax({
        type: "GET",
        url: "mapData.csv",
        dataType: "text",
        success: function(data) {
			mapDataArray = $.csv.toObjects(data);
			fillTable();
				 $.ajax({
					type: "GET",
					url: "mapDataTutorial.csv",
					dataType: "text",
					success: function(data) {
						mapDataArrayTutorial = $.csv.toObjects(data);
						fillTableTutorial(); //done here so tooltips are linked to squares
						$('.tooltip').tooltipster({ //start tooltipster https://iamceege.github.io/tooltipster/#getting-started
							theme: 'tooltipster-light',
							side: ['left','right','top','bottom'],
							distance: -6,
							animationDuration: 200,
							content: 'Loading...',
							contentAsHTML: true,
							interactive: true,
							functionBefore: function(instance, helper){
								if(tutorialMode){
									instance.content(createTooltipTutorial(helper.origin.id.substring(23)));
								}
								else{
									instance.content(createTooltip(helper.origin.id.substring(15)));
								}
							}
						});
					}
				 });
		}
     });
	 //Load team data from csv file
	 $.ajax({
        type: "GET",
        url: "teamData.csv",
        dataType: "text",
        success: function(data) {
			teamDataArray = $.csv.toObjects(data);
		}
     });
});

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBEE-8nI0Z9kZIBYJejd0B5Y4tUaYo2dCU",
    authDomain: "scrambleforafrica-b6375.firebaseapp.com",
    databaseURL: "https://scrambleforafrica-b6375.firebaseio.com",
    projectId: "scrambleforafrica-b6375",
    storageBucket: "scrambleforafrica-b6375.appspot.com",
    messagingSenderId: "606539511518"
};
firebase.initializeApp(config);
var db = firebase.database();
gameIntro();

function gameIntro(){
	var worldCodeIn = getParameterByName("world");
	if(worldCodeIn != null){
		$("#loadingDiv").show();
		db.ref('worlds/'+worldCodeIn).once('value').then(function(snapshot) { //make sure this world code exists
			if(snapshot.val() != null){
				numTeams = snapshot.val().teams;
				worldCode = worldCodeIn;
				getTeam();
			}
			else{
				$("#enterWorldCode").show(); //if the world code is invalid, we need one input
				$("#loadingDiv").hide();
			}
		});
	}
	else{
		$("#enterWorldCode").show(); //if there's no world code, we need it input
	}
}

document.getElementById('worldCodeInBtn').onclick=function(){ //take in world code from input box
	var worldCodeIn = document.getElementById('worldCodeIn').value.toUpperCase();
	if(worldCodeIn != ""){
		$("#loadingDiv").show();
		db.ref('worlds/'+worldCodeIn).once('value').then(function(snapshot) { //make sure this world code exists
			if(snapshot.val() != null){
				numTeams = snapshot.val().teams;
				$("#worldCodeError").hide();
				worldCode = worldCodeIn;
				document.getElementById('worldCodeInBtn').disabled = true;
				$("#newWorldCode").hide();
				getTeam();
			}
			else{
				$("#worldCodeError").show();
				$("#loadingDiv").hide();
			}
		});
	}
}

function getTeam(){
	for(i=0;i<(7-numTeams);i++){
		document.getElementById("teamSelect").remove(6-i); //remove non-existent teams from team selection dropdown
	}
	if(getParameterByName("team")=="teacher"){
		teacherMode = true;
		runTeacherMode();
	}
	else{
		myTeam =  parseInt(getParameterByName("team"));
		if(myTeam < 1 || myTeam > numTeams || isNaN(myTeam)){
			$("#selectTeam").show();
			$("#loadingDiv").hide();
		}
		else{
			$("#loadingDiv").show();
			loadGame();
		}
	}
}

document.getElementById('teamSelectBtn').onclick=function(){ //take in team number from drop down
	document.getElementById('teamSelectBtn').disabled = true;
	myTeam = parseInt(document.getElementById("teamSelect").value);
	loadGame();
}

function loadGame(){
	$("#loadingDiv").show();
	updateState();
	drawKey();
}

function tutorialCheck(){
	$("#introDivs").hide();
	if(year==1500){
		runTutorial();
		clearInterval(turnCountdown);
	}
	else if(year==1900){ //if the game has already ended
		$("#mainGame").show();
		endGame();
	}
	else{
		$("#mainGame").show();
	}
}

function runTutorial(){
	//$("#mainGame").show();
	tutorialMode = true;
	$("#tutorialDiv").show();
}

function runTeacherMode(){
	$("#introDivs").hide();
	$("#loadingDiv").show();
	db.ref('worlds/'+worldCode+'/state/').on('value',function(snapshot){ //whenever the state changes
		squares = snapshot.val().squares;
		year = snapshot.val().year;
		nextUp = snapshot.val().nextUp;
		turnHistory = snapshot.val().turnHistory;
		paused = snapshot.val().paused;
		if(document.getElementById("colorBy").value=="claim"){ //recolor squares if colored by claim
			colorSquaresClaim();
		}
		showTurnHistory();
		showScores();
		$("#loadingDiv").hide();
		document.getElementById("year").innerHTML = "Year " + year + " - ";
		document.getElementById("turn").innerHTML = lookupTeamName(nextUp) + "'s turn";
		if(paused){
			$("#teacherPause").hide();
			$("#teacherResume").show();
		}
	});
	drawKey();
	$("#mainGame").show();
	$("#uiTop2").hide();
	$("#teacherUI").show();
}

function pauseBtn(){
	$("#teacherPause").hide();
	$("#teacherResume").show();
	db.ref('worlds/'+worldCode+'/state/').update({ //update Firebase
		paused: true
	});
}

function resumeBtn(){
	$("#teacherPause").show();
	$("#teacherResume").hide();
	db.ref('worlds/'+worldCode+'/state/').update({ //update Firebase
		paused: false
	});
}

function skipTurn(){
	squaresThisTurn = "s0";
	if(nextUp==numTeams && year==1895){//if the game is over
		db.ref('worlds/'+worldCode+'/state/').update({ //update Firebase
			squares: squares,
			year: 1900, //the game is over at year = 1900
			turnHistory: turnHistory + "t" + nextUp + squaresThisTurn
		})
	endGame();
	}
	else{
		if(nextUp==numTeams){ //wrap last team back to 0, increase year
			nextUp=0;
			year = years[years.indexOf(year)+1];
		}; 
		db.ref('worlds/'+worldCode+'/state/').update({ //update Firebase
			squares: squares,
			nextUp: nextUp+1,
			year: year,
			turnHistory: turnHistory + "t" + nextUp + squaresThisTurn
		})
	}
}

function fillTable(){
	var africaMapTableHtml = '<table id="mapTable" border="1" cellspacing="0" cellpadding="0" style="width:600px"><tr>'
	for(i=1;i<=256;i++){
		var fileName = "images/map_slices/africa_" + i.toString() + ".gif";
		africaMapTableHtml += '<td class="africaMapSquare" id="africaMapSquare' + i + '"><img class="africaMapSquarePic" id="africaMapSquarePic'  + i + '" src="' + fileName + '" width="36px"><span class="africaMapSquareNum">'+i+'</span></td>';
		if(i%16==0){ //if we need to start a new row
			africaMapTableHtml += '</tr><tr>';
		}
	}
	africaMapTableHtml = africaMapTableHtml.substring(0,africaMapTableHtml.length-4) + '</table>'; //remove the extraneous <tr>
	document.getElementById("africaMapTable").innerHTML = africaMapTableHtml; //draw table only once it's valid
	toggleNumbers(); //start with numbers hidden
	squares = document.getElementsByClassName("africaMapSquare")
	fillResources();
	findLandSquares();
}

function findLandSquares(){ //add onclick, hover and tooltip to land squares
	for(i=1;i<=256;i++){
		var square = document.getElementById("africaMapSquare"+i);
		if(mapDataArray[i].landType != 0){ //if the square isn't all ocean
			square.className += " tooltip"; //add hover color and tooltip
		}
	}
}

function createTooltip(i){ //runs on demand for each tooltip
	var tooltipString = "<b>Square " + i + "</b><br>Claimed by " + lookupTeamName(squares[i]) + "<br><br>" + lookupClimateType(mapDataArray[i].climate)+" climate<br><br>Resources: ";
	if(mapDataArray[i].cattle+mapDataArray[i].ceramics+mapDataArray[i].diamond+mapDataArray[i].glass+mapDataArray[i].gold+mapDataArray[i].slaves+mapDataArray[i].textiles == 0){
		tooltipString += "none"
	}
	else{	
		tooltipString += resourceCountToString("Cattle",mapDataArray[i].cattle) + resourceCountToString("Ceramics",mapDataArray[i].ceramics) + resourceCountToString("Diamonds",mapDataArray[i].diamond) + resourceCountToString("Glass",mapDataArray[i].glass) + resourceCountToString("Gold",mapDataArray[i].gold) + resourceCountToString("Slaves",mapDataArray[i].slaves) + resourceCountToString("Textiles",mapDataArray[i].textiles);
	}
	if(!teacherMode){
		if(claimableSquares[i]==true){
			if(nextUp==myTeam){//add claim action if it's your turn and if the square is claimable
			var onclickString = 'claimSquare('+i+');$(".tooltip").tooltipster("close")'; //extra line to deal with too many quotation marks
				tooltipString += "<br><br><button class='button' style='width: 100%; background-color:" + lookupTeamColor(myTeam)+"' onclick="+onclickString+">Claim this square</button>";
			}
			else{
				tooltipString += "<br><br>You can claim this<br>on your next turn.";
			}
		}
		else{
			//if(nextUp==myTeam){//add explanation if it's your turn and the square is not claimable
			tooltipString += "<br><br>" + claimableSquares[i];
			//}
		}
	}
	return tooltipString;
}

function lookupTeamName(num){ //this is redundant to teamData csv
	var teamNames = ["no one","Britain","France","Belgium","Spain","Germany","Italy","Portugal"];
	return teamNames[num];
}

function lookupClimateType(num){
	switch(num){
		case "":
			return "";
			break;
		case "1":
			return "Rainforest";
			break;
		case "2":
			return "Savanna";
			break;
		case "3":
			return "Steppe";
			break;
		case "4":
			return "Desert";
			break;
		case "5":
			return "Mediterranean";
			break;
	}
}

function lookupTeamColor(num){ //belgium and portugal are lighter - this is for backgrounds
	var teamColor = ["#ffffff","#ffb1d8","#ffffa4","#976f6f","#49bf49","#3b6fff","#ff6666","#ad64ad"];
	return teamColor[num];
}

function resourceCountToString(resource, num){ //used for the tooltip
	switch(num){
		case "":
			return "";
			break;
		case "1":
			return "<br>&bull; " + resource + " (few)";
			break;
		case "2":
			return "<br>&bull; " + resource + " (some)";
			break;
		case "3":
			return "<br>&bull; " + resource + " (many)";
			break;
	}
}

function fillResources(){
	var resources = ["cattle","ceramics","diamond","glass","gold","slaves","textiles"];
	for(j=0;j<=resources.length;j++){
		for(i=1;i<256;i++){
			mapSquareHtml = document.getElementById("africaMapSquare"+i).innerHTML;
			if(mapDataArray[i][resources[j]] > 0){ //if we need to draw a new icon, consider deleting id
				document.getElementById("africaMapSquare"+i).innerHTML += '<img class="africaMapResourcePic africaMapResourcePic' + i + '" src="images/resources/'+resources[j]+'.gif" width="' + (5+mapDataArray[i][resources[j]]*4)+'px">';
				var picsInThisSquare = document.getElementsByClassName("africaMapResourcePic"+i);
				if(picsInThisSquare.length==1){ //center the first pic
					picsInThisSquare[0].style.left = (18-picsInThisSquare[0].width/2)+"px";
					picsInThisSquare[0].style.top = (18-picsInThisSquare[0].width/2)+"px";
				}
				if(picsInThisSquare.length==2){ //place first two side by side
					picsInThisSquare[0].style.left = ((18-picsInThisSquare[0].width)/2)+"px";
					picsInThisSquare[1].style.left = (18+(18-picsInThisSquare[1].width)/2)+"px";
					picsInThisSquare[1].style.top = (18-picsInThisSquare[1].width/2)+"px";
				}
				if(picsInThisSquare.length==3){ //move first two up, third one down
					picsInThisSquare[0].style.top = ((18-picsInThisSquare[0].width)/2)+"px";
					picsInThisSquare[1].style.top = ((18-picsInThisSquare[1].width)/2)+"px";
					picsInThisSquare[2].style.top = (18+(18-picsInThisSquare[2].width)/2)+"px";
					picsInThisSquare[2].style.left = (18-picsInThisSquare[2].width/2)+"px";
				}
				if(picsInThisSquare.length==4){ //place last two side by side
					picsInThisSquare[2].style.left = ((18-picsInThisSquare[2].width)/2)+"px";
					picsInThisSquare[3].style.left = (18+(18-picsInThisSquare[3].width)/2)+"px";
					picsInThisSquare[3].style.top = (18+(18-picsInThisSquare[3].width)/2)+"px";
				}
			}
		}
	}
}

function claimSquare(squareNum){
	if(myTeam != nextUp){
		alert("It's not your turn!");
	}
	else if(paused){
		alert("The game is paused!");
	}
	else{
		claims--; //use one of your claims for this turn
		squares[squareNum] = myTeam; //locally claim the square
		squaresThisTurn += "s" + squareNum; //add this square to the turn history string
		if(document.getElementById("colorBy").value=="claim"){ //recolor squares if colored by claim
			colorSquaresClaim();
		}
		findClaimableSquares(); //update which squares are claimable
		switch(claims){
			case -1:
			case 0:
				endTurn();
				break;
			case 1:
				if(squaresThisTurn != ""){ //this is a fix for a timing issue when you run out of viable squares mid-turn
					document.getElementById("thisTurn").innerHTML = "Expand your colonies by <b>one more square</b>. You can only expand colonies to squares that share a side with an existing colony."
				}
				break;
			case 2:
				if(squaresThisTurn != ""){
					document.getElementById("thisTurn").innerHTML = "Expand your colonies by <b>two more squares</b>. You can only expand colonies to squares that share a side with an existing colony."
				}
				break;
			case 3:
				if(squaresThisTurn != ""){
					document.getElementById("thisTurn").innerHTML = "Expand your colonies by <b>three more squares</b>. You can only expand colonies to squares that share a side with an existing colony."
				}
				break;
		}
	}
}

function endTurn(){
	claimableSecondAttempt = false;
	if(nextUp==numTeams && year==1895){//if the game is over
		db.ref('worlds/'+worldCode+'/state/').update({ //update Firebase
			squares: squares,
			year: 1900, //the game is over at year = 1900
			turnHistory: turnHistory + "t" + myTeam + squaresThisTurn
		})
	clearInterval(turnCountdown);
	endGame();
	}
	else{
		if(nextUp==numTeams){ //wrap last team back to 0, increase year
			nextUp=0;
			year = years[years.indexOf(year)+1];
		}; 
		db.ref('worlds/'+worldCode+'/state/').update({ //update Firebase
			squares: squares,
			nextUp: nextUp+1,
			year: year,
			turnHistory: turnHistory + "t" + myTeam + squaresThisTurn
		})
		clearInterval(turnCountdown);
		squaresThisTurn = "";
	}
}

function colorSquaresClaim(){
	for(i=1;i<=256;i++){ //iterate through all squares
		var square = document.getElementById("africaMapSquare"+i);
		fillSquareClaim(square,squares[i]);
	}
}

function fillSquareClaim(square,teamNum){
	switch(teamNum){
		case 0: //unclaimed, whiteSpace
			square.style.backgroundColor = "";
			break;
		case 1: //britain, pink
			square.style.backgroundColor = "#ffb1d8";
			break;
		case 2: //france, yellow
			square.style.backgroundColor = "#ffffa4";
			break;
		case 3: //belgium, brown
			square.style.backgroundColor = "#785555";
			break;
		case 4: //spain, green
			square.style.backgroundColor = "#49bf49";
			break;
		case 5: //germany, blue
			square.style.backgroundColor = "#3b6fff";
			break;
		case 6: //italy, red
			square.style.backgroundColor = "#ff6666";
			break;
		case 7: //portugal, purple
			square.style.backgroundColor = "#985098";
			break;
	}
}

function colorSquaresClimate(){
	for(i=1;i<=256;i++){
		var square = document.getElementById("africaMapSquare"+i);
		fillSquareClimate(square, mapDataArray[i].climate);
	}
}

function fillSquareClimate(square,climateNum){
	switch(climateNum){
		case "": //ocean, white
			square.style.backgroundColor = "";
			break;
		case "1": //rainforest, deep green
			square.style.backgroundColor = "#1faf3e";
			break;
		case "2": //savanna, pale green
			square.style.backgroundColor = "#b0fec2";
			break;
		case "3": //steppe, purple
			square.style.backgroundColor = "#e2aaff";
			break;
		case "4": //desert, yellow
			square.style.backgroundColor = "#fffca1";
			break;
		case "5": //mediterranean, tan
			square.style.backgroundColor = "#fece90";
			break;
	}
}

function updateState(){
	db.ref('worlds/'+worldCode+'/state/').on('value',function(snapshot){ //whenever the state changes
		squares = snapshot.val().squares;
		year = snapshot.val().year;
		nextUp = snapshot.val().nextUp;
		turnHistory = snapshot.val().turnHistory;
		paused = snapshot.val().paused;
		if(document.getElementById("colorBy").value=="claim"){ //recolor squares if colored by claim
			colorSquaresClaim();
		}
		drawRightUI();
		findClaimableSquares();
		if(firstLoad){ //if this is the first load
			tutorialCheck();
		}
		firstLoad = false;
		if(year == 1900){ //if another team ends the game
			endGame();
		}
		if(paused){
			document.getElementById("turn").innerHTML = "The game is paused!";
		}
	});
}

function turnTimer(){
	if(!tutorialMode){
		turnCountdown = setInterval(function(){
			if(!paused){
				if(timeLeft>179){
					document.getElementById("turn").innerHTML = "<b>Your turn!</b> You have 3min " +(timeLeft-180) + "sec left.";
				}
				else if(timeLeft>119){
					document.getElementById("turn").innerHTML = "<b>Your turn!</b> You have 2min " +(timeLeft-120) + "sec left.";
				}
				else if(timeLeft>59){
					document.getElementById("turn").innerHTML = "<b>Your turn!</b> You have 1min " +(timeLeft-60) + "sec left.";
				}
				else{
					document.getElementById("turn").innerHTML = "<b>Your turn!</b> You have " +timeLeft + "sec left.";
				}

					timeLeft--;
				if(timeLeft <=-1){
					claims = 1;
					claimSquare(0);
					clearInterval(turnCountdown);
					alert("You've run out of time! Your turn is over.");
				}
			}
			else{
				document.getElementById("turn").innerHTML = "The game is paused!";
			}
		},1000);
	}
}

function toggleColor(){
	if(year!=1900){findClaimableSquares();} //so squares don't flash when colored by climate
	if(document.getElementById("colorBy").value=="claim"){
		colorSquaresClaim();
	}
	else{
		colorSquaresClimate();
	}
	drawKey();
}

function generateWorldCode(){
	$("#loadingDiv").show();
	var worldCodeGen = ((Math.random().toString(36)+'00000000000000000').slice(2, 8)).toUpperCase(); //from http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
	db.ref('worlds/'+worldCodeGen).once('value').then(function(snapshot) {
		 if(snapshot.val() != null){
			generateWorldCode();
		 }
		 else{
			 squares = Array.apply(null, Array(257)).map(Number.prototype.valueOf,0); //from https://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array
			 db.ref('worlds/'+worldCodeGen+'/state/').set({
				 year: 1500,
				 squares: squares,
				 nextUp: 1,
				 turnHistory: "0",
				 paused: false
			 });
			 worldCode = worldCodeGen;
			 $("#enterWorldCode").hide();
			 $("#loadingDiv").hide();
			 $("#createdWorldCode").show();
			 $("#numberOfTeams").show();
			 document.getElementById("createdWorldCode").innerHTML = "<br>Your world code is <b>" + worldCodeGen + "</b>.";
		 }
	 });
}

document.getElementById("numberOfTeamsBtn").onclick = function(){
	numTeams = parseInt(document.getElementById("numberOfTeamsSelect").value);
	db.ref('worlds/'+worldCode+'/').update({
		teams: numTeams
	});
	document.getElementById("numberOfTeams").innerHTML = "<br>Here are links each team can use to log in directly to your world:<br><br>"
	for(i=1;i<=numTeams;i++){
		var teamURL = window.location.href + "?world=" + worldCode + "&team=" + i;
		document.getElementById("numberOfTeams").innerHTML += "<img src='images/flags/"+teamDataArray[i].name+".png' width='32px'></img> " + lookupTeamName(i) + ": <a href=" + teamURL + ">" + teamURL + "</a><br><br>";
	}
	var teacherUrl = window.location.href + "?world=" + worldCode + "&team=teacher";
	document.getElementById("numberOfTeams").innerHTML += "And here's the teacher link you should use to monitor the map, pause the game and skip turns as necessary:<br><a href=" + teacherUrl + ">" + teacherUrl + "</a>";
}

function toggleNumbers(){
	var africaMapSquareNums = document.getElementsByClassName("africaMapSquareNum");
	if(document.getElementById("cbShowNumbers").checked){
		for(i=0;i<africaMapSquareNums.length;i++){
			africaMapSquareNums[i].style.visibility = "visible";
		}
	}
	else{
		for(i=0;i<africaMapSquareNums.length;i++){
			africaMapSquareNums[i].style.visibility = "hidden";
		}
	}
}

function toggleResources(){
	var africaMapSquareNums = document.getElementsByClassName("africaMapResourcePic");
	if(document.getElementById("cbShowResources").checked){
		for(i=0;i<africaMapSquareNums.length;i++){
			africaMapSquareNums[i].style.visibility = "visible";
		}
	}
	else{
		for(i=0;i<africaMapSquareNums.length;i++){
			africaMapSquareNums[i].style.visibility = "hidden";
		}
	}
}

function findClaimableSquares(){
	var sumClaimableSquares = 0;
	var yearFind = year;
	if(nextUp>myTeam){ //if your next turn is not in the current year
		yearFind = years[years.indexOf(year)+1];
	}
	for(i=1;i<=256;i++){ //fill claimablesquares array
		var square = document.getElementById("africaMapSquare"+i);
		square.classList.remove("claimable");
		if(yearFind == 1900){ //if your last turn has passed
			claimableSquares[i] = "Your last turn has passed."
			sumClaimableSquares++; //so there's no infinite loop at the end of the game
		}
		else if(mapDataArray[i].landType == 0){ //if the square is all ocean
			claimableSquares[i] = "This square is all ocean."; //this shouldn't appear to the user
		}
		else if(squares[i]!=0){ //if the square is claimed
			claimableSquares[i] = "This square is<br>already claimed.";
		}
		else if(mapDataArray[i][1875]=="1" && yearFind<1875){ //if the square is protected until 1875 and it's not 1875 yet
			claimableSquares[i] = "This square is protected<br>by a powerful kingdom.";
		}
		else if(mapDataArray[i][1875]=="2"){ //if the square is protected forever (Ethiopia)
			claimableSquares[i] = "Ethiopia is independent<br>and cannot be claimed.";
		}
		else if(teamDataArray[myTeam]["turn"+yearFind] == "10" && mapDataArray[i].landType != 1){ //if this turn you're starting a new colony and this square isn't on the coast
			claimableSquares[i] = "This square is<br>not on the coast.";
		}
		else if(teamDataArray[myTeam]["turn"+yearFind] != "10" && (squares[i-1] != myTeam || (i+15)%16==0) && (squares[i+1] != myTeam || i%16==0) && squares[i-16] != myTeam && squares[i+16] != myTeam){ //if you're expanding a colony and don't own any of the four surrounding colonies; modulo is to prevent world wrap
			claimableSquares[i] = "This square doesn't share<br>a side with your colonies.";
		}
		else if(teamDataArray[myTeam]["turn"+yearFind] == "0"){ //if you're not claiming a square this turn
			claimableSquares[i] = "You cannot claim<br>squares this turn.";
			sumClaimableSquares++; //so there's no infinite loop on turns where you aren't given any claims
		}
		else{
			claimableSquares[i] = true;
			sumClaimableSquares++;
			if(document.getElementById("colorBy").value=="claim"){ //only flash claimable squares if coloring by claim
				square.classList.add("claimable");
			}
		}
	}
	if(sumClaimableSquares == 0 && nextUp == myTeam){ //if there are no valid squares for this turn, and it's your turn
		if(!claimableSecondAttempt){ //if this is the first time we're trying something else
			if(squaresThisTurn!=""){ //if we're mid-turn and already have at least one square correctly claimed
				endTurn();
			}
			else if(teamDataArray[myTeam]["turn"+year] == "10"){ //if you were supposed to start a port, expand a colony
				teamDataArray[myTeam]["turn"+year] = "1";
				claimableSecondAttempt = true;
				console.log("No valid port squares were found, trying with an expansion instead.")
				clearInterval(turnCountdown);
				drawRightUI();
			}
			else if(teamDataArray[myTeam]["turn"+year] == "1" || teamDataArray[myTeam]["turn"+year] == "2" || teamDataArray[myTeam]["turn"+year] == "3" || teamDataArray[myTeam]["turn"+year] == "4"){ //if you were suppossed to expand a colony, start a port
				teamDataArray[myTeam]["turn"+year] = "10";
				claimableSecondAttempt = true;
				console.log("No valid expansion squares were found, trying with a port instead.");
				clearInterval(turnCountdown);
				drawRightUI();
			}
		}
		else if(teamDataArray[myTeam]["turn"+year]!="0"){
			teamDataArray[myTeam]["turn"+year] = "0";
			console.log("No valid squares were found at all - nothing can be claimed this turn.");
			clearInterval(turnCountdown);
			drawRightUI();
		}
	}
}

function countClaims(){
	switch(teamDataArray[myTeam]["turn"+year]){
		case "10":
		case "1":
			claims = 1;
			break;
		case "2":
			claims = 2;
			break;
		case "3":
			claims = 3;
			break;
		case "4":
			claims = 4;
			break;
		case "E": //britain in 1875, also getting Egypt
			claims = 7;
			claimSquare(27);
			claimSquare(28);
			claimSquare(43);
			claimSquare(44);
			claimSquare(45);
			break;
		case "0":
			claims = 0;
			break;
	}
}

function drawKey(){
	if(document.getElementById("colorBy").value=="claim"){
		document.getElementById("legendDiv").innerHTML='<img id="claimLegend" src="images/claimLegend'+numTeams+'.png" height="42px">'
	}
	else{
		document.getElementById("legendDiv").innerHTML='<img id="climateLegend" src="images/climateLegend.png" height="42px">'
	}
}

function drawRightUI(){
	showTurnHistory();
	showScores();
	//year and turn
	document.getElementById("year").innerHTML = "Year " + year + " - ";
		if(nextUp==myTeam){
			document.getElementById("turnHeader").innerHTML = "This Turn";
			if(year==1500){
				timeLeft = 180;
			}
			else{
				timeLeft = 120;
			}
			turnTimer();
			countClaims();
			findClaimableSquares();
		}
		else{
			document.getElementById("turn").innerHTML = lookupTeamName(nextUp) + "'s turn";
			document.getElementById("turnHeader").innerHTML = "Next Turn";
			clearInterval(turnCountdown);
		}
		
	var turnsLeft = (years.length-years.indexOf(year)-1); //further code in the objectives section
		
	//objectives
	document.getElementById("objectiveHeader").innerHTML = "<img src='images/flags/"+teamDataArray[myTeam].name+".png' width='32px'></img>  " + teamDataArray[myTeam].name + "'s Objectives" + "  <img src='images/flags/"+teamDataArray[myTeam].name+".png' width='32px'></img>"; //consider moving this out once temp team swapping is cut out
	if(nextUp<=myTeam){ //if your next turn is still in the current year
		document.getElementById("turnsLeft").innerHTML = " (" + turnsLeft + " turns left)"
		if(turnsLeft==1){
			document.getElementById("turnsLeft").innerHTML = " (1 turn left)";
		}
		if(year<1815){
			document.getElementById("teamObjective").innerHTML = teamDataArray[0].obj1500 + " " + teamDataArray[myTeam].obj1500;
		}
		else if(year<1875){
			document.getElementById("teamObjective").innerHTML = teamDataArray[0].obj1815 + " " + teamDataArray[myTeam].obj1815;
		}
		else{
			document.getElementById("teamObjective").innerHTML = teamDataArray[0].obj1875 + " " + teamDataArray[myTeam].obj1875;
		}
	}
	else{ //if your next turn is actually in the next year
	document.getElementById("turnsLeft").innerHTML = " (" + (turnsLeft-1).toString() + " turns left)"
	if(turnsLeft==2){
		document.getElementById("turnsLeft").innerHTML = " (1 turn left)";
	}
		if(year<1800){
			document.getElementById("teamObjective").innerHTML = teamDataArray[0].obj1500 + " " + teamDataArray[myTeam].obj1500;
		}
		else if(year<1860){
			document.getElementById("teamObjective").innerHTML = teamDataArray[0].obj1815 + " " + teamDataArray[myTeam].obj1815;
		}
		else{
			document.getElementById("teamObjective").innerHTML = teamDataArray[0].obj1875 + " " + teamDataArray[myTeam].obj1875;
		}
	}
	document.getElementById("teamObjective").innerHTML += " Wherever you do claim land, you certainly wouldn't mind access to gold and diamonds."
	

	
	//this turn
	var yearObj = year;
	if(nextUp>myTeam){ //if your next turn is not in the current year
		if(year==1895){//if your last turn has passed
			document.getElementById("thisTurn").innerHTML = "You have completed your final turn in the Scramble for Africa."
		}
		yearObj = years[years.indexOf(year)+1];
	}
	switch(teamDataArray[myTeam]["turn"+yearObj]){
		case "10":
			document.getElementById("thisTurn").innerHTML = "Start a new colony.  New colonies must be started on the coast."
			break;
		case "1":
			document.getElementById("thisTurn").innerHTML = "Expand a colony by one square. You can only expand colonies to squares that share a side with an existing colony."
			break;
		case "2":
			document.getElementById("thisTurn").innerHTML = "Expand your colonies by a total of two squares. You can only expand colonies to squares that share a side with an existing colony."
			break;
		case "3":
			document.getElementById("thisTurn").innerHTML = "Expand your colonies by a total of three squares. You can only expand colonies to squares that share a side with an existing colony."
			break;
		case "4":
			document.getElementById("thisTurn").innerHTML = "Expand your colonies by a total of four squares. You can only expand colonies to squares that share a side with an existing colony."
			break;
		case "E": //britain gets egypt in 1875
			document.getElementById("thisTurn").innerHTML = "You claim all of Egypt in the northwest corner of Africa. You may also expand your colonies by a total of two squares. You can only expand colonies to squares that share a side with an existing colony."
			break;
		case "0":
			if(nextUp==myTeam){
				document.getElementById("thisTurn").innerHTML = "You do not expand in Africa this turn. <button class='button' onclick='claimSquare(0)' style='background-color:" + lookupTeamColor(myTeam)+"'>Click here to continue.</button>"
			}
			else{
				document.getElementById("thisTurn").innerHTML = "You do not expand in Africa next turn."
			}
			break;
	}
}

function showScores(){
	document.getElementById("scoresDiv").innerHTML = "";
	for(j=1;j<numTeams+1;j++){
		document.getElementById("scoresDiv").innerHTML += lookupTeamName(j) + ": " + calculateScore(j) + "<br>";
	}
}

function calculateScore(team){
	var score = 0;
	for(i=1;i<=256;i++){
		if(squares[i]==team){ //if you have claimed this square
			score++; //one point for the square
			score += (parseInt(mapDataArray[i].gold) || 0) + (parseInt(mapDataArray[i].diamonds) || 0); //points for gold and diamonds
			switch(team){
				case 1: //britain
					if(i>167){score++}; //one point if the square is in the south
					score += (parseInt(mapDataArray[i].slaves) || 0) + (parseInt(mapDataArray[i].cattle) || 0);//resource points
					break;
				case 2: //france
					if(i<119){score++}; //one point if square is in the north
					score += (parseInt(mapDataArray[i].slaves) || 0); //resource points
					break;
				case 3: //belgium
					if(mapDataArray[i].climate == "1"){score++;} //rainforests
					break;
				case 4: //spain
					if(mapDataArray[i].climate == "5"){score++;} //mediterannean
					if(i<119){score++}; //one point if square is in the north
					score += (parseInt(mapDataArray[i].ceramics) || 0) + (parseInt(mapDataArray[i].glass) || 0);//resource points
					break;
				case 5: //germany
					if(mapDataArray[i].landType == "1"){score++;} //coasts
					score += (parseInt(mapDataArray[i].cattle) || 0); //resource points
					break;
				case 6: //italy
					score += (parseInt(mapDataArray[i].ceramics) || 0) + (parseInt(mapDataArray[i].glass) || 0) + (parseInt(mapDataArray[i].textiles) || 0) + (parseInt(mapDataArray[i].cattle) || 0);//resource points
					break;
				case 7: //portugal
					if(mapDataArray[i].landType == "1"){score++;} //coasts
					break;
			}
		}
	}
	switch(team){ //calculated experimentally
		case 2: //france
			score = Math.ceil(score*.94);
			break;
		case 3: //belgium
			score = Math.ceil(score*2.32);
			break;
		case 4: //spain
			score = Math.ceil(score*2.26);
			break;
		case 5: //germany
			score = Math.ceil(score*1.38);
			break;
		case 6: //italy
			score = Math.ceil(score*1.75);
			break;
		case 7: //portugal
			score = Math.ceil(score*2.01);
			break;
	}
	return score;
}

function endGame(){
	clearInterval(turnCountdown);
	
	year = 1900;
	
	$('.tooltip').tooltipster('destroy');
	for(i=1;i<=256;i++){ 
		var square = document.getElementById("africaMapSquare"+i);
		square.classList.remove("claimable");
		square.classList.remove("tooltip");
	}
	
	$("#mapOptions").hide();
	document.getElementById("cbShowNumbers").checked = false;
	toggleNumbers();
	document.getElementById("cbShowResources").checked = false;
	toggleResources();
	document.getElementById("colorBy").value="claim";
	toggleColor();
	
	$("#rightUI").hide();
	$("#endGameDiv").show();
	
	for(j=1;j<numTeams+1;j++){
		document.getElementById("finalScoresDiv").innerHTML += "<h2><img src='images/flags/"+teamDataArray[j].name+".png' width='32px'></img> "+lookupTeamName(j) + ": " + calculateScore(j) + " points</h2>";
	}
	
	document.getElementById("finalLegendDiv").innerHTML+='<img id="claimLegend" src="images/claimLegend'+numTeams+'.png" height="42px">'
}

function showRealAfrica(){
	$("#realAfrica").show();
	$("#endGameDiv").hide();
}

function showTurnHistory(){
	var turnHistoryStringArray = [];
	var turnHistoryTeamArray = turnHistory.split("t"); //[1s19s20,2s23,3s192...]
	for(i=1;i<turnHistoryTeamArray.length;i++){
		var turnHistorySquareArray = turnHistoryTeamArray[i].split("s");
		turnHistoryStringArray[i] = lookupTeamName(turnHistorySquareArray[0]);
		switch(turnHistorySquareArray.length){
			case 2:
				if(turnHistorySquareArray[1] == "0"){ //if there was no square claimed, represented by s0
					turnHistoryStringArray[i] += " did not claim a square";
				}
				else{
					turnHistoryStringArray[i] += " claimed Square " + turnHistorySquareArray[1];
				}
				break;
			case 3:
				turnHistoryStringArray[i] += " claimed Squares " + turnHistorySquareArray[1] + " and " + turnHistorySquareArray[2];
				break;
			case 4:
				turnHistoryStringArray[i] += " claimed Squares " + turnHistorySquareArray[1] + ", " + turnHistorySquareArray[2] + " and " + turnHistorySquareArray[3];
				break;
			case 5:
				turnHistoryStringArray[i] += " claimed Squares " + turnHistorySquareArray[1] + ", " + turnHistorySquareArray[2] + ", " + turnHistorySquareArray[3] + " and " + turnHistorySquareArray[4];
				break;
			case 8: //when Britain gets Egypt
				turnHistoryStringArray[i] += " claimed Squares " + turnHistorySquareArray[1] + ", " + turnHistorySquareArray[2] + ", " + turnHistorySquareArray[3] + ", " + turnHistorySquareArray[4] + ", " + turnHistorySquareArray[5] + ", " + turnHistorySquareArray[6] + " and " + turnHistorySquareArray[7];
				break;
		}
	}
	document.getElementById("turnHistoryDiv").innerHTML = "";
	for(i=1;i<Math.min(numTeams+1,turnHistoryStringArray.length);i++){
		document.getElementById("turnHistoryDiv").innerHTML += turnHistoryStringArray[turnHistoryStringArray.length - i]+"<br>";
	}
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

// TUTORIAL CODE //

function fillTableTutorial(){
	claimableSquaresTutorial = [0,false, false, true, false, false, false, false, true, false, false, false, false];
	landSquaresTutorial = [0,0,1,1,0,1,1,1,1,1,1,1,0];
	resourceSquaresTutorial = [0,"none","<br>&bull; cattle (some)","<br>&bull; ceramics (some)<br>&bull; diamond (many)",0,"<br>&bull; glass (few)","none","none","none","none","none","<br>&bull; slaves (many)",0]
	
	var africaMapTableTutorialHtml = '<table id="mapTableTutorial" border="1" cellspacing="0" cellpadding="0" style="width:112px"><tr>'
	tutorialSquares = [0,256, 191, 192, 256, 207, 208, 222, 223, 224, 238, 239, 240];
	for(i=1;i<=12;i++){
		var fileName = "images/map_slices/africa_" + tutorialSquares[i].toString() + ".gif";
		africaMapTableTutorialHtml += '<td class="africaMapSquare" id="africaMapSquareTutorial' + i + '"><img class="africaMapSquarePic" id="africaMapSquareTutorialPic'  + i + '" src="' + fileName + '" width="36px"></td>';
		if(i%3==0){ //if we need to start a new row
			africaMapTableTutorialHtml += '</tr><tr>';
		}
	}
	africaMapTableTutorialHtml = africaMapTableTutorialHtml.substring(0,africaMapTableTutorialHtml.length-4) + '</table>'; //remove the extraneous <tr>
	document.getElementById("africaMapTableTutorial").innerHTML = africaMapTableTutorialHtml; //draw table only once it's valid
	tutorialSquares = document.getElementsByClassName("africaMapSquare");
	fillResourcesTutorial();
	findLandSquaresTutorial();
}

function createTooltipTutorial(i){ //runs on demand for each tooltip
	var tooltipString = "<b>Square " + i + "</b><br>Claimed by no one<br><br>Savanna climate<br><br>Resources: ";
	if(mapDataArrayTutorial[i].cattle+mapDataArrayTutorial[i].ceramics+mapDataArrayTutorial[i].diamond+mapDataArrayTutorial[i].glass+mapDataArrayTutorial[i].gold+mapDataArrayTutorial[i].slaves+mapDataArrayTutorial[i].textiles == 0){
		tooltipString += "none"
	}
	else{	
		tooltipString += resourceCountToString("Cattle",mapDataArrayTutorial[i].cattle) + resourceCountToString("Ceramics",mapDataArrayTutorial[i].ceramics) + resourceCountToString("Diamonds",mapDataArrayTutorial[i].diamond) + resourceCountToString("Glass",mapDataArrayTutorial[i].glass) + resourceCountToString("Gold",mapDataArrayTutorial[i].gold) + resourceCountToString("Slaves",mapDataArrayTutorial[i].slaves) + resourceCountToString("Textiles",mapDataArrayTutorial[i].textiles);
	}
	if(claimableSquaresTutorial[i]==true){
		var onclickString = 'claimSquareTutorial('+i+');$(".tooltip").tooltipster("close")'; //extra line to deal with too many quotation marks
		tooltipString += "<br><br><button class='button' style='width: 100%; background-color:" + lookupTeamColor(myTeam)+"' onclick="+onclickString+">Claim this square</button>";
	}
	else{
		tooltipString += "<br><br>This square is not claimable."
	}
	return tooltipString;
}

function claimSquareTutorial(squareNum){
	claimableSquaresTutorial[squareNum] = false;
	var square = document.getElementById("africaMapSquareTutorial"+squareNum);
	square.classList.remove("claimable");
	switch(myTeam){
		case 0: //unclaimed, whiteSpace
			square.style.backgroundColor = "";
			break;
		case 1: //britain, pink
			square.style.backgroundColor = "#ffb1d8";
			break;
		case 2: //france, yellow
			square.style.backgroundColor = "#ffffa4";
			break;
		case 3: //belgium, brown
			square.style.backgroundColor = "#785555";
			break;
		case 4: //spain, green
			square.style.backgroundColor = "#49bf49";
			break;
		case 5: //germany, blue
			square.style.backgroundColor = "#3b6fff";
			break;
		case 6: //italy, red
			square.style.backgroundColor = "#ff6666";
			break;
		case 7: //portugal, purple
			square.style.backgroundColor = "#985098";
			break;
	}
	if(!claimableSquaresTutorial[3] && !claimableSquaresTutorial[8]){
		$("#tutorial1").hide();
		$("#tutorial2").show();
	}
}

function findLandSquaresTutorial(){ //add onclick, hover and tooltip to land squares
	for(i=1;i<=12;i++){
		var square = document.getElementById("africaMapSquareTutorial"+i);
		if(i==3 || i==8){ //make squares 3 and 8 claimable
			square.classList.add("claimable");
		}
		if(landSquaresTutorial[i] != 0){ //if the square isn't all ocean
			square.className += " tooltip"; //add hover color and tooltip
		}
	}
}

function fillResourcesTutorial(){
	var resources = ["cattle","ceramics","diamond","glass","gold","slaves","textiles"];
	for(j=0;j<=resources.length;j++){
		for(i=1;i<12;i++){
			mapSquareHtml = document.getElementById("africaMapSquareTutorial"+i).innerHTML;
			if(mapDataArrayTutorial[i][resources[j]] > 0){ //if we need to draw a new icon, consider deleting id
				document.getElementById("africaMapSquareTutorial"+i).innerHTML += '<img class="africaMapResourcePic africaMapResourcePicTutorial' + i + '" src="images/resources/'+resources[j]+'.gif" width="' + (5+mapDataArrayTutorial[i][resources[j]]*4)+'px">';
				var picsInThisSquare = document.getElementsByClassName("africaMapResourcePicTutorial"+i);
				if(picsInThisSquare.length==1){ //center the first pic
					picsInThisSquare[0].style.left = (18-picsInThisSquare[0].width/2)+"px";
					picsInThisSquare[0].style.top = (18-picsInThisSquare[0].width/2)+"px";
				}
				if(picsInThisSquare.length==2){ //place first two side by side
					picsInThisSquare[0].style.left = ((18-picsInThisSquare[0].width)/2)+"px";
					picsInThisSquare[1].style.left = (18+(18-picsInThisSquare[1].width)/2)+"px";
					picsInThisSquare[1].style.top = (18-picsInThisSquare[1].width/2)+"px";
				}
			}
		}
	}
}

function endTutorial(){
	tutorialMode = false;
	$("#mainGame").show();
	$("#tutorialDiv").hide();
	if(nextUp==myTeam){
		document.getElementById("turnHeader").innerHTML = "This Turn";
		turnTimer();
	}
}

function claimAllSquares(){
	for(i=0;i<256;i++){
		squares[i]=myTeam;
	}
	db.ref('worlds/'+worldCode+'/state/').update({ //update Firebase
		squares: squares,
	});
}