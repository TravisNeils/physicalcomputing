var serial; // variable to hold an instance of the serialport library
var portName = 'COM5' //'/dev/ttyACM0' //rename to the name of your port
var datain; //some data coming in over serial!
var xPos = 0;

let greeting;
let lastAngle = 0;


function setup() {
  serial = new p5.SerialPort();       // make a new instance of the serialport library
  serial.on('list', printList);       // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing
 
  serial.list();                      // list the serial ports
  serial.open(portName);              // open a serial port
  createCanvas(1200, 800);
  background(240, 240, 240); // a light grey background
  ellipse(400, 400, 600, 600);
  greeting = createElement('h2', 'Lets get measuring, the white circle has a radius of 3 meters.');
  greeting.position(20, 5);
  e_status = createElement('h1', 'Calibrating!!'); // the total th
  e_status.position(500, 500);
}
 
// get the list of ports:
function printList(portList) {
 // portList is an array of serial port names
 for (var i = 0; i < portList.length; i++) {
 // Display the list the console:
   print(i + " " + portList[i]);
 }
}

function serverConnected() {
  print('connected to server.');
}
 
function portOpen() {
  print('the serial port opened.')
}
 
function serialError(err) {
  print('Something went wrong with the serial port. ' + err);
}
 
function portClose() {
  print('The serial port closed.');
}

function serialEvent() {
  if (serial.available()) {
	var datastring = serial.readLine(); // read the serieal input
	let newarray;
	try {
  	  newarray = JSON.parse(datastring); // can we parse the serial
	  console.log(newarray);
  	} catch(err) {
      	  //console.log(err);
	}
	if (typeof(newarray) == 'object'&& lastAngle != newarray['dtheta']) {
	  e_status.html(''); // clear the starting up message
  	  dataarray = newarray; // save it as the data array if it is good.
	  lastAngle = newarray['dtheta'];
	  let angle = 2*Math.PI -dataarray['dtheta']/dataarray['loopsize']*2*Math.PI; // calculate the angle with the steps taken out of total loop.
	  dataarray['x'] = cos(angle)*dataarray['dh']; // use trig to get x coord of measured object.
	  dataarray['y'] = sin(angle)*dataarray['dh']; // use trig to get y coord of measured object.
	  console.log(dataarray);
	}
	//graphData(datastring);
  } 
}

function draw() {
	if(typeof dataarray == 'object'){
		stroke('rgba(0,170,0, 1)'); // change stroke color to green so circles are green 
		ellipse(400+ dataarray['x']/10, 400+dataarray['y']/10, 7, 7); // draw the circle where the point is measured.
		if (dataarray['dtheta'] < 3) {
			background(240, 240, 240);
			stroke('rgba(255, 255,255, 1)'); // green
			ellipse(400, 400, 600, 600);
		}
	}
  
}

