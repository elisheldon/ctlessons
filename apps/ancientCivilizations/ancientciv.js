var c = document.getElementById("yearNavCanvas");
var ctx = c.getContext("2d");
var currentStage = null;

//Resource bonus dictionaries (name: percent)
foodBonusDict = {beans: 1, chickens: 1, corn: 1.5, cows: 2, fish: 1, oranges: .5, potatoes: 1.5, wheat: 2};

//War bonus dictionaries (name: chance increase [per])
warBonusResourceDict = {bronze: .04, camels: .02, horses: .04, iron: .06, "pine trees": .02, stone: .02};
warBonusLocationDict = {desert: .1, island: .15, mountains: .15, ocean: .1, rainforest: .05, river: .05};

//Load events and facts from csv files
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "events.csv",
        dataType: "text",
        success: function(data) {eventsObjArray = $.csv.toObjects(data);} //console.log(eventsObjArray[0]["Name"] works
     });
	 $.ajax({
        type: "GET",
        url: "facts.csv",
        dataType: "text",
        success: function(data) {factsArray = $.csv.toArray(data);}
     });
});

// Initialize Firebase
var config = {
	apiKey: "AIzaSyAi58QpzMrObrr4SRu9_uZYXL8X5xQD3jQ",
	authDomain: "ancientciv-149617.firebaseapp.com",
	databaseURL: "https://ancientciv-149617.firebaseio.com",
	storageBucket: "ancientciv-149617.appspot.com",
	messagingSenderId: "136304861236"
};
firebase.initializeApp(config);
var db = firebase.database();

//Login
var provider = new firebase.auth.GoogleAuthProvider();
document.getElementById('googleSignIn').onclick=function() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		user = result.user;
		db.ref('users/'+user.uid).once('value').then(function(snapshot) {
			//Ensure up-to-date info in our db, whether user exists or not
			db.ref('users/'+user.uid).update({
				name: user.displayName,
				firstname: user.displayName.substr(0,user.displayName.indexOf(' ')), //assumes first name is first word of display name
				email: user.email,
				photo: user.photoURL
			});
			userdb = db.ref('users/'+user.uid);
			civExistsTest = snapshot.val();
			if(civExistsTest == null){ //if we're a new player
				$("#signInDiv").hide();
				$("#classCodeDiv").show();
			}
			else if(typeof civExistsTest.materials == "undefined" || typeof civExistsTest.animals == "undefined" || typeof civExistsTest.plants == "undefined"){ //if we didn't get through creating a civilization, or if something failed to save (per bug report)
				alert("It looks your civilization wasn't created successfully - we're going to delete that and refresh the page to start again.")
				deleteMyCiv();
				$("#signInDiv").hide();
				$("#classCodeDiv").show();
			}
			else{
				$("#signInDiv").hide();
				userdb.on('value',function(snapshot){ //this will run forever
					player = snapshot.val();
					player.plants["pine trees"] = player.plants["pinetrees"];
					delete player.plants["pinetrees"];
					player.resources = $.extend({}, player.animals, player.plants, player.materials);
					populateRightUI();
				});
				userdb.once('value',function(snapshot){ //this starts the game, and yes it's an extra call but it makes sure we're ready
					player = snapshot.val();
					player.plants["pine trees"] = player.plants["pinetrees"];
					delete player.plants["pinetrees"];
					player.resources = $.extend({}, player.animals, player.plants, player.materials);
					populateRightUI();
					$("#gameUI").show();
					//currentStage = "resource bonuses";
					if(typeof player.nextstage == "undefined"){
						nextStage = "resource bonuses";
					}
					else{
						nextStage = player.nextstage;
					}
					drawYearNav(nextStage);
					goToNextStage();
				})
			}
		});
	}).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		console.log(errorCode + errorMessage);
	});
}

//Classroom code creation
document.getElementById('classCodeCreateNameBtn').onclick=function() {
	if(document.getElementById("classCodeCreateNameIn").value == ""){alert("Make sure you enter your name for your classroom!");}
	else{
		document.getElementById("classCodeCreateNameBtn").disabled = true;
		classCodeCreate2Div.innerHTML = "Your classroom code is <b>" + classCodeGen + "</b>. Make sure your students input this correctly when they first log in! Press the button below if you'd like to play along.";
		db.ref('classrooms/'+classCodeGen).update({
			name: document.getElementById("classCodeCreateNameIn").value
		})
	}
}

document.getElementById('startAfterClassCodeCreate').onclick=function(){
	$("#classCodeCreateDiv").hide();
	$("#classCodeDiv").show();
}

document.getElementById('createAnotherClassCode').onclick=function(){
	document.getElementById("classCodeCreateNameBtn").disabled = false;
	generateClassCode();
}

 function generateClassCode(){
	 classCodeCreateNameIn.value = "";
	 classCodeGen = ((Math.random().toString(36)+'00000000000000000').slice(2, 8)).toUpperCase(); //from http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
	 db.ref('classrooms/'+classCodeGen).once('value').then(function(snapshot) {
		 if(snapshot.val() != null){
			console.log("Classroom code generated is not unique.");
			generateClassCode();
		 }
		 else{
			 db.ref('classrooms/'+classCodeGen).set({
				 creatoruid: user.uid
			 })
		 }
	 });
}

//Classroom code input
 document.getElementById('classCodeInBtn').onclick=function(){
	 $("#classCodeConfirmDiv").show();
	 classCode = document.getElementById('classCodeIn').value.toUpperCase();
	 if(classCode != ""){
		 db.ref('classrooms/'+classCode).once('value').then(function(snapshot) {
			 if(snapshot.val() != null){
				 classroomName = snapshot.val().name;
				 classCodeConfirmDiv.innerHTML = "You are joining <b>" + classroomName + "</b>. If that isn't correct, please double-check your classroom code above and try again.<br><br><button id='classCodeContinueBtn'>Let's play!</button><br><br>";
				 document.getElementById('classCodeContinueBtn').onclick=function(){
					$("#classCodeDiv").hide();
					$("#civCreation1").show();
					var updates = {};
					updates['users/'+user.uid+'/classcode'] = classCode;
					updates['users/'+user.uid+'/classname'] = classroomName;
					updates['classrooms/'+classCode+'/members/'+user.uid] = true;
					db.ref().update(updates);
				}
			 }
			 else{
				 classCodeConfirmDiv.innerHTML = "We didn't find that classroom code. Please double-check above and try again.<br><br>";
			 }
		 });
	 }
 }
 
 //Civilization creation
document.getElementById('civNameInBtn').onclick=function(){
	civName = document.getElementById('civNameIn').value;
	if(civName == ""){alert("You forgot to enter a name for your civilization!");}
	else{
		userdb.update({civname: capitalizeFirstLetter(civName)});
		$("#civCreation1").hide();
		$("#civCreation2").show();
	}
}
document.getElementById('civLocationInBtn').onclick=function(){
	civLocation = document.querySelector('input[name="civLocationIn"]:checked').value;
	if(civLocation == ""){alert("Your civilization needs to be located somewhere!");}
	else{
		userdb.update({
			civlocation: civLocation,
			year: 1,
			score: 10, //start with ten civilians
			rp: 0,
			plague: 0,
			nextstage: "resource bonuses"
			});
		$("#civCreation2").hide();
		$("#civCreation3").show();
		remainingRP = 20;
		camelsRP = 0;
		catsRP = 0;
		chickensRP = 0;
		cowsRP = 0;
		dogsRP = 0;
		fishRP = 0;
		horsesRP = 0;
		llamasRP = 0;
	}
}

