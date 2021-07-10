var questionIdx = 0;
var questionsCorrect = 0;
var userName = "";
var userFirstName = "";
var userUid = "";
var classCode = "";
var classCodeGen = "";

// Initialize Firebase
var config = {
apiKey: "AIzaSyDQN-iaROV-AWXT53ycKm-98qD736gsjnA",
authDomain: "weatherballoon-cae71.firebaseapp.com",
databaseURL: "https://weatherballoon-cae71.firebaseio.com",
projectId: "weatherballoon-cae71",
storageBucket: "weatherballoon-cae71.appspot.com",
messagingSenderId: "722191411067"
};
firebase.initializeApp(config);
var db = firebase.database();

//Load data from csv file
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "flightData.csv",
        dataType: "text",
        success: function(data) {
			flightData = $.csv.toArrays(data);
			timeArray = flightData[1];
			elapsedArray = flightData[2];
			//altitudeMArray = flightData[3];
			altitudeFArray = flightData[4];
			latitudeArray = flightData[5];
			distanceNSFtArray = flightData[6];
			longitudeArray = flightData[7];
			distanceEWFtArray = flightData[8];
			distanceFtArray = flightData[9];
			//speedKphArray = flightData[10];
			speedMphArray = flightData[11];
			//speedFpsArray = flightData[12];
			plot(altitudeFArray);
		} 
     });
	  $.ajax({
        type: "GET",
        url: "questions.csv",
        dataType: "text",
        success: function(data) {
			questions = $.csv.toObjects(data);
			showQuestion(questionIdx);
		}
	  });
	 flightVideo = document.getElementById('flightVideo')
});

var chart = null;

function seriesSelectChange(){
	var series = document.querySelector('input[name="seriesSelect"]:checked').value;
	plot(eval(series+"Array"));
}

function plot(seriesIn){
	series = seriesIn.slice(1);
	if(chart != null){
		chart.destroy();
	}
	
	var canvas = document.getElementById('chartCanvas');
	var ctx = canvas.getContext('2d');
	
	chart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: timeArray.slice(1),
			datasets: [{
				data: series,
				fill: false
			}]
		},
		options: {
			maintainAspectRatio: false,
			responsive: false,
			legend: { display: false},
			  scales: {
				yAxes: [{
				  scaleLabel: {
					display: true,
					labelString: seriesIn[0]
				  }
				}]
			  }
		}
	});
	canvas.onclick = function(evt){
		var activePoints = chart.getElementsAtEvent(evt);
		if(activePoints.length>0){
			var chartData = activePoints[0]['_chart'].config.data;
			var idx = activePoints[0]['_index'];
			var label = chartData.labels[idx];
			var value = chartData.datasets[0].data[idx];
			//console.log(label + " is " + elapsedArray[idx]);
			setVideoTime(elapsedArray[idx]);
		}
	}
}

function setVideoTime(elapsed){
	if(elapsed == "Elapsed (min)"){ //quick and dirty bugfix for 3:27pm
		elapsed = -1.15;
	}
	flightVideo.currentTime = (parseFloat(elapsed)+3)/156*flightVideo.duration;
	if(flightVideo.paused && flightVideo.currentTime<9392){
		flightVideo.play();
	}
}

document.getElementById('answerSubmit').onclick=function(){
	answerSubmitted = document.querySelector('input[name="answers"]:checked').value;
	document.getElementById('nextQuestion').disabled = false;
	document.getElementById('answerSubmit').disabled = true;
	if(answerSubmitted == questions[questionIdx].correct){
		document.getElementById("questionResult").innerHTML = "That's correct!";
		document.getElementById("questionResult").style = "color:green;";
		questionsCorrect++;
		db.ref('classrooms/'+classCode+'/users/'+userUid).update({
			score: questionsCorrect
		})
		document.getElementById("questionsCorrect").innerHTML = "Questions correct: " + questionsCorrect;
	}
	else{
		document.getElementById("questionResult").innerHTML = "That's not correct. The correct answer is: " + questions[questionIdx].correct.toUpperCase() + ") " + questions[questionIdx][questions[questionIdx].correct]+".";
		document.getElementById("questionResult").style = "color:red;";
	}
}

document.getElementById('nextQuestion').onclick=function(){
	if(questionIdx==19){
		document.getElementById("questionArea").innerHTML = "<h2 style='display:inline'>That was the last question!</h2><br><br>Congratulations! You are now an expert on Excel's weather balloon launch. You answered " + questionsCorrect + " out of 20 questions correctly. Continue watching footage from the launch for as long as you'd like!";
	}
	else{
		questionIdx++;
		var ele = document.getElementsByName("answers");
		for(var i=0;i<ele.length;i++){
			ele[i].checked = false;
		}
		document.getElementById("questionResult").innerHTML = "&nbsp;";
		showQuestion(questionIdx);
		document.getElementById('nextQuestion').disabled = true;
		document.getElementById('answerSubmit').disabled = false;
	}
}

