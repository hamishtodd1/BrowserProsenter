//"get position data from other users" and "get our controller data" might be very different abstractions
var InputObject = { //only allowed to use this in this file and maybe in initialization
	UserDisconnect: "",
	UserData: Array(), //maybe the coming values should be properties of the objects? There are probably best practices...
	ModelPositions: Array(),
	ModelQuaternions: Array(),
	ModelsReSynched: 0,
	UserOrbitRequest: new THREE.Vector3(), //vector2, but we may want to cross product
	UserString: "",
	UserPressedEnter: 0,
	clientX: 0,
	clientY: 0
};

function ReadInput(Users, ControllerModel,Models)
{
	//eventually this will do everything that the mouse event listeners and the first "User.getinput" currently does
//	OurVRControls.update();
	
	handle_Connects_and_Disconnects(Users,ControllerModel,Models);
	
	//orbit stuff. GearVR stuff will be very comparable
	{
		var FocussedModelPosition = new THREE.Vector3();
		
		var CameraRelativeToModelZero = Camera.position.clone();
		CameraRelativeToModelZero.sub(FocussedModelPosition); //Models[0].position
		
		var CameraLongtitude = Math.atan2(CameraRelativeToModelZero.z, CameraRelativeToModelZero.x);
		CameraLongtitude += InputObject.UserOrbitRequest.x * 0.01;
		
		var CameraLatitude = Math.atan2(CameraRelativeToModelZero.y, Math.sqrt(
				CameraRelativeToModelZero.z * CameraRelativeToModelZero.z + 
				CameraRelativeToModelZero.x * CameraRelativeToModelZero.x ));
		CameraLatitude += InputObject.UserOrbitRequest.y * 0.0077;
		
		var polerepulsion = 0.01;
		if(Math.abs(CameraLatitude) + polerepulsion > TAU / 4 )
		{
			if( CameraLatitude > 0 )
				CameraLatitude = TAU / 4 - polerepulsion;
			else
				CameraLatitude =-TAU / 4 + polerepulsion;
		}
		
		Camera.position.set(
			CameraRelativeToModelZero.length() * Math.cos(CameraLatitude) * Math.cos(CameraLongtitude),
			CameraRelativeToModelZero.length() * Math.sin(CameraLatitude),
			CameraRelativeToModelZero.length() * Math.cos(CameraLatitude) * Math.sin(CameraLongtitude) );
		Camera.position.add(FocussedModelPosition);
		Camera.lookAt(FocussedModelPosition);
		
		InputObject.UserOrbitRequest.set(0,0,0);
				//don't let them get up to the pole
	}

	if( InputObject.UserPressedEnter === 1 )
	{
		Loadpdb( "http://files.rcsb.org/download/" + InputObject.UserString + ".pdb", Models);
		ChangeUserString("");
		InputObject.UserPressedEnter = 0;
	}
	
	for(var i = 0; i < Users.length; i++)
		Users[i].GetInput();
	
	for(var i = 1; i < Users.length; i++)
	{
		if(Users[i].CameraObject.position.distanceTo(Camera.position) < 1)
			Users[i].CameraObject.visible = false;
		else
			Users[i].CameraObject.visible = true;
	}
	
	if(InputObject.ModelsReSynched && Models.length === InputObject.ModelPositions.length ) //will be destroyed by the possibility of deleting models
	{
		console.log(InputObject.ModelPositions)
		for(var i = 0; i < Models.length; i++)
		{
			Models[i].position.copy(InputObject.ModelPositions[i]);
			Models[i].quaternion.copy(InputObject.ModelQuaternions[i]);
		}
		
		InputObject.ModelsReSynched = 0;
	}
	
	socket.emit('UserStateUpdate', InputObject.UserData[0] ); //we could emit it with every control change?
}