function recalcAnimalRP(animals){
	switch(animals){
		case "camels":
			camelsRP = document.getElementById('camelsIn').value;
			if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP > 20){ //the pluses prevent javascript from treating those numbers like strings
				camelsRP = 20-catsRP-chickensRP-cowsRP-dogsRP-fishRP-horsesRP-llamasRP;
				document.getElementById('camelsIn').value = camelsRP;
			}
			break;
		case "cats":
			catsRP = document.getElementById('catsIn').value;
			if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP > 20){
				catsRP = 20-camelsRP-chickensRP-cowsRP-dogsRP-fishRP-horsesRP-llamasRP;
				document.getElementById('catsIn').value = catsRP;
			}
			break;
		case "chickens":
			chickensRP = document.getElementById('chickensIn').value;
			if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP > 20){
				chickensRP = 20-catsRP-camelsRP-cowsRP-dogsRP-fishRP-horsesRP-llamasRP;
				document.getElementById('chickensIn').value = chickensRP;
			}
			break;
		case "cows":
			cowsRP = document.getElementById('cowsIn').value;
			if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP > 20){
				cowsRP = 20-catsRP-chickensRP-camelsRP-dogsRP-fishRP-horsesRP-llamasRP;
				document.getElementById('cowsIn').value = cowsRP;
			}
			break;
		case "dogs":
			dogsRP = document.getElementById('dogsIn').value;
			if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP > 20){
				dogsRP = 20-catsRP-chickensRP-cowsRP-camelsRP-fishRP-horsesRP-llamasRP;
				document.getElementById('dogsIn').value = dogsRP;
			}
			break;
		case "fish":
			fishRP = document.getElementById('fishIn').value;
			if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP > 20){
				fishRP = 20-catsRP-chickensRP-cowsRP-dogsRP-camelsRP-horsesRP-llamasRP; 
				document.getElementById('fishIn').value = fishRP;
			}
			break;
		case "horses":
			horsesRP = document.getElementById('horsesIn').value;
			if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP > 20){
				horsesRP = 20-catsRP-chickensRP-cowsRP-dogsRP-fishRP-camelsRP-llamasRP;
				document.getElementById('horsesIn').value = horsesRP;
			}
			break;
		case "llamas":
			llamasRP = document.getElementById('llamasIn').value;
			if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP > 20){
				llamasRP = 20-catsRP-chickensRP-cowsRP-dogsRP-fishRP-horsesRP-camelsRP;; 
				document.getElementById('llamasIn').value = llamasRP;
			}
			break;
	}
	remainingRP = Math.max(0,20-camelsRP-catsRP-chickensRP-cowsRP-dogsRP-fishRP-horsesRP-llamasRP);
	animalRP.innerHTML = "Resource Points remaining: " + String(remainingRP);
}

document.getElementById('civAnimalsInBtn').onclick=function(){
	if(camelsRP % 1 != 0 || catsRP % 1 != 0 || chickensRP % 1 != 0 || cowsRP % 1 != 0 || dogsRP % 1 != 0 || fishRP % 1 != 0 || horsesRP % 1 != 0 || llamasRP % 1 != 0){
		alert("Make sure you're using only whole numbers - no decimals!");
	}
	else if (+camelsRP < 0 || +catsRP < 0 || +chickensRP < 0 || +cowsRP < 0 || +dogsRP < 0 || +fishRP < 0 || +horsesRP < 0 || +llamasRP < 0){
		alert("You've found a way to set one of your animals to a negative value - correct this and try again!");
	}
	else if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP == 20){
		$("#civCreation3").hide();
		$("#civCreation4").show();
		remainingRP = 20;
		beansRP = 0;
		cornRP = 0;
		orangesRP = 0;
		pinetreesRP = 0;
		potatoesRP = 0;
		rosesRP = 0;
		wheatRP = 0;
		db.ref('users/'+user.uid+'/animals/').update({
			camels: parseInt(camelsRP),
			cats: parseInt(catsRP),
			chickens: parseInt(chickensRP),
			cows: parseInt(cowsRP),
			dogs: parseInt(dogsRP),
			fish: parseInt(fishRP),
			horses: parseInt(horsesRP),
			llamas: parseInt(llamasRP)
		});
	}
	else if(+camelsRP + +catsRP + +chickensRP + +cowsRP + +dogsRP + +fishRP + +horsesRP + +llamasRP < 20){
		alert("Make sure you spend all 20 Resource Points!");
	}
	else{
		alert("You've found a way to spend more Resource Points than you have - check your numbers again!");
	}
}
 
 function recalcPlantRP(plants){
	switch(plants){
		case "beans":
			beansRP = document.getElementById('beansIn').value;
			if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP > 20){
				beansRP = 20-cornRP-orangesRP-pinetreesRP-potatoesRP-rosesRP-wheatRP;
				document.getElementById('beansIn').value = beansRP;
			}
			break;
		case "corn":
			cornRP = document.getElementById('cornIn').value;
			if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP > 20){
				cornRP = 20-beansRP-orangesRP-pinetreesRP-potatoesRP-rosesRP-wheatRP;
				document.getElementById('cornIn').value = cornRP;
			}
			break;
		case "oranges":
			orangesRP = document.getElementById('orangesIn').value;
			if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP > 20){
				orangesRP = 20-cornRP-beansRP-pinetreesRP-potatoesRP-rosesRP-wheatRP;
				document.getElementById('orangesIn').value = orangesRP;
			}
			break;
		case "pinetrees":
			pinetreesRP = document.getElementById('pinetreesIn').value;
			if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP > 20){
				pinetreesRP = 20-cornRP-orangesRP-beansRP-potatoesRP-rosesRP-wheatRP;
				document.getElementById('pinetreesIn').value = pinetreesRP;
			}
			break;
		case "potatoes":
			potatoesRP = document.getElementById('potatoesIn').value;
			if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP > 20){
				potatoesRP = 20-cornRP-orangesRP-pinetreesRP-beanssRP-rosesRP-wheatRP;
				document.getElementById('potatoesIn').value = potatoesRP;
			}
			break;
		case "roses":
			rosesRP = document.getElementById('rosesIn').value;
			if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP > 20){
				rosesRP = 20-cornRP-orangesRP-pinetreesRP-potatoesRP-beansRP-wheatRP;
				document.getElementById('rosesIn').value = rosesRP;
			}
			break;
		case "wheat":
			wheatRP = document.getElementById('wheatIn').value;
			if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP > 20){
				wheatRP = 20-cornRP-orangesRP-pinetreesRP-potatoesRP-rosesRP-beansRP;
				document.getElementById('wheatIn').value = wheatRP;
			}
			break;
	}
	remainingRP = Math.max(0,20-beansRP-cornRP-orangesRP-pinetreesRP-potatoesRP-rosesRP-wheatRP);
	plantRP.innerHTML = "Resource Points remaining: " + String(remainingRP);
}

document.getElementById('civPlantsInBtn').onclick=function(){
	if(beansRP % 1 != 0 || cornRP % 1 != 0 || orangesRP % 1 != 0 || pinetreesRP % 1 != 0 || potatoesRP % 1 != 0 || rosesRP % 1 != 0 || wheatRP % 1 != 0){
		alert("Make sure you're using only whole numbers - no decimals!");
	}
	else if (+beansRP < 0 || +cornRP < 0 || +orangesRP < 0 || +pinetreesRP < 0 || +potatoesRP < 0 || +rosesRP < 0 || +wheatRP < 0){
		alert("You've found a way to set one of your plants to a negative value - correct this and try again!");
	}
	else if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP == 20){
		$("#civCreation4").hide();
		$("#civCreation5").show();
		remainingRP = 20;
		goldRP = 0;
		ironRP = 0;
		stoneRP = 0;
		silkRP = 0;
		bronzeRP = 0;
		db.ref('users/'+user.uid+'/plants/').update({
			beans: parseInt(beansRP),
			corn: parseInt(cornRP),
			oranges: parseInt(orangesRP),
			pinetrees: parseInt(pinetreesRP),
			potatoes: parseInt(potatoesRP),
			roses: parseInt(rosesRP),
			wheat: parseInt(wheatRP)
		});
	}
	else if(+beansRP + +cornRP + +orangesRP + +pinetreesRP + +potatoesRP + +rosesRP + +wheatRP < 20){
		alert("Make sure you spend all 20 Resource Points!");
	}
	else{
		alert("You've found a way to spend more Resource Points than you have - check your numbers again!");
	}
}

 function recalcMaterialRP(materials){
	switch(materials){
		case "bronze":
			bronzeRP = document.getElementById('bronzeIn').value;
			if(+bronzeRP + +goldRP + +ironRP + +silkRP + +stoneRP > 10){
				bronzeRP = 10-goldRP-ironRP-silkRP-stoneRP;
				document.getElementById('bronzeIn').value = bronzeRP;
			}
			break;
		case "gold":
			goldRP = document.getElementById('goldIn').value;
			if(+bronzeRP + +goldRP + +ironRP + +silkRP + +stoneRP > 10){
				goldRP = 10-bronzeRP-ironRP-silkRP-stoneRP;
				document.getElementById('goldIn').value = goldRP;
			}
			break;
		case "iron":
			ironRP = document.getElementById('ironIn').value;
			if(+bronzeRP + +goldRP + +ironRP + +silkRP + +stoneRP > 10){
				bronzeRP = 10-goldRP-bronzeRP-silkRP-stoneRP;
				document.getElementById('ironIn').value = ironRP;
			}
			break;
		case "silk":
			silkRP = document.getElementById('silkIn').value;
			if(+bronzeRP + +goldRP + +ironRP + +silkRP + +stoneRP > 10){
				silkRP = 10-goldRP-ironRP-bronzeRP-stoneRP;
				document.getElementById('silkIn').value = silkRP;
			}
			break;
		case "stone":
			stoneRP = document.getElementById('stoneIn').value;
			if(+bronzeRP + +goldRP + +ironRP + +silkRP + +stoneRP > 10){
				stoneRP = 10-goldRP-ironRP-bronzeRP-silkRP;
				document.getElementById('stoneIn').value = stoneRP;
			}
			break;
	}
	remainingRP = Math.max(0,10-bronzeRP-goldRP-ironRP-silkRP-stoneRP);
	materialRP.innerHTML = "Resource Points remaining: " + String(remainingRP);
}

