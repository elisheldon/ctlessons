var c = document.getElementById("babyFace");
var ctx = c.getContext("2d");
var ec = document.getElementById("movingEyes");
var ectx = ec.getContext("2d");
ectx.save();
var traitInfoArray = ["skin tone","face shape","eye shape","eye size","eye color","","ear shape","ear lobes","mouth size","cheek dimples","nose size","chin shape","chin dimple","freckles","birthmark","hair color","","eyebrows","eyebrow color","eyelash length"]
var traitMissing = ["a face","a face","eyes","eyes","eyes","","ears","ears","a mouth","cheek dimples, if they were supposed to have them","a nose","a chin","a chin dimple, if they were supposed to have one","freckles, if they were supposed to have them","a birthmark, if they were supposed to have one","hair","eyebrows","eyebrows","eyelashes"]

var traitLookup = {};
traitLookup.TT = "light skin";
traitLookup.Tt = "medium pigment skin";
traitLookup.tt = "dark skin";
traitLookup.RR = "a round face";
traitLookup.Rr = "a round face";
traitLookup.rr = "a square face";
traitLookup.ww = "round eyes";
traitLookup.Ww = "wide eyes";
traitLookup.WW = "wide eyes";
traitLookup.ee = "small eyes";
traitLookup.Ee = "medium-sized eyes";
traitLookup.EE = "large eyes";
traitLookup.AABB = "deep brown eyes";
traitLookup.AABb = "deep brown eyes";
traitLookup.AAbb = "medium brown eyes";
traitLookup.AaBB = "greenish brown eyes";
traitLookup.AaBb = "light brown eyes";
traitLookup.Aabb = "gray-blue eyes";
traitLookup.aaBB = "green eyes";
traitLookup.aaBb = "light blue eyes";
traitLookup.aabb = "pink eyes";
traitLookup.GG = "long ears";
traitLookup.Gg = "long ears";
traitLookup.gg = "round ears";
traitLookup.ff = "attached ear lobes";
traitLookup.Ff = "free ear lobes";
traitLookup.FF = "free ear lobes";
traitLookup.mm = "a narrow mouth";
traitLookup.Mm = "a medium-sized mouth";
traitLookup.MM = "a wide mouth";
traitLookup.DD = "cheek dimples";
traitLookup.Dd = "cheek dimples";
traitLookup.dd = "no cheek dimples";
traitLookup.nn = "a small nose";
traitLookup.Nn = "a medium-sized nose";
traitLookup.NN = "a large nose";
traitLookup.CC = "a protruding chin";
traitLookup.Cc = "a protruding chin";
traitLookup.cc = "a hidden chin";
traitLookup.JJ = "no chin dimple";
traitLookup.Jj = "a chin dimple";
traitLookup.jj = "a chin dimple";
traitLookup.KK = "freckles";
traitLookup.Kk = "freckles";
traitLookup.kk = "no freckles";
traitLookup.OO = "a birthmark on the left side";
traitLookup.Oo = "a birthmark on the right side";
traitLookup.oo = "no birthmark";
traitLookup.XXYY = "black hair";
traitLookup.XXYy = "black hair";
traitLookup.Xxyy = "red hair";
traitLookup.XxYY = "dark brown hair";
traitLookup.XxYy = "light brown hair";
traitLookup.Xxyy = "dark blond hair";
traitLookup.xxYY = "blond hair";
traitLookup.xxYy = "blond hair";
traitLookup.xxyy = "white hair";
traitLookup.HH = "thick eyebrows";
traitLookup.Hh = "thick eyebrows";
traitLookup.hh = "fine eyebrows";
traitLookup.pp = "lighter eyebrow color than hair color";
traitLookup.Pp = "the same eyebrow color as hair color";
traitLookup.PP = "darker eyebrow color than hair color";
traitLookup.vv = "short eyelashes";
traitLookup.Vv = "long eyelashes";
traitLookup.VV = "long eyelashes";

var playerName = "";

function startFunction(){
	//$("#inputPhenotype").hide();
	gen0 = {};
	gen1 = {};
	gen2 = {};
	gen3 = {};
	gen4 = {};
	gen5 = {};
	gen = 0;
	score = 0;
	crossBaby = {};
	drawThisTrait = [];
	gen0frecklesX = [];
	gen0frecklesY = [];
	for (i=0;i<50;i++){
		gen0frecklesX[i] = Math.random();
		gen0frecklesY[i] = Math.random();
	}
}

function moveEyes(e){
	eyeX = 200+Math.ceil((e.clientX-1080)/50);
	eyeY = 250+Math.ceil((e.clientY-300)/40);
	//if(eyeX<181){eyeX=181;} //prevent eye from escaping socket #gross
	//if(eyeY>265){eyeY=265;}
	drawMovingEyes(movingEyeColor,eyeX,eyeY);
	//window.requestAnimationFrame(function(){drawMovingEyes(eyeShape,eyeColor,eyeSize,200);});
	//alert(200+Math.ceil((event.screenX-250)/25));
}

function drawMovingEyesOld(eyeShape,eyeColor,eyeSize,eyeXin){ //this doesn't run right now
	eyeXin = eyeXin + 1;
	//eyeX = 200+Math.ceil(10*Math.sin(eyeXin/10));
	eyeX = 980+Math.ceil((e.screenX-1030)/25);
	drawEyes(eyeShape,eyeColor,eyeSize,eyeX);
	window.requestAnimationFrame(function(){drawMovingEyes(eyeShape,eyeColor,eyeSize,eyeXin)});
}

function drawFace(){
	var faceShape = document.querySelector('input[name="faceShape"]:checked').value;
	var faceColor = document.querySelector('input[name="faceColor"]:checked').value;
	var eyeShape = document.querySelector('input[name="eyeShape"]:checked').value;
	var eyeColor = document.querySelector('input[name="eyeColor"]:checked').value;
	var eyeSize = document.querySelector('input[name="eyeSize"]:checked').value;
	var chinShape = document.querySelector('input[name="chinShape"]:checked').value;
	var chinDimple = document.querySelector('input[name="chinDimple"]:checked').value;
	var freckles = document.querySelector('input[name="freckles"]:checked').value;
	var mouthSize = document.querySelector('input[name="mouthSize"]:checked').value;
	var cheekDimples = document.querySelector('input[name="cheekDimples"]:checked').value;
	var earShape = document.querySelector('input[name="earShape"]:checked').value;
	var earLobes = document.querySelector('input[name="earLobes"]:checked').value;
	var birthmark = document.querySelector('input[name="birthmark"]:checked').value;
	var eyebrows = document.querySelector('input[name="eyebrows"]:checked').value;
	var eyebrowColor = document.querySelector('input[name="eyebrowColor"]:checked').value;
	var hairColor = document.querySelector('input[name="hairColor"]:checked').value;
	var noseSize = document.querySelector('input[name="noseSize"]:checked').value;
	var eyelashLength = document.querySelector('input[name="eyelashLength"]:checked').value;
	var eyeX = 200;
	var eyeY = 250;

	ctx.clearRect(0, 0, c.width, c.height);
	ectx.clearRect(0, 0, c.width, c.height);

	drawHead(faceShape,faceColor);
	drawChin(faceColor,chinDimple,chinShape);
	if(freckles == "true"){drawFreckles(faceColor);}
	drawEyelashes(eyelashLength,eyeShape,eyeSize,hairColor);
	drawEyes(eyeShape,eyeColor,eyeSize,eyeX,eyeY);
	drawMouth(mouthSize);
	if(cheekDimples == "true"){drawCheekDimples(mouthSize);}
	drawEars(faceColor,earShape,earLobes);
	if(birthmark != "none"){drawBirthmark(birthmark,faceColor);}
	drawEyebrows(eyebrows,hairColor,eyeShape,eyeSize,eyebrowColor);
	drawNose(noseSize);
	drawHair(hairColor);

}

function drawHead(faceShape,faceColor){
	ctx.beginPath();
	if(faceShape=="round"){ctx.arc(250,250,150,0,2*Math.PI);}
	else{roundedRect(100,100,300,300,50);}
	ctx.fillStyle=faceColor;
	ctx.fill();
}

function drawChin(faceColor,chinDimple,chinShape){
	ctx.beginPath();
	ctx.moveTo(160,370);
	if(chinShape == "protruding"){
		ctx.bezierCurveTo(205, 395, 210, 420, 250, 420);
		ctx.bezierCurveTo(290, 420, 295, 395, 340, 370);
		ctx.fillStyle=faceColor;
		ctx.fill();
		if(chinDimple == "true"){
			ctx.beginPath();
			ctx.arc(237,400, 20, -.4, .4, false);
			ctx.strokeStyle=shadeColor2(faceColor,-.5);
			ctx.stroke();
		}
	}
	else{
		if(chinDimple == "true"){
			ctx.beginPath();
			ctx.arc(233,390, 20, -.2, .3, false);
			ctx.strokeStyle=shadeColor2(faceColor,-.5);
			ctx.stroke();
		}
	}
}

function drawFreckles(faceColor,frecklesX,frecklesY){
	ctx.beginPath();
	ctx.fillStyle=shadeColor2(faceColor,-.25);
	if(typeof frecklesX === "undefined"){
		frecklesX = [];
		frecklesY = [];
		for (i=0;i<50;i++){
			frecklesX[i] = Math.random();
			frecklesY[i] = Math.random();
			ctx.fillRect(145+Math.floor(frecklesX[i]*210),245+Math.floor(frecklesY[i]*90),2,2);
		}
	}
	else{
		for (i=0;i<50;i++){
			ctx.fillRect(145+Math.floor(frecklesX[i]*210),245+Math.floor(frecklesY[i]*90),2,2);
		}
	}
}

function drawEyes(eyeShape,eyeColor,eyeSize,eyeX,eyeY){
	switch(eyeSize){
		case "small":
			eyeRadius = 20;
			break;
		case "medium":
			eyeRadius = 25;
			break;
		case "large":
			eyeRadius = 30;
			break;
	}

	//left eye white
	ctx.beginPath();
	if(eyeShape == "round"){ctx.arc(200,250,eyeRadius,0,2*Math.PI);}
	else{ctx.ellipse(200,250,eyeRadius,eyeRadius*.6,0,0,2*Math.PI);}
	ctx.fillStyle="white";
	ctx.fill();

	//right eye white
	ctx.beginPath();
	if(eyeShape == "round"){ctx.arc(300,250,eyeRadius,0,2*Math.PI);}
	else{ctx.ellipse(300,250,eyeRadius,eyeRadius*.6,0,0,2*Math.PI);}
	ctx.fillStyle="white";
	ctx.fill();

	//left eye color
	ctx.beginPath();
	ctx.arc(eyeX,eyeY,11,0,2*Math.PI);
	ctx.fillStyle=eyeColor;
	ctx.fill();

	//right eye color
	ctx.beginPath();
	ctx.arc(eyeX+100,eyeY,11,0,2*Math.PI);
	ctx.fillStyle=eyeColor;
	ctx.fill();

	//left eye pupil
	ctx.beginPath();
	ctx.arc(eyeX,eyeY,5,0,2*Math.PI);
	ctx.fillStyle="black";
	ctx.fill();

	//right eye pupil
	ctx.beginPath();
	ctx.arc(eyeX+100,eyeY,5,0,2*Math.PI);
	ctx.fillStyle="black";
	ctx.fill();

	movingEyeShape = eyeShape;
	movingEyeColor = eyeColor;
	movingEyeSize = eyeSize;
	ectx.restore(); //remove clipping, in case old eyes were smaller than new
	ectx.save(); //need to put a save back in the stack
	clipMovingEyes(movingEyeShape,movingEyeSize);
	document.onmousemove = moveEyes;

}

