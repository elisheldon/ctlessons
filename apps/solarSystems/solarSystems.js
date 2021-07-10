var game = new Phaser.Game(1280,600,Phaser.AUTO,'phaserDiv',{preload: gamePreload, create: gameCreate, update: gameUpdate});

var G = 6.673e-11;
var originalMetersToPixels = 1.8e-9;
var metersToPixels = originalMetersToPixels;
var pixelsToMeters = 1/metersToPixels;
var timeScale = 1e6;
var oldTime = 0;
var creating = 0;
var starCenterX = 500;
var starCenterY = 300;
var massSliderValue = .5;
var velocitySliderValue = .5;
var createMass = 1e+25;
var createVelocityX = 0;
var createVelocityY = 0;
var timePassed = 0;
var starMass = 1.972e+30;
var planetCount = 1;
var asteroidCount = 0;
var meteorCount = 0;
var planetSelected = null;
var scaleChanging = false;
var scaleSliderValue = .7;

function gamePreload(){
	
	game.load.image('circle', 'circle.png');
	game.load.image('ring','ring.png');
	game.load.image('black','black.gif');
	game.load.image('star','star.png');
	
	slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
	slickUI.load('kenney/kenney.json');
}

function gameCreate(){
	
	game.stage.backgroundColor = '#000000';
	background = game.add.sprite(0,0,'black');
	background.width = 990;
	background.height = 600;
	background.inputEnabled = true;
	background.events.onInputDown.add(backgroundClick, this)
	
	planets = game.add.group();
	
	star = planets.create(starCenterX,300,'star');
	star.anchor.set(0.5);
	star.scale.setTo(0.5);
	star.mass = starMass;
	star.velocityX = 0;
	star.velocityY = 0;
	star.overlaps = zeroArray();
	star.inputEnabled = true;
	
	var planet = planets.create(starCenterX-149600000000*metersToPixels,300,'circle');
	planet.tint = 0x1800ff;
	planet.anchor.set(0.5);
	planet.scale.setTo(.5);
	planet.mass = 5.972e+24;
	planet.velocityX = 0;
	planet.velocityY = 29783;
	planet.type = "Planet";
	planet.number = 1;
	planet.overlaps = zeroArray();
	planet.inputEnabled = true;
	planet.events.onInputDown.add(selectPlanet, this);
	
	////////// SLICKUI ////////	
	slickUI.add(panel = new SlickUI.Element.Panel(game.width - 288, 8, 280, game.height - 16));
	
	panel.add(new SlickUI.Element.Text(10,10,"Simulation speed:"));
	panel.add(timeScaleSlider = new SlickUI.Element.Slider(16,65,panel.width-32,0.4));
	timeScaleSlider.onDrag.add(function(value){
		updateTimeScale(value);
	});
	
	panel.add(new SlickUI.Element.Text(10,125,"Zoom level:"));
	panel.add(scaleSlider = new SlickUI.Element.Slider(16,180,panel.width-32,0.7));
	scaleSlider.onDrag.add(function(value){
		scaleChanging = true;
		scaleSliderValue = value;
	});
	
	panel.add(starMassText = new SlickUI.Element.Text(10,240, "Mass of star: 1.97e+30 kg"));
	panel.add(starMassSlider = new SlickUI.Element.Slider(16,295,panel.width-32,0.5));
	starMassSlider.onDrag.add(function(value){
		updateStarMass(value);
	});
	
	panel.add(selectedPlanetText = new SlickUI.Element.Text(10,350, "Selected body: none"));
	panel.add(selectedPlanetMassText = new SlickUI.Element.Text(10,380,""));
	panel.add(selectedPlanetDistanceText = new SlickUI.Element.Text(10,410,""));
	panel.add(selectedPlanetSpeedText = new SlickUI.Element.Text(10,440,""));
	panel.add(deleteButton = new SlickUI.Element.Button(50,475,panel.width-100,34));
	deleteButton.add(new SlickUI.Element.Text(0,0, "Delete this body")).center();
	deleteButton.alpha = 0;
	deleteButton.events.onInputUp.add(function(){
		selectedPlanetText.value = "Selected body: none";
		selectedPlanetDistanceText.value = "";
		selectedPlanetMassText.value = "";
		selectedPlanetSpeedText.value = "";
		planetSelected.destroy();
		planetSelected = null;
		deleteButton.alpha = 0;
	});
	
	panel.add(timePassedText = new SlickUI.Element.Text(10,538,"Days	: 0"));
	panel.add(restartButton = new SlickUI.Element.Button(185,535,80,34));
	restartButton.add(new SlickUI.Element.Text(0,0, "Restart")).center();
	restartButton.events.onInputUp.add(function(){
		location.reload();
	});
	
	createCreatePanel();
	
}