document.getElementById('civMaterialsInBtn').onclick=function(){
	if(bronzeRP % 1 != 0 || goldRP % 1 != 0 || ironRP % 1 != 0 || silkRP % 1 != 0 || stoneRP % 1 != 0){
		alert("Make sure you're using only whole numbers - no decimals!");
	}
	else if (+bronzeRP < 0 || +goldRP < 0 || +ironRP < 0 || +silkRP < 0 || +stoneRP < 0){
		alert("You've found a way to set one of your materials to a negative value - correct this and try again!");
	}
	else if(+bronzeRP + +goldRP + +ironRP + +silkRP + +stoneRP == 10){
		$("#civCreation5").hide();
		userdb.once('value',function(snapshot){ //this starts the game
				player = snapshot.val();
				player.plants["pine trees"] = player.plants["pinetrees"];
				delete player.plants["pinetrees"];
				player.resources = $.extend({}, player.animals, player.plants, player.materials);
				populateRightUI();
				$("#gameUI").show();
				currentStage = "resource bonuses";
				nextStage = "events";
				drawYearNav("resource bonuses");
				doResourceBonuses();
		})
		db.ref('users/'+user.uid+'/materials/').update({
			bronze: parseInt(bronzeRP),
			gold: parseInt(goldRP),
			iron: parseInt(ironRP),
			silk: parseInt(silkRP),
			stone: parseInt(stoneRP)
		});
		userdb.on('value',function(snapshot){
			player = snapshot.val();
			player.plants["pine trees"] = player.plants["pinetrees"];
			delete player.plants["pinetrees"];
			player.resources = $.extend({}, player.animals, player.plants, player.materials);
			populateRightUI();
		});
	}
	else if(+bronzeRP + +goldRP + +ironRP + +silkRP + +stoneRP < 10){
		alert("Make sure you spend all 10 Resource Points!");
	}
	else{
		alert("You've found a way to spend more Resource Points than you have - check your numbers again!");
	}
}

///////////////////////////
// GAMEPLAY
///////////////////////////

function hideLeftGameDivs(){
	$("#resourceBonuses").hide();
	$("#trade").hide();
	$("#reviewTrades").hide();
	$("#plague").hide();
	$("#events").hide();
	$("#yearEnd").hide();
	$("#war").hide();
}

function populateRightUI(){
	ruiCivName.innerHTML = player.civname + " " + drawLocation(player.civlocation);
	ruiYear.innerHTML = "Year: " + player.year;
	ruiPop.innerHTML = "Population: " + player.score;
	ruiAnimals.innerHTML = "";
	ruiPlants.innerHTML = "";
	ruiMaterials.innerHTML = "";
	
	 for (var animal in player.animals){
		 if(player.animals[animal] != 0){
			 ruiAnimals.innerHTML += capitalizeFirstLetter(animal) + ": " + drawResource(animal,player.animals[animal]) +"<br>"
			 };
	 }
	 for (var plant in player.plants){
		 if(player.plants[plant] != 0){
			 ruiPlants.innerHTML += capitalizeFirstLetter(plant) + ": " + drawResource(plant,player.plants[plant])+"<br>"
			 };
	 }
	 for (var material in player.materials){
		 if(player.materials[material] != 0){ruiMaterials.innerHTML += capitalizeFirstLetter(material) + ": " + drawResource(material,player.materials[material])+"<br>"};
	 }
	
}

///////////////////////////
// YEAR NAV
///////////////////////////

function drawResizedNav(){
	if(currentStage != null){drawYearNav(currentStage);}
}

function drawYearNav(stage){
	ctx.clearRect(0, 0, c.width, c.height);
	c.width = Math.ceil(.8*window.innerWidth);
	ctx.textAlign = "center";
	ctx.beginPath();
	ctx.moveTo(c.width/5,25);
	ctx.lineTo(4*c.width/5,25);
	ctx.stroke();
	ctx.arc(c.width/5,25,3,0,2*Math.PI);
	ctx.arc(2*c.width/5,25,3,0,2*Math.PI);
	ctx.arc(3*c.width/5,25,3,0,2*Math.PI);
	ctx.arc(4*c.width/5,25,3,0,2*Math.PI);
	ctx.fill();
	switch(stage){
		case "resource bonuses":
			ctx.beginPath();
			ctx.arc(c.width/5,25,5,0,2*Math.PI);
			ctx.fillStyle="blue";
			ctx.fill();
			ctx.font = "bold 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Resource bonuses',c.width/5,10);
			ctx.fillStyle="black";
			ctx.font = "normal 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Events',2*c.width/5,10);
			ctx.fillText('Trades',3*c.width/5,10);
			ctx.fillText('End of year',4*c.width/5,10);
			break;
		case "events":
			ctx.beginPath();
			ctx.arc(2*c.width/5,25,5,0,2*Math.PI);
			ctx.fillStyle = "blue";
			ctx.fill();
			ctx.font = "bold 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Events',2*c.width/5,10);
			ctx.fillStyle="black";
			ctx.font = "normal 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Resource bonuses',c.width/5,10);
			ctx.fillText('Trades',3*c.width/5,10);
			ctx.fillText('End of year',4*c.width/5,10);
			break;
		case "trades":
			ctx.beginPath();
			ctx.arc(3*c.width/5,25,5,0,2*Math.PI);
			ctx.fillStyle = "blue";
			ctx.fill();
			ctx.font = "bold 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Trades',3*c.width/5,10);
			ctx.fillStyle="black";
			ctx.font = "normal 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Resource bonuses',c.width/5,10);
			ctx.fillText('Events',2*c.width/5,10);
			ctx.fillText('End of year',4*c.width/5,10);
			break;
		case "trades2":
			ctx.beginPath();
			ctx.arc(3*c.width/5,25,5,0,2*Math.PI);
			ctx.fillStyle = "blue";
			ctx.fill();
			ctx.font = "bold 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Trades',3*c.width/5,10);
			ctx.fillStyle="black";
			ctx.font = "normal 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Resource bonuses',c.width/5,10);
			ctx.fillText('Events',2*c.width/5,10);
			ctx.fillText('End of year',4*c.width/5,10);
			break;
		case "end of year":
			ctx.beginPath();
			ctx.arc(4*c.width/5,25,5,0,2*Math.PI);
			ctx.fillStyle="blue";
			ctx.fill();
			ctx.font = "bold 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('End of year',4*c.width/5,10);
			ctx.fillStyle = "black";
			ctx.font = "normal 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Resource bonuses',c.width/5,10);
			ctx.fillText('Events',2*c.width/5,10);
			ctx.fillText('Trades',3*c.width/5,10);
			break;
		default:
			ctx.font = "normal 14px 'Palatino Linotype', 'Book Antiqua', Palatino, serif";
			ctx.fillText('Resource bonuses',c.width/5,10);
			ctx.fillText('Events',2*c.width/5,10);
			ctx.fillText('Trades',3*c.width/5,10);
			ctx.fillText('End of year',4*c.width/5,10);
			break;
	}
}

document.getElementById('nextStageBtn').onclick=function(){goToNextStage()}

function goToNextStage(){
	currentStage = nextStage;
	drawYearNav(currentStage);
	switch(nextStage){
		case "resource bonuses":
			doResourceBonuses();
			nextStage = "events";
			break;
		case "events":
			doEvents();
			nextStage = "trades";
			break;
		case "trades":
			if(player.classcode == "none"){
				drawYearNav("end of year");
				doYearEnd();
				nextStage = "resource bonuses";
			}
			else{
				selectClassmateToTrade();
				nextStage = "trades2";
			}
			break;
		case "trades2":
			var tradesLength = 0;
			if(player.classcode == "none"){
				drawYearNav("end of year");
				doYearEnd();
				nextStage = "resource bonuses";
			}
			else if(typeof player.trades != "undefined"){
				tradesLength = Object.keys(player.trades).length;
			}
			if(tradesLength==0){
				drawYearNav("end of year");
				doYearEnd();
				nextStage = "resource bonuses";
			}
			else{
				loadTrades();
				nextStage = "end of year";
			}
			break;
		case "end of year":
			doYearEnd();
			nextStage = "resource bonuses";
			break;
	}
}

