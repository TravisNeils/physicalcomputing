var serial; // variable to hold an instance of the serialport library
var portName = 'COM5' //'/dev/ttyACM0' //rename to the name of your port
var datain; //some data coming in over serial!
var xPos = 0;
//var dataarray = {"dht" :68.00,"thermistor" :577,"button":0};

let input, p_button, greeting;
let sent_stop = false;

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
  
  
  // Create a toggle power button set its position and what will happen with pressed.
  p_button = createButton('Toggle power'); 
  p_button.position(20, 65);
  p_button.mousePressed(transistor);
  
  // Create a toggle power button set its position and what will happen with pressed.
  f_button = createButton('Toggle fan');
  f_button.position(p_button.x + p_button.width + 5, 65);
  f_button.mousePressed(fans);
  
  // Create a toggle power button set its position and what will happen with pressed.
  e_button = createButton('EMERGENCY STOP (no power + turn on fan)');
  e_button.position(f_button.x + f_button.width + 5, 65);
  e_button.mousePressed(emergency);

  // Create a toggle power button set its position and what will happen with pressed.
  greeting = createElement('h2', 'Green is DHT value, blue is voltage from thermistor.');
  greeting.position(20, 5);
  
  // Create a toggle power button set its position and what will happen with pressed.
  a_status = createElement('h3', 'power off, fan off');
  a_status.position(p_button.x, p_button.y + p_button.height + 10);
  
  // Create a toggle power button set its position and what will happen with pressed.
  b_status = createElement('h3', 'temp unknown');
  b_status.position(a_status.x, a_status.y + a_status.height + 10);
  
  // Create a toggle power button set its position and what will happen with pressed.
  e_status = createElement('h1', 'Starting up!!');
  e_status.position(500, 500);
  
  // Create a toggle power button set its position and what will happen with pressed.
  textAlign(CENTER);
  textSize(50);
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
	
	//console.log(datastring);
	try {
  	  newarray = JSON.parse(datastring); // can we parse the serial
	  console.log(newarray);
  	} catch(err) {
      	  //console.log(err);
	}
	
	// check if the array exists/ is valid
	if (typeof(newarray) == 'object') {
  	  dataarray = newarray; // save it as the data array if it is good. 
	  let offons = ['off', 'on']; // so that offons[boolean] will return if the thing is on of off.
	  
	  // display the power and fan status.
	  a_status.html('power ' + offons[dataarray['power']] + ', fan ' + offons[dataarray['fans']]); 
	  
	  // check if the button was pressed.
	  if(dataarray['button']){
		 // ensure that I don't run this fucntion 50 times when the button is pressed. max as 1 pre 2 seconds. 
		if(!sent_stop){
			console.log('button pressed');
			serial.write('e'); // let the arduino no to execute the stop power start fans.
			//display on center of screen the message
			e_status.html('Stop button was pressed. Fan starting, power stopping.');
			sent_stop = true;
		}
		
	  } else {
		e_status.html(''); // clear the message in the center
		sent_stop = false; // reset the stop setting if the button is no longer pressed, so it can be pressed again. 
	  }
	  
	  // do the math th find the voltage.
	  let thermistorV = parseFloat(dataarray['thermistor']) / 1024.0 * 5
	  // V = 5 * R / (R + 10k)
	  // V(R + 10k) = 5 * R
	  // VR - 5R = -10kV
	  // R = 10kV/(5-V)
	  let thermistorR = 10000.0* thermistorV /(5.0 - thermistorV); // clalculate resistance from the voltage.
	  
	  b_status.html('DHT ' + dataarray['dht'] + 'deg F , thermistor ' + thermistorV + ' V,  '+ thermistorR + ' Ohms '); // display the calcualted values.
	}
	// console.log("got back " + datastring);


  } 
}

function graphData(newData) {
  let increment = 9; // I will only plot every nth value and this is n.
  if (xPos % increment == 0){
	// map the range of the input to the window height:
	var yPos = map(newData, 0, 255, 0, height);
	//plot the value as a line with height dependednt on the varaible. 
	line(xPos / increment, height, xPos / increment, height - yPos);
  }
  
  // at the edge of the screen, go back to the beginning:
  if (xPos >= width * increment) {
    xPos = 0;
    // clear the screen by resetting the background:
    background(240, 240, 240); // a light grey background
  } else {
    // increment the horizontal position for the next reading:
    xPos++;
  }
}

function draw() {
  if(typeof dataarray == 'object'){
	  stroke('rgba(0,170,0, 1)'); // green
	  graphData(dataarray['dht']); 

	  stroke('rgba(30,0,200, 1)'); // blue
	  // translate the tranistor vlaue to somehtingo nthe same scales as the DHT, not accurate in scale but lets us see changes. Together. 
	  let translatedval = (1023 - dataarray['thermistor'])/10;
	  graphData(translatedval);
	  graphData();
	  xPos++; 
  } else {
	text('serial not connected');
  }
  
}

// tell the Arduino to toggle power value
function transistor() {
  serial.write('p');
}

// tell the Arduino to toggle fans value
function fans() {
  serial.write('f');
}

// tell the Arduino to go into emergency mode
function emergency() {
  serial.write('e');
}