function gameUpdate(){
	if(scaleChanging){
		scaleChanging = false;
		rescaleSpace(scaleSliderValue);
	}
	
	timestep = game.time.elapsed/1000 * timeScale;
	timePassed += timestep;
	
	for (var i=0; i<planets.length; i++){
		var thisPlanet = planets.children[i];
		thisPlanet.forceX = 0;
		thisPlanet.forceY = 0;
		for (var j=0; j<planets.length; j++){
			if(j != i){
				var thatPlanet = planets.children[j];
				var gravityArray = calcGravity(thisPlanet,thatPlanet);
				thisPlanet.forceX  += gravityArray[0];
				thisPlanet.forceY += gravityArray[1];
				if (checkOverlap(thisPlanet,thatPlanet) && thisPlanet.overlaps[j] != true && i!=0 && j!=0){
					thisPlanet.overlaps[j] = true;
					thatPlanet.overlaps[i] = true;
					planetsCollide(thisPlanet,thatPlanet,1);
				}
				else if (checkOverlap(thisPlanet,thatPlanet) && i!=0 && j!=0){ //if the first collision didn't work
					thisPlanet.overlaps[j] = true;
					thatPlanet.overlaps[i] = true;
					planetsCollide(thisPlanet,thatPlanet,1);
				}
				else if(!checkOverlap(thisPlanet,thatPlanet)){
					thisPlanet.overlaps[j] = false;
					thatPlanet.overlaps[i] = false;
				}
			}
		}
		thisPlanet.velocityX += thisPlanet.forceX / thisPlanet.mass * timestep;
		thisPlanet.velocityY += thisPlanet.forceY / thisPlanet.mass * timestep;
		thisPlanet.position.x += thisPlanet.velocityX * metersToPixels * timestep;
		thisPlanet.position.y += thisPlanet.velocityY * metersToPixels * timestep;
		if (i>0 && Math.sqrt((star.position.x-thisPlanet.position.x)**2+(star.position.y-thisPlanet.position.y)**2)<star.width/2){
			if (thisPlanet == planetSelected){
				selectedPlanetText.value = "Selected body: none";
				selectedPlanetDistanceText.value = "";
				selectedPlanetMassText.value = "";
				selectedPlanetSpeedText.value = "";
				planetSelected = null;
				deleteButton.alpha = 0;
			}
			thisPlanet.destroy();
		}
		if(planetSelected != null){
			selectedPlanetDistanceText.value = "Distance from star: " + (Math.sqrt((planetSelected.position.x-star.position.x)**2+(planetSelected.position.y-star.position.y)**2)*pixelsToMeters).toExponential(2) + " m";
			selectedPlanetSpeedText.value = "Speed: " + (Math.sqrt(planetSelected.velocityX**2+planetSelected.velocityY**2)).toExponential(2) + " m/s"
		}
	}
	
	if(timePassed > 31536000){
		timePassedText.value = "Years: " + (timePassed / 31536000).toFixed(2);
	}
	else{
		timePassedText.value = "Days: " + (timePassed / 86400).toFixed(0);
	}
	
}

function rescaleSpace(sliderValue){
	var newScale = 1.8e-9 * 10**((sliderValue-.7));
	var oldScale = metersToPixels;
	for (var i=0; i<planets.length; i++){
		var thisPlanet = planets.children[i];
		thisPlanet.position.x = starCenterX-((starCenterX-thisPlanet.position.x) * newScale/oldScale);
		thisPlanet.position.y = starCenterY-((starCenterY-thisPlanet.position.y) * newScale/oldScale);
		thisPlanet.scale.setTo(thisPlanet.scale.x*newScale/oldScale);
	}
	metersToPixels = newScale;
	pixelsToMeters = 1/metersToPixels;
}

function calcGravity(thisPlanet,thatPlanet){
	var dx = (thisPlanet.position.x-thatPlanet.position.x)*pixelsToMeters;
	var dy = (thisPlanet.position.y-thatPlanet.position.y)*pixelsToMeters;
	var r2 = dx**2+dy**2;
	var f = G*thisPlanet.mass*thatPlanet.mass/r2;
	var theta = Math.atan2(dy,dx);
	return [-Math.cos(theta)*f,-Math.sin(theta)*f];
}