function drawMovingEyes(eyeColor,eyeX,eyeY){
	ectx.fillStyle = "white";
	ectx.fillRect(0,0, ec.width, ec.height);

	//left eye color
	ectx.beginPath();
	ectx.arc(eyeX,eyeY,11,0,2*Math.PI);
	ectx.fillStyle=eyeColor;
	ectx.fill();

	//right eye color
	ectx.beginPath();
	ectx.arc(eyeX+100,eyeY,11,0,2*Math.PI);
	ectx.fillStyle=eyeColor;
	ectx.fill();

	//left eye pupil
	ectx.beginPath();
	ectx.arc(eyeX,eyeY,5,0,2*Math.PI);
	ectx.fillStyle="black";
	ectx.fill();

	//right eye pupil
	ectx.beginPath();
	ectx.arc(eyeX+100,eyeY,5,0,2*Math.PI);
	ectx.fillStyle="black";
	ectx.fill();
}

function clipMovingEyes(eyeShape,eyeSize){
	switch(eyeSize){
		case "small":
			eyeRadius = 20;
			break;
		case "medium":
			eyeRadius = 25;
			break;
		case "large":
			eyeRadius = 30;
			break;
	}

	//left eye white
	ectx.beginPath();
	if(eyeShape == "round"){ectx.arc(200,250,eyeRadius,0,2*Math.PI);}
	else{ectx.ellipse(200,250,eyeRadius,eyeRadius*.6,0,0,2*Math.PI);}

	//right eye white
	if(eyeShape == "round"){ectx.arc(300,250,eyeRadius,0,2*Math.PI);}
	else{ectx.ellipse(300,250,eyeRadius,eyeRadius*.6,0,0,2*Math.PI);}
	ectx.clip();
}

function drawMouth(mouthSize){
	ctx.beginPath();
	switch(mouthSize){
		case "wide":
			ctx.moveTo(190,340);
			ctx.bezierCurveTo(200,340,230,330,250,330);
			ctx.bezierCurveTo(270,330,300,340,310,340);
			ctx.quadraticCurveTo(250,410,190,340);
			ctx.fillStyle="black";
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(235,332);
			ctx.quadraticCurveTo(250,329,265,332);
			ctx.bezierCurveTo(265,345,255,345,250,345);
			ctx.bezierCurveTo(245,345,235,345,235,332);
			ctx.fillStyle="white";
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(240,372);
			ctx.quadraticCurveTo(254,357,280,365);
			ctx.bezierCurveTo(257,380,242,373,240,372);
			ctx.fillStyle="#930a2c";
			ctx.fill();
			break;
		case "medium":
			ctx.moveTo(200,340);
			ctx.bezierCurveTo(210,340,230,330,250,330);
			ctx.bezierCurveTo(270,330,290,340,300,340);
			ctx.quadraticCurveTo(250,410,200,340);
			ctx.fillStyle="black";
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(235,333);
			ctx.quadraticCurveTo(250,328,265,333);
			ctx.bezierCurveTo(265,345,255,345,250,345);
			ctx.bezierCurveTo(245,345,235,345,235,333);
			ctx.fillStyle="white";
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(240,372);
			ctx.quadraticCurveTo(254,357,278,363);
			ctx.bezierCurveTo(257,380,242,373,240,372);
			ctx.fillStyle="#930a2c";
			ctx.fill();
			break;
		case "narrow":
			ctx.moveTo(210,340);
			ctx.bezierCurveTo(220,340,230,330,250,330);
			ctx.bezierCurveTo(270,330,280,340,290,340);
			ctx.quadraticCurveTo(250,410,210,340);
			ctx.fillStyle="black";
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(235,333);
			ctx.quadraticCurveTo(250,328,265,333);
			ctx.bezierCurveTo(265,345,255,345,250,345);
			ctx.bezierCurveTo(245,345,235,345,235,333);
			ctx.fillStyle="white";
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(240,372);
			ctx.quadraticCurveTo(254,357,272,363);
			ctx.bezierCurveTo(257,380,242,373,240,372);
			ctx.fillStyle="#930a2c";
			ctx.fill();
			break;
	}

	ctx.beginPath();
	//ctx.stroke();
}

function drawCheekDimples(mouthSize){
	switch(mouthSize){
		case "wide":
			ctx.beginPath();
			ctx.arc(175,340, 15, -.4, .7, false);
			ctx.strokeStyle="black";
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(325,340, 15, Math.PI - .7, Math.PI +.4, false);
			ctx.stroke();
			break;
		case "medium":
			ctx.beginPath();
			ctx.arc(185,340, 15, -.4, .7, false);
			ctx.strokeStyle="black";
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(315,340, 15, Math.PI - .7, Math.PI +.4, false);
			ctx.stroke();
			break;
		case "narrow":
			ctx.beginPath();
			ctx.arc(195,340, 15, -.4, .7, false);
			ctx.strokeStyle="black";
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(305,340, 15, Math.PI - .7, Math.PI +.4, false);
			ctx.stroke();
			break;
	}
}

function drawEars(faceColor,earShape,earLobes){
	switch(earShape+"|"+earLobes){
		case "long|free":
			//left ear
			ctx.beginPath();
			ctx.moveTo(103,235);
			ctx.bezierCurveTo(85,220,80,250,80,270);
			ctx.bezierCurveTo(80,290,90,325,109,300)
			ctx.fillStyle = faceColor;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(98,250);
			ctx.bezierCurveTo(90,240,90,265,90,270);
			ctx.bezierCurveTo(90,275,90,300,98,290);
			ctx.strokeStyle=shadeColor2(faceColor,-.25);
			ctx.stroke();
			//right ear
			ctx.beginPath();
			ctx.moveTo(397,235);
			ctx.bezierCurveTo(415,220,420,250,420,270);
			ctx.bezierCurveTo(420,290,410,325,391,300)
			ctx.fillStyle = faceColor;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(402,250);
			ctx.bezierCurveTo(410,240,410,265,410,270);
			ctx.bezierCurveTo(410,275,410,300,402,290);
			ctx.strokeStyle=shadeColor2(faceColor,-.25);
			ctx.stroke();
			break;
		case "long|attached":
			//left ear
			ctx.beginPath();
			ctx.moveTo(103,235);
			ctx.bezierCurveTo(85,220,80,250,80,270);
			ctx.bezierCurveTo(80,290,90,320,116,310)
			ctx.fillStyle = faceColor;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(98,250);
			ctx.bezierCurveTo(90,240,90,265,90,270);
			ctx.bezierCurveTo(90,275,90,300,102,300);
			ctx.strokeStyle=shadeColor2(faceColor,-.25);
			ctx.stroke();
			//right ear
			ctx.beginPath();
			ctx.moveTo(397,235);
			ctx.bezierCurveTo(415,220,420,250,420,270);
			ctx.bezierCurveTo(420,290,410,325,384,300)
			ctx.fillStyle = faceColor;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(402,250);
			ctx.bezierCurveTo(410,240,410,265,410,270);
			ctx.bezierCurveTo(410,275,410,300,398,300);
			ctx.strokeStyle=shadeColor2(faceColor,-.25);
			ctx.stroke();
			break;
		case "round|free":
			//left ear
			ctx.beginPath();
			ctx.moveTo(103,245);
			ctx.bezierCurveTo(85,230,80,240,80,260);
			ctx.bezierCurveTo(80,280,90,305,109,275)
			ctx.fillStyle = faceColor;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(98,260);
			ctx.bezierCurveTo(90,250,90,260,90,270);
			ctx.bezierCurveTo(90,265,90,280,98,270);
			ctx.strokeStyle=shadeColor2(faceColor,-.25);
			ctx.stroke();
			//right ear
			ctx.beginPath();
			ctx.moveTo(397,245);
			ctx.bezierCurveTo(415,230,420,240,420,260);
			ctx.bezierCurveTo(420,280,410,305,391,275)
			ctx.fillStyle = faceColor;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(402,260);
			ctx.bezierCurveTo(410,250,410,260,410,270);
			ctx.bezierCurveTo(410,265,410,280,402,270);
			ctx.strokeStyle=shadeColor2(faceColor,-.25);
			ctx.stroke();
			break;
		case "round|attached":
			//left ear
			ctx.beginPath();
			ctx.moveTo(103,245);
			ctx.bezierCurveTo(85,230,80,240,80,260);
			ctx.bezierCurveTo(80,280,90,300,109,285)
			ctx.fillStyle = faceColor;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(98,260);
			ctx.bezierCurveTo(90,250,90,260,90,270);
			ctx.bezierCurveTo(90,265,90,280,98,280);
			ctx.strokeStyle=shadeColor2(faceColor,-.25);
			ctx.stroke();
			//right ear
			ctx.beginPath();
			ctx.moveTo(397,245);
			ctx.bezierCurveTo(415,230,420,240,420,260);
			ctx.bezierCurveTo(420,280,410,300,391,285)
			ctx.fillStyle = faceColor;
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(402,260);
			ctx.bezierCurveTo(410,250,410,260,410,270);
			ctx.bezierCurveTo(410,265,410,280,402,280);
			ctx.strokeStyle=shadeColor2(faceColor,-.25);
			ctx.stroke();
			break;
	}
}

function drawBirthmark(birthmark,faceColor){
	ctx.beginPath();
	if(birthmark == "left"){
		ctx.arc(156,317,3,0,2*Math.PI);
	}
	else{
		ctx.arc(344,317,3,0,2*Math.PI);
	}
	ctx.fillStyle=shadeColor2(faceColor,-.7);
	ctx.fill();
}

function drawEyebrows(eyebrows, hairColor,eyeShape,eyeSize,eyebrowColor){
	switch(eyeShape+"|"+eyeSize){
		case "round|small":
			eyebrowY = 215;
			break;
		case "round|medium":
			eyebrowY = 210;
			break;
		case "round|large":
			eyebrowY = 205;
			break;
		case "wide|small":
			eyebrowY = 220;
			break;
		case "wide|medium":
			eyebrowY = 215;
			break;
		case "wide|large":
			eyebrowY = 210;
			break;
	}
	switch(eyebrowColor){
		case "lighter":
			ctx.strokeStyle = shadeColor2(hairColor,.4);
			break;
		case "same":
			ctx.strokeStyle = hairColor;
			break;
		case "darker":
			ctx.strokeStyle = shadeColor2(hairColor,-.6);
			break;
	}
	if(eyebrows == "bushy"){
		ctx.beginPath();
		ctx.moveTo(160,eyebrowY);
		for(i=1;i<72;i=i+4){
			ctx.quadraticCurveTo(160+i,Math.sqrt((eyebrowY-20)*(eyebrowY-20)+2*(41-i)*(41-i)),161+i,Math.sqrt((eyebrowY-10)*(eyebrowY-10)+2*(41-i)*(41-i))); //
			ctx.quadraticCurveTo(162+i,Math.sqrt(eyebrowY*eyebrowY+2*(41-i)*(41-i)),163+i,Math.sqrt((eyebrowY-10)*(eyebrowY-10)+2*(41-i)*(41-i)));
		}
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(340,eyebrowY);
		for(i=1;i<72;i=i+4){
			ctx.quadraticCurveTo(340-i,Math.sqrt((eyebrowY-20)*(eyebrowY-20)+2*(41-i)*(41-i)),339-i,Math.sqrt((eyebrowY-10)*(eyebrowY-10)+2*(41-i)*(41-i))); //
			ctx.quadraticCurveTo(338-i,Math.sqrt(eyebrowY*eyebrowY+2*(41-i)*(41-i)),337-i,Math.sqrt((eyebrowY-10)*(eyebrowY-10)+2*(41-i)*(41-i)));
		}
		ctx.stroke();
	}
	else{
		ctx.beginPath();
		ctx.moveTo(160,eyebrowY);
		for(i=1;i<72;i=i+4){
			ctx.quadraticCurveTo(160+i,Math.sqrt((eyebrowY-10)*(eyebrowY-10)+2*(41-i)*(41-i)),161+i,Math.sqrt((eyebrowY-5)*(eyebrowY-5)+2*(41-i)*(41-i))); //
			ctx.quadraticCurveTo(162+i,Math.sqrt(eyebrowY*eyebrowY+2*(41-i)*(41-i)),163+i,Math.sqrt((eyebrowY-5)*(eyebrowY-5)+2*(41-i)*(41-i)));
		}
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(340,eyebrowY);
		for(i=1;i<72;i=i+4){
			ctx.quadraticCurveTo(340-i,Math.sqrt((eyebrowY-10)*(eyebrowY-10)+2*(41-i)*(41-i)),339-i,Math.sqrt((eyebrowY-5)*(eyebrowY-5)+2*(41-i)*(41-i))); //
			ctx.quadraticCurveTo(338-i,Math.sqrt(eyebrowY*eyebrowY+2*(41-i)*(41-i)),337-i,Math.sqrt((eyebrowY-5)*(eyebrowY-5)+2*(41-i)*(41-i)));
		}
		ctx.stroke();
	}
}

