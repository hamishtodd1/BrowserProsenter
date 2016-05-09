//"get position data from other users" and "get our controller data" might be very different abstractions
var InputObject = { //only allowed to use this in this file and maybe in initialization
	UserDisconnect: "",
	UserData: Array(), //maybe the coming values should be properties of the objects? There are probably best practices...
	ModelPosition: new THREE.Vector3(),
	ModelQuaternion: new THREE.Quaternion(),
	ModelsReSynched: 0
};

function ReadInput(Users, ControllerModel,ModelZero)
{
	//eventually this will do everything that the mouse event listeners and the first "User.getinput" currently does
//	OurVRControls.update();
	
	handle_Connects_and_Disconnects(Users,ControllerModel,ModelZero);
	
//	if(Master)
//		InputObject.UserData[0].HandQuaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis, TAU / 60 / 20) );
//	if(Master)
//		InputObject.UserData[0].CameraQuaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis, TAU / 60 / 20) );
		
	for(var i = 0; i < Users.length; i++)
		Users[i].GetInput();
	
	for(var i = 1; i < Users.length; i++)
	{
		if(Users[i].CameraObject.position.distanceTo(Camera.position) < 1)
			Users[i].CameraObject.visible = false;
		else
			Users[i].CameraObject.visible = true;
	}
	
	if(InputObject.ModelsReSynched){
		ModelZero.position.copy(InputObject.ModelPosition);
		ModelZero.quaternion.copy(InputObject.ModelQuaternion);
		InputObject.ModelsReSynched = 0;
	}
	
	socket.emit('UserStateUpdate', InputObject.UserData[0] ); //we could emit it with every control change?
}


document.addEventListener( 'mousemove', function(event)
{
	event.preventDefault();
	
	if(delta_t === 0) return; //so we get no errors before beginning
	
	var vector = new THREE.Vector3(
		  ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight) * 2 + 1,
	    0.5 );
	vector.unproject( Camera );
	var dir = vector.sub( Camera.position ).normalize();
	var distance = - Camera.position.z / dir.z;
	var finalposition = Camera.position.clone();
	finalposition.add( dir.multiplyScalar( distance ) );
	
	InputObject.UserData[0].HandPosition.copy(finalposition);
	
}, false );


document.addEventListener( 'mousedown', function(event) 
{
	event.preventDefault();
	
	InputObject.UserData[0].Gripping = 1;
}, false );

document.addEventListener( 'mouseup', function(event) 
{
	event.preventDefault();
	
	InputObject.UserData[0].Gripping = 0;
}, false );

socket.on('ModelsReSync', function(msg)
{
	copyvec(InputObject.ModelPosition, msg.ModelPosition);
	copyquat(InputObject.ModelQuaternion, msg.ModelQuaternion);
	InputObject.ModelsReSynched = 1;
});