function createCreatePanel(){
	slickUI.add(createDialog = new SlickUI.Element.Panel(300,100,400,400));
	
	createDialog.add(new SlickUI.Element.Text(10,10,"Create a new..."));
	
	createDialog.add(cbMeteor = new SlickUI.Element.Checkbox(10, 50, SlickUI.Element.Checkbox.TYPE_RADIO));
	createDialog.add(new SlickUI.Element.Text(50,53,"Meteor"));
	cbMeteor.events.onInputDown.add(function(){
		cbPlanet.checked = false;
		cbAsteroid.checked = false;
		cbMeteor.checked = true;
		updateCreateMass(massSliderValue);
	});
	
	createDialog.add(cbAsteroid = new SlickUI.Element.Checkbox(136, 50, SlickUI.Element.Checkbox.TYPE_RADIO));
	createDialog.add(new SlickUI.Element.Text(176,53,"Asteroid"));
	cbAsteroid.events.onInputDown.add(function(){
		cbPlanet.checked = false;
		cbMeteor.checked = false;
		cbAsteroid.checked = true;
		updateCreateMass(massSliderValue);
	});
	
	createDialog.add(cbPlanet = new SlickUI.Element.Checkbox(278, 50, SlickUI.Element.Checkbox.TYPE_RADIO));
	cbPlanet.checked = true;
	createDialog.add(new SlickUI.Element.Text(318,53,"Planet"));
	cbPlanet.events.onInputDown.add(function(){
		cbMeteor.checked = false;
		cbAsteroid.checked = false;
		cbPlanet.checked = true;
		updateCreateMass(massSliderValue);
	});
	
	createDialog.add(massSlider = new SlickUI.Element.Slider(16,160,createDialog.width-32,0.5));
	massSlider.onDrag.add(function(value){
		updateCreateMass(value);
		massSliderValue = value;
	});
	createDialog.add(massText = new SlickUI.Element.Text(16,110,"Mass: 5.97e+24 kg"));
	
	createDialog.add(velocitySlider = new SlickUI.Element.Slider(16,250,createDialog.width-32,0.5));
	createDialog.add(velocityText = new SlickUI.Element.Text(16,200,"Initial speed: "));
	velocitySlider.onDrag.add(function(value){
		updateCreateVelocity(value,xClicked,yClicked);
		velocitySliderValue = value;
	});
	
	createDialog.add(new SlickUI.Element.Text(16,290,"Orbit direction: "));
	createDialog.add(cbCW = new SlickUI.Element.Checkbox(180,287,SlickUI.Element.Checkbox.TYPE_RADIO));
	createDialog.add(new SlickUI.Element.Text(220,290,"CW"));
	cbCW.events.onInputDown.add(function(){
		cbCCW.checked = false;
		cbCW.checked = true;
	});
	createDialog.add(cbCCW = new SlickUI.Element.Checkbox(290,287,SlickUI.Element.Checkbox.TYPE_RADIO));
	createDialog.add(new SlickUI.Element.Text(330,290,"CCW"));
	cbCCW.events.onInputDown.add(function(){
		cbCW.checked = false;
		cbCCW.checked = true;
	});
	cbCCW.checked = true;
	
	createDialog.add(createButton = new SlickUI.Element.Button(8,342,184,42));
	createButton.add(new SlickUI.Element.Text(0,0, "Create")).center();
	createButton.events.onInputUp.add(function(){
		createNewPlanet(xClicked,yClicked);
		createDialog.visible = false;
	});
	
	createDialog.add(cancelButton = new SlickUI.Element.Button(200,342,184,42));
	cancelButton.add(new SlickUI.Element.Text(0,0, "Cancel")).center();
	cancelButton.events.onInputUp.add(function(){createDialog.visible = false;});
	
	createDialog.alpha = .9;
	createDialog.visible = false;
}

function updateCreateMass(sliderValue){
	if(cbMeteor.checked){
		createMass = 1+Math.round(sliderValue*8);
		massText.value = "Number: " + createMass + " meteors";
		if(createMass==1){
			massText.value = "Number: " + createMass + " meteor";
		}
	}
	else if(cbAsteroid.checked){
		createMass = 1+Math.round(sliderValue*8);
		massText.value = "Number: " + createMass + " asteroids";
		if(createMass==1){
			massText.value = "Number: " + createMass + " asteroid";
		}
	}
	else if(cbPlanet.checked){
		createMass = 5.972e+24 * 10**(6*(sliderValue-.5));
		massText.value = "Mass: " + createMass.toExponential(2) + " kg";
	}	
}