function drawNose(noseSize){
	ctx.beginPath();
	switch(noseSize){
		case "large":
			ctx.moveTo(258,303);
			ctx.bezierCurveTo(230,315,235,280,245,275);
			break;
		case "medium":
			ctx.moveTo(255,300);
			ctx.bezierCurveTo(230,310,235,280,245,280);
			break;
		case "small":
			ctx.moveTo(250,295);
			ctx.bezierCurveTo(230,300,235,280,245,284);
			break;
	}
	ctx.strokeStyle="black";
	ctx.stroke();
}

function drawHair(hairColor){
	ctx.beginPath();
	ctx.moveTo(250,110);
	ctx.bezierCurveTo(235,80,250,50,260,50);
	ctx.moveTo(250,110);
	ctx.bezierCurveTo(250,90,260,50,300,40);
	ctx.moveTo(250,110);
	ctx.bezierCurveTo(255,90,270,85,280,85);
	ctx.strokeStyle = hairColor;
	ctx.stroke();
}

function drawEyelashes(eyelashLength,eyeShape,eyeSize,hairColor){
	switch(eyeSize){
		case "small":
			eyeRadius = 18; //intentionally smaller than 20
			break;
		case "medium":
			eyeRadius = 25;
			break;
		case "large":
			eyeRadius = 32; //intentionally larger than 30
			break;
	}

	if(eyelashLength=="long"){eyelashRadius=eyeRadius + 10;}
	else{eyelashRadius=eyeRadius + 5;}

	ctx.beginPath();
	ctx.moveTo(200,250);
	for (i=-2.8;i<-.9;i=i+.2){
		if(eyeShape=="round"){ctx.lineTo(200 + eyelashRadius*Math.cos(i), 250 + eyelashRadius*Math.sin(i));}
		else{ctx.lineTo(200 + eyelashRadius*Math.cos(i), 250 + eyelashRadius*.6*Math.sin(i));};
		ctx.moveTo(200,250);
	}
	ctx.moveTo(300,250);
	for (i=-2.2;i<-.4;i=i+.2){
		if(eyeShape=="round"){ctx.lineTo(300 + eyelashRadius*Math.cos(i), 250 + eyelashRadius*Math.sin(i));}
		else{ctx.lineTo(300 + eyelashRadius*Math.cos(i), 250 + eyelashRadius*.6*Math.sin(i));};
		ctx.moveTo(300,250);
	}
	ctx.strokeStyle = hairColor;
	ctx.stroke();
}

//modified from https://jsfiddle.net/api/mdn/
function roundedRect(x,y,width,height,radius){
  ctx.beginPath();
  ctx.moveTo(x,y+radius);
  ctx.lineTo(x,y+height-radius);
  ctx.arcTo(x,y+height,x+radius,y+height,radius);
  ctx.lineTo(x+width-radius,y+height);
  ctx.arcTo(x+width,y+height,x+width,y+height-radius,radius);
  ctx.lineTo(x+width,y+radius);
  ctx.arcTo(x+width,y,x+width-radius,y,radius);
  ctx.lineTo(x+radius,y);
  ctx.arcTo(x,y,x,y+radius,radius);
}

//from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

//document.getElementById('drawFaceButton').onclick=function() {drawFace()};
//document.getElementById('toggleInputPhenotype').onclick=function() {$("#inputPhenotype").toggle()};
//<button id="toggleInputPhenotype">Toggle input phenotype</button> from HTML
//document.getElementById('moveEyesButton').onclick=function() {moveEyes()};
//http://www.victoriakirst.com/beziertool/


//INTRO
document.getElementById('showSkinTone').onclick=function() {
	playerName = document.getElementById("playerNameIn").value;
	if(playerName == ""){alert("Make sure you enter your name!");}
	else{
		$("#start").hide();
		$("#traitSkinTone").show();
		$("#babyScreen").hide();
		$("#genome").hide();
		ctx.clearRect(0, 0, c.width, c.height);
	}
}