///////////////////////////
// RESOURCE BONUSES
///////////////////////////

function doResourceBonuses(){
	yearStartPopulation = player.score;
	hideLeftGameDivs();
	$("#resourceBonuses").show();
	var foodBonus = 0;
	foodBonusCalcHtml = "";
	foodBonusReferenceHtml = "<table border='1'><tr><th>Resource</th><th>Bonus</th></tr>";
	$.each(foodBonusDict, function(resource,bonus){
		foodBonusReferenceHtml += "<tr><td>" + capitalizeFirstLetter(resource) + " " + drawResource(resource) + "</td><td>" + bonus + "%</td></tr>";
	});
	foodBonusReference.innerHTML = foodBonusReferenceHtml + "</table>";
	$.each(player.resources, function(resource,resourceVal){
		if (resource in foodBonusDict && resourceVal != 0){
			foodBonusCalcHtml += "With your " + String(resourceVal) + " " + resource + " " + drawResource(resource) + ", your population grows by " + foodBonusDict[resource]*resourceVal + "%. <br>";
			foodBonus += foodBonusDict[resource]*resourceVal;
		}
	});
	newScore = Math.ceil(player.score*(1+foodBonus/100));
	foodBonusCalc.innerHTML = foodBonusCalcHtml + "<br>Your total population growth from food bonuses this year is " + String(foodBonus) + "%. Your new population is " + String(newScore) + ".";
	db.ref('users/'+user.uid).update({
		score : newScore
	});
	userdb.update({nextstage: "events"});
}

///////////////////////////
// PROPOSE TRADE
///////////////////////////

$("#tradeRightArrow").click(function(){if(classmateNum + 1 == classmateUids.length){classmateNum = 0}else{classmateNum++};showClassmateResources(classmateUids[classmateNum]);});
$("#tradeLeftArrow").click(function(){if(classmateNum == 0){classmateNum = classmateUids.length - 1}else{classmateNum--};showClassmateResources(classmateUids[classmateNum]);});

function selectClassmateToTrade(){
	$("#tradeOffer").hide();
	classmateToTrade.innerHTML = "Loading classmates...";
	tradeClassmatesInstructions.innerHTML = "Select a classmate to trade with. You can only have one active trade proposal per classmate.";
	hideLeftGameDivs();
	$("#trade").show();
	loadClassmateUids();
}

function loadClassmateUids(){
	classmateUids=[];
	db.ref('classrooms/'+player.classcode+'/members/').once('value').then(function(snapshot){
		for (var classmateUid in snapshot.val()){
			if(classmateUid != user.uid){
				classmateUids.push(classmateUid);
			}
		}
		classmateNum = 0; //this is done here because of the loading delay
		if(classmateUids.length>0){
			$("#tradeClassmates").show();
			$("#noClassmates").hide();
			showClassmateResources(classmateUids[classmateNum]);
		}
		else{
			noClassmates.innerHTML = "It looks like there aren't any classmates in your class - ask your friends to join you using your class code, " + player.classcode;
			$("#tradeClassmates").hide();
			$("#noClassmates").show();
		}
	});
}

function showClassmateResources(classmateUid){
	receiverUid = classmateUid;
	db.ref('users/'+classmateUid).once('value').then(function(snapshot){
		classmate = snapshot.val();
		classmate.plants["pine trees"] = classmate.plants["pinetrees"];
		delete classmate.plants["pinetrees"];
		classmate.resources = $.extend({}, classmate.animals, classmate.plants, classmate.materials);
		classmateToTradeHtml = "<b>" + classmate.civname + "</b>, founded by " + classmate.name + "<br><table border='1' style='margin-left:auto; margin-right:auto;'><tr><th>Animals</th><th>Plants</th><th>Materials</th></tr><tr><td valign='top'>";
		for (var animal in classmate.animals){
			 if(classmate.animals[animal] != 0){classmateToTradeHtml += animal + ": " + classmate.animals[animal] + " " + drawResource(animal) + "<br>"};
		 }
		 classmateToTradeHtml += "</td><td valign='top'>"
		 for (var plant in classmate.plants){
			 if(classmate.plants[plant] != 0){classmateToTradeHtml += plant + ": " + classmate.plants[plant] + " " + drawResource(plant) + "<br>"};
		 }
		 classmateToTradeHtml += "</td><td valign='top'>"
		 for (var material in classmate.materials){
			 if(classmate.materials[material] != 0){classmateToTradeHtml += material + ": " + classmate.materials[material] + " " + drawResource(material) + "<br>"};
		 }
		 classmateToTrade.innerHTML = classmateToTradeHtml + "</td></tr></table>"
		 tradeWithBtn.innerHTML = "Trade with " + classmate.firstname;
	})
} 

$("#tradeWithBtn").click(function(){
	creatorOffer = {};
	receiverOffer = {};
	$("#tradeClassmates").hide();
	$("#tradeOffer").show();
	classmateCivHasHeader.innerHTML = classmate.civname + " has...";
	classmateCivGivesHeader.innerHTML = classmate.firstname + " will trade...";
	playerCivHasHeader.innerHTML = player.civname + " has...";
	playerCivGivesHeader.innerHTML = "You offer...";
	classmateCivHas.innerHTML = "";
	classmateCivGives.innerHTML = "";
	playerCivHas.innerHTML = "";
	playerCivGives.innerHTML = "";
	for (var resource in classmate.resources){
		 if(classmate.resources[resource] != 0){classmateCivHas.innerHTML += drawResource(resource,classmate.resources[resource],32,"classmateResourceToTrade") + " "};
	}
	for (var resource in player.resources){
		if(player.resources[resource] != 0){playerCivHas.innerHTML += drawResource(resource,player.resources[resource],32,"playerResourceToTrade") + " "};
	}
	$(".classmateResourceToTrade").click(function(){ // this will fire for both the classmateResourceToTrade and the classmateResourceInTrade images, because they're registered for the handler on creation - the class change is for the conditional within
		if($(this).attr("class") == "classmateResourceToTrade"){
			receiverOffer[$(this).attr("title")] = receiverOffer[$(this)[0].getAttribute("title")] + 1 || 1;
			$("#classmateCivGives").append($(this)[0]);
			$(this).attr("class","classmateResourceInTrade");
		}
		else{
			receiverOffer[$(this).attr("title")] = receiverOffer[$(this)[0].getAttribute("title")] - 1;
			$("#classmateCivHas").append($(this)[0]);
			$(this).attr("class","classmateResourceToTrade");
		}
	});
	$(".playerResourceToTrade").click(function(){
		if($(this).attr("class") == "playerResourceToTrade"){
			creatorOffer[$(this).attr("title")] = creatorOffer[$(this)[0].getAttribute("title")] + 1 || 1;
			$("#playerCivGives").append($(this)[0]);
			$(this).attr("class","playerResourceInTrade");
		}
		else{
			creatorOffer[$(this).attr("title")] = creatorOffer[$(this)[0].getAttribute("title")] - 1;
			$("#playerCivHas").append($(this)[0]);
			$(this).attr("class","playerResourceToTrade");
		}
	});
});

$("#proposeTradeBtn").click(function(){
	if(jQuery.isEmptyObject(receiverOffer) || jQuery.isEmptyObject(creatorOffer) || checkAllZeroes(Object.values(receiverOffer)) || checkAllZeroes(Object.values(creatorOffer))){
		alert("Make sure your trade includes at least one resource from both you and your classmate!");
	}
	else{
		db.ref('trades/'+user.uid+receiverUid).set({
			status: "pending",
			creatorUid: user.uid,
			receiverUid: receiverUid,
			creationTime: new Date().getTime(),
			receiverOffer: receiverOffer, // this saves the object correctly - no need to convert to any kind of json or string - woohoo!
			creatorOffer: creatorOffer
		});
		db.ref('users/'+user.uid+'/trades/').update({
			[user.uid+receiverUid] : "pending"
		});
		db.ref('users/'+receiverUid+'/trades/').update({
			[user.uid+receiverUid] : "pending"
		})
		$("#tradeOffer").hide();
		$("#tradeClassmates").show();
		tradeClassmatesInstructions.innerHTML = "Your trade has been proposed! Select another classmate to trade with. You can only have one active trade proposal per classmate.";
	}
});