function showQuestion(i){
	document.getElementById("questionHeader").innerHTML = "Question #" + (i+1);
	document.getElementById("questionText").innerHTML = questions[i].q;
	document.getElementById("answerA").innerHTML = "A)&nbsp; " + questions[i].a;
	document.getElementById("answerB").innerHTML = "B)&nbsp; " + questions[i].b;
	document.getElementById("answerC").innerHTML = "C)&nbsp; " + questions[i].c;
	document.getElementById("answerD").innerHTML = "D)&nbsp; " + questions[i].d;
}

/*function subtitles(){
	var subs = "";
	for(i=2;i<157;i++){
		if(i<60){
			subs+="00:" + i + ":00.000 --> 00:" + (i+1)+":00.000<br>"+timeArray[i-2]+"<br><br>";
		}
		else if(i<120){
			subs+="01:" + (i-60) + ":00.000 --> 01:" + (i-59)+":00.000<br>"+timeArray[i-2]+"<br><br>";
		}
		else{
			subs+="02:" + (i-120) + ":00.000 --> 02:" + (i-119)+":00.000<br>"+timeArray[i-2]+"<br><br>";
		}
	}
	document.getElementById("subHtml").innerHTML = subs;
}*/

//Login
var provider = new firebase.auth.GoogleAuthProvider();
document.getElementById('googleSignIn').onclick=function() {
	firebase.auth().signInWithPopup(provider).then(function(result) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		var token = result.credential.accessToken;
		// The signed-in user info.
		var user = result.user;
		userUid = user.uid;
		userName = user.displayName,
		userFirstName = user.displayName.substr(0,user.displayName.indexOf(' ')), //assumes first name is first word of display name
		document.getElementById("welcomeName").innerHTML = userFirstName;
		$("#signInDiv").hide();
		$("#classCodeDiv").show();
	}).catch(function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorCode + errorMessage);
	});
}

//Classroom code creation
document.getElementById('classCodeCreateBtn').onclick=function() {
	generateClassCode();
}

document.getElementById('cancelClassCodeCreate').onclick=function() {
	$("#classCodeCreateDiv").hide();
	$("#classCodeDiv").show();
}

document.getElementById('startAfterClassCodeCreate').onclick=function(){
	$("#classCodeCreate2Div").hide();
	$("#classCodeDiv").show();
}

document.getElementById('createAnotherClassCode').onclick=function(){
	generateClassCode();
}

 function generateClassCode(){
	 classCodeGen = ((Math.random().toString(36)+'00000000000000000').slice(2, 8)).toUpperCase(); //from http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
	 console.log(classCodeGen);
	 db.ref('classrooms/'+classCodeGen).once('value').then(function(snapshot) {
		 if(snapshot.val() != null){
			console.log("Classroom code generated is not unique.");
			generateClassCode();
		 }
		 else{
			$("#classCodeCreateDiv").hide();
			$("#classCodeCreate2Div").show();
			document.getElementById("classCodeCreate2TextDiv").innerHTML = "Your classroom code is <b>" + classCodeGen + "</b>. Make sure your students input this correctly when they first log in! Press the button below if you'd like to play along.";
			var today = new Date();
			var createdDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
			db.ref('classrooms/'+classCodeGen).set({
				creator: userName,
				created: createdDate
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
				db.ref('classrooms/'+classCode+'/users/'+userUid).set({
					name: userName,
					score: 0
				})
				trackScore();
				$("#classCodeDiv").hide();
				$("#welcomeHeader").hide();
				$("#introDiv").show();
			}
			else{
				classCodeConfirmDiv.innerHTML = "We didn't find that classroom code. Please double-check above and try again.<br><br>";
			}
		});
	}
}

document.getElementById('classCodeContinueBtn').onclick=function(){
	$("#introDiv").hide();
	$("#main").show();
	setVideoTime(-1.15);
}

//reading score
function trackScore(){
	db.ref('classrooms/'+classCode+'/users/').on('value',function(snapshot){ //whenever the state changes
		var scoresHtml = "";
		//var inTopTen = false;
		var usersObj = snapshot.val();
		var usersArray = $.map(usersObj, function(value, index) { //from https://stackoverflow.com/questions/6857468/converting-a-js-object-to-an-array
			return [value];
		});
		var usersByScore = usersArray.slice(0); //from https://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value
		usersByScore.sort(function(b,a) {
			return a.score - b.score;
		});
		for(i=0;i<usersByScore.length;i++){
			if(usersByScore[i].name == userName){
				scoresHtml += "<font color='green'>" + usersByScore[i].name + ": " + usersByScore[i].score + "</font><br>";
				//inTopTen = true;
			}
			else{
				scoresHtml += usersByScore[i].name + ": " + usersByScore[i].score + "<br>";
			}
		}
		/*if(inTopTen&&usersByScore.length>9){ //if player's score was in top ten, show a tenth score
			scoresHtml += usersByScore[10].name + ": " + usersByScore[10].score;
		}
		else{
			scoresHtml += "<font color='green'>" + userName + ": " + questionsCorrect + "</font>";
		}*/
		document.getElementById("scoresTable").innerHTML = scoresHtml;
	});
}