document.getElementById('showFaceShape').onclick=function() {
	try{
		gen0.faceColor = document.querySelector('input[name="faceColor"]:checked').value;
		$("#traitSkinTone").hide();
		$("#traitFaceShape").show();
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
}

document.getElementById('showEyes').onclick=function() {
	try{
		gen0.faceShape = document.querySelector('input[name="faceShape"]:checked').value;
		drawHead(gen0.faceShape,gen0.faceColor);
		$("#traitFaceShape").hide();
		$("#traitEyes").show();
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
}

document.getElementById('showEars').onclick=function() {
	try{
		gen0.eyeShape = document.querySelector('input[name="eyeShape"]:checked').value;
		gen0.eyeColor = document.querySelector('input[name="eyeColor"]:checked').value;
		gen0.eyeSize = document.querySelector('input[name="eyeSize"]:checked').value;
		drawEyes(gen0.eyeShape,gen0.eyeColor,gen0.eyeSize,200,250);
		$("#traitEyes").hide();
		$("#traitEars").show();
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
}

document.getElementById('showMouth').onclick=function() {
	try{
		gen0.earShape = document.querySelector('input[name="earShape"]:checked').value;
		gen0.earLobes = document.querySelector('input[name="earLobes"]:checked').value;
		drawEars(gen0.faceColor,gen0.earShape,gen0.earLobes);
		$("#traitEars").hide();
		$("#traitMouth").show();
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
}

document.getElementById('showNose').onclick=function() {
	try{
		gen0.mouthSize = document.querySelector('input[name="mouthSize"]:checked').value;
		gen0.cheekDimples = document.querySelector('input[name="cheekDimples"]:checked').value;
		drawMouth(gen0.mouthSize);
		if(gen0.cheekDimples == "true"){drawCheekDimples(gen0.mouthSize);}
		$("#traitMouth").hide();
		$("#traitNose").show();
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
}

document.getElementById('showChin').onclick=function() {
	try{
		gen0.noseSize = document.querySelector('input[name="noseSize"]:checked').value;
		drawNose(gen0.noseSize);
		$("#traitNose").hide();
		$("#traitChin").show();
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
}

document.getElementById('showCheeks').onclick=function() {
	try{
		gen0.chinShape = document.querySelector('input[name="chinShape"]:checked').value;
		gen0.chinDimple = document.querySelector('input[name="chinDimple"]:checked').value;
		drawChin(gen0.faceColor,gen0.chinDimple,gen0.chinShape);
		drawMouth(gen0.mouthSize); //to fix chin overlap
		$("#traitChin").hide();
		$("#traitCheeks").show();
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
}

document.getElementById('showHair').onclick=function() {
	try{
		gen0.freckles = document.querySelector('input[name="freckles"]:checked').value;
		gen0.birthmark = document.querySelector('input[name="birthmark"]:checked').value;
		if(gen0.freckles == "true"){
			drawFreckles(gen0.faceColor,gen0frecklesX,gen0frecklesY);
			drawMouth(gen0.mouthSize); //to fix freckles overlap
			drawEyes(gen0.eyeShape,gen0.eyeColor,gen0.eyeSize,200,250); //to fix freckles overlap
			drawNose(gen0.noseSize); //to fix freckles overlap
		}
		if(gen0.birthmark != "none"){drawBirthmark(gen0.birthmark,gen0.faceColor);}
		$("#traitCheeks").hide();
		$("#traitHair").show();
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
	}

document.getElementById('finishIntroBtn').onclick=function() {
	try{
		gen0.hairColor = document.querySelector('input[name="hairColor"]:checked').value;
		gen0.eyebrows = document.querySelector('input[name="eyebrows"]:checked').value;
		gen0.eyebrowColor = document.querySelector('input[name="eyebrowColor"]:checked').value;
		gen0.eyelashLength = document.querySelector('input[name="eyelashLength"]:checked').value;
		drawEyelashes(gen0.eyelashLength,gen0.eyeShape,gen0.eyeSize,gen0.hairColor);
		drawEyebrows(gen0.eyebrows,gen0.hairColor,gen0.eyeShape,gen0.eyeSize,gen0.eyebrowColor);
		drawEyes(gen0.eyeShape,gen0.eyeColor,gen0.eyeSize,200,250); //to fix eyelash overlap
		drawHair(gen0.hairColor);
		$("#traitHair").hide();
		$("#finishIntro").show();
		$("#randomBabyToCross").show();
		$("#generateBabyToCross").show();
		gen0G = babyToGenome(gen0);
		finishIntro.innerHTML += gen0G.genome + ". <br> <br>";
	}
	catch(err){
		alert("Make sure you selected an option for each question!");
	}
}

document.getElementById('createRandomGen0').onclick=function(){
	playerName = document.getElementById("playerNameIn").value;
	if(playerName == ""){alert("Make sure you enter your name!");}
	else{
		gen0 = generateRandomBaby();
		drawBaby(gen0,gen0frecklesX,gen0frecklesY);
		$("#start").hide();
		$("#finishIntro").show();
		$("#generateBabyToCross").show();
		$("#randomBabyToCross").show();
		gen0G = babyToGenome(gen0);
		finishIntro.innerHTML += gen0G.genome + ". <br> <br>";
	}
}

document.getElementById('generateRandomBaby').onclick=function(){
	document.getElementById("beginCrossing").disabled = false;
	crossBaby = generateRandomBaby();
	crossBabyG = babyToGenome(crossBaby);
	gen0Image = saveCanvas();
	drawBaby(crossBaby);
	crossBabyImage = saveCanvas();
	drawBaby(gen0,gen0frecklesX,gen0frecklesY);
	randomBabyToCross.innerHTML = "<img width='300' height='300' alt='baby' src=" + crossBabyImage + ">" + "<br> This baby's genome is: " + crossBabyG.genome;
}

document.getElementById('beginCrossing').onclick=function(){
	$("#finishIntro").hide();
	$("#generateBabyToCross").hide();
	$("#randomBabyToCross").hide();
	$("#crossingIntro").show();
	$("#crossingIntroImgs").show();
	$("#crossingIntro2").show();
	ctx.clearRect(0, 0, c.width, c.height);
	document.onmousemove = "";
	ectx.clearRect(0, 0, c.width, c.height);
	crossingIntroImgs.innerHTML = "<img width='200' height='200' alt='you' src=" + gen0Image + "><img width='200' height='200' alt='you' src=" + crossBabyImage + ">"
	nextBaby = gen0;
	nextBabyG = gen0G;
	nextBabyGenome = gen0G.genome;
	nextBabyImage = gen0Image;
}


document.getElementById('beginCrossingTraits').onclick=function(){
	$("#crossingIntro").hide();
	$("#crossingIntroImgs").hide();
	$("#crossingIntro2").hide();
	$("#crossingTraits").show();
	$("#crossResult").show();
	newBaby = {};
	newBabyG = {};

	baby1img.innerHTML = "<img width='200' height='200' alt='you' src=" + nextBabyImage + ">";
	baby2img.innerHTML = "<img width='200' height='200' alt='you' src=" + crossBabyImage + ">";
	baby1imgP.innerHTML = "<img width='200' height='200' alt='you' src=" + nextBabyImage + ">";
	baby2imgP.innerHTML = "<img width='200' height='200' alt='you' src=" + crossBabyImage + ">";

	nextQ(0);

}

function nextQ(ti){
	if(ti>39){ //if we're done with all traits
		if(gen == 3){afterAllCrossings(nextBaby,nextBabyG,crossBaby,crossBabyG,newBaby,newBabyG);}
		else{afterCrossing(nextBaby,nextBabyG,crossBaby,crossBabyG,newBaby,newBabyG);}
	}
	else{
		var qType = Math.ceil(Math.random()*2); // 1 or 2
		//var qType = 2; //force a question type for testing
		switch (qType){
			case 1: fillInSquare(nextBaby,nextBabyG,crossBaby,crossBabyG,nextBabyGenome,crossBabyG.genome,newBabyG,ti); break;
			//case 2: fillInSquare(nextBaby,nextBabyG,crossBaby,crossBabyG,nextBabyGenome,crossBabyG.genome,newBabyG,ti); break;
			case 2: probTest(nextBaby,nextBabyG,crossBaby,crossBabyG,nextBabyGenome,crossBabyG.genome,newBabyG,ti); break;
		}
	}
}

function probTest(baby1,baby1G,baby2,baby2G,g1,g2,newBabyG,ti){
	$("#fillInSquareDiv").hide();
	$("#probTestDiv").show();

	if(ti == 8 || ti == 30){
		traitT1 = sortGenotype(g2[ti]+g2[ti+2]+g1[ti]+g1[ti+2]);
		traitT2 = sortGenotype(g2[ti]+g2[ti+2]+g1[ti]+g1[ti+3]);
		traitT3 = sortGenotype(g2[ti]+g2[ti+2]+g1[ti+1]+g1[ti+2]);
		traitT4 = sortGenotype(g2[ti]+g2[ti+2]+g1[ti+1]+g1[ti+3]);
		traitT5 = sortGenotype(g2[ti]+g2[ti+3]+g1[ti]+g1[ti+2]);
		traitT6 = sortGenotype(g2[ti]+g2[ti+3]+g1[ti]+g1[ti+3]);
		traitT7 = sortGenotype(g2[ti]+g2[ti+3]+g1[ti+1]+g1[ti+2]);
		traitT8 = sortGenotype(g2[ti]+g2[ti+3]+g1[ti+1]+g1[ti+3]);
		traitT9 = sortGenotype(g2[ti+1]+g2[ti+2]+g1[ti]+g1[ti+2]);
		traitT10 = sortGenotype(g2[ti+1]+g2[ti+2]+g1[ti]+g1[ti+3]);
		traitT11 = sortGenotype(g2[ti+1]+g2[ti+2]+g1[ti+1]+g1[ti+2]);
		traitT12 = sortGenotype(g2[ti+1]+g2[ti+2]+g1[ti+1]+g1[ti+3]);
		traitT13 = sortGenotype(g2[ti+1]+g2[ti+3]+g1[ti]+g1[ti+2]);
		traitT14 = sortGenotype(g2[ti+1]+g2[ti+3]+g1[ti]+g1[ti+3]);
		traitT15 = sortGenotype(g2[ti+1]+g2[ti+3]+g1[ti+1]+g1[ti+2]);
		traitT16 = sortGenotype(g2[ti+1]+g2[ti+3]+g1[ti+1]+g1[ti+3]);

		traitInfoP.innerHTML = "Current trait: <br><b>" + traitInfoArray[ti/2] + "</b>";
		psquareP.innerHTML = "<table border='0' style='font-size:32px'><tr align='center'><td></td><td>" + g1[ti] + g1[ti+2] + "</td><td>" + g1[ti] + g1[ti+3] + "</td><td>" + g1[ti+1] + g1[ti+2] + "</td><td>" + g1[ti+1] + g1[ti+3] + "</td></tr><tr><td>" + g2[ti] + g2[ti+2] + "</td><td><input type='text' id='T1' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT1 +"'  disabled></td><td><input type='text' id='T2' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT2 +"'  disabled></td><td><input type='text' id='T3' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT3 +"'  disabled></td><td><input type='text' id='T4' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT4 +"'  disabled></td></tr><tr><td>" + g2[ti] + g2[ti+3] + "</td><td><input type='text' id='T5' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT5 +"'  disabled></td><td><input type='text' id='T6' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT6 +"'  disabled></td><td><input type='text' id='T7' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT7 +"'  disabled></td><td><input type='text' id='T8' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT8 +"'  disabled></td></tr><tr><td>" + g2[ti+1] + g2[ti+2] + "</td><td><input type='text' id='T9' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT9 +"'  disabled></td><td><input type='text' id='T10' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT10 +"'  disabled></td><td><input type='text' id='T11' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT11 +"'  disabled></td><td><input type='text' id='T12' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT12 +"'  disabled></td></tr><tr><td>" + g2[ti+1] + g2[ti+3] + "</td><td><input type='text' id='T13' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT13 +"'  disabled></td><td><input type='text' id='T14' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT14 +"'  disabled></td><td><input type='text' id='T15' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT15 +"'  disabled></td><td><input type='text' id='T16' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;' value='" + traitT16 +"'  disabled></td></tr></table><br><br>";

		traitArray = [traitT1,traitT2,traitT3,traitT4,traitT5,traitT6,traitT7,traitT8,traitT9,traitT10,traitT11,traitT12,traitT13,traitT14,traitT15,traitT16];
		newTrait = randomTrait(traitArray);

		genotype = randomTrait(traitArray);
		phenotype = eval("traitLookup." + genotype);
		phenoProbYes = 0;

		for(var i = 0; i < traitArray.length; ++i){
			if(eval("traitLookup." + traitArray[i]) == phenotype){
				phenoProbYes += 1;
			}
		}

		var phenoProbNums = []
		while(phenoProbNums.length < 4){
		//from http://stackoverflow.com/questions/2380019/generate-unique-random-numbers-between-1-and-100
			var randomnumber = Math.ceil(Math.random()*16)
			if(phenoProbNums.indexOf(randomnumber) > -1) continue;
			phenoProbNums[phenoProbNums.length] = randomnumber;
		}
		if(phenoProbNums.indexOf(phenoProbYes) < 0){phenoProbNums[Math.floor(Math.random()*4)] = phenoProbYes;} //make sure the right answer is in there, in a random spot


		probTestQDiv.innerHTML = "What is the probability of this baby having " + phenotype + "? <br><input type='radio' name='phenoProb' value='" + phenoProbNums[0] +"'>"+String(phenoProbNums[0])+"/16   <input type='radio' name='phenoProb' value='" + phenoProbNums[1] +"'>"+String(phenoProbNums[1])+"/16   <input type='radio' name='phenoProb' value='" + phenoProbNums[2] +"'>"+String(phenoProbNums[2])+"/16   <input type='radio' name='phenoProb' value='" + phenoProbNums[3] +"'>"+String(phenoProbNums[3])+"/16   <button id='nextTraitP'>Submit</button><br><br>"

		document.getElementById('nextTraitP').onclick=function(){
			phenoProbGuess = document.querySelector('input[name="phenoProb"]:checked').value;

			scoreThisTrait = 0;
			if(phenoProbGuess == phenoProbYes){scoreThisTrait += 16;}

			score += scoreThisTrait;
			scoreDiv.innerHTML = "Your score is " + String(score) + ". <a href='javascript:submitScoreNow();'>Quit and submit your score now.</a>";

			if(scoreThisTrait == 16){
				drawThisTrait[ti] = true;
				crossResult.style.color = "green";
				crossResult.innerHTML = "You got the probability correct! The new trait for " + traitInfoArray[ti/2] + " is " + newTrait + ".";
			}
			else{
				drawThisTrait[ti] = false;
				crossResult.style.color = "red";
				crossResult.innerHTML = "You didn't get the probability correct. Your baby will be missing " + traitMissing[ti/2] + ".";
			}

			switch(ti){
				case 8: newBabyG.eyeColorG = newTrait; if(drawThisTrait[4] && drawThisTrait[6] && drawThisTrait[8]){newBaby=genomeToBaby(newBabyG);drawEyes(newBaby.eyeShape,newBaby.eyeColor,newBaby.eyeSize,200,250);} break;
				case 30: newBabyG.hairColorG = newTrait; if(drawThisTrait[30]){newBaby=genomeToBaby(newBabyG);drawHair(newBaby.hairColor);} break;
			}

			ti += 4;
			nextQ(ti);
		}

	}

	else{
		traitTL = sortGenotype(g1[ti]+g2[ti]);
		traitTR = sortGenotype(g1[ti+1]+g2[ti]);
		traitBL = sortGenotype(g1[ti]+g2[ti+1]);
		traitBR = sortGenotype(g1[ti+1]+g2[ti+1]);

		traitInfoP.innerHTML = "Current trait: <br><b>" + traitInfoArray[ti/2] + "</b>";
		psquareP.innerHTML = "<table border='0' style='font-size:32px'><tr align='center'><td></td><td>" + g1[ti] + "</td><td>" + g1[ti+1] + "</td></tr><tr><td>" + g2[ti] + "</td><td><input type='text' id='TL' maxlength='2' style='height:60px; width: 60px; text-align: center; font-size: 32px;' value='" + traitTL +"'  disabled></td><td><input type='text' id='TR' maxlength='2' style='height:60px; width: 60px; text-align: center; font-size: 32px;' value='" + traitTR +"'  disabled></td></tr><tr><td>" + g2[ti+1] + "</td><td><input type='text' id='BL' maxlength='2' style='height:60px; width: 60px; text-align: center; font-size: 32px;' value='" + traitBL +"'  disabled></td><td><input type='text' id='BR' maxlength='2' style='height:60px; width: 60px; text-align: center; font-size: 32px;' value='" + traitBR +"'  disabled></td></tr></table><br><br>";

		traitArray = [traitTL,traitTR,traitBL,traitBR];
		newTrait = randomTrait(traitArray);

		genotype = randomTrait(traitArray);
		phenotype = eval("traitLookup." + genotype);
		phenoProbYes = 0;

		for(var i = 0; i < traitArray.length; ++i){
			if(eval("traitLookup." + traitArray[i]) == phenotype){
				phenoProbYes += 1;
			}
		}

		probTestQDiv.innerHTML = "What is the probability of this baby having " + phenotype + "? <br><input type='radio' name='phenoProb' value='1'>25%   <input type='radio' name='phenoProb' value='2'>50%   <input type='radio' name='phenoProb' value='3'>75%   <input type='radio' name='phenoProb' value='4'>100%   <button id='nextTraitP'>Submit</button><br><br>"

		document.getElementById('nextTraitP').onclick=function(){
			phenoProbGuess = document.querySelector('input[name="phenoProb"]:checked').value;

			scoreThisTrait = 0;
			if(phenoProbGuess == phenoProbYes){scoreThisTrait += 4;}

			score += scoreThisTrait;
			scoreDiv.innerHTML = "Your score is " + String(score) + ". <a href='javascript:submitScoreNow();'>Quit and submit your score now.</a>";

			if(scoreThisTrait == 4){
				drawThisTrait[ti] = true;
				crossResult.style.color = "green";
				crossResult.innerHTML = "You got the probability correct! The new trait for " + traitInfoArray[ti/2] + " is " + newTrait + ".";
			}
			else{
				drawThisTrait[ti] = false;
				crossResult.style.color = "red";
				crossResult.innerHTML = "You didn't get the probability correct. Your baby will be missing " + traitMissing[ti/2] + ".";
			}

			switch (ti){
				case 0: newBabyG.faceColorG = newTrait; break;
				case 2: newBabyG.faceShapeG = newTrait; if(drawThisTrait[0] && drawThisTrait[2]){newBaby=genomeToBaby(newBabyG);drawHead(newBaby.faceShape,newBaby.faceColor);} break;
				case 4: newBabyG.eyeShapeG = newTrait; break;
				case 6: newBabyG.eyeSizeG = newTrait; break;
				case 12: newBabyG.earShapeG = newTrait; break;
				case 14: newBabyG.earLobesG = newTrait; if(drawThisTrait[12] && drawThisTrait[14]){newBaby=genomeToBaby(newBabyG);drawEars(newBaby.faceColor, newBaby.earShape,newBaby.earLobes);} break;
				case 16: newBabyG.mouthSizeG = newTrait; if(drawThisTrait[16]){newBaby=genomeToBaby(newBabyG);drawMouth(newBaby.mouthSize);} break;
				case 18: newBabyG.cheekDimplesG = newTrait; if(drawThisTrait[18]){newBaby=genomeToBaby(newBabyG);if(newBaby.cheekDimples == "true"){drawCheekDimples(newBaby.mouthSize);}} break;
				case 20: newBabyG.noseSizeG = newTrait; if(drawThisTrait[20]){newBaby=genomeToBaby(newBabyG);drawNose(newBaby.noseSize);} break;
				case 22: newBabyG.chinShapeG = newTrait; if(drawThisTrait[22]){newBaby=genomeToBaby(newBabyG);drawChin(newBaby.faceColor,false,newBaby.chinShape);} if(drawThisTrait[16]){drawMouth(newBaby.mouthSize);} break;
				case 24: newBabyG.chinDimpleG = newTrait; if(drawThisTrait[24]){newBaby=genomeToBaby(newBabyG);drawChin(newBaby.faceColor,newBaby.chinDimple,newBaby.chinShape);} if(drawThisTrait[16]){drawMouth(newBaby.mouthSize);} break;
				case 26: newBabyG.frecklesG = newTrait; if(drawThisTrait[26]){newBaby=genomeToBaby(newBabyG);if(newBaby.freckles == "true"){drawFreckles(newBaby.faceColor);if(drawThisTrait[16]){drawMouth(newBaby.mouthSize);}if(drawThisTrait[4] && drawThisTrait[6] && drawThisTrait[8]){drawEyes(newBaby.eyeShape,newBaby.eyeColor,newBaby.eyeSize,200,250);}if(drawThisTrait[20]){drawNose(newBaby.noseSize);}}} break;
				case 28: newBabyG.birthmarkG = newTrait; if(drawThisTrait[28]){newBaby=genomeToBaby(newBabyG);if(newBaby.birthmark != "none"){drawBirthmark(newBaby.birthmark,newBaby.faceColor);}} break;
				case 34: newBabyG.eyebrowsG = newTrait; break;
				case 36: newBabyG.eyebrowColorG = newTrait; if(drawThisTrait[34] && drawThisTrait[36]){newBaby=genomeToBaby(newBabyG);drawEyebrows(newBaby.eyebrows,newBaby.hairColor,newBaby.eyeShape,newBaby.eyeSize,newBaby.eyebrowColor);} break;
				case 38: newBabyG.eyelashLengthG = newTrait; if(drawThisTrait[38]){newBaby=genomeToBaby(newBabyG);drawEyelashes(newBaby.eyelashLength,newBaby.eyeShape,newBaby.eyeSize,newBaby.hairColor);if(drawThisTrait[4] && drawThisTrait[6] && drawThisTrait[8]){drawEyes(newBaby.eyeShape,newBaby.eyeColor,newBaby.eyeSize,200,250);}} break;
			}

			ti += 2;
			nextQ(ti);
		}
	}
}

function fillInSquare(baby1,baby1G,baby2,baby2G,g1,g2,newBabyG,ti){
	$("#fillInSquareDiv").show();
	$("#probTestDiv").hide();
	if(ti == 8 || ti == 30){
		traitInfo.innerHTML = "Current trait: <br><b>" + traitInfoArray[ti/2] + "</b>";
		psquare.innerHTML = "<table border='0' style='font-size:32px'><tr align='center'><td></td><td>" + g1[ti] + g1[ti+2] + "</td><td>" + g1[ti] + g1[ti+3] + "</td><td>" + g1[ti+1] + g1[ti+2] + "</td><td>" + g1[ti+1] + g1[ti+3] + "</td></tr><tr><td>" + g2[ti] + g2[ti+2] + "</td><td><input type='text' id='T1' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T2' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T3' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T4' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td></tr><tr><td>" + g2[ti] + g2[ti+3] + "</td><td><input type='text' id='T5' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T6' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T7' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T8' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td></tr><tr><td>" + g2[ti+1] + g2[ti+2] + "</td><td><input type='text' id='T9' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T10' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T11' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T12' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td></tr><tr><td>" + g2[ti+1] + g2[ti+3] + "</td><td><input type='text' id='T13' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T14' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T15' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td><td><input type='text' id='T16' maxlength='4' style='height:60px; width: 120px; text-align: center; font-size: 32px;'></td></tr></table><br><br>";

		document.getElementById('nextTrait').onclick=function(){
			traitT1in = sortGenotype(document.getElementById("T1").value);
			traitT2in = sortGenotype(document.getElementById("T2").value);
			traitT3in = sortGenotype(document.getElementById("T3").value);
			traitT4in = sortGenotype(document.getElementById("T4").value);
			traitT5in = sortGenotype(document.getElementById("T5").value);
			traitT6in = sortGenotype(document.getElementById("T6").value);
			traitT7in = sortGenotype(document.getElementById("T7").value);
			traitT8in = sortGenotype(document.getElementById("T8").value);
			traitT9in = sortGenotype(document.getElementById("T9").value);
			traitT10in = sortGenotype(document.getElementById("T10").value);
			traitT11in = sortGenotype(document.getElementById("T11").value);
			traitT12in = sortGenotype(document.getElementById("T12").value);
			traitT13in = sortGenotype(document.getElementById("T13").value);
			traitT14in = sortGenotype(document.getElementById("T14").value);
			traitT15in = sortGenotype(document.getElementById("T15").value);
			traitT16in = sortGenotype(document.getElementById("T16").value);
			traitT1 = sortGenotype(g2[ti]+g2[ti+2]+g1[ti]+g1[ti+2]);
			traitT2 = sortGenotype(g2[ti]+g2[ti+2]+g1[ti]+g1[ti+3]);
			traitT3 = sortGenotype(g2[ti]+g2[ti+2]+g1[ti+1]+g1[ti+2]);
			traitT4 = sortGenotype(g2[ti]+g2[ti+2]+g1[ti+1]+g1[ti+3]);
			traitT5 = sortGenotype(g2[ti]+g2[ti+3]+g1[ti]+g1[ti+2]);
			traitT6 = sortGenotype(g2[ti]+g2[ti+3]+g1[ti]+g1[ti+3]);
			traitT7 = sortGenotype(g2[ti]+g2[ti+3]+g1[ti+1]+g1[ti+2]);
			traitT8 = sortGenotype(g2[ti]+g2[ti+3]+g1[ti+1]+g1[ti+3]);
			traitT9 = sortGenotype(g2[ti+1]+g2[ti+2]+g1[ti]+g1[ti+2]);
			traitT10 = sortGenotype(g2[ti+1]+g2[ti+2]+g1[ti]+g1[ti+3]);
			traitT11 = sortGenotype(g2[ti+1]+g2[ti+2]+g1[ti+1]+g1[ti+2]);
			traitT12 = sortGenotype(g2[ti+1]+g2[ti+2]+g1[ti+1]+g1[ti+3]);
			traitT13 = sortGenotype(g2[ti+1]+g2[ti+3]+g1[ti]+g1[ti+2]);
			traitT14 = sortGenotype(g2[ti+1]+g2[ti+3]+g1[ti]+g1[ti+3]);
			traitT15 = sortGenotype(g2[ti+1]+g2[ti+3]+g1[ti+1]+g1[ti+2]);
			traitT16 = sortGenotype(g2[ti+1]+g2[ti+3]+g1[ti+1]+g1[ti+3]);

			newTrait = randomTrait([traitT1,traitT2,traitT3,traitT4,traitT5,traitT6,traitT7,traitT8,traitT9,traitT10,traitT11,traitT12,traitT13,traitT14,traitT15,traitT16]);
			scoreThisTrait = 0;

			if(traitT1 == traitT1in){scoreThisTrait +=1;}
			if(traitT2 == traitT2in){scoreThisTrait +=1;}
			if(traitT3 == traitT3in){scoreThisTrait +=1;}
			if(traitT4 == traitT4in){scoreThisTrait +=1;}
			if(traitT5 == traitT5in){scoreThisTrait +=1;}
			if(traitT6 == traitT6in){scoreThisTrait +=1;}
			if(traitT7 == traitT7in){scoreThisTrait +=1;}
			if(traitT8 == traitT8in){scoreThisTrait +=1;}
			if(traitT9 == traitT9in){scoreThisTrait +=1;}
			if(traitT10 == traitT10in){scoreThisTrait +=1;}
			if(traitT11 == traitT11in){scoreThisTrait +=1;}
			if(traitT12 == traitT12in){scoreThisTrait +=1;}
			if(traitT13 == traitT13in){scoreThisTrait +=1;}
			if(traitT14 == traitT14in){scoreThisTrait +=1;}
			if(traitT15 == traitT15in){scoreThisTrait +=1;}
			if(traitT16 == traitT16in){scoreThisTrait +=1;}

			score += scoreThisTrait;
			scoreDiv.innerHTML = "Your score is " + String(score) + ". <a href='javascript:submitScoreNow();'>Quit and submit your score now.</a>";

			if(scoreThisTrait == 16){
				drawThisTrait[ti] = true;
				crossResult.style.color = "green";
				crossResult.innerHTML = "You got the last square completely correct! The new trait for " + traitInfoArray[ti/2] + " is " + newTrait + ".";
			}
			else{
				drawThisTrait[ti] = false;
				crossResult.style.color = "red";
				crossResult.innerHTML = "You didn't get the last square completely correct - you missed " + String(16-scoreThisTrait) + ". Your baby will be missing " + traitMissing[ti/2] + ".";
			}

			switch(ti){
				case 8: newBabyG.eyeColorG = newTrait; if(drawThisTrait[4] && drawThisTrait[6] && drawThisTrait[8]){newBaby=genomeToBaby(newBabyG);drawEyes(newBaby.eyeShape,newBaby.eyeColor,newBaby.eyeSize,200,250);} break;
				case 30: newBabyG.hairColorG = newTrait; if(drawThisTrait[30]){newBaby=genomeToBaby(newBabyG);drawHair(newBaby.hairColor);} break;
			}

			ti += 4;
			nextQ(ti);
		}
	}
	else{
		traitInfo.innerHTML = "Current trait: <br><b>" + traitInfoArray[ti/2] + "</b>";
		psquare.innerHTML = "<table border='0' style='font-size:32px'><tr align='center'><td></td><td>" + g1[ti] + "</td><td>" + g1[ti+1] + "</td></tr><tr><td>" + g2[ti] + "</td><td><input type='text' id='TL' maxlength='2' style='height:60px; width: 60px; text-align: center; font-size: 32px;'></td><td><input type='text' id='TR' maxlength='2' style='height:60px; width: 60px; text-align: center; font-size: 32px;'></td></tr><tr><td>" + g2[ti+1] + "</td><td><input type='text' id='BL' maxlength='2' style='height:60px; width: 60px; text-align: center; font-size: 32px;'></td><td><input type='text' id='BR' maxlength='2' style='height:60px; width: 60px; text-align: center; font-size: 32px;'></td></tr></table><br><br>";

		document.getElementById('nextTrait').onclick=function(){
			traitTLin = sortGenotype(document.getElementById("TL").value);
			traitTRin = sortGenotype(document.getElementById("TR").value);
			traitBLin = sortGenotype(document.getElementById("BL").value);
			traitBRin = sortGenotype(document.getElementById("BR").value);
			traitTL = sortGenotype(g1[ti]+g2[ti]);
			traitTR = sortGenotype(g1[ti+1]+g2[ti]);
			traitBL = sortGenotype(g1[ti]+g2[ti+1]);
			traitBR = sortGenotype(g1[ti+1]+g2[ti+1]);

			newTrait = randomTrait([traitTL,traitTR,traitBL,traitBR]);

			scoreThisTrait = 0;
			if(traitTL == traitTLin){scoreThisTrait += 1;}
			if(traitTR == traitTRin){scoreThisTrait += 1;}
			if(traitBL == traitBLin){scoreThisTrait += 1;}
			if(traitBR == traitBRin){scoreThisTrait += 1;}

			score += scoreThisTrait;
			scoreDiv.innerHTML = "Your score is " + String(score) + ". <a href='javascript:submitScoreNow();'>Quit and submit your score now.</a>";

			if(scoreThisTrait == 4){
				drawThisTrait[ti] = true;
				crossResult.style.color = "green";
				crossResult.innerHTML = "You got the last square completely correct! The new trait for " + traitInfoArray[ti/2] + " is " + newTrait + ".";
			}
			else{
				drawThisTrait[ti] = false;
				crossResult.style.color = "red";
				crossResult.innerHTML = "You didn't get the last square completely correct - you missed " + String(4-scoreThisTrait) + ". Your baby will be missing " + traitMissing[ti/2] + ".";
			}

			switch (ti){
				case 0: newBabyG.faceColorG = newTrait; break;
				case 2: newBabyG.faceShapeG = newTrait; if(drawThisTrait[0] && drawThisTrait[2]){newBaby=genomeToBaby(newBabyG);drawHead(newBaby.faceShape,newBaby.faceColor);} break;
				case 4: newBabyG.eyeShapeG = newTrait; break;
				case 6: newBabyG.eyeSizeG = newTrait; break;
				case 12: newBabyG.earShapeG = newTrait; break;
				case 14: newBabyG.earLobesG = newTrait; if(drawThisTrait[12] && drawThisTrait[14]){newBaby=genomeToBaby(newBabyG);drawEars(newBaby.faceColor, newBaby.earShape,newBaby.earLobes);} break;
				case 16: newBabyG.mouthSizeG = newTrait; if(drawThisTrait[16]){newBaby=genomeToBaby(newBabyG);drawMouth(newBaby.mouthSize);} break;
				case 18: newBabyG.cheekDimplesG = newTrait; if(drawThisTrait[18]){newBaby=genomeToBaby(newBabyG);if(newBaby.cheekDimples == "true"){drawCheekDimples(newBaby.mouthSize);}} break;
				case 20: newBabyG.noseSizeG = newTrait; if(drawThisTrait[20]){newBaby=genomeToBaby(newBabyG);drawNose(newBaby.noseSize);} break;
				case 22: newBabyG.chinShapeG = newTrait; if(drawThisTrait[22]){newBaby=genomeToBaby(newBabyG);drawChin(newBaby.faceColor,false,newBaby.chinShape);} if(drawThisTrait[16]){drawMouth(newBaby.mouthSize);} break;
				case 24: newBabyG.chinDimpleG = newTrait; if(drawThisTrait[24]){newBaby=genomeToBaby(newBabyG);drawChin(newBaby.faceColor,newBaby.chinDimple,newBaby.chinShape);} if(drawThisTrait[16]){drawMouth(newBaby.mouthSize);} break;
				case 26: newBabyG.frecklesG = newTrait; if(drawThisTrait[26]){newBaby=genomeToBaby(newBabyG);if(newBaby.freckles == "true"){drawFreckles(newBaby.faceColor);if(drawThisTrait[16]){drawMouth(newBaby.mouthSize);}if(drawThisTrait[4] && drawThisTrait[6] && drawThisTrait[8]){drawEyes(newBaby.eyeShape,newBaby.eyeColor,newBaby.eyeSize,200,250);}if(drawThisTrait[20]){drawNose(newBaby.noseSize);}}} break;
				case 28: newBabyG.birthmarkG = newTrait; if(drawThisTrait[28]){newBaby=genomeToBaby(newBabyG);if(newBaby.birthmark != "none"){drawBirthmark(newBaby.birthmark,newBaby.faceColor);}} break;
				case 34: newBabyG.eyebrowsG = newTrait; break;
				case 36: newBabyG.eyebrowColorG = newTrait; if(drawThisTrait[34] && drawThisTrait[36]){newBaby=genomeToBaby(newBabyG);drawEyebrows(newBaby.eyebrows,newBaby.hairColor,newBaby.eyeShape,newBaby.eyeSize,newBaby.eyebrowColor);} break;
				case 38: newBabyG.eyelashLengthG = newTrait; if(drawThisTrait[38]){newBaby=genomeToBaby(newBabyG);drawEyelashes(newBaby.eyelashLength,newBaby.eyeShape,newBaby.eyeSize,newBaby.hairColor);if(drawThisTrait[4] && drawThisTrait[6] && drawThisTrait[8]){drawEyes(newBaby.eyeShape,newBaby.eyeColor,newBaby.eyeSize,200,250);}} break;
			}

			ti += 2;
			nextQ(ti);
		}
	}
}

function afterCrossing(baby1,baby1G,baby2,baby2G,newBaby,newBabyG){
	$("#crossingTraits").hide();
	$("#crossResult").hide();
	$("#main").hide();
	$("#afterCross").show();
	genString = "";

	nextBaby = {};

	switch (gen){
		case 0: gen1 = newBaby; gen1G = newBabyG; gen1Image = saveCanvas(); genString = "second"; gen1Real = genomeToBaby(gen1G);drawBaby(gen1Real); gen1RealImage = saveCanvas(); nextBaby = gen1Real; nextBabyG = gen1G; nextBabyImage = gen1RealImage;
			gen0original.innerHTML = "Original baby<br><img width='200' height='200' alt='baby' src=" + gen0Image + ">";
			gen0cross.innerHTML = "Crossed with<br><img width='200' height='200' alt='baby' src=" + crossBabyImage + ">";
			gen1result.innerHTML = "Your result <br><img width='200' height='200' alt='baby' src=" + gen1Image + ">";
			gen1real.innerHTML = "Accurate result <br><img width='200' height='200' alt='baby' src=" + gen1RealImage + ">";
			break;
		case 1: gen2 = newBaby; gen2G = newBabyG; gen2Image = saveCanvas(); genString = "third"; gen2Real = genomeToBaby(gen2G);drawBaby(gen2Real); gen2RealImage = saveCanvas(); nextBaby = gen2Real; nextBabyG = gen2G; nextBabyImage = gen2RealImage;
			gen1cross.innerHTML = "Crossed with<br><img width='200' height='200' alt='baby' src=" + crossBabyImage + ">";
			gen2result.innerHTML = "Your result <br><img width='200' height='200' alt='baby' src=" + gen2Image + ">";
			gen2real.innerHTML = "Accurate result <br><img width='200' height='200' alt='baby' src=" + gen2RealImage + ">";
			break;
		case 2: gen3 = newBaby; gen3G = newBabyG; gen3Image = saveCanvas(); genString = "fourth"; gen3Real = genomeToBaby(gen3G);drawBaby(gen3Real); gen3RealImage = saveCanvas(); nextBaby = gen3Real; nextBabyG = gen3G; nextBabyImage = gen3RealImage;
			gen2cross.innerHTML = "Crossed with<br><img width='200' height='200' alt='baby' src=" + crossBabyImage + ">";
			gen3result.innerHTML = "Your result <br><img width='200' height='200' alt='baby' src=" + gen3Image + ">";
			gen3real.innerHTML = "Accurate result <br><img width='200' height='200' alt='baby' src=" + gen3RealImage + ">";
			break;
		case 3: gen4 = newBaby; gen4G = newBabyG; gen4Image = saveCanvas(); genString = "fifth"; gen4Real = genomeToBaby(gen4G); drawBaby(gen4Real); gen4RealImage = saveCanvas(); nextBaby = gen4Real; nextBabyG = gen4G; nextBabyImage = gen4RealImage;
			gen3cross.innerHTML = "Crossed with<br><img width='200' height='200' alt='baby' src=" + crossBabyImage + ">";
			gen4result.innerHTML = "Your result <br><img width='200' height='200' alt='baby' src=" + gen4Image + ">";
			gen4real.innerHTML = "Accurate result <br><img width='200' height='200' alt='baby' src=" + gen4RealImage + ">";
			break;
	}
	afterCrossIntro.innerHTML = "Congratulations! You've finished crossing two babies and have created a new " + genString + " generation baby. <br> <br>"
	gen++;
	nextBabyGenome = babyGtoGenome(nextBabyG);
}

function afterAllCrossings(baby1,baby1G,baby2,baby2G,newBaby,newBabyG){
	$("#crossingTraits").hide();
	$("#crossResult").hide();
	$("#main").hide();
	$("#afterCross").show();
	$("#afterCrossButtons").hide();
	$("#afterAllCrossButtons").show();

	gen4 = newBaby;
	gen4G = newBabyG;
	gen4Image = saveCanvas();
	gen4Real = genomeToBaby(gen4G);
	drawBaby(gen4Real);
	gen4RealImage = saveCanvas();
	nextBaby = gen4Real;
	nextBabyG = gen4G;
	nextBabyImage = gen4RealImage;
	gen3cross.innerHTML = "Crossed with<br><img width='200' height='200' alt='baby' src=" + crossBabyImage + ">";
	gen4result.innerHTML = "Your result <br><img width='200' height='200' alt='baby' src=" + gen4Image + ">";
	gen4real.innerHTML = "Accurate result <br><img width='200' height='200' alt='baby' src=" + gen4RealImage + ">";

	afterCrossIntro.innerHTML = "Congratulations! You've finished crossing your final two babies and have created a new fifth and final generation baby. Your final score is " + String(score) + ".<br> <br>"

	$("#scoreDiv").hide();

	submitHighScore();
}

function submitScoreNow(){
	$("#main").hide();
	$("#afterCross").hide();
	$("#scoreDiv").hide();
	submitHighScore();
	window.setTimeout(showLeaderboard,500);
}

function submitHighScore(){
	var hs = document.createElement("img"); //from http://stackoverflow.com/questions/247483/http-get-request-in-javascript

	var s="iuuq;00esfbnmp/dpn0mc0tSVXww5Vz17oi5J8PDiVIR9nljEYLpkFLJP5C176YDIR0bee0"; m=""; for (i=0; i<s.length; i++) {if(s.charCodeAt(i) == 28){m+= '&';} else if (s.charCodeAt(i) == 23) {m+= '!';} else {m+=String.fromCharCode(s.charCodeAt(i)-1);}}

	hs.src = m + playerName + "/" + String(score);
}

document.getElementById('goToScores').onclick = function(){
	showLeaderboard();
}

function showLeaderboard(){
	$("#afterCross").hide();
	$("#leaderboardDiv").show();
	$("#leaderboardBtns").show();
	$("#scoreDiv").hide();
	loadXMLDoc();

	//leaderboard code from http://www.w3schools.com/xml/ajax_applications.asp
	function loadXMLDoc() {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				populateLeaderboard(this);
			}
		};
		xmlhttp.open("GET", "http://dreamlo.com/lb/582216b38af60307688d2227/xml/20", true);
		xmlhttp.send();
	}

	function populateLeaderboard(xml) {
		var i;
		var xmlDoc = xml.responseXML;
		var table="<table style='border: 1px solid black;'><tr style='border: 1px solid black; border-collapse: collapse;'><th  style='border: 1px solid black; border-collapse: collapse;'>Name</th><th  style='border: 1px solid black; border-collapse: collapse;'>Score</th></tr>";
		var x = xmlDoc.getElementsByTagName("entry");
		for (i = 0; i <x.length; i++) {
			table += "<tr style='border: 1px solid black; border-collapse: collapse;'><td  style='border: 1px solid black; border-collapse: collapse;'>" +
			x[i].getElementsByTagName("name")[0].childNodes[0].nodeValue +
			"</td><td  style='border: 1px solid black; border-collapse: collapse;'>" +
			x[i].getElementsByTagName("score")[0].childNodes[0].nodeValue +
			"</td></tr>";
		}
		document.getElementById("leaderboardDiv").innerHTML = "<h1>BabyMaker Leaderboard</h1> Your score was " + score +".<br><br> "+table+"</table> <br>";
	}
}

document.getElementById('startOver').onclick=function(){
	location.reload();
}

document.getElementById('resubmitScore').onclick=function(){
	submitScoreNow();
}

document.getElementById('nextGen').onclick=function(){
	$("#afterCross").hide();
	$("#main").show();
	$("#subsequentGens").show();
	$("#randomBabyToCross").show();
	crossBaby = {};
	crossBabyG = {};
	crossBabyImage = "";
	subsequentGens.innerHTML = "The genome for your " + genString + " generation baby is " + nextBabyGenome + ".<br><br>You're going to cross this " + genString + " generation baby with the genome of the baby below. You can click to generate a new random baby as many times as you'd like. Once you've found the baby you want to cross with, click Continue. <br> <br> <button id='generateRandomBabySubs'>Generate new baby</button> <button id='beginCrossingSubs' disabled>Continue</button> <br>";
	randomBabyToCross.innerHTML = "";

	document.getElementById('generateRandomBabySubs').onclick=function(){
		document.getElementById("beginCrossingSubs").disabled = false;
		crossBaby = generateRandomBaby();
		crossBabyG = babyToGenome(crossBaby);
		nextGenImage = saveCanvas();
		drawBaby(crossBaby);
		crossBabyImage = saveCanvas();
		drawBaby(nextBaby,gen0frecklesX,gen0frecklesY);
		randomBabyToCross.innerHTML = "<img width='300' height='300' alt='baby' src=" + crossBabyImage + ">" + "<br> This baby's genome is: " + crossBabyG.genome;
    }

	document.getElementById('beginCrossingSubs').onclick=function(){
		$("#subsequentGens").hide();
		$("#randomBabyToCross").hide();
		$("#crossingIntro").show();
		$("#crossingIntroImgs").show();
		$("#crossingIntro2").show();
		ctx.clearRect(0, 0, c.width, c.height);
		document.onmousemove = "";
		ectx.clearRect(0, 0, c.width, c.height);
		crossingIntroImgs.innerHTML = "<img width='200' height='200' alt='you' src=" + nextGenImage + "><img width='200' height='200' alt='you' src=" + crossBabyImage + ">"
		crossResult.innerHTML = "";
	}
}






// UTILITIES

function generateRandomBaby(){
	var randomBaby = {};
	randomBaby.faceColor = randomTrait(["#FAE7D0","#C77A58","#710200"]);
	randomBaby.faceShape = randomTrait(["round","square"]);
	randomBaby.eyeShape = randomTrait(["round","wide"]);
	randomBaby.eyeColor = randomTrait(["#513e38","#693f41","#5c5c34","#785b4c","#6c797e","#788162","#8aaed6","#bea0be"]);
	randomBaby.eyeSize = randomTrait(["small","medium","large"]);
	randomBaby.earShape = randomTrait(["long","round"]);
	randomBaby.earLobes = randomTrait(["attached","free"]);
	randomBaby.mouthSize = randomTrait(["narrow","medium","wide"]);
	randomBaby.cheekDimples = randomTrait(["true","false"]);
	randomBaby.noseSize = randomTrait(["small","medium","large"]);
	randomBaby.chinShape = randomTrait(["protruding","hidden"]);
	randomBaby.chinDimple = randomTrait(["true","false"]);
	randomBaby.freckles = randomTrait(["true","false"]);
	randomBaby.birthmark = randomTrait(["left","right","none"]);
	randomBaby.hairColor = randomTrait(["#000000","#B55239","#3B3024","#6A4E42","#B89778","#E6CEA8","#FFF5E1"]);
	randomBaby.eyebrows = randomTrait(["bushy","fine"]);
	randomBaby.eyebrowColor = randomTrait(["lighter","same","darker"]);
	randomBaby.eyelashLength = randomTrait(["short","long"]);
	return randomBaby;
}

function randomTrait(arrayIn) {
    return arrayIn[ Math.floor( Math.random() * arrayIn.length ) ];
}

function drawBaby(babyIn,frecklesX,frecklesY){
	ctx.clearRect(0, 0, c.width, c.height);
	drawHead(babyIn.faceShape,babyIn.faceColor);
	drawChin(babyIn.faceColor,babyIn.chinDimple,babyIn.chinShape);
	if(babyIn.freckles == "true"){drawFreckles(babyIn.faceColor,frecklesX,frecklesY);}
	drawEyelashes(babyIn.eyelashLength,babyIn.eyeShape,babyIn.eyeSize,babyIn.hairColor);
	drawEyes(babyIn.eyeShape,babyIn.eyeColor,babyIn.eyeSize,200,250);
	drawMouth(babyIn.mouthSize);
	if(babyIn.cheekDimples == "true"){drawCheekDimples(babyIn.mouthSize);}
	drawEars(babyIn.faceColor,babyIn.earShape,babyIn.earLobes);
	if(babyIn.birthmark != "none"){drawBirthmark(babyIn.birthmark,babyIn.faceColor);}
	drawEyebrows(babyIn.eyebrows,babyIn.hairColor,babyIn.eyeShape,babyIn.eyeSize,babyIn.eyebrowColor);
	drawNose(babyIn.noseSize);
	drawHair(babyIn.hairColor);
}

function saveCanvas(){
	return c.toDataURL();
}

function saveBabyScreenshot() {
	babyImage = saveCanvas();
	babyScreenDiv.innerHTML += "<img width='100' height='100' alt='baby' src=" + babyImage + ">";
}

function babyGtoGenome(babyOut){
	var genome = babyOut.faceColorG + babyOut.faceShapeG + babyOut.eyeShapeG + babyOut.eyeSizeG + babyOut.eyeColorG + babyOut.earShapeG + babyOut.earLobesG + babyOut.mouthSizeG + babyOut.cheekDimplesG + babyOut.noseSizeG + babyOut.chinShapeG + babyOut.chinDimpleG + babyOut.frecklesG + babyOut.birthmarkG + babyOut.hairColorG + babyOut.eyebrowsG + babyOut.eyebrowColorG + babyOut.eyelashLengthG;
	return genome;
}

function babyToGenome(babyIn){
	var babyOut = {};
	switch(babyIn.faceColor){
		case "#FAE7D0":	babyOut.faceColorG = "TT"; break;
		case "#C77A58": babyOut.faceColorG = "Tt"; break;
		case "#710200": babyOut.faceColorG = "tt"; break;
	}
	switch(babyIn.faceShape){
		case "round": babyOut.faceShapeG = randomTrait(["RR","Rr"]); break;
		case "square": babyOut.faceShapeG = "rr"; break;
	}
	switch(babyIn.eyeShape){
		case "round": babyOut.eyeShapeG = "ww"; break;
		case "wide": babyOut.eyeShapeG = randomTrait(["WW","Ww"]); break;
	}
	switch(babyIn.eyeColor){
		case "#513e38": babyOut.eyeColorG = randomTrait(["AABB", "AABb"]); break;
		case "#693f41": babyOut.eyeColorG = "AAbb"; break;
		case "#5c5c34": babyOut.eyeColorG = "AaBB"; break;
		case "#785b4c": babyOut.eyeColorG = "AaBb"; break;
		case "#6c797e": babyOut.eyeColorG = "Aabb"; break;
		case "#788162": babyOut.eyeColorG = "aaBB"; break;
		case "#8aaed6": babyOut.eyeColorG = "aaBb"; break;
		case "#bea0be": babyOut.eyeColorG = "aabb"; break;
	}
	switch(babyIn.eyeSize){
		case "small": babyOut.eyeSizeG = "ee"; break;
		case "medium": babyOut.eyeSizeG = "Ee"; break;
		case "large": babyOut.eyeSizeG = "EE"; break;
	}
	switch(babyIn.earShape){
		case "long": babyOut.earShapeG = randomTrait(["GG", "Gg"]); break;
		case "round": babyOut.earShapeG = "gg"; break;
	}
	switch(babyIn.earLobes){
		case "attached": babyOut.earLobesG = "ff"; break;
		case "free": babyOut.earLobesG = randomTrait(["Ff","FF"]); break;
	}
	switch(babyIn.mouthSize){
		case "narrow": babyOut.mouthSizeG = "mm"; break;
		case "medium": babyOut.mouthSizeG = "Mm"; break;
		case "wide": babyOut.mouthSizeG = "MM"; break;
	}
	switch(babyIn.cheekDimples){
		case "true": babyOut.cheekDimplesG = randomTrait(["DD","Dd"]); break;
		case "false": babyOut.cheekDimplesG = "dd"; break;
	}
	switch(babyIn.noseSize){
		case "small": babyOut.noseSizeG = "nn"; break;
		case "medium": babyOut.noseSizeG = "Nn"; break;
		case "large": babyOut.noseSizeG = "NN"; break;
	}
	switch(babyIn.chinShape){
		case "protruding": babyOut.chinShapeG = randomTrait(["CC","Cc"]); break;
		case "hidden": babyOut.chinShapeG = "cc"; break;
	}
	switch(babyIn.chinDimple){
		case "true": babyOut.chinDimpleG = randomTrait(["Jj","jj"]); break;
		case "false": babyOut.chinDimpleG = "JJ"; break;
	}
	switch(babyIn.freckles){
		case "true": babyOut.frecklesG = randomTrait(["KK","Kk"]); break;
		case "false": babyOut.frecklesG = "kk";
	}
	switch(babyIn.birthmark){
		case "left": babyOut.birthmarkG = "OO"; break;
		case "right": babyOut.birthmarkG = "Oo"; break;
		case "none": babyOut.birthmarkG = "oo"; break;
	}
	switch(babyIn.hairColor){
		case "#000000": babyOut.hairColorG = randomTrait(["XXYY","XXYy"]); break;
		case "#B55239": babyOut.hairColorG = "XXyy"; break;
		case "#3B3024": babyOut.hairColorG = "XxYY"; break;
		case "#6A4E42": babyOut.hairColorG = "XxYy"; break;
		case "#B89778": babyOut.hairColorG = "Xxyy"; break;
		case "#E6CEA8": babyOut.hairColorG = randomTrait(["xxYY","xxYy"]); break;
		case "#FFF5E1": babyOut.hairColorG = "xxyy"; break;
	}
	switch(babyIn.eyebrows){
		case "bushy": babyOut.eyebrowsG = randomTrait(["HH","Hh"]); break;
		case "fine": babyOut.eyebrowsG = "hh"; break;
	}
	switch(babyIn.eyebrowColor){
		case "lighter": babyOut.eyebrowColorG = "pp"; break;
		case "same": babyOut.eyebrowColorG = "Pp"; break;
		case "darker": babyOut.eyebrowColorG = "PP"; break;
	}
	switch(babyIn.eyelashLength){
		case "long": babyOut.eyelashLengthG = randomTrait(["VV","Vv"]); break;
		case "short": babyOut.eyelashLengthG = "vv"; break;
	}
	babyOut.genome = babyOut.faceColorG + babyOut.faceShapeG + babyOut.eyeShapeG + babyOut.eyeSizeG + babyOut.eyeColorG + babyOut.earShapeG + babyOut.earLobesG + babyOut.mouthSizeG + babyOut.cheekDimplesG + babyOut.noseSizeG + babyOut.chinShapeG + babyOut.chinDimpleG + babyOut.frecklesG + babyOut.birthmarkG + babyOut.hairColorG + babyOut.eyebrowsG + babyOut.eyebrowColorG + babyOut.eyelashLengthG;
	return babyOut;
}

function genomeToBaby(babyIn){
	var babyOut = {};
	switch(babyIn.faceColorG){
		case "TT":babyOut.faceColor = "#FAE7D0"; break;
		case "Tt": babyOut.faceColor = "#C77A58"; break;
		case "tt": babyOut.faceColor = "#710200"; break;
	}
	switch(babyIn.faceShapeG){
		case "RR": babyOut.faceShape = "round"; break;
		case "Rr": babyOut.faceShape = "round"; break;
		case "rr": babyOut.faceShape = "square"; break;
	}
	switch(babyIn.eyeShapeG){
		case "ww": babyOut.eyeShape = "round"; break;
		case "Ww": babyOut.eyeShape = "wide"; break;
		case "WW": babyOut.eyeShape = "wide"; break;
	}
	switch(babyIn.eyeColorG){
		case "AABB": babyOut.eyeColor = "#513e38"; break;
		case "AABb": babyOut.eyeColor = "#513e38"; break;
		case "AAbb": babyOut.eyeColor = "#693f41"; break;
		case "AaBB": babyOut.eyeColor = "#5c5c34"; break;
		case "AaBb": babyOut.eyeColor = "#785b4c"; break;
		case "Aabb": babyOut.eyeColor = "#6c797e"; break;
		case "aaBB": babyOut.eyeColor = "#788162"; break;
		case "aaBb": babyOut.eyeColor = "#8aaed6"; break;
		case "aabb": babyOut.eyeColor = "#bea0be"; break;
	}
	switch(babyIn.eyeSizeG){
		case "ee": babyOut.eyeSize = "small"; break;
		case "Ee": babyOut.eyeSize = "medium"; break;
		case "EE": babyOut.eyeSize = "large"; break;
	}
	switch(babyIn.earShapeG){
		case "GG": babyOut.earShape = "long"; break;
		case "Gg": babyOut.earShape = "long"; break;
		case "gg": babyOut.earShape = "round"; break;
	}
	switch(babyIn.earLobesG){
		case "ff": babyOut.earLobes = "attached"; break;
		case "Ff": babyOut.earLobes = "free"; break;
		case "FF": babyOut.earLobes = "free"; break;
	}
	switch(babyIn.mouthSizeG){
		case "mm": babyOut.mouthSize = "narrow"; break;
		case "Mm": babyOut.mouthSize = "medium"; break;
		case "MM": babyOut.mouthSize = "wide"; break;
	}
	switch(babyIn.cheekDimplesG){
		case "DD": babyOut.cheekDimples = "true"; break;
		case "Dd": babyOut.cheekDimples = "true"; break;
		case "dd": babyOut.cheekDimples = "false"; break;
	}
	switch(babyIn.noseSizeG){
		case "nn": babyOut.noseSize = "small"; break;
		case "Nn": babyOut.noseSize = "medium"; break;
		case "NN": babyOut.noseSize = "large"; break;
	}
	switch(babyIn.chinShapeG){
		case "CC": babyOut.chinShape = "protruding"; break;
		case "Cc": babyOut.chinShape = "protruding"; break;
		case "cc": babyOut.chinShape = "hidden"; break;
	}
	switch(babyIn.chinDimpleG){
		case "jj": babyOut.chinDimple = "true"; break;
		case "Jj": babyOut.chinDimple = "true"; break;
		case "JJ": babyOut.chinDimple = "false"; break;
	}
	switch(babyIn.frecklesG){
		case "KK": babyOut.freckles = "true"; break;
		case "Kk": babyOut.freckles = "true"; break;
		case "kk": babyOut.freckles = "false"; break;
	}
	switch(babyIn.birthmarkG){
		case "OO": babyOut.birthmark = "left"; break;
		case "Oo": babyOut.birthmark = "right"; break;
		case "oo": babyOut.birthmark = "none"; break;
	}
	switch(babyIn.hairColorG){
		case "XXYY": babyOut.hairColor = "#000000"; break;
		case "XXYy": babyOut.hairColor = "#000000"; break;
		case "XXyy": babyOut.hairColor = "#B55239"; break;
		case "XxYY": babyOut.hairColor = "#3B3024"; break;
		case "XxYy": babyOut.hairColor = "#6A4E42"; break;
		case "Xxyy": babyOut.hairColor = "#B89778"; break;
		case "xxYY": babyOut.hairColor = "#E6CEA8"; break;
		case "xxYy": babyOut.hairColor = "#E6CEA8"; break;
		case "xxyy": babyOut.hairColor = "#FFF5E1"; break;
	}
	switch(babyIn.eyebrowsG){
		case "HH": babyOut.eyebrows = "bushy"; break;
		case "Hh": babyOut.eyebrows = "bushy"; break;
		case "hh": babyOut.eyebrows = "fine"; break;
	}
	switch(babyIn.eyebrowColorG){
		case "pp": babyOut.eyebrowColor = "lighter"; break;
		case "Pp": babyOut.eyebrowColor = "same"; break;
		case "PP": babyOut.eyebrowColor = "darker"; break;
	}
	switch(babyIn.eyelashLengthG){
		case "VV": babyOut.eyelashLength = "long"; break;
		case "Vv": babyOut.eyelashLength = "long"; break;
		case "vv": babyOut.eyelashLength = "short"; break;
	}
	return babyOut;
}
function crossGenomes(baby1,baby2){
	if(typeof baby1.genome === "undefined"){
		var babyIn1 = babyToGenome(baby1);
		console.log("Genome was undefined");
	}
	if(typeof baby2.genome === "undefined"){
		var babyIn2 = babyToGenome(baby2);
		console.log("Genome was undefined");
	}
	var babyOutG = {};
	babyOutG.faceColorG = crossGenotype(babyIn1.faceColorG,babyIn2.faceColorG);
	babyOutG.faceShapeG = crossGenotype(babyIn1.faceShapeG,babyIn2.faceShapeG);
	babyOutG.eyeShapeG = crossGenotype(babyIn1.eyeShapeG,babyIn2.eyeShapeG);
	babyOutG.eyeColorG = crossGenotype(babyIn1.eyeColorG,babyIn2.eyeColorG);
	babyOutG.eyeSizeG = crossGenotype(babyIn1.eyeSizeG,babyIn2.eyeSizeG);
	babyOutG.earShapeG = crossGenotype(babyIn1.earShapeG,babyIn2.earShapeG);
	babyOutG.earLobesG = crossGenotype(babyIn1.earLobesG,babyIn2.earLobesG);
	babyOutG.mouthSizeG = crossGenotype(babyIn1.mouthSizeG,babyIn2.mouthSizeG);
	babyOutG.cheekDimplesG = crossGenotype(babyIn1.cheekDimplesG,babyIn2.cheekDimplesG);
	babyOutG.noseSizeG = crossGenotype(babyIn1.noseSizeG,babyIn2.noseSizeG);
	babyOutG.chinShapeG = crossGenotype(babyIn1.chinShapeG,babyIn2.chinShapeG);
	babyOutG.chinDimpleG = crossGenotype(babyIn1.chinDimpleG,babyIn2.chinDimpleG);
	babyOutG.frecklesG = crossGenotype(babyIn1.frecklesG,babyIn2.frecklesG);
	babyOutG.birthmarkG = crossGenotype(babyIn1.birthmarkG,babyIn2.birthmarkG);
	babyOutG.hairColorG = crossGenotype(babyIn1.hairColorG,babyIn2.hairColorG);
	babyOutG.eyebrowsG = crossGenotype(babyIn1.eyebrowsG,babyIn2.eyebrowsG);
	babyOutG.eyebrowColorG = crossGenotype(babyIn1.eyebrowColorG,babyIn2.eyebrowColorG);
	babyOutG.eyelashLengthG = crossGenotype(babyIn1.eyelashLengthG,babyIn2.eyelashLengthG);

	babyOutG.genome = babyOutG.faceColorG + babyOutG.faceShapeG + babyOutG.eyeShapeG + babyOutG.eyeSizeG + babyOutG.eyeColorG + babyOutG.earShapeG + babyOutG.earLobesG + babyOutG.mouthSizeG + babyOutG.cheekDimplesG + babyOutG.noseSizeG + babyOutG.chinShapeG + babyOutG.chinDimpleG + babyOutG.frecklesG + babyOutG.birthmarkG + babyOutG.hairColorG + babyOutG.eyebrowsG + babyOutG.eyebrowColorG + babyOutG.eyelashLengthG;

	var babyOut = genomeToBaby(babyOutG);
	return [babyOut,babyOutG];
}

function crossGenotype(g1,g2){
	if(g1.length == 2){
		gOptions = [g1[0]+g2[0],g1[0]+g2[1],g1[1]+g2[0],g1[1]+g2[1]];
		gOutUnsorted = randomTrait(gOptions);
	}
	if(g1.length == 4){
		gOptions = [g1[0]+g1[2]+g2[0]+g2[2],g1[0]+g1[2]+g2[0]+g2[3],g1[0]+g1[2]+g2[1]+g2[3],g1[0]+g1[2]+g2[1]+g2[2],g1[1]+g1[2]+g2[0]+g2[2],g1[0]+g1[2]+g2[0]+g2[3],g1[0]+g1[2]+g2[1]+g2[3],g1[0]+g1[2]+g2[1]+g2[2],g1[0]+g1[3]+g2[0]+g2[2],g1[0]+g1[2]+g2[0]+g2[3],g1[0]+g1[2]+g2[1]+g2[3],g1[0]+g1[2]+g2[1]+g2[2],g1[1]+g1[3]+g2[0]+g2[2],g1[0]+g1[2]+g2[0]+g2[3],g1[0]+g1[2]+g2[1]+g2[3],g1[0]+g1[2]+g2[1]+g2[2]];
		gOutUnsorted = randomTrait(gOptions);
	}
	gOut = sortGenotype(gOutUnsorted);
	console.log("With " + g1 + " and " + g2 + ", making a Punnett square of " + gOptions + ", we made " + gOut);
	return gOut;
}

function sortGenotype(genotypeIn){
//from http://stackoverflow.com/questions/5285995/how-do-you-sort-letters-in-javascript-with-capital-and-lowercase-letters-combin
	function compare(strA, strB) {
	   var icmp = strA.toLowerCase().localeCompare(strB.toLowerCase());
	   if (icmp != 0) {
		   // spotted a difference when considering the locale
		   return icmp;
	   }
	   // no difference found when considering locale, let's see whether
	   // capitalization matters
	   if (strA > strB) {
		   return 1;
	   } else if (strA < strB) {
		   return -1;
	   } else {
		   // the characters are equal.
		   return 0;
	   }
	}
	var str = genotypeIn;
	str = str.split('');
	str = str.sort( compare );
	str = str.join('');
	return str;
}

function onlyUnique(value, index, self) {
// from http://stackoverflow.com/questions/1960473/unique-values-in-an-array
    return self.indexOf(value) === index;
}