function updateCreateVelocity(sliderValue,xIn,yIn){
	var velocityArray = calcStableVelocity(xIn,yIn);
	var stableVelocity = velocityArray[0];
	var theta = velocityArray[1];
	velocity = stableVelocity * 10**(2*(sliderValue-.5));
	velocityText.value = "Initial speed: " + velocity.toFixed(0) + " m/s";
	createVelocityX = -Math.sin(theta)*velocity;
	createVelocityY = Math.cos(theta)*velocity;
}

function updateTimeScale(sliderValue){
	if(sliderValue == 0){
		timeScale = 0;
	}
	else{
		timeScale = 2e6 * 10**(3*(sliderValue-.5));
	}
}

function updateStarMass(sliderValue){
	star.scale.setTo(.5*metersToPixels/originalMetersToPixels*(.5+sliderValue));
	star.mass = 1.972e+30 * 10**(4*(sliderValue-.5));
	starMassText.value = "Mass of star: " + star.mass.toExponential(2) + " kg";
}

function calcStableVelocity(xIn,yIn){
	var dx = (star.position.x-xIn)*pixelsToMeters;
	var dy = (star.position.y-yIn)*pixelsToMeters;
	var theta = Math.atan2(dy,dx);
	var velocity = Math.sqrt(G*star.mass/Math.sqrt(dx**2+dy**2));
	return [velocity, theta];
}

function createNewPlanet(xIn,yIn){	
	if(!cbPlanet.checked){
		var createAngle = Math.atan2(yIn-star.position.y,xIn-star.position.x);
		var createRadius = Math.sqrt((xIn-star.position.x)**2+(yIn-star.position.y)**2);
		if(cbAsteroid.checked){angleScale = createRadius/(60*(scaleSliderValue+.1));}
		else{angleScale = createRadius/(30*(scaleSliderValue+.1));}
		for (i=0;i<createMass;i++){
			var xNew = star.position.x + (createRadius-8+16*Math.random())*Math.cos(createAngle + (i - Math.floor(createMass/2))/angleScale);
			var yNew = star.position.y + (createRadius-8+16*Math.random())*Math.sin(createAngle + (i - Math.floor(createMass/2))/angleScale);
			
			var planet = planets.create(xNew,yNew,'circle');
			var tint = 0;
			while(tint<8000000){
				var value = Math.random(0,.01)* 0xff | 0; //https://stackoverflow.com/questions/22692588/random-hex-generator-only-grey-colors
				tint = (value << 16) | (value << 8) | value;
			}
			planet.tint = tint;
			if (cbAsteroid.checked){
				var asteroidSize = Math.random();
				var asteroidMass =  1e+17 * 10**(8*(asteroidSize-.5));
				planet.mass = asteroidMass;
				planet.scale.setTo(metersToPixels/originalMetersToPixels*(0.15+0.1*asteroidSize));
				planet.type = "Asteroid";
				asteroidCount++;
				planet.number = asteroidCount;
			}
			else {
				var meteorSize = Math.random();
				var meteorMass = 1e+9 * 10**(4*(meteorSize-.5));
				planet.mass = meteorMass;
				planet.scale.setTo(metersToPixels/originalMetersToPixels*(0.05+0.1*meteorSize));
				planet.type = "Meteor";
				meteorCount++;
				planet.number = meteorCount;
			}
			planet.anchor.set(0.5);
			updateCreateVelocity(velocitySliderValue,xNew,yNew) //recalc for each asteroid/meteor
			if (cbCCW.checked){
				planet.velocityX = createVelocityX;
				planet.velocityY = createVelocityY;
			}
			else{
				planet.velocityX = -createVelocityX;
				planet.velocityY = -createVelocityY;
			}
			planet.overlaps = zeroArray();
			planet.inputEnabled = true;
			planet.events.onInputDown.add(selectPlanet, this);	
			if(i==0){selectPlanet(planet);}
		}
	}
	
	else{
		var planet = planets.create(xIn,yIn,'circle');
		planet.tint = Math.random() * 0xffffff;
		planet.scale.setTo(metersToPixels/originalMetersToPixels*(0.4+0.1*massSliderValue));
		planet.type = "Planet";
		planetCount++;
		planet.number = planetCount;
		planet.anchor.set(0.5);
		planet.mass = createMass;
		if (cbCCW.checked){
			planet.velocityX = createVelocityX;
			planet.velocityY = createVelocityY;
		}
		else{
			planet.velocityX = -createVelocityX;
			planet.velocityY = -createVelocityY;
		}
		planet.overlaps = zeroArray();
		planet.inputEnabled = true;
		planet.events.onInputDown.add(selectPlanet, this);
		selectPlanet(planet);
	}
}