//keyboard crap
document.addEventListener( 'keydown', function(event)
{
	if(event.keyCode !== 74)
	event.preventDefault(); //what if it's j as in ctrl+shift+j?
	
	//might come in handy
//	if( 37 <= event.keyCode && event.keyCode <= 40)
//	{
//		//going to use orbit controls, otherwise we lost the sense of orientation
//		/*
//		 * when mouse goes down, your z goes up
//		 * when mouse goes to the left, you go around to the right
//		 */
//		
//		
//		var movingspeed = 0.8;
//		var turningspeed = 0.05;
//		
//		var forwardvector = Camera.getWorldDirection();
//		forwardvector.setLength(movingspeed);
//		
//		if(event.keyCode === 37)
//			Camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis, turningspeed));
//		if(event.keyCode === 38)
//			Camera.position.add(forwardvector);
//		if(event.keyCode === 39)
//			Camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis,-turningspeed));
//		if(event.keyCode === 40)
//			Camera.position.sub(forwardvector);
//	}
	
	if(event.keyCode === 13) //enter
		InputObject.UserPressedEnter = 1;
	if(event.keyCode === 8) //backspace
		ChangeUserString( InputObject.UserString.slice(0, InputObject.UserString.length - 1) );
	
	//symbols
	{
		var keycodeArray = "0123456789abcdefghijklmnopqrstuvwxyz";
		var arrayposition;
		if( 48 <= event.keyCode && event.keyCode <= 57 )
			arrayposition = event.keyCode - 48;
		if( 65 <= event.keyCode && event.keyCode <= 90 )
			arrayposition = event.keyCode - 55;
		
		if(typeof arrayposition != 'undefined')
		{
			ChangeUserString(InputObject.UserString + keycodeArray[arrayposition]);
		}
	}
	
}, false );

function ChangeUserString(newstring)
{	
	InputObject.UserString = newstring;
	
	//remove the previous string that was in there
	for(var i = 0; i < Scene.children.length; i++)
	{
		if( Scene.children[i].name === "The User's string")
			Scene.remove(Scene.children[i]);
	}
	
	if(newstring === "")
		return;
	
	var TextMesh = new THREE.Mesh(
			new THREE.TextGeometry(newstring,{size: 5, height: 1, font: gentilis}),
			new THREE.MeshPhongMaterial( {
				color: 0x156289,
				emissive: 0x072534,
				shading: THREE.FlatShading
			}) );
	
	var TextCenter = new THREE.Vector3();
	for ( var i = 0, l = TextMesh.geometry.vertices.length; i < l; i ++ ){
		TextCenter.add( TextMesh.geometry.vertices[ i ] );
	}
	
	TextMesh.name = "The User's string";

	TextCenter.multiplyScalar( 1 / TextMesh.geometry.vertices.length );
	TextMesh.position.sub(TextCenter);
	Scene.add(TextMesh);
}

document.addEventListener( 'mousemove', function(event)
{
	event.preventDefault();
	
	if(delta_t === 0) return; //so we get no errors before beginning
	
	if(InputObject.UserData[0].Gripping) //and only if you're not in VR
	{
		console.log("yeah")
		InputObject.UserOrbitRequest.x = event.clientX - InputObject.clientX;
		InputObject.UserOrbitRequest.y = event.clientY - InputObject.clientY;
	}
	
	InputObject.clientX = event.clientX;
	InputObject.clientY = event.clientY;
	
	var vector = new THREE.Vector3(
		  ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight) * 2 + 1,
	    0.5 );
	vector.unproject( Camera );
	var dir = vector.sub( Camera.position ).normalize();
	var distance = - Camera.position.z / dir.z;
	var finalposition = Camera.position.clone();
	finalposition.add( dir.multiplyScalar( distance ) );
	
//	InputObject.UserData[0].HandPosition.copy(finalposition);
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

//bug: will need to think about deleted models somehow. InputObject's arrays have an uncertain length which maybe needs updating?

socket.on('ModelsReSync', function(msg)
{
	if(msg.ModelPositions.length > InputObject.ModelPositions.length)
	{
		for(var i = InputObject.ModelPositions.length; i < msg.ModelPositions.length; i++)
		{
			InputObject.ModelPositions[i] = new THREE.Vector3();
			InputObject.ModelQuaternions[i] = new THREE.Quaternion();
		}
	}
	
	for(var i = 0; i < msg.ModelPositions.length; i++)
	{
		copyvec(InputObject.ModelPositions[i], msg.ModelPositions[i]);
		copyquat(InputObject.ModelQuaternions[i], msg.ModelQuaternions[i]);
	}
	
	InputObject.ModelsReSynched = 1;
});