$("#cancelTradeBtn").click(function(){
	$("#tradeOffer").hide();
	$("#tradeClassmates").show();
	tradeClassmatesInstructions.innerHTML = "Your trade has been cancelled. Select another classmate to trade with. You can only have one active trade proposal per classmate.";
});

///////////////////////////
// REVIEW TRADES
///////////////////////////

function loadTrades(){
	hideLeftGameDivs();
	$("#reviewTrades").show();
	tradesIn.innerHTML = "<h3>Trade proposals sent to you</h3>";
	tradesOut.innerHTML = "<h3>Trade proposals you've sent</h3>";
	$.each(player.trades, function(tradekey,tradestatus){
		db.ref('trades/'+tradekey).once('value').then(function(snapshot){
			var trade = snapshot.val();
			if(trade.creatorUid != user.uid && trade.status == "pending"){ //pending trades coming to the player
				db.ref('users/'+trade.creatorUid+'/firstname').once('value').then(function(snapshot2){
					var creatorName = snapshot2.val();
					tradesIn.innerHTML += creatorName + " wants to trade ";
					$.each(trade.creatorOffer, function(resource,resourceNum){
						tradesIn.innerHTML += drawResource(resource, resourceNum);
					});
					tradesIn.innerHTML += " for your ";
					$.each(trade.receiverOffer, function(resource,resourceNum){
						tradesIn.innerHTML += drawResource(resource, resourceNum);
					});
					tradesIn.innerHTML += ". You decide: <img src='images/accept.gif' height='16' title='accept' id='A"+tradekey+"'>  <img src='images/reject.gif' height='16' title='reject' id='R"+tradekey+"'><br><br>"; //make sure variable scope is working here?
					$(document).on('click',"#A"+tradekey,function(e){ //this works! unlike the normal .click, which doesn't work after more html is appended
						processTrade($(this).attr("id").slice(1),"accept");
					});
					$(document).on('click',"#R"+tradekey,function(e){
						processTrade($(this).attr("id").slice(1),"reject");
					});
				});
			};
			if(trade.creatorUid == user.uid && trade.status == "accepted"){ //accepted trades coming back to player
				db.ref('users/'+trade.receiverUid+'/firstname').once('value').then(function(snapshot2){
					var receiverName = snapshot2.val();
					tradesOut.innerHTML += receiverName + " accepted your trade proposal. You received ";
					$.each(trade.receiverOffer, function(resource,resourceNum){
						tradesOut.innerHTML += drawResource(resource, resourceNum);
					});
					tradesOut.innerHTML += " for your ";
					$.each(trade.creatorOffer, function(resource,resourceNum){
						tradesOut.innerHTML += drawResource(resource, resourceNum);
					});
					tradesOut.innerHTML += ". <br>";
					var updates = {};
					updates['users/'+user.uid+'/trades/'+tradekey] = null; //delete the trade - it's done!
					updates['users/'+trade.receiverUid+'/trades/'+tradekey] = null;
					updates['trades/'+tradekey] = null;
					$.each(trade.creatorOffer, function(resource,resourceNum){
						switch(resource){
							case "camels":
							case "cats":
							case "chickens":
							case "cows":
							case "dogs":
							case "fish":
							case "horses":
							case "llamas":
								updates['users/'+user.uid+'/animals/'+resource] = player.animals[resource] - resourceNum;
								break;
							case "beans":
							case "corn":
							case "oranges":
							case "potatoes":
							case "roses":
							case "wheat":
								updates['users/'+user.uid+'/plants/'+resource] = player.plants[resource] - resourceNum;
								break;
							case "pine trees":
								updates['users/'+user.uid+'/plants/pinetrees/'] = player.plants[resource] - resourceNum;
								break;
							case "bronze":
							case "gold":
							case "iron":
							case "silk":
							case "stone":
								updates['users/'+user.uid+'/materials/'+resource] = player.materials[resource] - resourceNum;
								break;
						}
					});
					$.each(trade.receiverOffer, function(resource,resourceNum){
						switch(resource){
							case "camels":
							case "cats":
							case "chickens":
							case "cows":
							case "dogs":
							case "fish":
							case "horses":
							case "llamas":
								updates['users/'+user.uid+'/animals/'+resource] = player.animals[resource] + resourceNum;
								break;
							case "beans":
							case "corn":
							case "oranges":
							case "potatoes":
							case "roses":
							case "wheat":
								updates['users/'+user.uid+'/plants/'+resource] = player.plants[resource] + resourceNum;
								break;
							case "pine trees":
								updates['users/'+user.uid+'/plants/pinetrees/'] = player.plants[resource] + resourceNum;
								break;
							case "bronze":
							case "gold":
							case "iron":
							case "silk":
							case "stone":
								updates['users/'+user.uid+'/materials/'+resource] = player.materials[resource] + resourceNum;
								break;
						}
					});
					db.ref().update(updates);
				});
			}
			if(trade.creatorUid == user.uid && trade.status == "rejected"){ //rejected trades coming back to player
				db.ref('users/'+trade.receiverUid+'/firstname').once('value').then(function(snapshot2){
					var receiverName = snapshot2.val();
					tradesOut.innerHTML += receiverName + " rejected your trade proposal. You asked for ";
					$.each(trade.receiverOffer, function(resource,resourceNum){
						tradesOut.innerHTML += drawResource(resource, resourceNum);
					});
					tradesOut.innerHTML += " for your ";
					$.each(trade.creatorOffer, function(resource,resourceNum){
						tradesOut.innerHTML += drawResource(resource, resourceNum);
					});
					tradesOut.innerHTML += ". <br>";
					var updates = {};
					updates['users/'+user.uid+'/trades/'+tradekey] = null; //delete the trade - it's done!
					updates['users/'+trade.receiverUid+'/trades/'+tradekey] = null;
					updates['trades/'+tradekey] = null;
					db.ref().update(updates);
				});
			}
			if(trade.creatorUid == user.uid && trade.status == "pending"){ //pending trades from player
				db.ref('users/'+trade.receiverUid+'/firstname').once('value').then(function(snapshot2){
					var receiverName = snapshot2.val();
					tradesOut.innerHTML += receiverName + " is still considering your trade proposal. You asked for ";
					$.each(trade.receiverOffer, function(resource,resourceNum){
						tradesOut.innerHTML += drawResource(resource, resourceNum);
					});
					tradesOut.innerHTML += " for your ";
					$.each(trade.creatorOffer, function(resource,resourceNum){
						tradesOut.innerHTML += drawResource(resource, resourceNum);
					});
					tradesOut.innerHTML += ". <br>";
				});
			}
		});
	});
}

