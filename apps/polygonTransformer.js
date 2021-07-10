var c = document.getElementById("coordinatePlane");
var ctx = c.getContext("2d");
var planeWidth = 1200;
var planeHeight = 500;
var gridSize = 25; //10 , 25 and 50 work well
var p0Canvas = [];
var p0Cart = [];
var p1Canvas = [];
var p1Cart = [];
var p2Canvas = [];
var p2Cart = [];
var p3Canvas = [];
var p3Cart = [];
var polygon = 0;
var rowsArray = [];
var drawn = false;
var p0Color = "#FF0000";
var p1Color = "#008000";
var p2Color = "#0000FF";
var p3Color = "#FF00FF";
var showValues = false;

disableTransformations();
document.getElementById("clearButton").disabled = true;
document.getElementById("undoButton").disabled = true;
drawBackground(); //creates coordinate plane with grid lines
document.getElementById("pairsInput").value = "0,0"; //sets dummy text in vertices list
document.getElementById("translateX").value = "0";
document.getElementById("translateY").value = "0";
document.getElementById("reflectX").value = "0";
document.getElementById("reflectY").value = "0";
document.getElementById("scale").value = "1";
document.getElementById("p0list").style.display = "none";
document.getElementById("p1list").style.display = "none";
document.getElementById("p2list").style.display = "none";
document.getElementById("p3list").style.display = "none";
document.getElementById("showValuesButton").disabled = true;
document.getElementById("status").innerHTML = "Add three to six coordinate pairs to the Vertices area and hit Draw to get started!";


function drawBackground(){
	//draw grid lines and axes
	ctx.beginPath(); 
	for (i=1; i<planeWidth/gridSize; i++){
		ctx.moveTo(gridSize*i,0); //starting point of vertical grid line
		ctx.lineTo(gridSize*i,planeHeight); //ending point of vertical grid line
	}
	for (i=1; i<planeHeight/gridSize; i++){
		ctx.moveTo(0,gridSize*i); //starting point of horizontal grid line
		ctx.lineTo(planeWidth,gridSize*i); //ending point of horizontal grid line
	}
	ctx.lineWidth = 0.5; //line width of grid lines
	ctx.strokeStyle = '#808080'; //color of grid lines
	ctx.stroke(); //draw grid lines defined above
	ctx.beginPath(); //start a new path
	ctx.moveTo(planeWidth/2,0); //starting point of y-axis
	ctx.lineTo(planeWidth/2,planeHeight); //ending point of y-axis
	ctx.moveTo(0,planeHeight/2); //starting point of x-axis
	ctx.lineTo(planeWidth,planeHeight/2); //ending point of x-axis
	ctx.lineWidth = gridSize/5; //line width of axes
	ctx.strokeStyle = '#000000'; //color of axes
	ctx.stroke(); //draw axes
}

