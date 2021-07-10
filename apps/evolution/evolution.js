//Load adaptations from csv file
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "adaptations.csv",
        dataType: "text",
        success: function(data) {adaptationsObjArray = $.csv.toObjects(data);}
     });
	 $.ajax({
        type: "GET",
        url: "birdAdaptations.csv",
        dataType: "text",
        success: function(data) {birdAdaptationsObjArray = $.csv.toObjects(data);}
     });
});

////////////////////////////////
// INTRO
////////////////////////////////

//starting values
var pTailLength = .1; // .1-1
var pMitochondriaSize = .3; //.3-1
var pMouthNumber = 1; //1 2 3 4
var pCiliaNum = 0; //0 1 2 3
var pWallThickness = 1; //1 2 3 4 5 6 7 8
var years = [0];
var pops = [100];
var environmentNum = "environment1";
var totalFood = 0;

var bWingSize = .3;
var bTailSize = .5;
var bBeakSize = .6;
var bEyeSize = .5;
var bBlueness = 0;

var environment1 = {pTailLength: true, pMitochondriaSize: true, pMouthNumber: true, pCiliaNum: true, pWallThickness: false};
var environment2 = {pTailLength: true, pMitochondriaSize: true, pMouthNumber: true, pCiliaNum: true, pWallThickness: true};
var environment3 = {pTailLength: true, pMitochondriaSize: true, pMouthNumber: true, pCiliaNum: true, pWallThickness: true};
var environment4 = {bWingSize: true, bTailSize: true, bBeakSize: true, bEyeSize: false, bBlueness: false}
var environment5 = {bWingSize: true, bTailSize: true, bBeakSize: true, bEyeSize: false, bBlueness: true}
var environment6 = {bWingSize: true, bTailSize: true, bBeakSize: true, bEyeSize: true, bBlueness: true}

function intro1(){	
	adaptationDiv.innerHTML = "First, let's take a look at the components that make up Zoe.<br><br>This is her mitochondrion - her power factory. The larger her mitochondrion grows, the more energy Zoe will have to move around and collect food.<br><br><a href='javascript:intro2()'>Continue</a>";
	prvwTail.animations.paused = true;
	[mitochondriaScaleTween,mitochondriaPosTween] = highlightComponent(prvwMitochondria,3);
}

function intro2(){
	adaptationDiv.innerHTML = "This is Zoe's flagellum - her tail. The longer her tail grows, the faster she'll be able to move around the water on her hunt for food.<br><br><a href='javascript:intro3()'>Continue</a>";
	mitochondriaScaleTween.repeat(0);
	mitochondriaPosTween.repeat(0);
	prvwTail.animations.paused = false;
}

function intro3(){
	adaptationDiv.innerHTML = "Zoe is protected from enemies by her cell wall. The thicker her cell wall, the less damage she'll take when she encounters parasites.<br><br><a href='javascript:intro4()'>Continue</a>";
	prvwTail.animations.paused = true;
	[wallScaleTween,wallPosTween] = highlightComponent(prvwWall,1.1);
}

function intro4(){
	adaptationDiv.innerHTML = "Zoe's 'mouth' is actually a cytostome - a flap within her cell membrane that allows food to enter. The larger her cytostome, the easier it'll be to let the food in!<br><br><a href='javascript:intro5()'>Continue</a>";
	wallScaleTween.repeat(0);
	wallPosTween.repeat(0);
	[mouthScaleTween,mouthPosTween] = highlightComponent(prvwMouth,1.4);
}

function intro5(){
	adaptationDiv.innerHTML = "Zoe's species may evolve new parts over time, but for now, those are all of the components you need to worry about.<br><br>You may recognize other cell components like the Golgi apparatus and the nucleus, but those are already working well and won't change in this simulation.<br><br><a href='javascript:intro6()'>Continue</a>";
	mouthScaleTween.repeat(0);
	mouthPosTween.repeat(0);
	prvwTail.animations.paused = false;
}

function intro6(){
	adaptationDiv.innerHTML = "In the water, you'll encounter food (top) and parasites (bottom).<br><br>How much food you collect will affect how Zoe's species adapts and evolves over time. Avoid parasites - running into them will drop your health!<br><br>Once you run out of health or energy, your food-collecting round will end.<br><br><a href='javascript:intro7()'>Continue</a>";
	prvwProtozoa.x += 1000;
	prvwFood = protozoaPreview.add.sprite(40, 30, 'food');
	prvwParasite = protozoaPreview.add.sprite(40, 130, 'parasite', 'parasite1.png');
	prvwParasite.scale.setTo(.3);
}

function intro7(){
	adaptationDiv.innerHTML = "It's time to hunt for food! In your starting environment, there aren't any parasites to worry about, so focus on collecting food.<br><br>When the game starts, use the arrow keys to move. Collect as much food as you can before you run out of health or energy.<br><br><b>Hint:</b> Zoe hasn't evolved much in her current environment, so she probably won't be very good at collecting food yet.<br><br><a href='javascript:startGame()'>Start</a>";
	if (typeof prvwFood != "undefined"){ //this is required for skipping the intro
		prvwProtozoa.x -= 1000;
		prvwFood.destroy();
		delete prvwFood;
		prvwParasite.destroy();
		delete prvwParasite;
	}
	game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv', { preload: phaserPreload, create: phaserCreate, update: phaserUpdate });
}

function startGame(){
	$('#mutationDiv').hide();
	$('#gameDiv').show();
	prvwProtozoa.x += 1000; //reduces flash coming back from game
	protozoaPreview.paused = true;
	game.paused = false;
}