function processTrade(tradekey,decision){
	db.ref('trades/'+tradekey).once('value').then(function(snapshot){
		var trade = snapshot.val();
		var updates = {};
		
		//validate trade is still valid
		db.ref('users/'+trade.creatorUid).once('value').then(function(snapshot2){
			classmate = snapshot2.val();
			classmate.plants["pine trees"] = classmate.plants["pinetrees"];
			delete classmate.plants["pinetrees"];
			classmate.resources = $.extend({}, classmate.animals, classmate.plants, classmate.materials);
			$.each(trade.creatorOffer, function(offerResource,offerResourceNum){
				if(offerResourceNum > classmate.resources[offerResource]){
					alert("This trade is no longer valid - " + classmate.firstname + " no longer has the resources required to complete it. It has been automatically rejected.");
					decision = "reject";
				}
			});
			$.each(trade.receiverOffer, function(offerResource,offerResourceNum){
				if(offerResourceNum > player.resources[offerResource]){
					alert("This trade is no longer valid - you no longer have the resources required to complete it. It has been automatically rejected.");
					decision = "reject";
				}
			});
			if(decision=="accept"){
				updates['users/'+user.uid+'/trades/'+tradekey] = "accepted";
				updates['users/'+trade.creatorUid+'/trades/'+tradekey] = "accepted";
				updates['trades/'+tradekey+'/status'] = "accepted";
				$.each(trade.receiverOffer, function(resource,resourceNum){
					switch(resource){ //this is because I combined resources together above, but they're stored separately
						case "camels":
						case "cats":
						case "chickens":
						case "cows":
						case "dogs":
						case "fish":
						case "horses":
						case "llamas":
							updates['users/'+user.uid+'/animals/'+resource] = player.animals[resource] - resourceNum;
							break;
						case "beans":
						case "corn":
						case "oranges":
						case "potatoes":
						case "roses":
						case "wheat":
							updates['users/'+user.uid+'/plants/'+resource] = player.plants[resource] - resourceNum;
							break;
						case "pine trees":
							updates['users/'+user.uid+'/plants/pinetrees/'] = player.plants[resource] - resourceNum;
							break;
						case "bronze":
						case "gold":
						case "iron":
						case "silk":
						case "stone":
							updates['users/'+user.uid+'/materials/'+resource] = player.materials[resource] - resourceNum;
							break;
					}
				});
				$.each(trade.creatorOffer, function(resource,resourceNum){
					switch(resource){
						case "camels":
						case "cats":
						case "chickens":
						case "cows":
						case "dogs":
						case "fish":
						case "horses":
						case "llamas":
							updates['users/'+user.uid+'/animals/'+resource] = player.animals[resource] + resourceNum;
							break;
						case "beans":
						case "corn":
						case "oranges":
						case "potatoes":
						case "roses":
						case "wheat":
							updates['users/'+user.uid+'/plants/'+resource] = player.plants[resource] + resourceNum;
							break;
						case "pine trees":
							updates['users/'+user.uid+'/plants/pinetrees/'] = player.plants[resource] + resourceNum;
							break;
						case "bronze":
						case "gold":
						case "iron":
						case "silk":
						case "stone":
							updates['users/'+user.uid+'/materials/'+resource] = player.materials[resource] + resourceNum;
							break;
					}
				});
				readyToLoad = true; //readyToLoad exists because loadTrades was getting called multiple times if multiple decisions were made within a year, possibly because of a then binding duplication? relatively quick fix :)
				db.ref().update(updates).then(function(){if(readyToLoad){loadTrades();}readyToLoad=false;});
			}
			else{
				updates['users/'+user.uid+'/trades/'+tradekey] = "rejected";
				updates['users/'+trade.creatorUid+'/trades/'+tradekey] = "rejected";
				updates['trades/'+tradekey+'/status'] = "rejected";
				readyToLoad = true;
				db.ref().update(updates).then(function(){if(readyToLoad){loadTrades();}readyToLoad=false;});
			}
		});
	});
}
 
///////////////////////////
// EVENTS
///////////////////////////

function doEvents(){
	if(player.year == 4){
		hideLeftGameDivs();
		$("#plague").show();
		plagueText.innerHTML = "In Year 4, the Bubonic Plague hits the world.<br><br> Civilizations with cats, chickens, cows, dogs or horses are devastated.<br><br>";
		if(player.animals["cats"]>0 || player.animals["chickens"]>0 || player.animals["cows"]>0 || player.animals["dogs"]>0 || player.animals["horses"]>0){
			plagueText.innerHTML += "Your civilization is struck hard. In your second year of existence, <b>fifty percent</b> of your civilization is wiped out before the spread of the disease is stopped.<br><br>You can only hope you never encounter a disease like this again...";
			db.ref('users/'+user.uid).update({
				plague: 1,
				score: Math.ceil(player.score/2)
			});
		}
		else{
			plagueText.innerHTML += "Lacking these animals, your civilization is miraculously spared from the plague.<br><br>You can only hope it doesn't come back some day..."
		}
	}
	else if(player.year == 10){
		hideLeftGameDivs();
		$("#plague").show();
		plagueText.innerHTML = "In Year 10, the Bubonic Plague hits the world again.<br><br>This time, it's much worse. It spreads from person to person - it no longer matters what animals your civilization has.<br><br>";
		if(player.plague == 1){
			plagueText.innerHTML += "Fortunately, your civilization is IMMUNE. Having suffered the effects of the plague six years ago, your population has built up an immunity towards it. All of your civilians are safe.";
		}
		else{
			plagueText.innerHTML += "Your civilization is struck hard. Since you weren't affected by the outbreak six years ago, your population has no immunity towards the plague. As a result, <b>ninety percent</b> of your civilization is wiped out.<br><br>You can only hope you never encounter a disease like this again...";
			db.ref('users/'+user.uid).update({
				plague: 1,
				score: Math.ceil(player.score*.1)
			});
		}
	}
	else if(player.year % 3 == 0 ){ //if the year is a multiple of 3 - it's time for war!
		doWar();
	}
	else{
		document.getElementById('nextStageBtn').disabled = true;
		hideLeftGameDivs();
		$("#events").show();
		
		eventsObjArray = shuffle(eventsObjArray); //shuffle the events array (permanent each time)
		
		monthsClicked = 0;
		eventlist.innerHTML = "<br><br>";
		eventCalYear.innerHTML = "<h2>Year " + String(player.year) + "</h2>";
		$("#eventCal1,#eventCal2,#eventCal3,#eventCal4,#eventCal5,#eventCal6,#eventCal7,#eventCal8,#eventCal9,#eventCal10,#eventCal11,#eventCal12").each(function(){
			this.className = "eventMonth";
		});
		
		$(".eventMonth").click(function(){
			if(monthsClicked < 3 && this.className == "eventMonth"){
				monthsClicked++;
				//this.style.backgroundColor = "#ddd";
				this.className = "eventMonthClicked";
				var eventObj = eventsObjArray[Number(this.id.slice(8))];
				var eventTrueIndices = [];
				var eventFalseIndices = [];
				var eventIsApplied = false;
				var eventKeys = Object.keys(eventObj);
				try{
					$.each(Object.values(eventObj), function(index, value){ //for events that happen if player has a resource
						if(value == "TRUE"){
							eventTrueIndices.push(index);
						}
					});
				}
				catch(err){
					eventlist.innerHTML = "Unfortunately, your internet browser is out of date and is causing an issue with generating events. Please update your browser and refresh the page to continue your civilization's journey!";
				}
				$.each(Object.values(eventObj), function(index, value){ //for events that happen if player does not have a resource
					if(value == "FALSE"){
						eventFalseIndices.push(index);
					}
				});
				$.each(eventTrueIndices, function(index, value){
					if(player.resources[eventKeys[value]] > 0 || eventObj["all"] == "TRUE" || eventKeys[value] == player.civlocation){ //first is if player has at least one of the resource, second is if it applies to everyone, third is if the player's location matches; doesn't matter that locations and resources are checked against the opposite, undefined is okay
						eventIsApplied = true;
					}
				});
				$.each(eventFalseIndices, function(index, value){
					if(player.resources[eventKeys[value]] == 0 || player.resources[eventKeys[value]] == undefined){
						eventIsApplied = true;
					}
				});
				if(eventIsApplied){
					if(isNaN(Number(eventObj["pts"]))){ //if this is a resource event, not a points event
						var updates = {};
						if(eventObj["pts"].slice(0,1)=="-"){ //if we're losing a resource
							var resource = eventObj["pts"].slice(1);
							eventlistHtml = "<span style='color:red'>";
							switch(resource){
								case "camels":
								case "cats":
								case "chickens":
								case "cows":
								case "dogs":
								case "fish":
								case "horses":
								case "llamas":
									updates['users/'+user.uid+'/animals/'+resource] = player.animals[resource] - 1;
									break;
								case "beans":
								case "corn":
								case "oranges":
								case "potatoes":
								case "roses":
								case "wheat":
									updates['users/'+user.uid+'/plants/'+resource] = player.plants[resource] - 1;
									break;
								case "pine trees":
									updates['users/'+user.uid+'/plants/pinetrees/'] = player.plants[resource] - 1;
									break;
								case "bronze":
								case "gold":
								case "iron":
								case "silk":
								case "stone":
									updates['users/'+user.uid+'/materials/'+resource] = player.materials[resource] - 1;
									break;
							}
						}
						else{ //if we're gaining a resource
							eventlistHtml = "<span style='color:green'>";
							var resource = eventObj["pts"];
							switch(resource){
								case "camels":
								case "cats":
								case "chickens":
								case "cows":
								case "dogs":
								case "fish":
								case "horses":
								case "llamas":
									updates['users/'+user.uid+'/animals/'+resource] = player.animals[resource] + 1;
									break;
								case "beans":
								case "corn":
								case "oranges":
								case "potatoes":
								case "roses":
								case "wheat":
									updates['users/'+user.uid+'/plants/'+resource] = player.plants[resource] + 1;
									break;
								case "pine trees":
									updates['users/'+user.uid+'/plants/pinetrees/'] = player.plants[resource] + 1;
									break;
								case "bronze":
								case "gold":
								case "iron":
								case "silk":
								case "stone":
									updates['users/'+user.uid+'/materials/'+resource] = player.materials[resource] + 1;
									break;
							}
						}
						db.ref().update(updates);
						eventlist.innerHTML += eventlistHtml + capitalizeFirstLetter(eventObj["name"]) + ": " + eventObj["posdesc"] + "</span> " + drawResource(resource) + "<br><br>";
					}
					else{ //if this is a points-based event
						if(Number(eventObj["pts"]) < 0){eventlistHtml = "<span style='color:red'>";}
						else{eventlistHtml = "<span style='color:green'>";}
						eventlist.innerHTML += eventlistHtml + capitalizeFirstLetter(eventObj["name"]) + ": " + eventObj["posdesc"] + "</span><br><br>";
						db.ref('users/'+user.uid).update({
							score : Math.round(player.score * (100+Number(eventObj["pts"]))/100)
						});
					}
				}
				else{
					if(isNaN(Number(eventObj["pts"]))){
						eventlistHtml = "<span style='color:green'>"; //this will always be green as long as the gaining resource events apply to everyone, because it's a good thing we're not losing a resource
					}
					else{
						if(Number(eventObj["pts"]) > 0){eventlistHtml = "<span style='color:red'>";}
						else{eventlistHtml = "<span style='color:green'>";}
					}
					eventlist.innerHTML += eventlistHtml + capitalizeFirstLetter(eventObj["name"]) + ": " + eventObj["negdesc"] + "</span><br><br>";
				}
				if(monthsClicked >= 3){
					document.getElementById('nextStageBtn').disabled = false;
					$(".eventMonth").each(function(){
							this.className = "eventMonthDisabled";
					});
					eventlist.innerHTML += "That's all the events for this year!";
					if(player.classcode == "none"){
						userdb.update({nextstage: "year end"});
					}
					else{
						userdb.update({nextstage: "trades"});
					}
				}
			}
		});
	}
}