function selectPlanet(planet,pointer){
	if(planetSelected != null && typeof planetSelected.children[0] != "undefined"){
		planetSelected.children[0].destroy();
	}
	planetSelected = planet;
	planetRing = game.add.sprite(0,0,'ring');
	planetRing.anchor.set(.5);
	planet.addChild(planetRing);
	selectedPlanetText.value = "Selected body: " + planet.type + " " + planet.number;
	selectedPlanetMassText.value = "Mass: " + planet.mass.toExponential(2) + " kg";
	selectedPlanetDistanceText.value = "Distance from star: " + (Math.sqrt((planet.position.x-star.position.x)**2+(planet.position.y-star.position.y)**2)*pixelsToMeters).toExponential(2) + " m";
	selectedPlanetSpeedText.value = "Speed: " + (Math.sqrt(planet.velocityX**2+planet.velocityY**2)).toExponential(2) + " m/s"
	deleteButton.alpha = 1;
}

function backgroundClick(){
		if(!createDialog.visible){
			xClicked = game.input.activePointer.x;
			yClicked = game.input.activePointer.y;
			updateCreateVelocity(velocitySliderValue,xClicked,yClicked);
			createDialog.visible = true;
		}
}

function checkOverlap(thisPlanet, thatPlanet) { 
	var distance = Math.sqrt((thatPlanet.position.x-thisPlanet.position.x)**2+(thatPlanet.position.y-thisPlanet.position.y)**2);
	return distance < (thisPlanet.width/2 + thatPlanet.width/2);
}

function planetsCollide(thisPlanet,thatPlanet,scale){
	var v1x = thisPlanet.velocityX;
	var v1y = thisPlanet.velocityY;
	var o1 = Math.atan2(v1y,v1x);
	var v1 = Math.sqrt(v1x**2+v1y**2);
	var m1 = thisPlanet.mass;
	
	var v2x = thatPlanet.velocityX;
	var v2y = thatPlanet.velocityY;
	var o2 = Math.atan2(v2y,v2x);
	var v2 = Math.sqrt(v2x**2+v2y**2);
	var m2 = thatPlanet.mass;
	
	var p = Math.atan2(thatPlanet.position.y-thisPlanet.position.y,thatPlanet.position.x-thisPlanet.position.x);
	
	var v1fx = ((v1*Math.cos(o1-p)*(m1-m2)+2*m2*v2*Math.cos(o2-p))/(m1+m2))*Math.cos(p) + v1*Math.sin(o1-p)*Math.cos(p+Math.PI/2);
	var v1fy = ((v1*Math.cos(o1-p)*(m1-m2)+2*m2*v2*Math.cos(o2-p))/(m1+m2))*Math.sin(p) + v1*Math.sin(o1-p)*Math.sin(p+Math.PI/2);
	
	var v2fx = ((v2*Math.cos(o2-p)*(m2-m1)+1*m1*v1*Math.cos(o1-p))/(m2+m1))*Math.cos(p) + v2*Math.sin(o2-p)*Math.cos(p+Math.PI/2);
	var v2fy = ((v2*Math.cos(o2-p)*(m2-m1)+1*m1*v1*Math.cos(o1-p))/(m2+m1))*Math.sin(p) + v2*Math.sin(o2-p)*Math.sin(p+Math.PI/2);
	
	var scaleThis = 1;
	var scaleThat = 1;
	if (thisPlanet.mass < thatPlanet.mass){
		scaleThis = scale;
	}
	else{
		scaleThat = scale;
	}
	
	thisPlanet.velocityX= v1fx*scaleThis;
	thisPlanet.velocityY = v1fy*scaleThis;
	thatPlanet.velocityX = v2fx*scaleThat;
	thatPlanet.velocityY = v2fy*scaleThat;
}

function zeroArray(){
	array = [];
	length = 2 + planetCount + asteroidCount + meteorCount;
	for (var i = 0; i<length; i++){
		array.push(false);
	}
	return array;
}