function highlightComponent(component,amount){
	var scaleTween = protozoaPreview.add.tween(component.scale).to({ x: amount*component.scale.x, y: amount*component.scale.y }, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
	var posTween = protozoaPreview.add.tween(component).to({ x: component.x - component.width*(amount-1)*.5, y: component.y - component.height*(amount-1)*.5}, 300, Phaser.Easing.Sinusoidal.	InOut, true, 0, -1, true);
	return [scaleTween,posTween];
}

////////////////////////////////
// PROTOZOA PREVIEW
////////////////////////////////

var protozoaPreview = new Phaser.Game(200,600,Phaser.AUTO,'protozoaPreviewDiv',{preload: protozoaPreviewPreload, create: protozoaPreviewCreate});

function protozoaPreviewPreload() {
	protozoaPreview.load.image('protozoaBody', 'images/protozoa/body.png');
	protozoaPreview.load.image('mitochondria', 'images/protozoa/mitochondria.png');
	protozoaPreview.load.atlasJSONArray('protozoaTail','images/protozoa/tail.png','images/protozoa/tail.json');
	protozoaPreview.load.atlasJSONArray('protozoaMouth','images/protozoa/mouth.png','images/protozoa/mouth.json');
	protozoaPreview.load.atlasJSONArray('protozoaCilia','images/protozoa/cilia.png','images/protozoa/cilia.json');
	protozoaPreview.load.atlasJSONArray('protozoaWall','images/protozoa/wall.png','images/protozoa/wall.json');
	protozoaPreview.load.image('food','images/protozoa/food.png')
	protozoaPreview.load.atlasJSONArray('parasite','images/protozoa/parasite.png','images/protozoa/parasite.json');
	protozoaPreview.load.image('current','images/protozoa/current.jpg');
}

function createMitochondria(pMitochondriaSize){
	if (typeof prvwMitochondria != "undefined"){
		prvwMitochondria.destroy();
		delete prvwMitochondria;
	}
	prvwMitochondria = protozoaPreview.add.sprite(-10+(1-pMitochondriaSize)*50,0,'mitochondria');
	prvwMitochondria.scale.setTo(pMitochondriaSize);
	prvwProtozoa.addChild(prvwMitochondria);
}

function createWall(pWallThickness,pTailLength,pTailStopped){
	if (typeof prvwWall != "undefined"){
		prvwWall.destroy();
		delete prvwWall;
	}
	prvwWall = protozoaPreview.add.sprite(-95,-195,'protozoaWall','wall_'+pWallThickness+'.png');
	prvwProtozoa.addChild(prvwWall);
	createTail(pTailLength,pTailStopped);
}

function createTail(pTailLength,pTailStopped){
	if (typeof prvwTail != "undefined"){
		prvwTail.destroy();
		delete prvwTail;
	}
	prvwTail = protozoaPreview.add.sprite(-50,140+(1-pTailLength)*40,'protozoaTail');
	prvwTail.scale.setTo(1,pTailLength);
	prvwTail.animations.add('pTailSwing', [0,1,2,3,4,5,6,5,4,3,2,1]);
	prvwTail.animations.play('pTailSwing',30,true);
	prvwTail.animations.paused = pTailStopped;
	prvwProtozoa.addChild(prvwTail);
}

function createMouth(pMouthNumber){
	if (typeof prvwMouth != "undefined"){
		prvwMouth.destroy();
		delete prvwMouth;
	}
	prvwMouth = protozoaPreview.add.sprite(-40-pMouthNumber*4,-197,'protozoaMouth','mouth_0'+pMouthNumber+'.png');
	prvwProtozoa.addChild(prvwMouth);
}

function createCilia(pCiliaNum){
	if (typeof prvwCilia != "undefined"){
		prvwCilia.destroy();
		delete prvwCilia;
	}
	if(pCiliaNum != 0){
		prvwCilia = protozoaPreview.add.sprite(-125,-225,'protozoaCilia')
		switch(pCiliaNum){
			case 1:
				prvwCilia.animations.add('pCiliaSwing',[0,1,2,3,4,3,2,1]);
				break;
			case 3:
				prvwCilia.animations.add('pCiliaSwing',[5,6,7,8,9,8,7,6]);
				break;
			case 2:
				prvwCilia.animations.add('pCiliaSwing',[10,11,12,13,14,13,12,11]);
				break;
		}
		prvwCilia.animations.play('pCiliaSwing',20,true);
		prvwProtozoa.addChild(prvwCilia);
	}
}	

function protozoaPreviewCreate(){
	
	protozoaSize = .5;
	
	protozoaPreview.stage.backgroundColor = '#ffffff';
	
	//create protozoa
	prvwProtozoa = protozoaPreview.add.sprite(60,120,'protozoaBody');
	prvwProtozoa.anchor.set(.5);
	
	createMitochondria(pMitochondriaSize);
	createWall(pWallThickness,pTailLength,false);
	createTail(pTailLength,false);
	createMouth(pMouthNumber);
	if(pCiliaNum !=0){
		createCilia(pCiliaNum);
	}
	
	//scale protozoa
	prvwProtozoa.scale.setTo(protozoaSize);
}

////////////////////////////////
// POPULATION CALC
////////////////////////////////

function populationCalc(cause,foodThisRound){
	game.paused = true;
	protozoaPreview.paused = false;
	
	$('#gameDiv').hide();
	$('#mutationDiv').show();
	if(cause == "energy"){
		adaptationDiv.innerHTML = "You've run out of energy for this round.<br><br>";
	}
	else{
		adaptationDiv.innerHTML = "You've run out of health for this round.<br><br>";
	}
	adaptationDiv.innerHTML += "You collected " + foodThisRound + " pieces of food this round. In total, you've collected " + totalFood + " pieces of food. By better adapting to your environment, you'll be able to collect more!<br><br>"
	
	if (typeof adaptationObj != "undefined"){	
		if(adaptationObj.keep == "TRUE" && eval(environmentNum)[adaptationObj.adaptation]){
			adaptationDiv.innerHTML += "The mutated offspring, who " + adaptationObj.impact + " than the rest of the species, were more fit as a result of their mutation. This adaptation will become the dominant phenotype until the next mutation.<br><br>"
		}
		else if(adaptationObj.keep == "FALSE" && eval(environmentNum)[adaptationObj.adaptation]){
			eval(adaptationObj.adaptation + "-=" + adaptationObj.change);
			adaptationDiv.innerHTML += "The mutated offspring, who " + adaptationObj.impact + " than the rest of the species, were less fit as a result of their mutation. Organisms with this mutation will quickly die out due to competition with the rest of their species.<br><br>"
		}
		else{
			eval(adaptationObj.adaptation + "-=" + adaptationObj.change);
			adaptationDiv.innerHTML += "The mutated offspring, who " + adaptationObj.impact + " than the rest of the species, were no more or less fit in this specific environment. Having no advantage over the rest of the species, these mutated organisms slowly die out.<br><br>"
		}
	}
	if(years[years.length - 1]==650000){ //if we're ready to switch species
		adaptationDiv.innerHTML += "<b>Say goodbye to Zoe's species</b>, because we're about to travel a billion years into the future. Don't expect to recognize her anymore!<br><br><a href='javascript:switchSpecies()'>To the future!</a>"
	}
	else{
		adaptationDiv.innerHTML += "Let's fast forward fifty thousand years and see how Zoe's species has changed.<br><br><a href='javascript:populationCalc2("+foodThisRound+")'>To the future!</a>"
	}
}

function populationCalc2(foodThisRound){
	$('#yearPopDiv').show();
	newYear = years[years.length - 1] + 50000;
	years.push(newYear);
	preMutate(); //this is here so the preview state can restart in time
	adaptationDiv.innerHTML = "It's now the year " + addCommas(newYear) + ".<br><br>"
	
	switch(newYear){
		case 300000:
			//add parasites
			environmentNum = "environment2";
			adaptationDiv.innerHTML += "Over the past 50,000 years, <b>Zoe's species has migrated to a new environment</b>. In this environment, they face a dangerous new enemy - parasites - which can be seen to the left.<br><br>"
			prvwProtozoa.x += 1000;
			prvwParasite = protozoaPreview.add.sprite(40, 30, 'parasite', 'parasite1.png');
			prvwParasite2 = protozoaPreview.add.sprite(40, 130, 'parasite', 'parasite2.png');
			prvwParasite.scale.setTo(.3);
			prvwParasite2.scale.setTo(.3);
			break;
		case 500000:
			//add current
			environmentNum = "environment3";
			adaptationDiv.innerHTML += "Over the past 50,000 years, <b>Zoe's species has migrated to a new environment</b>. In this environment, the river has a strong current which Zoe's species will need to swim against in order to reach food. <br><br>"
			prvwProtozoa.x += 1000;
			prvwCurrent = protozoaPreview.add.sprite(40, 0, 'current');
			prvwCurrent.scale.setTo(.6);
			break;
	}
	
	adaptationDiv.innerHTML += "Based on your food-collecting performance, and a simulation of the rest of Zoe's species over the past fifty thousand years, Zoe's species has ";
	oldPop = pops[pops.length - 1];
	var popChange = calculatePopulationChange() + foodThisRound/5;
	newPop = Math.ceil(oldPop * (100+popChange)/100);
	
	pops.push(newPop);
	var chartData = {
		labels: years,
		series: [pops]
	};
	var chartOptions = {
		width: 400,
		height: 200,
		showArea: true,
		axisY: {
			onlyInteger: true
		},
		axisX: {
			showLabel: false,
			showGrid: false
		}
	};
	popChart = new Chartist.Line('#yearPopDiv', chartData, chartOptions);
	
	if(newPop<oldPop){
		adaptationDiv.innerHTML += "shrunk to " + newPop + ". Looks like they'd better get adapting quickly, before they go extinct!<br><br><a href='javascript:mutate()'>Let's scramble some DNA</a><br><br>"
	}
	else if(newPop>oldPop){
		adaptationDiv.innerHTML += "grown to " + newPop + ". That's decent growth, but they can grow even faster with the right adaptations!<br><br><a href='javascript:mutate()'>Let's scramble some DNA</a><br><br>"
	}
	else{
		adaptationDiv.innerHTML += "maintained its population of " + newPop + ". With the right adaptations, this population is ready to grow!<br><br><a href='javascript:mutate()'>Let's scramble some DNA</a><br><br>"
	}
}

function calculatePopulationChange(){
	switch(environmentNum){
		case "environment1":
			var popChangeSim = (pTailLength-.4)*7+(pMitochondriaSize-.6)*12+(pMouthNumber-2)*3+pCiliaNum*4;
			break;
		case "environment2":
			var popChangeSim = (pTailLength-.3)*7+(pMitochondriaSize-.5)*6+(pMouthNumber-1)*2+pCiliaNum*4+(pWallThickness-3)*6;
			break;
		case "environment3":
			var popChangeSim = (pTailLength-.3)*20+(pMitochondriaSize-.5)*6+(pMouthNumber-1)*2+pCiliaNum*4+(pWallThickness-3)*4;
			break;
		case "environment4":
			var popChangeSim = (bWingSize-.7)*10+(bTailSize-.8)*10+(bBeakSize-1)*10+(bEyeSize-.7)*2;
			break;
		case "environment5":
			var popChangeSim = (bWingSize-.7)*8+(bTailSize-.8)*15+(bBeakSize-1)*8+(bEyeSize-.7)*6;
			break;
		case "environment6":
			var popChangeSim = (bWingSize-.7)*8+(bTailSize-.8)*12+(bBeakSize-1)*15+(bEyeSize-.7)*20;
			break;
	}
	return popChangeSim;
}

////////////////////////////////
// MUTATION
////////////////////////////////

function preMutate(){
	if (typeof adaptationObj != "undefined"){	//back out the previous year's negative change here, now that the preview has definitely finished restarting
		if(adaptationObj.keep == "FALSE"){
			eval(adaptationObj.adaptation + "-=" + adaptationObj.change);
		}
	}
	switch(newYear){
		case 150000:
			//add cilia
			adaptationObj = [];
			adaptationObj.adaptation = "pCiliaNum";
			adaptationObj.impact = "turn faster";
			adaptationObj.keep="TRUE";
			pCiliaNum = 1;
			mutationHtml = "An entirely new organelle is found in the mutated offspring - cilia. These small hair-like structures give the organisms better control of their movement, allowing them to turn faster while hunting food.<br><br>Let's see how much these early cilia help!<br><br><a href='javascript:startGame()'>Start</a>";
			break;
		default:
			//normal random mutation
			var goodAdaptation = false; //good doesn't mean beneficial, it means able to be applied
			while(goodAdaptation == false){
				adaptationObj = adaptationsObjArray[Math.floor(Math.random()*adaptationsObjArray.length)]; //get random adaptationObj
				if(adaptationObj.description == "cilia grows more dense" && pCiliaNum == 0){ //don't spontaneously grow cilia
					continue;
				}
				else if(eval(adaptationObj.adaptation + adaptationObj.condition)){
					goodAdaptation = true;
					break;
				}
			}
			eval(adaptationObj.adaptation + "+=" + adaptationObj.change);
			mutationHtml = "In the newly mutated offspring, the " + adaptationObj.description + ", causing these organisms to " + adaptationObj.impact + ".<br><br>Let's see how they do in their hunt for food.<br><br><a href='javascript:startGame()'>Start</a>"
	}
	
	game.paused = false;
	game.state.restart();
}

function mutate(){
	$('#yearPopDiv').hide();
	prvwTail.animations.paused = true;
			
	if (typeof prvwCilia != "undefined"){prvwCilia.animations.paused = true;}
	
	switch(newYear){
		case 300000:
			//remove parasite preview
			prvwProtozoa.x -= 1000;
			prvwParasite.destroy();
			delete prvwParasite;
			prvwParasite2.destroy();
			delete prvwParasite2;
			break;
		case 500000:
			//remove current preview
			prvwProtozoa.x -= 1000;
			prvwCurrent.destroy();
			delete prvwCurrent;
			break;
	}
		
	adaptationDiv.innerHTML = "In the year " + addCommas(newYear) + ", a mutation is introduced into Zoe's species.<br><br>"
	switch(adaptationObj.adaptation){
		case "pTailLength":
			createTail(pTailLength,false)
			break;
		case "pMitochondriaSize":
			createMitochondria(pMitochondriaSize);
			highlightComponent(prvwMitochondria,4.3-4*pMitochondriaSize);
			break;
		case "pMouthNumber":
		createMouth(pMouthNumber);
			highlightComponent(prvwMouth,1.4);
			break;
		case "pWallThickness":
			createWall(pWallThickness,pTailLength,true);
			highlightComponent(prvwWall,1.1);
			break;
		case "pCiliaNum":
			createCilia(pCiliaNum);
			break;
	}	
	
	adaptationDiv.innerHTML += mutationHtml;
}

////////////////////////////////
// GAME
////////////////////////////////

function phaserPreload() {
	game.load.image('protozoaBody', 'images/protozoa/body.png');
	game.load.image('mitochondria', 'images/protozoa/mitochondria.png');
	game.load.image('oceanBackground', 'images/ocean_background.jpg');
	game.load.image('bubble','images/protozoa/bubble.png')
	game.load.image('food','images/protozoa/food.png')
	game.load.atlasJSONArray('protozoaTail','images/protozoa/tail.png','images/protozoa/tail.json');
	game.load.atlasJSONArray('protozoaMouth','images/protozoa/mouth.png','images/protozoa/mouth.json');
	game.load.atlasJSONArray('protozoaCilia','images/protozoa/cilia.png','images/protozoa/cilia.json');
	game.load.atlasJSONArray('protozoaWall','images/protozoa/wall.png','images/protozoa/wall.json');
	game.load.atlasJSONArray('parasite','images/protozoa/parasite.png','images/protozoa/parasite.json');
	game.load.image('health','images/health.png');
	game.load.image('energy','images/energy.png');
}

function phaserCreate() {
	//console.log("pTailLength = " + pTailLength + ", pMitochondriaSize = " + pMitochondriaSize + ", pMouthNumber = " + pMouthNumber + ", pCiliaNum = " + pCiliaNum + ", pWallThickness = " + pWallThickness) 
	protozoaSize = .2;
	
	//calculated properties
	maxVelocity = 10*pTailLength;
	thrustAmt = 330+70*pTailLength;
	rotationSpeed = 20*(1.3+pCiliaNum);
	energy = 50000*pMitochondriaSize; //50000
	//damagePerCollision = 9-pWallThickness;
	damagePerCollision = -4*Math.log(pWallThickness)+10; //from Excel fitting
	
	
	//add ocean background
	game.add.image(0,0,'oceanBackground');
	
	//start P2 physics system and turn on collision callbacks
	game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
	
	//create protozoa and mitochondria
	protozoa = game.add.sprite(400,300,'protozoaBody');
	pMitochondria = game.add.sprite(-10+(1-pMitochondriaSize)*50,0,'mitochondria');
	
	//create wall
	pWall = game.add.sprite(-95,-195,'protozoaWall','wall_'+pWallThickness+'.png');
	
	//create tail		
	pTail = game.add.sprite(-50,140+(1-pTailLength)*40,'protozoaTail');
	pTail.scale.setTo(1,pTailLength);
	pTail.animations.add('pTailSwing', [0,1,2,3,4,5,6,5,4,3,2,1]);
	pTail.animations.play('pTailSwing',40,true);	
	pTail.animations.paused = true;
	
	//create mouth
	pMouth = game.add.sprite(400,268,'protozoaMouth','mouth_0'+pMouthNumber+'.png');
	
	//create cilia
	if(pCiliaNum != 0){
		pCilia = game.add.sprite(-125,-225,'protozoaCilia')
		switch(pCiliaNum){
			case 1:
				pCilia.animations.add('pCiliaSwing',[0,1,2,3,4,3,2,1]);
				break;
			case 3:
				pCilia.animations.add('pCiliaSwing',[5,6,7,8,9,8,7,6]);
				break;
			case 2:
				pCilia.animations.add('pCiliaSwing',[10,11,12,13,14,13,12,11]);
				break;
		}
		pCilia.animations.play('pCiliaSwing',20,true);
		pCilia.animations.paused = true;
	}
	
	//scale protozoa and components
	protozoa.scale.setTo(protozoaSize);
	pMitochondria.scale.setTo(pMitochondriaSize);
	pMouth.scale.setTo(protozoaSize);
	
	
	//set up physics
	game.physics.p2.restitution = .5;
	game.physics.p2.enable(protozoa, false);
	game.physics.p2.enable(pMouth, false);
	
	//scale mouth hitbox
	if(pMouthNumber>1){pMouth.body.addRectangle(pMouthNumber*20,pMouthNumber*10,0,pMouthNumber*-3);}
	
	
	//set up collisions
	var protozoaCollisionGroup = game.physics.p2.createCollisionGroup();
	var pMouthCollisionGroup = game.physics.p2.createCollisionGroup();
	var foodCollisionGroup = game.physics.p2.createCollisionGroup();
	var outerBoundsCollisionGroup = game.physics.p2.createCollisionGroup();
	var parasiteCollisionGroup = game.physics.p2.createCollisionGroup();
	game.physics.p2.updateBoundsCollisionGroup(); //keeps objects in new collision groups from leaving the world
	pMouth.body.setCollisionGroup(pMouthCollisionGroup);
	protozoa.body.setCollisionGroup(protozoaCollisionGroup);
	protozoa.body.collides(parasiteCollisionGroup,parasiteAttack,this);
	
	//attach protozoa parts
	protozoa.addChild(pWall);
	protozoa.addChild(pMitochondria);
	protozoa.addChild(pTail);
	if(pCiliaNum != 0){protozoa.addChild(pCilia)};
	var mouthConstraint = game.physics.p2.createLockConstraint(protozoa,pMouth,[0,36-2*pMouthNumber],0);
	
	//add water damping to protozoa
	protozoa.body.damping = .7;
	
	//enable arrow key input
	cursors = game.input.keyboard.createCursorKeys();
	
	//bubbles
	var delay = 0;
	for (var i = 0; i < 20; i++){
		var bubble = game.add.sprite(-100 + (game.world.randomX), 700, 'bubble');
		bubble.scale.set(game.rnd.realInRange(0.05,0.3));
		var bubbleSpeed = game.rnd.between(10000,13000);
		game.add.tween(bubble).to({ y: -100 }, bubbleSpeed, Phaser.Easing.Sinusoidal.InOut, true, delay, -1, false);
		delay += 10000;
	}
	
	//food
	for (var i=0; i<50; i++){
		if(Math.random() >= 0.5){ //create food from both directions
			foodStart = game.rnd.between(-800,-50);
			foodVelocityX=game.rnd.between(25,100)
		}
		else{
			foodStart = game.rnd.between(850,1600);
			foodVelocityX=game.rnd.between(-100,-25);
		}
		var food = game.add.sprite(foodStart, game.world.randomY, 'food');
		food.scale.set(game.rnd.realInRange(.2,.4));
		game.physics.p2.enable(food, false);
		food.body.collideWorldBounds = false;
		food.body.setCollisionGroup(foodCollisionGroup);
		food.body.collides([pMouthCollisionGroup,outerBoundsCollisionGroup]); //the array format is important, otherwise it looks for a callback function!
		food.body.velocity.x = foodVelocityX;
		food.body.velocity.y = game.rnd.between(-40,40);
		food.body.damping = 0;
		food.body.mass = .0001; //prevents physics issues while eating
		food.body.fixedRotation = true;
		food.body.beingEaten = false;
	}
	pMouth.body.collides(foodCollisionGroup,eatFood,this);
	
	//outer bounds
	var foodBoundary = game.physics.p2.createBody(400,300,0,true);
	foodBoundary.addRectangle(2800,10,0,-800);
	foodBoundary.addRectangle(2800,10,0,800);
	foodBoundary.addRectangle(10,1600,-1400,0);
	foodBoundary.addRectangle(10,1600,1400,0);
	foodBoundary.collideWorldBounds = false;
	foodBoundary.setCollisionGroup(outerBoundsCollisionGroup);
	foodBoundary.collides(foodCollisionGroup,foodOutsideBounds,this);
	foodBoundary.collides(parasiteCollisionGroup,parasiteOutsideBounds,this);
	
	//parasites
	if(environmentNum == "environment1"){
		parasiteCount = 0;
	}
	else{
		parasiteCount = 10;
	}
	for (var i=0;i<parasiteCount;i++){
		if(Math.random() >= 0.5){
			parasiteStart = game.rnd.between(-800,-50);
			parasiteVelocityX=game.rnd.between(50,200)
		}
		else{
			parasiteStart = game.rnd.between(850,1600);
			parasiteVelocityX=game.rnd.between(-200,-50);
		} //create parasites from both directions
		var parasite = game.add.sprite(parasiteStart, game.world.randomY, 'parasite', 'parasite' + game.rnd.between(1,4) + '.png');
		parasiteScale = game.rnd.realInRange(.1,.2);
		parasite.scale.set(parasiteScale);
		game.physics.p2.enable(parasite,false);
		parasite.body.collideWorldBounds = false;
		parasite.body.setCollisionGroup(parasiteCollisionGroup);
		parasite.body.collides([protozoaCollisionGroup,outerBoundsCollisionGroup]);
		parasite.body.velocity.x = parasiteVelocityX;
		parasite.body.velocity.y = game.rnd.between(-40,40);
		parasite.body.damping = 0;
		parasite.body.mass = 50*parasiteScale;
		parasite.body.rotateRight(game.rnd.between(-30,30));
	}
	
	//health bar
	protozoa.health = 100;
	var healthBarConfig = {x: 70, y: 30, width:100, height: 20, bg:{color: '#961517'}, bar:{color:'#ed2024'}, animationDuration : 100};
	healthBar = new HealthBar(this.game, healthBarConfig);
	healthIcon = game.add.image(10,10,'health');
	healthIcon.scale.setTo(.3);
	
	//energy bar
	var energyBarConfig = {x: 70, y: 70, width:100, height: 20, bg:{color: '#8e8d54'}, bar:{color:'#fffc00'}, animationDuration : 1};
	energyBar = new HealthBar(this.game, energyBarConfig);
	energyIcon = game.add.image(7,50,'energy');
	energyIcon.scale.setTo(.4);
	
	//energy
	gameTimer = game.time.create(false);
	gameTimer.add(energy,outOfEnergy,this);
	gameTimer.start();
	
	//food stat
	foodTextStyle = {font: "bold 20px 'Palatino Linotype', 'Book Antiqua', Palatino, serif"};
	foodCollected = 0;
	foodText = game.add.text(600,30,"Food collected: 0", foodTextStyle);
	
	game.paused = true;
}

function resetFood(foodBody){
	if(Math.random() >= 0.5){
		foodBody.x = game.rnd.between(-800,-50);
		foodBody.velocity.x = game.rnd.between(25,100);
	}
	else{
		foodBody.x = game.rnd.between(850,1600);
		foodBody.velocity.x = game.rnd.between(-100,-25);
	}
	foodBody.y = game.world.randomY;
	foodBody.velocity.y = game.rnd.between(-40,40);
	foodBody.beingEaten = false;
}

function eatFood(pMouthBody,foodBody){
	if(!foodBody.beingEaten){
		foodBody.beingEaten = true;
		foodCollected += 1;
		foodText.text = "Food collected: " + foodCollected;
		var foodConstraint = game.physics.p2.createLockConstraint(pMouthBody,foodBody);
		var foodTween = game.add.tween(foodBody.sprite.scale).to({x:0,y:0},250,null,true,0,0,true);
		setTimeout(function(){ //onComplete for tween would only pass sprite, and we need to pass body
			game.physics.p2.removeConstraint(foodConstraint);
			resetFood(foodBody);
		},250);
	}
}

function resetParasite(parasiteBody){
	if(Math.random() >= 0.5){ //create food from both directions
		parasiteBody.x = game.rnd.between(-800,-50);
		parasiteVelocityX=game.rnd.between(25,100)
	}
	else{
		parasiteBody.x = game.rnd.between(850,1600);
		parasiteVelocityX=game.rnd.between(-100,-25);
	}
	parasiteBody.velocity.x = parasiteVelocityX;
	parasiteBody.velocity.y = game.rnd.between(-40,40);
	parasiteBody.rotateRight(game.rnd.between(-30,30));
}

function parasiteAttack(){
	protozoa.health -= damagePerCollision;
	healthBar.setPercent(protozoa.health);
	if(protozoa.health < 1){
		outOfHealth();
	}
}

function foodOutsideBounds(foodBoundaryBody,foodBody){
	resetFood(foodBody);
}

function parasiteOutsideBounds(foodBoundaryBody,parasiteBody){
	resetParasite(parasiteBody);
}

function outOfEnergy(){
	protozoaPreview.state.restart();
	totalFood += foodCollected;
	populationCalc("energy",foodCollected);
}

function outOfHealth(){
	protozoaPreview.state.restart();
	totalFood += foodCollected;
	populationCalc("health",foodCollected);
}

function phaserUpdate() {
	//movement
	speed = protozoa.body.data.velocity[0]^2+protozoa.body.data.velocity[1]^2;
	if(environmentNum=="environment3"){
		protozoa.body.velocity.x -= 3;
	}
	turning = false;
	if (cursors.left.isDown){
		turning = true;
		protozoa.body.rotateLeft(rotationSpeed);
		if(pCiliaNum != 0){
			if(pCilia.animations.paused == true){
				pCilia.animations.paused = false;
			}		
		}
	}
	else if (cursors.right.isDown){
		turning = true;
		protozoa.body.rotateRight(rotationSpeed);
		if(pCiliaNum != 0){
			if(pCilia.animations.paused == true){
				pCilia.animations.paused = false;
			}
		}
	}
	else{
		protozoa.body.setZeroRotation();
	}
	if (cursors.up.isDown){
		protozoa.body.thrust(thrustAmt);
		if(pTail.animations.paused == true){
			pTail.animations.paused = false;
			if(pCiliaNum != 0){
				pCilia.animations.paused = false;
			}
		}			
	}
	else if (cursors.down.isDown){
		protozoa.body.reverse(thrustAmt);
		if(pTail.animations.paused == true){
			pTail.animations.paused = false;
			if(pCiliaNum != 0){
				pCilia.animations.paused = false;
			}
		}	
	}
	else{
		pTail.animations.paused = true;
		if(turning==false && pCiliaNum != 0){pCilia.animations.paused = true;}
	}
	constrainVelocity(protozoa, maxVelocity);
	
	//energy
	energyBar.setPercent(gameTimer.duration*100/energy);
}

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//                                            BIRD                                                   //
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

function switchSpecies(){
	birdPreview = new Phaser.Game(200,600,Phaser.AUTO,'birdPreviewDiv',{preload: birdPreviewPreload, create: birdPreviewCreate});
	$('#mutationDiv').hide();
	$('#gameDiv').hide();
	$('#birdMutationDiv').show();
	if(typeof game != "undefined"){ //if we're skipping protozoa
		game.destroy();
		protozoaPreview.destroy();
	}
	environmentNum = "environment4";
	years = [1000000000];
	birdPops = [100*pops[pops.length - 1]];
}

function birdIntro1(){
	$('#birdPreviewDiv').show();
	birdAdaptationDiv.innerHTML = "This is Berta. She's a member of the new species that came from Zoe's species. Let's take a look at the components that make up Berta.<br><br>First off, her wings. The larger her wings grow, the easier it'll be for Berta to stay up in the air.<br><br><a href='javascript:birdIntro2()'>Continue</a>";
	if (typeof birdPrvwTail != "undefined"){
		birdPrvwTail.animations.paused = true;
	}
	//[birdWingScaleTween,birdWingPosTween] = birdHighlightComponent(birdPrvwWing,1.2);
}

function birdIntro2(){
	birdAdaptationDiv.innerHTML = "This is Berta's tail. Her tail helps her fly forwards. The larger her tail grows, the faster she'll be able to fly side to side.<br><br><a href='javascript:birdIntro3()'>Continue</a>";
	//birdPrvwWing.animations.paused = true;
	birdPrvwWing.animations._anims.bWingFlap.loop = false; //this instead of pause so the wing stops facing down (and not blocking other body parts)
	birdPrvwTail.animations.paused = false;
	//[birdTailScaleTween,birdTailPosTween] = birdHighlightComponent(birdPrvwTail,1.2);
}

function birdIntro3(){
	birdAdaptationDiv.innerHTML = "Berta's beak is a lot like Zoe's cytostome (mouth). The larger her beak, the easier it'll be for her to catch nearby food!<br><br><a href='javascript:birdIntro4()'>Continue</a>";
	birdPrvwTail.animations.paused = true;
	birdBeakScaleTween = birdPreview.add.tween(birdPrvwBeak.scale).to({ x: 1.5*birdPrvwBeak.scale.x, y: 1.5*birdPrvwBeak.scale.y }, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
}

function birdIntro4(){
	birdAdaptationDiv.innerHTML = "Berta doesn't have any real protection from enemies once they catch her, but by changing color to  match her environment, she's able to hide from them. In this simulation, Berta's species may evolve to better match the color of the sky.<br><br><a href='javascript:birdIntro5()'>Continue</a>";
	birdBeakScaleTween.repeat(0);
	birdColorTween = tweenTint(birdPrvwBird, 0xffffff, 0x70c7ff, 500);
	birdTailColorTween = tweenTint(birdPrvwTail, 0xffffff, 0x70c7ff, 500);
	birdWingColorTween = tweenTint(birdPrvwWing, 0xffffff, 0x70c7ff, 500);	
}

function birdIntro5(){
	birdAdaptationDiv.innerHTML = "Finally, Berta needs to be able to see at night, as well as during the day. You'll start by hunting with her during the day, but as the light fades, her eyes will need to grow to find food and avoid enemies once the sun goes down.<br><br><a href='javascript:birdIntro6()'>Continue</a>";
	birdColorTween.repeat(0);
	birdTailColorTween.repeat(0);
	birdWingColorTween.repeat(0);
	birdEyeScaleTween = birdPreview.add.tween(birdPrvwEye.scale).to({ x: 2*birdPrvwEye.scale.x, y: 2*birdPrvwEye.scale.y }, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
	birdEyePosTween = birdPreview.add.tween(birdPrvwEye).to({ x: birdPrvwEye.x - birdPrvwEye.width*(2-1)*.5, y: birdPrvwEye.y - birdPrvwEye.height*(2-1)*.5}, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
}

function birdIntro6(){
	birdAdaptationDiv.innerHTML = "In the air, you'll encounter ladybugs (top) and crows (bottom).<br><br>How many ladybugs you eat will affect how Berta's species adapts and evolves over time. Avoid crows - running into them will drop your health!<br><br>As before, once you run out of health or energy, your food-collecting round will end.<br><br><a href='javascript:birdIntro7()'>Continue</a>";
	birdEyeScaleTween.repeat(0);
	birdEyePosTween.repeat(0);
	birdPrvwBird.x += 1000;
	birdPrvwLadybug = birdPreview.add.sprite(40, 30, 'ladybug');
	birdPrvwCrow = birdPreview.add.sprite(30, 130, 'crow');
	birdPrvwLadybug.scale.setTo(.5);
	birdPrvwCrow.scale.setTo(.3);
}

function birdIntro7(){
	birdAdaptationDiv.innerHTML = "It's time to fly! In your starting environment, there aren't any crows to worry about, so focus on collecting ladybugs.<br><br>Use the up arrow to flap, and the left and right arrows to fly in each direction. Catch as many ladybugs as you can before you run out of health or energy.<br><br>Hint: Berta is the product of millions of years of evolution, but her species is still pretty new to flying, so she probably won't be very good at hunting ladybugs yet.<br><br><a href='javascript:startBirdGame()'>Start</a>";
	birdPrvwWing.animations._anims.bWingFlap.isPlaying = true;
	birdPrvwWing.animations._anims.bWingFlap.loop = true;
	birdPrvwTail.animations.paused = false;
	if (typeof birdPrvwLadybug != "undefined"){ //this is required for skipping the intro
		birdPrvwBird.x -= 1000;
		birdPrvwLadybug.destroy();
		delete birdPrvwLadybug;
		birdPrvwCrow.destroy();
		delete birdPrvwCrow;
	}
	birdGame = new Phaser.Game(800, 600, Phaser.AUTO, 'birdGameDiv', { preload: birdPreload, create: birdCreate, update: birdUpdate });
}

function startBirdGame(){
	$('#birdMutationDiv').hide();
	$('#birdGameDiv').show();
	birdGame.paused = false;
	birdPreview.paused = true;
}

////////////////////////////////
// BIRD PREVIEW
////////////////////////////////

function birdPreviewPreload(){
	birdPreview.load.image('birdBody', 'images/bird/body.png');
	birdPreview.load.image('birdEye', 'images/bird/eye.png');
	birdPreview.load.atlasJSONArray('birdTail', 'images/bird/tail.png','images/bird/tail.json');
	birdPreview.load.atlasJSONArray('birdBeak', 'images/bird/beak.png','images/bird/beak.json');
	birdPreview.load.atlasJSONArray('birdWing','images/bird/wing.png','images/bird/wing.json');
	birdPreview.load.atlasJSONArray('ladybug','images/bird/ladybug.png','images/bird/ladybug.json');
	birdPreview.load.image('crow','images/bird/crow.png');
}

function birdCreateWing(bWingSize){
	if (typeof birdPrvwWing != "undefined"){
		birdPrvwWing.destroy();
		delete birdPrvwWing;
	}
	birdPrvwWing = birdPreview.add.sprite(-60*bWingSize,-330*bWingSize,'birdWing');
	birdPrvwWing.scale.setTo(bWingSize);
	birdPrvwWing.animations.add('bWingFlap',[0,1,2,3,4,5,6,7,8,7,6,5,4,3,2,1]);
	birdPrvwWing.animations.play('bWingFlap',40,true);
	birdPrvwBird.addChild(birdPrvwWing);
}

function birdCreateTail(bTailSize){
	if (typeof birdPrvwTail != "undefined"){
		birdPrvwTail.destroy();
		delete birdPrvwTail;
	}
	birdPrvwTail = birdPreview.add.sprite(-230+10*bTailSize,-80+65*bTailSize,'birdTail');
	birdPrvwTail.anchor.set(.92,.9);
	birdPrvwTail.scale.setTo(bTailSize);
	birdPrvwTail.animations.add('bTailFlap',[0,1,2,3,4,5,6,7,8,7,6,5,4,3,2,1]);
	birdPrvwTail.animations.play('bTailFlap',40,true);
	birdPrvwBird.addChild(birdPrvwTail);
}

function birdCreateBeak(bBeakSize){
	if (typeof birdPrvwBeak != "undefined"){
		birdPrvwBeak.destroy();
		delete birdPrvwBeak;
	}
	birdPrvwBeak = birdPreview.add.sprite(242,-83,'birdBeak');
	birdPrvwBeak.anchor.set(0,.57);
	birdPrvwBeak.scale.setTo(bBeakSize,.5+bBeakSize/6);
	birdPrvwBird.addChild(birdPrvwBeak);
}

function birdCreateEye(bEyeSize){
	if (typeof birdPrvwEye != "undefined"){
		birdPrvwEye.destroy();
		delete birdPrvwEye;
	}
	birdPrvwEye = birdPreview.add.sprite(180-45*bEyeSize,-150-5*bEyeSize,'birdEye');
	birdPrvwEye.scale.setTo(bEyeSize);
	birdPrvwBird.addChild(birdPrvwEye);
}

function birdPreviewCreate(){
	birdSize = .25;
	
	birdPreview.stage.backgroundColor = '#ffffff';
	
	//create bird
	birdPrvwBird = birdPreview.add.sprite(110,120,'birdBody');
	birdPrvwBird.anchor.set(.5);
	
	
	birdCreateTail(bTailSize);
	birdCreateBeak(bBeakSize);
	birdCreateEye(bEyeSize);
	birdCreateWing(bWingSize);
	
	birdPrvwTint = Phaser.Color.interpolateColor(0xffffff,0x70c7ff,100,bBlueness);
	
	birdPrvwWing.tint = birdPrvwTint;
	birdPrvwTail.tint = birdPrvwTint;
	birdPrvwBird.tint = birdPrvwTint;
	
	birdPrvwBird.scale.setTo(birdSize);
}

////////////////////////////////
// BIRD POPULATION CALC
////////////////////////////////

function birdPopulationCalc(cause,foodThisRound){
	birdGame.paused = true;
	birdPreview.paused = false;
	
	$('#birdGameDiv').hide();
	$('#birdMutationDiv').show();
	if(cause == "energy"){
		birdAdaptationDiv.innerHTML = "You've run out of energy for this round.<br><br>";
	}
	else{
		birdAdaptationDiv.innerHTML = "You've run out of health for this round.<br><br>";
	}
	
	birdAdaptationDiv.innerHTML += "You collected " + foodThisRound + " ladybugs this round. In total, you've collected " + totalFood + " pieces of food. By better adapting to your environment, you'll be able to collect more!<br><br>"
	
	if (typeof birdAdaptationObj != "undefined"){	
		if(birdAdaptationObj.keep == "TRUE" && eval(environmentNum)[birdAdaptationObj.adaptation]){
			birdAdaptationDiv.innerHTML += "The mutated offspring, who " + birdAdaptationObj.impact + " than the rest of the species, were more fit as a result of their mutation. This adaptation will become the dominant phenotype until the next mutation.<br><br>"
		}
		else if(birdAdaptationObj.keep == "FALSE" && eval(environmentNum)[birdAdaptationObj.adaptation]){
			eval(birdAdaptationObj.adaptation + "-=" + birdAdaptationObj.change);
			birdAdaptationDiv.innerHTML += "The mutated offspring, who " + birdAdaptationObj.impact + " than the rest of the species, were less fit as a result of their mutation. Organisms with this mutation will quickly die out due to competition with the rest of their species.<br><br>"
		}
		else{
			eval(birdAdaptationObj.adaptation + "-=" + birdAdaptationObj.change);
			birdAdaptationDiv.innerHTML += "The mutated offspring, who " + birdAdaptationObj.impact + " than the rest of the species, were no more or less fit in this specific environment. Having no advantage over the rest of the species, these mutated organisms slowly die out.<br><br>"
		}
	}
	
	birdAdaptationDiv.innerHTML += "Let's fast forward fifty thousand years and see how Berta's species has changed.<br><br><a href='javascript:birdPopulationCalc2("+foodThisRound+")'>To the future!</a>"	
}

function birdPopulationCalc2(foodThisRound){
	$('#birdYearPopDiv').show();
	newYear = years[years.length - 1] + 50000
	years.push(newYear);
	birdPreMutate(); //this is here so the preview state can restart in time
	birdAdaptationDiv.innerHTML = "It's now the year " + addCommas(newYear) + ".<br><br>"
	
	switch(newYear){
		case 1000200000:
			environmentNum = "environment5";
			birdAdaptationDiv.innerHTML += "Over the past 50,000 years, <b>Zoe's species has migrated to a new environment</b>. In this environment, they face a dangerous new enemy - crows - which can be seen to the left.<br><br>"
			birdPrvwBird.x += 1000;
			birdPrvwCrow = birdPreview.add.sprite(30,130,'crow');
			birdPrvwCrow.scale.setTo(.3);
			break;
		case 1000400000:
			environmentNum = "environment6";
			birdAdaptationDiv.innerHTML += "Over the past 50,000 years, <b>Zoe's species has migrated to a new environment</b>. In this environment, they are forced to hunt at night, making it more challenging to see both ladybugs and crows.<br><br>";
			break;
	}
	
	birdAdaptationDiv.innerHTML += "Based on your food-collecting performance, and a simulation of the rest of Berta's species over the past fifty thousand years, Berta's species has ";
	oldPop = birdPops[birdPops.length - 1];
	var popChange = calculatePopulationChange() + foodThisRound/5;
	newPop = Math.ceil(oldPop * (100+popChange)/100);
	
	birdPops.push(newPop);
	var chartData = {
		labels: years,
		series: [birdPops]
	};
	var chartOptions = {
		width: 400,
		height: 200,
		showArea: true,
		axisY: {
			onlyInteger: true
		},
		axisX: {
			showLabel: false,
			showGrid: false
		}
	};
	popChart = new Chartist.Line('#birdYearPopDiv', chartData, chartOptions);
	
	if(newPop<oldPop){
		birdAdaptationDiv.innerHTML += "shrunk to " + addCommas(newPop) + ". Looks like they'd better get adapting quickly, before they go extinct!<br><br><a href='javascript:birdMutate()'>Let's scramble some DNA</a><br><br>"
	}
	else if(newPop>oldPop){
		birdAdaptationDiv.innerHTML += "grown to " + addCommas(newPop) + ". That's decent growth, but they can grow even faster with the right adaptations!<br><br><a href='javascript:birdMutate()'>Let's scramble some DNA</a><br><br>"
	}
	else{
		birdAdaptationDiv.innerHTML += "maintained its population of " + addCommas(newPop) + ". With the right adaptations, this population is ready to grow!<br><br><a href='javascript:birdMutate()'>Let's scramble some DNA</a><br><br>"
	}
}

////////////////////////////////
// BIRD MUTATION
////////////////////////////////

function birdPreMutate(){
	if (typeof birdAdaptationObj != "undefined"){	//back out the previous year's negative change here, now that the preview has definitely finished restarting
		if(birdAdaptationObj.keep == "FALSE"){
			eval(birdAdaptationObj.adaptation + "-=" + birdAdaptationObj.change);
		}
	}
	
	var goodAdaptation = false; //good doesn't mean beneficial, it means able to be applied
	while(goodAdaptation == false){
		birdAdaptationObj = birdAdaptationsObjArray[Math.floor(Math.random()*birdAdaptationsObjArray.length)]; //get random adaptationObj
		if(eval(birdAdaptationObj.adaptation + birdAdaptationObj.condition)){
			goodAdaptation = true;
		}
	}
	
	eval(birdAdaptationObj.adaptation + "+=" + birdAdaptationObj.change);
	birdMutationHtml = "In the newly mutated offspring, the " + birdAdaptationObj.description + ", causing these organisms to " + birdAdaptationObj.impact + ".<br><br>Let's see how they do in their hunt for ladybugs.<br><br><a href='javascript:startBirdGame()'>Start</a>"
	
	birdGame.paused = false;
	birdGame.state.restart();
}

function birdMutate(){
	$('#birdYearPopDiv').hide();
	birdPrvwWing.animations._anims.bWingFlap.loop = false;
	birdPrvwTail.animations.paused = true;
	
	switch(newYear){
		case 1000200000:
			//remove crow preview
			birdPrvwBird.x -= 1000;
			birdPrvwCrow.destroy();
			delete birdPrvwCrow;
			break;
		/*case 1000400000:
			//remove current preview
			prvwProtozoa.x -= 1000;
			prvwCurrent.destroy();
			delete prvwCurrent;
			break;*/
	}
		
	birdAdaptationDiv.innerHTML = "In the year " + addCommas(newYear) + ", a mutation is introduced into Berta's species.<br><br>"
	switch(birdAdaptationObj.adaptation){
		case "bWingSize":
			birdCreateWing(bWingSize);
			birdPrvwWing.animations._anims.bWingFlap.isPlaying = true;
			birdPrvwWing.animations._anims.bWingFlap.loop = true;
			break;
		case "bTailSize":
			birdCreateTail(bTailSize);
			birdPrvwTail.animations.paused = false;
			break;
		case "bEyeSize":
			birdCreateEye(bEyeSize);
			birdPreview.add.tween(birdPrvwEye.scale).to({ x: 2*birdPrvwEye.scale.x, y: 2*birdPrvwEye.scale.y }, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
			birdPreview.add.tween(birdPrvwEye).to({ x: birdPrvwEye.x - birdPrvwEye.width*(2-1)*.5, y: birdPrvwEye.y - birdPrvwEye.height*(2-1)*.5}, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
			break;
		case "bBeakSize":
			birdCreateBeak(bBeakSize);
			birdPreview.add.tween(birdPrvwBeak.scale).to({ x: 1.5*birdPrvwBeak.scale.x, y: 1.5*birdPrvwBeak.scale.y }, 300, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true);
			break;
		case "bBlueness":
			birdColorTween = tweenTint(birdPrvwBird, 0xffffff, 0x70c7ff, 500);
			birdTailColorTween = tweenTint(birdPrvwTail, 0xffffff, 0x70c7ff, 500);
			birdWingColorTween = tweenTint(birdPrvwWing, 0xffffff, 0x70c7ff, 500);	
			break;
	}	
	
	birdAdaptationDiv.innerHTML += birdMutationHtml;
}

////////////////////////////////
// BIRD GAME
////////////////////////////////

function birdPreload() {
	birdGame.load.image('birdBody', 'images/bird/body.png');
	birdGame.load.image('birdEye', 'images/bird/eye.png');
	birdGame.load.image('skyBackground', 'images/skyBackground.jpg');
	birdGame.load.atlasJSONArray('birdTail', 'images/bird/tail.png','images/bird/tail.json');
	birdGame.load.atlasJSONArray('birdBeak', 'images/bird/beak.png','images/bird/beak.json');
	birdGame.load.atlasJSONArray('birdWing','images/bird/wing.png','images/bird/wing.json');
	birdGame.load.image('health','images/health.png');
	birdGame.load.image('energy','images/energy.png');
	birdGame.load.atlasJSONArray('ladybug','images/bird/ladybug.png','images/bird/ladybug.json');
	birdGame.load.image('crow','images/bird/crow.png');
	birdGame.load.image('night','images/bird/black.gif');
}

function birdCreate() {
	
	energy = 20000;
	bThrust = 50+200*(bTailSize-.5);
	bLift = 90+bWingSize*100;
	birdDamagePerCollision = 8;
	var bBeakBoxSize = 7+14*bBeakSize;
	
	//add sky background
	birdGame.add.image(0,0,'skyBackground');
	
	//start P2 physics system and turn on collision callbacks
	birdGame.physics.startSystem(Phaser.Physics.P2JS);
	birdGame.physics.p2.setImpactEvents(true);
	
	//create bird
	bird = birdGame.add.sprite(400,300,'birdBody');
	
	//create bird parts
	bEye = birdGame.add.sprite(180-45*bEyeSize,-150-5*bEyeSize,'birdEye');
	bEye.scale.setTo(bEyeSize);
	
	bTail = birdGame.add.sprite(-230+10*bTailSize,-80+65*bTailSize,'birdTail');
	bTail.anchor.set(.92,.9);
	bTail.scale.setTo(bTailSize);
	bTail.animations.add('bTailFlap',[0,1,2,3,4,5,6,5,4,3,2,1]);
	bTail.animations.play('bTailFlap',40,true);
	
	bBeak = birdGame.add.sprite(242,-83,'birdBeak');
	bBeak.anchor.set(0,.57);
	bBeak.scale.setTo(bBeakSize,.5+bBeakSize/6);
	bBeak.animations.add('bBeakEat',[0,1,2,3,2,1]);
	
	bWing = birdGame.add.sprite(-60*bWingSize,-330*bWingSize,'birdWing');
	bWing.scale.setTo(bWingSize);
	bWing.animations.add('bWingFlap',[0,1,2,3,4,5,6,7,8,7,6,5,4,3,2,1]);
	bWing.animations.play('bWingFlap',40,true);
	
	//create beak hitbox
	bBeakBox = birdGame.physics.p2.createBody(440,300,0,true);
	bBeakBox.addRectangle(bBeakBoxSize,bBeakBoxSize,0,0);
	bBeakBox.collideWorldBounds = false;
	bBeakBox.debug = false;
	
	//scale bird parts
	birdScale = .15;
	bird.scale.setTo(birdScale);
	
	//tint bird parts
	tintColor = Phaser.Color.interpolateColor(0xffffff,0x70c7ff,10,Math.round(Math.sqrt(bBlueness)));
	bird.tint = tintColor;
	bTail.tint = tintColor;
	bWing.tint = tintColor;
	
	//set up physics
	birdGame.physics.p2.restitution = 0.1;
	birdGame.physics.p2.enable(bird, false);
	//birdGame.physics.p2.enable(bBeak, false);
	birdGame.physics.p2.gravity.y = 100;
	bird.body.fixedRotation = true;
	
	//set up collisions
	var birdCollisionGroup = birdGame.physics.p2.createCollisionGroup();
	var bBeakBoxCollisionGroup = birdGame.physics.p2.createCollisionGroup();
	var ladybugCollisionGroup = birdGame.physics.p2.createCollisionGroup();
	var outerBoundsCollisionGroup = birdGame.physics.p2.createCollisionGroup();
	var crowCollisionGroup = birdGame.physics.p2.createCollisionGroup();
	birdGame.physics.p2.updateBoundsCollisionGroup(); //keeps objects in new collision groups from leaving the world
	bBeakBox.setCollisionGroup(bBeakBoxCollisionGroup);
	bird.body.setCollisionGroup(birdCollisionGroup);
	bird.body.collides(crowCollisionGroup,crowAttack,this);
	
	//attach bird parts
	//beakConstraint = birdGame.physics.p2.createLockConstraint(bird,bBeak,[-55,20],0);
	bird.addChild(bEye);
	bird.addChild(bBeak);
	bird.addChild(bWing);
	bird.addChild(bTail);
	
	//add air damping to bird
	bird.body.damping = .3;
	
	//enable arrow key input
	cursors = birdGame.input.keyboard.createCursorKeys();
	
	//ladybugs
	for (var i=0; i<50; i++){
		if(Math.random() >= 0.5){ //create food from both directions
			ladybugStart = birdGame.rnd.between(-800,-50);
			ladybugVelocityX=birdGame.rnd.between(50,150)
			var flipped = true;
		}
		else{
			ladybugStart = birdGame.rnd.between(850,1600);
			ladybugVelocityX=birdGame.rnd.between(-150,-50);
			var flipped = false;
		}
		var ladybug = birdGame.add.sprite(ladybugStart, birdGame.world.randomY, 'ladybug');
		ladybug.animations.add('lFly',[0,1,2,3,2,1]);
		ladybug.animations.play('lFly',40,true);
		ladybug.scale.set(birdGame.rnd.realInRange(.1,.2));
		birdGame.physics.p2.enable(ladybug, false);
		ladybug.body.data.gravityScale = 0;
		ladybug.body.collideWorldBounds = false;
		ladybug.body.setCollisionGroup(ladybugCollisionGroup);
		ladybug.body.collides([bBeakBoxCollisionGroup,outerBoundsCollisionGroup]); //the array format is important, otherwise it looks for a callback function!
		ladybug.body.velocity.x = ladybugVelocityX;
		ladybug.body.velocity.y = birdGame.rnd.between(-40,40);
		ladybug.body.damping = 0;
		ladybug.body.mass = .0001; //prevents physics issues while eating
		ladybug.body.fixedRotation = true;
		ladybug.body.beingEaten = false;
		if(flipped){
			ladybug.body.facingRight = true; //this goes on the body for easy access in the collision function
			ladybug.body.sprite.scale.x *= -1;
		}
		else{
			ladybug.body.facingRight = false;
		}
	}
	bBeakBox.collides(ladybugCollisionGroup,eatLadybug,this);
	
	//outer bounds
	var ladybugBoundary = birdGame.physics.p2.createBody(400,300,0,true);
	ladybugBoundary.addRectangle(2800,10,0,-800);
	ladybugBoundary.addRectangle(2800,10,0,800);
	ladybugBoundary.addRectangle(10,1600,-1400,0);
	ladybugBoundary.addRectangle(10,1600,1400,0);
	ladybugBoundary.collideWorldBounds = false;
	ladybugBoundary.setCollisionGroup(outerBoundsCollisionGroup);
	ladybugBoundary.collides(ladybugCollisionGroup,ladybugOutsideBounds,this);
	ladybugBoundary.collides(crowCollisionGroup,crowOutsideBounds,this);
	
	//crows
	if(environmentNum == "environment4"){
		crowCount = 0;
	}
	else{
		crowCount = Math.ceil(8-bBlueness*8/100);
	}
	for (var i=0;i<crowCount;i++){
		if(Math.random() >= 0.5){
			crowStart = birdGame.rnd.between(-400,250);
			crowVelocityX=birdGame.rnd.between(100,250)
			var flipped = false;
		}
		else{
			var flipped = true;
			crowStart = birdGame.rnd.between(550,1200);
			crowVelocityX=birdGame.rnd.between(-250,-100);
		} //create crows from both directions
		var crow = birdGame.add.sprite(crowStart, birdGame.rnd.between(-600,-200), 'crow');
		crowScale = birdGame.rnd.realInRange(.2,.3);
		crow.scale.set(crowScale);
		birdGame.physics.p2.enable(crow,false);
		crow.body.collideWorldBounds = false;
		crow.body.setCollisionGroup(crowCollisionGroup);
		crow.body.collides([birdCollisionGroup,outerBoundsCollisionGroup]);
		crow.body.velocity.x = crowVelocityX;
		crow.body.velocity.y = birdGame.rnd.between(100,350);
		crow.body.data.gravityScale = 0;
		crow.body.damping = 0;
		crow.body.mass = 30*crowScale;
		crow.body.fixedRotation = true;
		if(flipped){
			crow.body.facingRight = false; //this goes on the body for easy access in the collision function
			crow.body.sprite.scale.x *= -1;
		}
		else{
			crow.body.facingRight = true;
		}
	}
	
	//direction the bird is facing at start
	direction = "right";
	
	//this is up here to make white text during night
	ladybugTextStyle = {font: "bold 20px 'Palatino Linotype', 'Book Antiqua', Palatino, serif", fill: "black"};
	
	//nighttime
	if(years[years.length - 1]>1000390000){
		night = birdGame.add.sprite(0,0,'night');
		night.scale.setTo(400);
		night.alpha = 1-bEyeSize/2;
		if(night.alpha > .5){
			ladybugTextStyle = {font: "bold 20px 'Palatino Linotype', 'Book Antiqua', Palatino, serif", fill: "white"};
		}
	}
	
	//health bar
	bird.health = 100;
	var birdHealthBarConfig = {x: 70, y: 30, width:100, height: 20, bg:{color: '#961517'}, bar:{color:'#ed2024'}, animationDuration : 100};
	birdHealthBar = new HealthBar(this.game, birdHealthBarConfig); //might be this.birdGame
	birdHealthIcon = birdGame.add.image(10,10,'health');
	birdHealthIcon.scale.setTo(.3);
	
	//energy bar
	var birdEnergyBarConfig = {x: 70, y: 70, width:100, height: 20, bg:{color: '#8e8d54'}, bar:{color:'#fffc00'}, animationDuration : 1};
	birdEnergyBar = new HealthBar(this.game, birdEnergyBarConfig);
	birdEnergyIcon = birdGame.add.image(7,50,'energy');
	birdEnergyIcon.scale.setTo(.4);
	
	//energy
	birdGameTimer = birdGame.time.create(false);
	birdGameTimer.add(energy,birdOutOfEnergy,this);
	birdGameTimer.start();
	
	//ladybug stat
	ladybugsCollected = 0;
	ladybugText = birdGame.add.text(570,30,"Ladybugs collected: 0", ladybugTextStyle);
	
	birdGame.paused = true;
}

function eatLadybug(bBeakBoxBody,ladybugBody){
		bBeak.animations.play('bBeakEat',20,false);
		if(!ladybugBody.beingEaten){
		ladybugBody.beingEaten = true;
		ladybugsCollected += 1;
		ladybugText.text = "Ladybugs collected: " + ladybugsCollected;
		var ladybugConstraint = birdGame.physics.p2.createLockConstraint(bBeakBoxBody,ladybugBody);
		var ladybugTween = birdGame.add.tween(ladybugBody.sprite.scale).to({x:0,y:0},250,null,true,0,0,false);
		setTimeout(function(){ //onComplete for tween would only pass sprite, and we need to pass body
			birdGame.physics.p2.removeConstraint(ladybugConstraint);
			resetLadybug(ladybugBody);
		},250);
	}
}

function ladybugOutsideBounds(ladybugBoundaryBody,ladybugBody){
	resetLadybug(ladybugBody);
}

function crowOutsideBounds(ladybugBoundaryBody,crowBody){
	resetCrow(crowBody);
}

function resetCrow(crowBody){
	if(Math.random() >= 0.5){
		crowBody.x = birdGame.rnd.between(-400,250);
		crowBody.velocity.x = birdGame.rnd.between(100,250)
		if(!crowBody.facingRight){
			crowBody.sprite.scale.x *= -1;
			crowBody.facingRight = true;
		}
	}
	else{
		crowBody.x = birdGame.rnd.between(550,1200);
		crowBody.velocity.x = birdGame.rnd.between(-250,-100);
		if(crowBody.facingRight){
			crowBody.sprite.scale.x *= -1;
			crowBody.facingRight = false;
		}
	}
	crowBody.y = birdGame.rnd.between(-600,-200);
	crowBody.velocity.y = birdGame.rnd.between(200,500);
}

function resetLadybug(ladybugBody){
	ladybugBody.sprite.scale.set(birdGame.rnd.realInRange(.1,.2)); //this is needed so ladybugs don't fly backwards after having their scale tweened during eating
	ladybugBody.facingRight = false;
	if(Math.random() >= 0.5){
		ladybugBody.x = birdGame.rnd.between(-800,-50);
		ladybugBody.velocity.x = birdGame.rnd.between(50,150);
		if(!ladybugBody.facingRight){
			ladybugBody.sprite.scale.x *= -1;
			ladybugBody.facingRight = true;
		}
	}
	else{
		ladybugBody.x = birdGame.rnd.between(850,1600);
		ladybugBody.velocity.x = birdGame.rnd.between(-150,-50);
		if(ladybugBody.facingRight){
			ladybugBody.sprite.scale.x *= -1;
			ladybugBody.facingRight = false;
		}
	}
	ladybugBody.y = birdGame.world.randomY;
	ladybugBody.velocity.y = birdGame.rnd.between(-40,40);
	ladybugBody.beingEaten = false;
}

function crowAttack(){
	bird.health -= birdDamagePerCollision;
	birdHealthBar.setPercent(bird.health);
	if(bird.health < 1){
		birdOutOfHealth();
	}
}

function birdOutOfHealth(){
	birdPreview.state.restart();
	totalFood += foodCollected;
	birdPopulationCalc("health",ladybugsCollected);
}

function birdOutOfEnergy(){
	birdPreview.state.restart();
	totalFood += foodCollected;
	birdPopulationCalc("energy",ladybugsCollected);
}

function birdUpdate() {
	if(direction=="right"){
		bBeakBox.x = bBeak.worldPosition.x+10;
	}
	else{
		bBeakBox.x = bBeak.worldPosition.x-10;
	}
	bBeakBox.y = bBeak.worldPosition.y;
	if(bBeakBox.debug){
		if(direction=="right"){
			bBeakBox.debugBody.x = bBeak.worldPosition.x+10;
		}
		else{
			bBeakBox.debugBody.x = bBeak.worldPosition.x-10;
		}
		bBeakBox.debugBody.y = bBeak.worldPosition.y;
	}
	
	//movement
	if (cursors.left.isDown){
		bird.body.thrustLeft(bThrust);
		if(direction == "right"){
			direction = "left";
			bird.body.sprite.scale.x *= -1;
		}
		if(bTail.animations.paused == true){
			bTail.animations.paused = false;
		}
	}
	
	else if (cursors.right.isDown){
		bird.body.thrustRight(bThrust);
		if(direction == "left"){
			direction = "right";
			bird.body.sprite.scale.x *= -1;
		}
		if(bTail.animations.paused == true){
			bTail.animations.paused = false;
		}
	}
	else{
		if(bTail.animations.paused == false && !cursors.up.isDown){
			bTail.animations.paused = true;
		}
	}
	
	if (cursors.up.isDown){
		bird.body.thrust(bLift);
		if(bWing.animations.paused == true){
			bTail.animations.paused = false;
			bWing.animations.paused = false;
		}			
	}
	else{
		bWing.animations.paused = true;
	}
	
	
	//energy
	birdEnergyBar.setPercent(birdGameTimer.duration*100/energy);
}

function constrainVelocity(sprite, maxVelocity) {
	//from http://www.html5gamedevs.com/topic/4723-p2-physics-limit-the-speed-of-a-sprite/
  var body = sprite.body
  var angle, currVelocitySqr, vx, vy;

  vx = body.data.velocity[0];
  vy = body.data.velocity[1];
  
  currVelocitySqr = vx * vx + vy * vy;
  
  if (currVelocitySqr > maxVelocity * maxVelocity) {
    angle = Math.atan2(vy, vx);
    
    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;
    
    body.data.velocity[0] = vx;
    body.data.velocity[1] = vy;
  }
};

//switchSpecies(); //to start with bird

function addCommas(intNum) {
	//from http://cwestblog.com/2011/06/23/javascript-add-commas-to-numbers/
  return (intNum + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
}

function tweenTint(obj, startColor, endColor, time) {
	//from http://www.html5gamedevs.com/topic/7162-tweening-a-tint/?do=findComment&comment=42712
	
	// create an object to tween with our step value at 0
	var colorBlend = {step: 0};
	
	// create the tween on this object and tween its step property to 100
	var colorTween = birdPreview.add.tween(colorBlend).to({step: 100}, time,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
	
	// run the interpolateColor function every time the tween updates, feeding it the updated value of our tween each time, and set the result as our tint
	colorTween.onUpdateCallback(function() {
		obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
	});
	
	// set the object to the start color straight away
	obj.tint = startColor;
	
	return colorTween;
}