///////////////////////////
// WAR
///////////////////////////

function phaserPreload(){
	game.load.image('flagSymbol', 'images/locations/' + player.civlocation + '.gif');
	game.load.atlasJSONArray('warImages','images/war/warImages.png','images/war/warImages.json');
	game.load.atlasJSONArray('fire','images/war/fireAnimation.png','images/war/fireAnimation.json');
}

function phaserCreate() {
	game.stage.backgroundColor = "#7ce87e";
	game.physics.startSystem(Phaser.Physics.ARCADE);
	
	leftEmitter = game.add.emitter(-2,200,1000); //x and y location of emitter, max number of particles alive
	leftEmitter.height = 100;
	leftEmitter.setXSpeed(100,200); //min speed, max speed
	leftEmitter.setYSpeed(-10,10);
	leftEmitter.minRotation = 0;
	leftEmitter.maxRotation = 0;
	leftEmitter.gravity = 0;
	leftEmitter.makeParticles('warImages','warrior.png',undefined,true,false); //image name, frame of image, qunatity, collide, collide with world boundaries
	
	leftEmitter.start(false, 10000, millisecondsPerWarrior); //all at once?, lifespan, how often to emit one particle
	
	huts = game.add.group();
	hutsRemaining = 5;
	huts.enableBody = true;
	for (i=18;i<500;i=i+100){
		var hut = huts.create(5,i,'warImages','hut1.png');
		hut.body.immovable = true;
		hut.health = 100;
	}
	
	rightEmitter = game.add.emitter(802,250,1000); //x and y location of emitter - rightEmitter is after huts so enemy walks over ruins
	rightEmitter.height = game.world.height;
	rightEmitter.setXSpeed(-100,-200); //min speed, max speed
	rightEmitter.setYSpeed(-50,50);
	rightEmitter.minRotation = 0;
	rightEmitter.maxRotation = 0;
	rightEmitter.gravity = 0;
	rightEmitter.makeParticles('warImages','enemy.png',undefined,true,false); //image name, frame of image, quantity, collide, collide with world boundaries
	
	rightEmitter.start(false, 30000, millisecondsPerEnemy);//millisecondsPerWarrior); //all at once?, lifespan, how often to emit one particle
	
	flag = game.add.sprite(7,220,'warImages','flag.png');
	flagSymbol = game.add.sprite(13,225,'flagSymbol',0);
	flagSymbol.scale.setTo(.05,.05);
	
	fireArray = [];
	
	gameTimer = game.time.create(false);
	gameTimer.add(30000,gameEnd,this);
	gameTimer.start();
	
	timerTextStyle = {font: "bold 20px 'Palatino Linotype', 'Book Antiqua', Palatino, serif"};
	timerText = game.add.text(530,450,"Time remaining: 30 seconds", timerTextStyle);
}

function phaserUpdate() {
	timerText.text = "Time remaining: " + (gameTimer.duration/1000).toFixed(0) + " seconds";
	
	game.physics.arcade.overlap(leftEmitter,rightEmitter,warriorCollideEnemy);
	game.physics.arcade.collide(rightEmitter,huts,enemyCollideHuts);
	
	function warriorCollideEnemy(warrior,enemy){
		if(Math.random() < warriorKillChance){
			enemy.kill();
			warrior.body.velocity.x = 100+100*Math.random();
			warrior.body.velocity.y = -50+100*Math.random();
		}
		else{
			warrior.kill();
			enemy.body.velocity.x = -100-100*Math.random();
			enemy.body.velocity.y = -50+100*Math.random();
		}
	}
	
	function enemyCollideHuts(enemy,hut){
		enemy.body.velocity.x = 0;
		enemy.body.velocity.y = 0;
		hut.health = hut.health - 1;
		game.time.events.add(200,keepGoing,this);
		function keepGoing(){
			enemy.body.velocity.x = -100-100*Math.random();
			enemy.body.velocity.y = -50+100*Math.random();
		}
		if(hut.health == 70){hut.loadTexture('warImages','hut2.png')};
		if(hut.health == 40){createFire(hut)};
		if(hut.health<0){ //if hut should die
			for(i=0;i<fireArray.length;i++){ //check all fire emitters in fire array
				if(fireArray[i].y==hut.y-18){ //if this fire emitter is where the hut was
					fireArray[i].destroy(); //destroy emitter and all particles. note kill() would not remove existing particles
				}
			}
			hut.body = null;
			hut.loadTexture('warImages','hut3.png');
			hut.alpha = .5;
			hutsRemaining--;
			if(hutsRemaining == 0){
				gameEnd();
			}
		}
	}
	
	function createFire(hut){
		var fire = game.add.sprite(hut.x-18,hut.y-18,'fire');
		fire.scale.setTo(.5,.5);
		fire.alpha = .9;
		fire.animations.add('fireAnimation');
		fire.animations.play('fireAnimation',30,true);
		fireArray.push(fire);
	}
	
	if(game.input.keyboard.isDown(Phaser.Keyboard.UP) && leftEmitter.y > 32){
		leftEmitter.y -= 5;
	}
	else if(game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && leftEmitter.y < game.world.height){
		leftEmitter.y += 5;
	}
	flag.y = leftEmitter.y - 30;
	flagSymbol.y = leftEmitter.y - 25;
}

function doWar(){
	document.getElementById('nextStageBtn').disabled = true;
	hideLeftGameDivs();
	$("#war").show();
	$("#warText").hide();
	$("#warTable").show();
	warriorKillChanceCalc();
	flowCalc();
	warInstructions.innerHTML = "It's time for war.<br><br>Based on your resources and your location, your soldiers will have a " + String(Math.round(warriorKillChance*100)) + "% chance of defeating enemies they encounter on the battlefield.<br><br>Use the Up and Down arrow keys on your keyboard to direct your soldiers into battle. The larger your population, the more soldiers you'll have in battle. Your goal is to defend your huts for thirty seconds - otherwise the enemy will kill some of your civilians!<br><br>";
	var startWarBtn = document.createElement("BUTTON");
	var startWithBtnTxt = document.createTextNode("I'm ready");
	startWarBtn.appendChild(startWithBtnTxt);
	startWarBtn.onclick = function(){
		$("#warGame").show();
		$("#warTable").hide();
		game = new Phaser.Game(800, 500, Phaser.AUTO, 'warGame', { preload: phaserPreload, create: phaserCreate, update: phaserUpdate });
	}
	warInstructions.appendChild(startWarBtn);
}

