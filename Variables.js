//-----Mathematical constants
var TAU = Math.PI * 2;


//-----Fundamental objects
var ourclock = new THREE.Clock( true );
var delta_t = 0;
var logged = 0;

var Scene;
var Camera;

//until we have a working HMD, we'll just aim to get a sphere in there, then a protein read from a .pdb.
//all you need is to get the contents of the file as a string
//the alternative is that we have a python script that spits out an array. Where to run that though?