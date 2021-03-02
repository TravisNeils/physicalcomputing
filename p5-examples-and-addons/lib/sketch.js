var serial; // variable to hold an instance of the serialport library
var portName = '/dev/ttyACM0' //rename to the name of your port
var datain; //some data coming in over serial!


function setup() {
  // put setup code here
  createCanvas(1200, 800);
  background(255,0,80);
  
}

function draw() {
  // put drawing code here
  ellipse(50, 50, 80, 80);
}

function serialEvent() {
  if (serial.available()) {
      datain = Number(serial.readLine());
    	//console.log(datain);
  }
}