function drawp0(){
	//retrieve and convert vertices from text input to canvas-scaled matrix
	clear();
	document.getElementById("clearButton").disabled = false;
	document.getElementById("drawp0Button").disabled = true;
	document.getElementById("showValuesButton").disabled = false;
	var err = 0;
	if(document.getElementById("pairsInput").value.match(/[a-zA-Z+!@#$%^&*;?\/=_~()|]|\.\./)){ // checks for invalid characters
		err=1;
	}
	else{
		rowsArray = document.getElementById("pairsInput").value.split('\n'); //load all coordinate pairs, with each row an entry into this array
		//TODO: check for at least three vertices
		for(i=0; i<rowsArray.length; i++){
			if(rowsArray[i] != ""){ //skip and truncate any blank rows
				if(rowsArray[i].split(",").length==2){ //make sure we have only pairs for each vertex
					p0Cart[i] = rowsArray[i].split(","); //split x and y values into respective matrix columns;
				}
				else{err=1;}
			}
		}
		p0Canvas = cartToCanvas(p0Cart);
	}
	if(p0Cart.length > 6){
		err=2;
	} 
	if(err==0){
		draw(p0Canvas,p0Color,0);
		enableTransformations();
	}
	if(err==1){
		document.getElementById("status").innerHTML = "There's something wrong with your coordinate pairs. Make sure you only use numbers, commas and the negative sign.";
		clear();
	}
	if(err==2){
		document.getElementById("status").innerHTML = "You have too many vertices! Make sure you have six coordinate pairs or fewer.";
		clear();
	}
}

function cartToCanvas(xyCart){
	//convert a matrix of coordinate pairs in Cartesian units to HTML Canvas units
	var xyCanvas = [];
	for(i=0; i<xyCart.length; i++){
		xyCanvas[i] = [Number(xyCart[i][0])*gridSize+planeWidth/2, -Number(xyCart[i][1])*gridSize+planeHeight/2];
	}
	return xyCanvas;
}

function canvasToCart(xyCanvas){
	//convert a matrix of coordinate pairs in HTML Canvas units to Cartesian units
	//this is never used...
	var xyCart = [];
	for(i=0; i<xyCanvas.length; i++){
		xyCart[i] = [(Number(xyCanvas[i][0])-planeWidth/2)/gridSize, -((Number(xyCanvas[i][1])-planeHeight/2)/gridSize)]
	}
	return xyCart;
}

function draw(xyCanvas,lineColor,polyNum){
	document.getElementById("status").innerHTML = ""; //clear status message
	ctx.beginPath(); //start a new path
	ctx.moveTo(xyCanvas[0][0],xyCanvas[0][1]); //starting point of polygon
	for (i=1; i<xyCanvas.length; i++){
		ctx.lineTo(xyCanvas[i][0],xyCanvas[i][1]); //draw each vertex
	}
	ctx.closePath(); //close the polygon
	ctx.lineWidth = gridSize/8; //width of polygon border
	ctx.strokeStyle = lineColor; //color of polygon border
	if(xyCanvas.length == 1){ctx.strokeRect(xyCanvas[0][0]-gridSize/16,xyCanvas[0][1]-gridSize/16,gridSize/8,gridSize/8)}; //if single point, make a rectangle there
	ctx.stroke(); //draw polygon
	drawn = true;
	labelPoly(xyCanvas,polyNum);
	xyCart = canvasToCart(xyCanvas);
	updatePolyList(xyCart, polyNum);
}

function translate(xyCartIn, amtX, amtY){
	//translate an input Cartesian matrix xyCartIn by amtX in x and amtY units in y
	xyCartOut = []; //create empty translated matrix
	for (i=0; i<xyCartIn.length; i++){
		xyCartOut[i] = [Number(xyCartIn[i][0]) + amtX,Number(xyCartIn[i][1]) + amtY]; //translate x and y
	}
	return xyCartOut;
}

function translateExec(){
	document.getElementById("undoButton").disabled = false;
	polygon += 1;
	amtX = Number(document.getElementById("translateX").value);
	amtY = Number(document.getElementById("translateY").value);
	switch(polygon){
		case 1:
			p1Cart = translate(p0Cart, amtX, amtY);
			p1Canvas = cartToCanvas(p1Cart);
			draw(p1Canvas,p1Color,1);
			document.getElementById("transform1").innerHTML = "&#8594;<br>Translated<br>" + amtX + " in x<br>" + amtY + " in y<br>&#8594;";
			break;
		case 2:
			p2Cart = translate(p1Cart, amtX, amtY);
			p2Canvas = cartToCanvas(p2Cart);
			draw(p2Canvas,p2Color,2);
			document.getElementById("transform2").innerHTML = "&#8594;<br>Translated<br>" + amtX + " in x<br>" + amtY + " in y<br>&#8594;";
			break;
		case 3:
			p3Cart = translate(p2Cart, amtX, amtY);
			p3Canvas = cartToCanvas(p3Cart);
			draw(p3Canvas,p3Color,3);
			disableTransformations();
			document.getElementById("transform3").innerHTML = "&#8594;<br>Translated<br>" + amtX + " in x<br>" + amtY + " in y<br>&#8594;";
			break;
	}
}

function reflectX(xyCartIn, xEq){
	//reflect an input Cartesian matrix xyCartIn across x = xEq
	xyCartOut = []; //create empty reflected matrix
	for (i=0; i<xyCartIn.length; i++){
		xyCartOut[i] = [2*xEq - Number(xyCartIn[i][0]),Number(xyCartIn[i][1])]; //reflect across xEq
	}
	return xyCartOut;
}

function reflectY(xyCartIn, yEq){
	//reflect an input Cartesian matrix xyCartIn across y = yEq
	xyCartOut = []; //create empty reflected matrix
	for (i=0; i<xyCartIn.length; i++){
		xyCartOut[i] = [Number(xyCartIn[i][0]),2*yEq - Number(xyCartIn[i][1])]; //reflect across yEq
	}
	return xyCartOut;
}

function reflectXExec(isAxis){
	document.getElementById("undoButton").disabled = false;
	polygon += 1;
	if(isAxis){xEq = 0;}
	else{xEq = Number(document.getElementById("reflectX").value);}
	switch(polygon){
		case 1:
			p1Cart = reflectX(p0Cart, xEq);
			p1Canvas = cartToCanvas(p1Cart);
			draw(p1Canvas,p1Color,1);
			document.getElementById("transform1").innerHTML = "&#8594;<br>Reflected<br>over<br>x = " + document.getElementById("reflectX").value + "<br>&#8594;";
			break;
		case 2:
			p2Cart = reflectX(p1Cart, xEq);
			p2Canvas = cartToCanvas(p2Cart);
			draw(p2Canvas,p2Color,2);
			document.getElementById("transform2").innerHTML = "&#8594;<br>Reflected<br>over<br>x = " + document.getElementById("reflectX").value + "<br>&#8594;";
			break;
		case 3:
			p3Cart = reflectX(p2Cart, xEq);
			p3Canvas = cartToCanvas(p3Cart);
			draw(p3Canvas,p3Color,3);
			document.getElementById("transform3").innerHTML = "&#8594;<br>Reflected<br>over<br>x = " + document.getElementById("reflectX").value + "<br>&#8594;";
			disableTransformations();
			break;
	}
}

function reflectYExec(isAxis){
	document.getElementById("undoButton").disabled = false;
	polygon += 1;
	if(isAxis){yEq = 0;}
	else{yEq = Number(document.getElementById("reflectY").value);}
	switch(polygon){
		case 1:
			p1Cart = reflectY(p0Cart, yEq);
			p1Canvas = cartToCanvas(p1Cart);
			draw(p1Canvas,p1Color,1);
			document.getElementById("transform1").innerHTML = "&#8594;<br>Reflected<br>over<br>y = " + document.getElementById("reflectY").value + "<br>&#8594;";
			break;
		case 2:
			p2Cart = reflectY(p1Cart, yEq);
			p2Canvas = cartToCanvas(p2Cart);
			draw(p2Canvas,p2Color,2);
			document.getElementById("transform2").innerHTML = "&#8594;<br>Reflected<br>over<br>y = " + document.getElementById("reflectY").value + "<br>&#8594;";
			break;
		case 3:
			p3Cart = reflectY(p2Cart, yEq);
			p3Canvas = cartToCanvas(p3Cart);
			draw(p3Canvas,p3Color,3);
			document.getElementById("transform3").innerHTML = "&#8594;<br>Reflected<br>over<br>y = " + document.getElementById("reflectY").value + "<br>&#8594;";
			disableTransformations();
			break;
	}
}

function rotate(xyCartIn, degrees, direction){
	//rotate an input Cartesian matrix xyCartIn around the origin
	xyCartOut = []; //create empty reflected matrix
	switch(degrees){
		case '90':
			if(direction=='CW'){
				for (i=0; i<xyCartIn.length; i++){
					xyCartOut[i] = [Number(xyCartIn[i][1]),-Number(xyCartIn[i][0])]; //y, -x
				}
			}
			else{
				for (i=0; i<xyCartIn.length; i++){
					xyCartOut[i] = [-Number(xyCartIn[i][1]),Number(xyCartIn[i][0])]; //-y, x
				}
			}
			break;
		case '180':
			for (i=0; i<xyCartIn.length; i++){
					xyCartOut[i] = [-Number(xyCartIn[i][0]),-Number(xyCartIn[i][1])]; //-x, -y
			}
			break;
		case '270':
			if(direction=='CCW'){
				for (i=0; i<xyCartIn.length; i++){
					xyCartOut[i] = [Number(xyCartIn[i][1]),-Number(xyCartIn[i][0])]; //y, -x
				}
			}
			else{
				for (i=0; i<xyCartIn.length; i++){
					xyCartOut[i] = [-Number(xyCartIn[i][1]),Number(xyCartIn[i][0])]; //-y, x
				}
			}
			break;
	}
	return xyCartOut;
}

function rotateExec(){
	document.getElementById("undoButton").disabled = false;
	polygon += 1;
	degrees = document.querySelector('input[name="degrees"]:checked').value;
	direction = document.querySelector('input[name="direction"]:checked').value;
	switch(polygon){
		case 1:
			p1Cart = rotate(p0Cart, degrees, direction);
			p1Canvas = cartToCanvas(p1Cart);
			draw(p1Canvas,p1Color,1);
			document.getElementById("transform1").innerHTML = "&#8594;<br>Rotated<br>" + degrees + "&deg; " + direction + "<br>&#8594;";
			break;
		case 2:
			p2Cart = rotate(p1Cart, degrees, direction);;
			p2Canvas = cartToCanvas(p2Cart);
			draw(p2Canvas,p2Color,2);
			document.getElementById("transform2").innerHTML = "&#8594;<br>Rotated<br>" + degrees + "&deg; " + direction + "<br>&#8594;";
			break;
		case 3:
			p3Cart = rotate(p2Cart, degrees, direction);;
			p3Canvas = cartToCanvas(p3Cart);
			draw(p3Canvas,p3Color,3);
			document.getElementById("transform3").innerHTML = "&#8594;<br>Rotated<br>" + degrees + "&deg; " + direction + "<br>&#8594;";
			disableTransformations();
			break;
	}
}

function dilate(xyCartIn, scale){
	//dilate an input Cartesian matrix by scale factor scale with the origin as the center of dilation
	xyCartOut = []; //create empty dilated matrix
	for (i=0; i<xyCartIn.length; i++){
		xyCartOut[i] = [Number(xyCartIn[i][0])*scale,Number(xyCartIn[i][1])*scale]; //scale
	}
	return xyCartOut;
}

function dilateExec(){
	document.getElementById("undoButton").disabled = false;
	polygon += 1;
	scale = Number(document.getElementById("scale").value);
	switch(polygon){
		case 1:
			p1Cart = dilate(p0Cart, scale);
			p1Canvas = cartToCanvas(p1Cart);
			draw(p1Canvas,p1Color,1);
			document.getElementById("transform1").innerHTML = "&#8594;<br>Dilated with<br>scale factor<br>" + document.getElementById("scale").value + "<br>&#8594;";
			break;
		case 2:
			p2Cart = dilate(p1Cart, scale);
			p2Canvas = cartToCanvas(p2Cart);
			draw(p2Canvas,p2Color,2);
			document.getElementById("transform2").innerHTML = "&#8594;<br>Dilated with<br>scale factor<br>" + document.getElementById("scale").value + "<br>&#8594;";
			break;
		case 3:
			p3Cart = dilate(p2Cart, scale);
			p3Canvas = cartToCanvas(p3Cart);
			draw(p3Canvas,p3Color,3);
			document.getElementById("transform3").innerHTML = "&#8594;<br>Dilated with<br>scale factor<br>" + document.getElementById("scale").value + "<br>&#8594;";
			disableTransformations();
			break;
	}
}

function disableTransformations(){
	document.getElementById("translateButton").disabled = true;
	document.getElementById("reflectXButton").disabled = true;
	document.getElementById("reflectYButton").disabled = true;
	document.getElementById("reflectXAxisButton").disabled = true;
	document.getElementById("reflectYAxisButton").disabled = true;
	document.getElementById("rotateButton").disabled = true;
	document.getElementById("dilateButton").disabled = true;
	document.getElementById("status").innerHTML = "You've used all three transformations. Hit Undo transformation, or Clear and then Draw to try again!";
}

function enableTransformations(){
	document.getElementById("translateButton").disabled = false;
	document.getElementById("reflectXButton").disabled = false;
	document.getElementById("reflectYButton").disabled = false;
	document.getElementById("reflectXAxisButton").disabled = false;
	document.getElementById("reflectYAxisButton").disabled = false;
	document.getElementById("rotateButton").disabled = false;
	document.getElementById("dilateButton").disabled = false;
	document.getElementById("clearButton").disabled = false;
	document.getElementById("drawp0Button").disabled = true;
	document.getElementById("showValuesButton").disabled = false;
}

function labelPoly(xyCanvas,polyNum){
	switch(polyNum){
		case 0:
			labels = ["A","B","C","D","E","F"];
			labelColor = p0Color;
			break;
		case 1:
			labels = ["A'","B'","C'","D'","E'","F'"];
			labelColor = p1Color;
			break;
		case 2:
			labels = ["A''","B''","C''","D''","E''","F''"];
			labelColor = p2Color;
			break;
		case 3:
			labels = ["A'''","B'''","C'''","D'''","E'''","F'''"];
			labelColor = p3Color;
			break;
	}
	var xSum = 0;
	var ySum = 0;
	for (i=0; i<xyCanvas.length; i++){
		xSum += Number(xyCanvas[i][0]);
		ySum += Number(xyCanvas[i][1]);
	}
	xAvg = xSum/xyCanvas.length;
	yAvg = ySum/xyCanvas.length;
	ctx.font = "20px Arial";
	ctx.fillStyle = labelColor;
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	var buffer = Math.sqrt(gridSize)+7;
	for (i=0; i<xyCanvas.length; i++){
		if(Number(xyCanvas[i][0])<=xAvg){xBuffer = -buffer;}
		else{xBuffer = buffer;}
		if(Number(xyCanvas[i][1])<=yAvg){yBuffer = -buffer;}
		else{yBuffer = buffer;}
		ctx.fillText(labels[i],xyCanvas[i][0]+xBuffer,xyCanvas[i][1]+yBuffer);
	}
	
}

function updatePolyList(xyCartIn, polyNum){
	switch(polyNum){
		case 0:
			labels = ["A","B","C","D","E","F"];
			document.getElementById("p0list").innerHTML = generatePolyList(xyCartIn, labels, polyNum);
			document.getElementById("p0name").innerHTML = "Shape<br>" + generatePolyName(xyCartIn, labels, polyNum);
			break;
		case 1:
			labels = ["A'","B'","C'","D'","E'","F'"];
			document.getElementById("p1list").innerHTML = generatePolyList(xyCartIn, labels, polyNum);
			document.getElementById("p1name").innerHTML = "Shape<br>" + generatePolyName(xyCartIn, labels, polyNum);
			break;
		case 2:
			labels = ["A''","B''","C''","D''","E''","F''"];
			document.getElementById("p2list").innerHTML = generatePolyList(xyCartIn, labels, polyNum);
			document.getElementById("p2name").innerHTML = "Shape<br>" + generatePolyName(xyCartIn, labels, polyNum);
			break;
		case 3:
			labels = ["A'''","B'''","C'''","D'''","E'''","F'''"];
			document.getElementById("p3list").innerHTML = generatePolyList(xyCartIn, labels, polyNum);
			document.getElementById("p3name").innerHTML = "Shape<br>" + generatePolyName(xyCartIn, labels, polyNum);
			break;
	}
}

function generatePolyList(xyCartIn,labels,polyNum){
	list = labels.join("").substring(0,xyCartIn.length*(polyNum+1)) + "<br>";
	for (i=0; i<xyCartIn.length; i++){
		list += labels[i] + ": (" + Math.round(xyCartIn[i][0] * 100)/100 + ", " + Math.round(xyCartIn[i][1] * 100)/100 +") <br>"; //add each vertex rounded to two decimals
	}
	return list;
}

function generatePolyName(xyCartIn,labels,polyNum){
	name = labels.join("").substring(0,xyCartIn.length*(polyNum+1));
	return name;
}

function clear(){
	document.getElementById("clearButton").disabled = true;
	document.getElementById("drawp0Button").disabled = false;
	document.getElementById("undoButton").disabled = true;
	ctx.clearRect(0,0,c.width,c.height);
	disableTransformations();
	drawBackground();
	p0Canvas = [];
	p0Cart = [];
	p1Canvas = [];
	p1Cart = [];
	p2Canvas = [];
	p2Cart = [];
	p3Canvas = [];
	p3Cart = [];
	polygon = 0;
	rowsArray = [];
	drawn = false;
	document.getElementById("p0list").innerHTML = "";
	document.getElementById("p1list").innerHTML = "";
	document.getElementById("p2list").innerHTML = "";
	document.getElementById("p3list").innerHTML = "";
	document.getElementById("p0name").innerHTML = "";
	document.getElementById("p1name").innerHTML = "";
	document.getElementById("p2name").innerHTML = "";
	document.getElementById("p3name").innerHTML = "";
	document.getElementById("transform1").innerHTML = "";
	document.getElementById("transform2").innerHTML = "";
	document.getElementById("transform3").innerHTML = "";
	showValues = false; //basically a reshash of the vertexValues function, but doesn't mess up user's choice
	document.getElementById("showValuesButton").innerHTML = "Show coordinate<br>values";
	document.getElementById("showValuesButton").disabled = true;
	document.getElementById("p0list").style.display = "none";
	document.getElementById("p1list").style.display = "none";
	document.getElementById("p2list").style.display = "none";
	document.getElementById("p3list").style.display = "none";
	document.getElementById("p0name").style.display = "block";
	document.getElementById("p1name").style.display = "block";
	document.getElementById("p2name").style.display = "block";
	document.getElementById("p3name").style.display = "block";
	document.getElementById("status").innerHTML = "Add three to six coordinate pairs to the Vertices area and hit Draw to get started!";
}

function zoom(zoomLevel){
	switch(zoomLevel){
		case '2':
			gridSize = 50;
			break;
		case '1':
			gridSize = 25;
			break;
		case '0':
			gridSize = 10;
			break;
	}
	ctx.clearRect(0,0,c.width,c.height);
	drawBackground();
	if(polygon>=0){
		p0Canvas = cartToCanvas(p0Cart);
		if(drawn==true){
			draw(p0Canvas,p0Color,0);
		}
	}
	if(polygon>=1){
		p1Canvas = cartToCanvas(p1Cart);
		draw(p1Canvas,p1Color,1);
	}
	if(polygon>=2){
		p2Canvas = cartToCanvas(p2Cart);
		draw(p2Canvas,p2Color,2);
	}
	if(polygon>=3){
		p3Canvas = cartToCanvas(p3Cart);
		draw(p3Canvas,p3Color,3);
	}	
}

function vertexValues(){
	if(showValues == false){
		document.getElementById("p0list").style.display = "block";
		document.getElementById("p1list").style.display = "block";
		document.getElementById("p2list").style.display = "block";
		document.getElementById("p3list").style.display = "block";
		document.getElementById("p0name").style.display = "none";
		document.getElementById("p1name").style.display = "none";
		document.getElementById("p2name").style.display = "none";
		document.getElementById("p3name").style.display = "none";
		showValues = true;
		document.getElementById("showValuesButton").innerHTML = "Hide coordinate<br>values";
	}
	else{
		document.getElementById("p0list").style.display = "none";
		document.getElementById("p1list").style.display = "none";
		document.getElementById("p2list").style.display = "none";
		document.getElementById("p3list").style.display = "none";
		document.getElementById("p0name").style.display = "block";
		document.getElementById("p1name").style.display = "block";
		document.getElementById("p2name").style.display = "block";
		document.getElementById("p3name").style.display = "block";
		document.getElementById("showValuesButton").innerHTML = "Show coordinate<br>values"
		showValues = false;
	}
}

function undo(){
	ctx.clearRect(0,0,c.width,c.height);
	drawBackground();
	document.getElementById("p0list").innerHTML = "";
	document.getElementById("p1list").innerHTML = "";
	document.getElementById("p2list").innerHTML = "";
	document.getElementById("p3list").innerHTML = "";
	document.getElementById("p0name").innerHTML = "";
	document.getElementById("p1name").innerHTML = "";
	document.getElementById("p2name").innerHTML = "";
	document.getElementById("p3name").innerHTML = "";
	switch(polygon){
	case 1:
		p1Cart = [];
		p1Canvas = [];
		draw(p0Canvas,p0Color,0);
		document.getElementById("undoButton").disabled = true;
		document.getElementById("transform1").innerHTML = "";
		break;
	case 2:
		p2Cart = [];
		p2Canvas = [];
		draw(p0Canvas,p0Color,0);
		draw(p1Canvas,p1Color,1);
		document.getElementById("transform2").innerHTML = ""
		break;
	case 3:
		p3Cart = [];
		p3Canvas = [];
		draw(p0Canvas,p0Color,0);
		draw(p1Canvas,p1Color,1);
		draw(p2Canvas,p2Color,2);
		document.getElementById("transform3").innerHTML = ""
		enableTransformations();
		break;
	}
	polygon -= 1;
}

function showOnlyFirstAndLast(){
	// no UI for this feature, only for teacher use
	ctx.clearRect(0,0,c.width,c.height);
	drawBackground();
	draw(p0Canvas,p0Color,0);
	switch(polygon){
	case 1:
		draw(p1Canvas,p1Color,1);
		break;
	case 2:
		draw(p2Canvas,p2Color,2);
		break;
	case 3:
		draw(p3Canvas,p3Color,3);
		break;
	}
}

document.getElementById('drawp0Button').onclick=function() {drawp0()};
document.getElementById('clearButton').onclick=function() {clear()};
document.getElementById('zoomRange').onchange=function() {zoom(document.getElementById('zoomRange').value)};
document.getElementById('translateButton').onclick=function() {translateExec()};
document.getElementById('reflectXButton').onclick=function() {reflectXExec(false)};
document.getElementById('reflectYButton').onclick=function() {reflectYExec(false)};
document.getElementById('reflectXAxisButton').onclick=function() {reflectYExec(true)};
document.getElementById('reflectYAxisButton').onclick=function() {reflectXExec(true)};
document.getElementById('rotateButton').onclick=function() {rotateExec()};
document.getElementById('dilateButton').onclick=function() {dilateExec()};
document.getElementById('showValuesButton').onclick=function() {vertexValues()};
document.getElementById('undoButton').onclick=function() {if(polygon>0){undo()}};