//audioSynth from http://keithwhor.github.io/audiosynth/
//physics reference from http://hyperphysics.phy-astr.gsu.edu/hbase/Waves/string.html
//notes reference from https://pages.mtu.edu/~suits/notefreqs.html


    document.addEventListener('DOMContentLoaded', function () {
        var percentage = document.querySelector('.js_slider');

        lory(percentage, {
            infinite: 1
        });
    });



var c=document.getElementById("stringCanvas");
var ctx=c.getContext("2d");

Synth.setVolume(0.1);
Synth.setSampleRate(22050);

var length = .648; //25.5 in to meters
var density = 8800; //kg/m3 per https://www.engineeringtoolbox.com/metal-alloys-densities-d_50.html

var tensions = [115.7, 133.4, 133.4, 133.4, 102.3, 102.3];
var diameters = [.0013462, .0010668, .0008128, .0006096, .0004064, .0003048];
var lengths = [.648, .648, .648, .648, .648, .648];
var freqs = [];

var V = [];
for(i=0;i<6;i++){
	V[i]=calcV(tensions[i],diameters[i]);
}

drawStrings();

var chords = new Object;
var chordName = "";

function calcV(tension,diameter){
	var mass = Math.PI*(diameter/2)*(diameter/2)*length*density;
	var V = Math.sqrt(tension/(mass/length));
	return V;
}

function calcF(stringNum){
	i = stringNum-1;
	freqs[i] = V[i]/(2*lengths[i]);
}

function drawStrings(){
	ctx.clearRect(0, 0, c.width, c.height);
	for(i=0;i<6;i++){
		lengths[i] = parseFloat(document.getElementById("length"+(i+1)).value);
		if(lengths[i]<0){lengths[i]=0;document.getElementById("length"+(i+1)).value=0;}
		else if (lengths[i]>.648){lengths[i]=.648;document.getElementById("length"+(i+1)).value=.648;};
		ctx.beginPath();
		ctx.moveTo(0,10+35*i);
		ctx.lineTo(1000*lengths[i]/.648,10+35*i);
		ctx.lineWidth = diameters[i]*5000;
		switch(i){
			case 0:
				ctx.strokeStyle = "#39CCCC";
				break;
			case 1:
				ctx.strokeStyle = "#FF851B";
				break;
			case 2:
				ctx.strokeStyle = "#2ECC40";
				break;
			case 3:
				ctx.strokeStyle = "#AAAAAA";
				break;
			case 4:
				ctx.strokeStyle = "#001f3f";
				break;
			case 5:
				ctx.strokeStyle = "#B10DC9";
				break;
		}
		ctx.stroke();
		calcF(i+1);
		document.getElementById("f"+(i+1)).innerHTML = freqs[i].toFixed(2) + " Hz";
	}
}

function playString(stringNum){
	animateString(stringNum);
	i = stringNum-1;
	Synth.play("acoustic",freqs[i],2);
}

function strum(){
	playString(1);
	setTimeout(function(){playString(2)},40);
	setTimeout(function(){playString(3)},80);
	setTimeout(function(){playString(4)},120);
	setTimeout(function(){playString(5)},160);
	setTimeout(function(){playString(6)},200);
}

c.addEventListener('click', (e) => {
	var y = e.clientY;
    if(y<39){playString(1);}
	else if(y<74){playString(2);}
	else if(y<110){playString(3);}
	else if(y<143){playString(4);}
	else if(y<179){playString(5);}
	else {playString(6);}
});

function animateString(stringNum){
	var ampMax = 10;
	var K = .1;
	var t = 0;
	
	var yClearMin = 35*(stringNum-1)-8;
	var yClearHeight = 35;
	var yOff = 10+35*(stringNum-1);
	
	if(lengths[stringNum-1]/.648<.1){ //if the string is very short, animate it more precisely
		var vibrateSegment = 10;
	}
	else{
		var vibrateSegment = 50;
	}
	
	window.requestAnimationFrame(drawStringVibrating);
	
	function drawStringVibrating(){
		ctx.clearRect(0, yClearMin, c.width, yClearHeight);
		ctx.beginPath();
		var i;

		var counter = 0;
		var x = 0;
		var y = yOff;
		var amp = ampMax*Math.exp(-K*t)*Math.sin((2*Math.PI*t/5)); //damped sine wave equation

		var increase = 45/180*Math.PI / (250/vibrateSegment) / (lengths[stringNum-1]/.648); //based on http://jsfiddle.net/Guffa/gmhg61s6/5/
		for(i=0; i<=1000*lengths[stringNum-1]/.648; i+=vibrateSegment){
			ctx.moveTo(x,y);
			x = i;
			y =  yOff - Math.sin(counter) * amp;
			counter += increase;
			 
			ctx.lineTo(x,y);
			ctx.lineWidth = diameters[stringNum-1]*5000;
			switch(stringNum-1){
				case 0:
					ctx.strokeStyle = "#39CCCC";
					break;
				case 1:
					ctx.strokeStyle = "#FF851B";
					break;
				case 2:
					ctx.strokeStyle = "#2ECC40";
					break;
				case 3:
					ctx.strokeStyle = "#AAAAAA";
					break;
				case 4:
					ctx.strokeStyle = "#001f3f";
					break;
				case 5:
					ctx.strokeStyle = "#B10DC9";
					break;
			}
			ctx.stroke();
		}
		ctx.lineTo(1000*lengths[stringNum-1]/.648,10+35*(stringNum-1));
		ctx.lineWidth = diameters[stringNum-1]*5000;
		ctx.stroke();		
		t++;
		if(t<40){window.requestAnimationFrame(drawStringVibrating);}
	}
}

function saveChord(){
	chordName = prompt("Enter a name for this chord");
	document.getElementById("chordButtons").innerHTML += "<button onclick='loadChord(" + '"' + lengths + '"' + ");'>" + chordName + "</button>&nbsp;&nbsp;";
}

function loadChord(lengthsIn){
	lengths = lengthsIn.split(",");
	for(i=0;i<6;i++){
		document.getElementById("length"+(i+1)).value = lengths[i];
	}
	drawStrings();
	strum(); 
}

function cycleChord(chordToShow){
	document.getElementById("standard").style = "display:none;";
	document.getElementById("Am").style = "display:none;";
	document.getElementById("C").style = "display:none;";
	document.getElementById("Dm").style = "display:none;";
	document.getElementById("E").style = "display:none;";
	document.getElementById("Em").style = "display:none;";
	document.getElementById("F").style = "display:none;";
	document.getElementById("G").style = "display:none;";	
	document.getElementById(chordToShow).style = "display:block;";
}