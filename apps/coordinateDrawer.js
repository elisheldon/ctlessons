var c = document.getElementById("coordinatePlane");
var ctx = c.getContext("2d");
var planeWidth = 1000;
var planeHeight = 600;
var gridSize = 25; //10 , 25 and 50 work well
var pairsArray = [];
var rowsArray = [];
var flippedX = false;
var flippedY = false;
var drawn = false;
var lineColor = '#000000';

drawBackground();
document.getElementById("pairsInput").value = "0,0";

function drawBackground(){
	ctx.beginPath(); 
	for (i=1; i<planeWidth/gridSize; i++){
		ctx.moveTo(gridSize*i,0);
		ctx.lineTo(gridSize*i,planeHeight);
	}
	for (i=1; i<planeHeight/gridSize; i++){
		ctx.moveTo(0,gridSize*i);
		ctx.lineTo(planeWidth,gridSize*i);
	}
	ctx.lineWidth = 0.5;
	ctx.strokeStyle = '#808080';
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(planeWidth/2,0);
	ctx.lineTo(planeWidth/2,planeHeight);
	ctx.moveTo(0,planeHeight/2);
	ctx.lineTo(planeWidth,planeHeight/2);
	ctx.lineWidth = 8;
	ctx.strokeStyle = '#000000';
	ctx.stroke();
}

function getPairs(){
	var err = 0;
	if(document.getElementById("pairsInput").value.match(/[a-zA-Z+!@#$%^&*;?\/=_~()|]|\.\./)){ // checks for invalid characters
		err=1;
	}
	else{
		rowsArray = document.getElementById("pairsInput").value.split('\n');
		var xy = [];
		for(i=0; i<rowsArray.length; i++){
			if(rowsArray[i] != ""){ //skip and truncate any blank rows
				xy[i] = rowsArray[i].split(",");
				if(xy[i].length==2){ // make sure we have only pairs
					pairsArray[i]= [Number(xy[i][0])*gridSize+planeWidth/2, (0-Number(xy[i][1]))*gridSize+planeHeight/2];
				}
				else{err=1;}
			}
		}
	}
	return err;
}

function draw(){
	document.getElementById("status").innerHTML = "";
	err = getPairs();
	if(err==1){
		document.getElementById("status").innerHTML = "There's something wrong with your coordinate pairs...";
		clear();
	}
	else{
		ctx.beginPath(); 
		ctx.moveTo(pairsArray[0][0],pairsArray[0][1]);
		for (i=1; i<pairsArray.length; i++){
			ctx.lineTo(pairsArray[i][0],pairsArray[i][1]);
		}
			ctx.lineWidth = 5;
		ctx.strokeStyle = lineColor;
		ctx.stroke();
	}
	drawn = true;
}

function mirrorX(){
	var xy = [];
	var mirrorXArray = [];
	for(i=0; i<rowsArray.length; i++){
		xy[i] = rowsArray[i].split(",");
		mirrorXArray[i]= [Number(xy[i][0])*gridSize+planeWidth/2, Number(xy[i][1])*gridSize+planeHeight/2];
	}
    ctx.beginPath(); 
	ctx.moveTo(mirrorXArray[0][0],mirrorXArray[0][1]);
	for (i=1; i<rowsArray.length; i++){
		ctx.lineTo(mirrorXArray[i][0],mirrorXArray[i][1]);
	}
		ctx.lineWidth = 5;
	ctx.strokeStyle = lineColor;
	ctx.stroke();
	flippedX = true;
	if(flippedY){mirrorXandY();};
}

function mirrorY(){
	var xy = [];
	var mirrorYArray = [];
	for(i=0; i<rowsArray.length; i++){
		xy[i] = rowsArray[i].split(",");
		mirrorYArray[i]= [planeWidth/2-Number(xy[i][0])*gridSize, (0-Number(xy[i][1]))*gridSize+planeHeight/2];
	}
	ctx.beginPath(); 
	ctx.moveTo(mirrorYArray[0][0],mirrorYArray[0][1]);
	for (i=1; i<rowsArray.length; i++){
		ctx.lineTo(mirrorYArray[i][0],mirrorYArray[i][1]);
	}
		ctx.lineWidth = 5;
	ctx.strokeStyle = lineColor;
	ctx.stroke();
	flippedY = true;
	if(flippedX){mirrorXandY();};
}

function mirrorXandY(){
	var xy = [];
	var mirrorXYArray = [];
	for(i=0; i<rowsArray.length; i++){
		xy[i] = rowsArray[i].split(",");
		mirrorXYArray[i]= [planeWidth/2-Number(xy[i][0])*gridSize, Number(xy[i][1])*gridSize+planeHeight/2];
	}
	ctx.beginPath(); 
	ctx.moveTo(mirrorXYArray[0][0],mirrorXYArray[0][1]);
	for (i=1; i<rowsArray.length; i++){
		ctx.lineTo(mirrorXYArray[i][0],mirrorXYArray[i][1]);
	}
		ctx.lineWidth = 5;
	ctx.strokeStyle = lineColor;
	ctx.stroke();
}

function clear(){
	ctx.clearRect(0,0,c.width,c.height);
	drawBackground();
	pairsArray = [];
	rowsArray = [];
	flippedX = false;
	flippedY = false;
	drawn = false;
}

function zoom(zoomLevel){
	switch(zoomLevel){
		case '2':
			ctx.clearRect(0,0,c.width,c.height);
			gridSize = 50;
			drawBackground();
			if(drawn){draw();}
			if(flippedX){mirrorX();}
			if(flippedY){mirrorY();}
			break;
		case '1':
			ctx.clearRect(0,0,c.width,c.height);
			gridSize = 25;
			drawBackground();
			if(drawn){draw();}
			if(flippedX){mirrorX();}
			if(flippedY){mirrorY();}
			break;
		case '0':
			ctx.clearRect(0,0,c.width,c.height);
			gridSize = 10;
			drawBackground();
			if(drawn){draw();}
			if(flippedX){mirrorX();}
			if(flippedY){mirrorY();}
			break;
		default:
			document.getElementById("status").innerHTML = "zoom is broken";
	}
}

function setColor(colorChoice){
	switch(colorChoice){
		case 'black':
			lineColor = '#000000';
			break;
		case 'blue':
			lineColor = '#0000FF';
			break;
		case 'red':
			lineColor = '#FF0000';
			break;
		case 'green':
			lineColor = '#00FF00';
			break;
		case 'pink':
			lineColor = '#FF69B4';
			break;
		case 'yellow':
			lineColor = '#FFFF00';
			break;
		case 'orange':
			lineColor = '#FF9900';
			break;
		case 'purple':
			lineColor = '#990099';
			break;
	}
	if(drawn){draw();}
	if(flippedX){mirrorX();}
	if(flippedY){mirrorY();}
}

document.getElementById('drawButton').onclick=function() {draw()};
document.getElementById('clearButton').onclick=function() {clear()};
document.getElementById('mirrorXButton').onclick=function() {mirrorX()};
document.getElementById('mirrorYButton').onclick=function() {mirrorY()};
document.getElementById('zoomRange').onchange=function() {zoom(document.getElementById('zoomRange').value)};
document.getElementById('colorPicker').onchange=function() {setColor(document.getElementById('colorPicker').value)};