var game = new Phaser.Game(1280,600,Phaser.AUTO,'phaserDiv',{preload: gamePreload, create: gameCreate, update: gameUpdate});

var G = 6.673e-11;
var metersToPixels = 3e-9;
var pixelsToMeters = 1/metersToPixels;
var timeScale = 2e6;
var oldTime = 0;
var creating = 0;
var starCenterX = 500;
var massSliderValue = .5;
var velocitySliderValue = .5;
var createMass = 1e+25;

function gamePreload(){
	
	game.load.image('circle', 'circle.png');
	
	slickUI = game.plugins.add(Phaser.Plugin.SlickUI);
	slickUI.load('kenney/kenney.json');
}

function gameCreate(){
	
	game.stage.backgroundColor = '#2d2d2d';
	
	
	planets = game.add.group();
	
	var planet = planets.create(starCenterX-149600000000*metersToPixels,300,'circle');
	planet.tint = 0x1800ff;
	planet.anchor.set(0.5);
	planet.scale.setTo(.5);
	planet.mass = 5.972e+24;
	planet.velocityX = 0;
	planet.velocityY = 29783;
	
	star = planets.create(starCenterX,300,'circle');
	star.tint = 0xfffc00;
	star.anchor.set(0.5);
	star.mass = 1.972e+30;
	star.velocityX = 0;
	star.velocityY = 0;
	
	/*var planet3 = planets.create(640+108160800000*metersToPixels,300,'circle');
	planet3.tint = 0xff00cc;
	planet3.anchor.set(0.5);
	planet3.scale.setTo(.5);
	planet3.mass = 4.8685e+24;
	planet3.velocityX = 0;
	planet3.velocityY = -35020;*/
	
	game.input.onTap.add(function(){
		//createNewPlanet(game.input.activePointer.x,game.input.activePointer.y);
		if(!createDialog.visible){
			xClicked = game.input.activePointer.x;
			yClicked = game.input.activePointer.y;
			createDialog.visible = true;
		}
	});
	
	////////// SLICKUI ////////	
	slickUI.add(panel = new SlickUI.Element.Panel(game.width - 288, 8, 280, game.height - 16));
	panel.add(new SlickUI.Element.Text(10,10,"Solar System"));
	
	createCreatePanel();
	
}

function gameUpdate(){
	timestep = .0166 * timeScale;
	
	for (var i=0; i<planets.length; i++){
		var thisPlanet = planets.children[i];
		planets.children[i].forceX = 0;
		planets.children[i].forceY = 0;
		for (var j=0; j<planets.length; j++){
			if(j != i){
				var thatPlanet = planets.children[j];
				var gravityArray = calcGravity(thisPlanet,thatPlanet);
				planets.children[i].forceX  += gravityArray[0];
				planets.children[i].forceY += gravityArray[1];
			}
		}
		planets.children[i].velocityX += planets.children[i].forceX / planets.children[i].mass * timestep;
		planets.children[i].velocityY += planets.children[i].forceY / planets.children[i].mass * timestep;
		planets.children[i].position.x += planets.children[i].velocityX * metersToPixels * timestep;
		planets.children[i].position.y += planets.children[i].velocityY * metersToPixels * timestep;
	}
	
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
	
	createDialog.add(massSlider = new SlickUI.Element.Slider(16,140,createDialog.width-32,0.5));
	massSlider.onDrag.add(function(value){
		updateCreateMass(value);
		massSliderValue = value;
	});
	createDialog.add(massText = new SlickUI.Element.Text(16,170,"Mass: 1.00e+25 kg"));
	
	createDialog.add(velocitySlider = new SlickUI.Element.Slider(16,260,createDialog.width-32,0.5));
	createDialog.add(velocityText = new SlickUI.Element.Text(16,290,"Initial velocity: "));
	velocitySlider.onDrag.add(function(value){
		updateCreateVelocity(value,xClicked,yClicked);
		velocitySliderValue = value;
	});
	
	createDialog.add(createButton = new SlickUI.Element.Button(8,342,184,42));
	createButton.add(new SlickUI.Element.Text(0,0, "Create")).center();
	createButton.events.onInputUp.add(function(){
		createNewPlanet(xClicked,yClicked);
		createDialog.visible = false;
	});
	
	createDialog.add(cancelButton = new SlickUI.Element.Button(200,342,184,42));
	cancelButton.add(new SlickUI.Element.Text(0,0, "Cancel")).center();
	cancelButton.events.onInputUp.add(function(){createDialog.visible = false;});
	
	createDialog.visible = false;
}

function updateCreateMass(sliderValue){
	if(cbMeteor.checked){
		createMass = 1e+9 * 10**(4*(sliderValue-.5));
	}
	else if(cbAsteroid.checked){
		createMass = 1e+16 * 10**(8*(sliderValue-.5));
	}
	else if(cbPlanet.checked){
		createMass = 1e+25 * 10**(4*(sliderValue-.5));
	}

	massText.value = "Mass: " + createMass.toExponential(2) + " kg";
}

function updateCreateVelocity(sliderValue){
	
}

function calcStableVelocity(xIn,yIn){
	var dx = (star.position.x-xIn)*pixelsToMeters;
	var dy = (star.position.y-yIn)*pixelsToMeters;
	var theta = Math.atan2(dy,dx);
	var velocity = Math.sqrt(G*star.mass/Math.sqrt(dx**2+dy**2));
	var velocityX = -Math.sin(theta)*velocity;
	var velocityY = Math.cos(theta)*velocity;
	return [velocityX, velocityY];
}

function createNewPlanet(xIn,yIn){	
	var planet = planets.create(xIn,yIn,'circle');
	planet.tint = Math.random() * 0xffffff;
	planet.anchor.set(0.5);
	planet.scale.setTo(0.5);
	/*planet.mass = Math.random()*(1e+25);
	var dx = (star.position.x-xIn)*pixelsToMeters;
	var dy = (star.position.y-yIn)*pixelsToMeters;
	var theta = Math.atan2(dy,dx);
	var velocity = Math.sqrt(G*star.mass/Math.sqrt(dx**2+dy**2));
	planet.velocityX = -Math.sin(theta)*velocity;
	planet.velocityY = Math.cos(theta)*velocity;*/
	planet.mass = createMass;
	var velocities = calcStableVelocity(xIn,yIn);
	planet.velocityX = velocities[0];
	planet.velocityY = velocities[1];
}