function warriorKillChanceCalc(){
	var warBonusResources = 0;
	var warBonusLocation = 0;
	$.each(warBonusResourceDict, function(resource,bonus){

	});
	$.each(player.resources,function(resource,resourceVal){
		if (resource in warBonusResourceDict && resourceVal !=0){
			warBonusResources += warBonusResourceDict[resource]*resourceVal;
		}
	});
	if (player.civLocation in warBonusLocationDict){
		warBonusLocation = warBonusLocationDict[player.civLocation];
	}
	
	warriorKillChance = Math.min(warBonusResources + warBonusLocation,1);

	warBonusReferenceHtml = "";
	warBonusReferenceHtml = "<table border='1' style='float: right'><tr><th>Resource</th><th>Bonus</th></tr>";
	$.each(warBonusResourceDict, function(resource,bonus){
		warBonusReferenceHtml += "<tr><td>" + capitalizeFirstLetter(resource) + " " + drawResource(resource) + "</td><td>" + bonus*100 + "%</td></tr>";
	});
	warBonusReferenceHtml += "</table><table border='1' style='float: right; margin-right: 10px'><tr><th>Location</th><th>Bonus</th></tr>";
	$.each(warBonusLocationDict, function(location,bonus){
		warBonusReferenceHtml += "<tr><td>" + capitalizeFirstLetter(location) + " " + drawLocation(location,16) + "</td><td>" + bonus*100 + "%</td></tr>";
	});
	warBonusReference.innerHTML = warBonusReferenceHtml + "</table>";
	
}

function flowCalc(){	
	totalWarriors = Math.ceil(player.score);
	
	millisecondsPerWarrior = Math.max(10,Math.ceil(30000/totalWarriors));
	
	millisecondsPerEnemy = Math.min(200,millisecondsPerWarrior);
}

function gameEnd(){
	game.paused = true;
	timerText.destroy();
	var gameOverTextStyle = {font: "bold 40px 'Palatino Linotype', 'Book Antiqua', Palatino, serif", fill: "#fff"};
	var continueTextStyle = {font: "32px 'Palatino Linotype', 'Book Antiqua', Palatino, serif", fill: "#fff"};
	var gameOverText = game.add.text(298,200,"Game over!",gameOverTextStyle);
	var continueText = game.add.text(283,250,"Click to continue",continueTextStyle);
	gameOverText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
	continueText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 2);
	game.input.onDown.add(gameEnd2, self);
}

function gameEnd2(){
	if(player.classcode == "none"){
		userdb.update({nextstage: "end of year"});
	}
	else{
		userdb.update({nextstage: "trades"});
	}
	document.getElementById('nextStageBtn').disabled = false;
	var endGameTime = gameTimer.duration;
	game.destroy();
	$("#warGame").hide();
	$("#warText").show();
	hutsLost = 5-hutsRemaining;
	
	if(endGameTime == 0){
		if(hutsRemaining == 5){
			warText.innerHTML = "All of your huts survived! As a reward, you've seized a " + giveWarReward() + " from the enemy."
		}
		else{
			warText.innerHTML = "After thirty seconds, you've lost " + String(hutsLost) + " huts, costing you " + String(5*hutsLost) + "% of your population.<br><br>Grow your population to recruit a large army, and make sure you have resources that will help you in battle!"
			db.ref('users/'+user.uid).update({
				score: Math.ceil(player.score * (100-5*hutsLost)/100)
			});
		}
	}
	else if(hutsRemaining == 0){
		warText.innerHTML = "All of your huts were destroyed within " + String(30-(endGameTime/1000).toFixed(0)) + " seconds, costing you 25% of your population.<br><br>Grow your population to recruit a large army, and make sure you have resources that will help you in battle!"
		db.ref('users/'+user.uid).update({
			score: Math.ceil(player.score * .75)
		});
	}
}

function giveWarReward(){
	rewardArray = ["horse","camel","piece of gold","piece of iron"];
	reward = rewardArray[Math.floor(Math.random()*rewardArray.length)];
	switch(reward){
		case "horse":
			db.ref('users/'+user.uid+'/animals/').update({
				horses: player.animals.horses + 1
			});
			rewardImg = drawResource("horses");
			break;
		case "camel":
			db.ref('users/'+user.uid+'/animals/').update({
				camels: player.animals.camels + 1
			});
			rewardImg = drawResource("camels");
			break;
		case "piece of gold":
			db.ref('users/'+user.uid+'/materials/').update({
				gold: player.materials.gold + 1
			});
			rewardImg = drawResource("gold");
			break;
		case "piece of iron":
			db.ref('users/'+user.uid+'/materials/').update({
				iron: player.materials.iron + 1
			});
			rewardImg = drawResource("iron");
			break;
	}
	return reward + " " + rewardImg;
}

///////////////////////////
// END OF YEAR
///////////////////////////
function doYearEnd(){
	yearEndPopulation = player.score;
	hideLeftGameDivs();
	$("#yearEnd").show();
	
	if(player.score >= 100000 && player.plague != 2){
		db.ref('users/'+user.uid).update({
			plague: 2,
		});
		yearEndText.innerHTML = "<table><tr><td><img src='images/celebration.gif' height='300'></td><td>Congratulations - your civilization has grown to over 100,000 civilians in just " + player.year + " years. That's very impressive! You can start a new civilization by deleting this one below, or you can keep playing with this one and see how large you can grow!</td></tr></table>"
	}
	else{
		factNum = (player.year-1)%factsArray.length; //loops back to first fact once we're in later years
		if(player.score <= 0){
			yearEndText.innerHTML = "You have no civilians left - your civilization has been destroyed! Fortunately, a wandering party of five explorers wanders into the ruins of your civilization, allowing you to continue the game!<br><br>";
			db.ref('users/'+user.uid).update({
				score : 5
			});
		}
		else{
			yearEndText.innerHTML = "Your civilization has survived through Year " + player.year + "! <br><br>";
			if(typeof yearStartPopulation != "undefined"){yearEndText.innerHTML += "You started Year " + player.year + " with a population of " + yearStartPopulation + " civilians, and you ended with " + yearEndPopulation + " civilians.<br><br>";}
		}
		yearEndText.innerHTML += "Here's this year's fun fact:<br>" + factsArray[factNum];
	}
	db.ref('users/'+user.uid).update({
		year : player.year + 1
	});
	userdb.update({nextstage: "resource bonuses"});
}
 
///////////////////////////
// UTILITIES
///////////////////////////

function capitalizeFirstLetter(string) { //from http://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
    return string.charAt(0).toUpperCase() + string.slice(1);
}


function drawResource(resource, num, size, imgclass){
	num = num || 1;
	if(num <= 0){return "";}
	size = size || 16;
	imgclass = imgclass || "";
	var imgString = "<img src='images/resources/" + resource + ".gif' height='" + size + "' title='" + resource + "' class='" + imgclass + "'> ";
	return imgString.repeat(num);
}

function drawLocation(location, size){
	size = size || 32;
	var imgString = "<img src='images/locations/" + location + ".gif' height='" + size + "'>";
	return imgString;
}

function checkAllZeroes(arrayIn){
	function checkIfZero(numIn){
		return numIn == 0;
	}
	return arrayIn.every(checkIfZero); //true if every element in arrayIn is zero
}

function shuffle(array) { //from http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
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

function deleteCivConfirm(){
	var deleteConfirmVal = confirm("Please confirm that you would like to completely delete your civilization. This will cancel all pending trades and erase your score. You cannot undo this action.");
	if(deleteConfirmVal){deleteMyCiv();};
}

function deleteMyCiv(){
	var updates = {};
	if(typeof player != "undefined"){
		if(typeof player.trades == "undefined"){finishDeletion();}
		else{
			var tradesLength = Object.keys(player.trades).length;
			$.each(player.trades, function(tradekey,tradestatus){ //cleanup now invalid trade, if it exists in trades table
				try{
					db.ref('trades/'+tradekey).once('value').then(function(snapshot){
						var trade = snapshot.val();
						updates['users/'+trade.receiverUid+'/trades/'+tradekey] = null;
						updates['users/'+trade.creatorUid+'/trades/'+tradekey] = null;
						updates['trades/'+tradekey] = null;
					});
				}
				catch(err){
					console.log("Error deleting trade, moving on.")
				}
				tradesLength--;
				if(tradesLength==0){finishDeletion();}
			})
		}
	}
	else{finishDeletion();}
	function finishDeletion(){
		if(typeof player != "undefined"){if(player.classcode != "none"){updates['classrooms/'+player.classcode+'/members/'+user.uid] = null;}}
		db.ref().update(updates);
		userdb = db.ref('users/'+user.uid);
		userdb.remove();
		//alert("Your civilization has been deleted - refreshing the page!");
		location.reload();
	}
}