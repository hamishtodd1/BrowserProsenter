function handle_Connects_and_Disconnects(Users,ControllerModel,ModelZero)
{
	if(Users.length < InputObject.UserData.length)
	{		
		for(var i = Users.length; i < InputObject.UserData.length; i++)
		{
			var CameraArgument;
			if(Users.length === 0){
				CameraArgument = Camera;
				InputObject.UserData[i].CameraPosition.copy(Camera.position);
				InputObject.UserData[i].CameraQuaternion.copy(Camera.quaternion);
			}
			else
				CameraArgument = "you need to make it";
			
			Users[i] = new User(
					InputObject.UserData[i].Gripping, 		InputObject.UserData[i].ID,					ControllerModel,
					InputObject.UserData[i].HandPosition,  	InputObject.UserData[i].HandQuaternion,
					InputObject.UserData[i].CameraPosition,	InputObject.UserData[i].CameraQuaternion, 	CameraArgument);
			
			Scene.add(Users[i].Controller);
			Scene.add(Users[i].CameraObject);
			
			if(Master) //also emit state of every other object
				socket.emit('ModelsReSync', {ModelPosition: ModelZero.position, ModelQuaternion:ModelZero.quaternion} );
		}
	}

	if( InputObject.UserDisconnect !== "" ){
		for(var i = 0; i < InputObject.UserData.length; i++ )
		{
			if( InputObject.UserData[i].ID === InputObject.UserDisconnect ) 
			{
				Scene.remove(Users[i].Controller);
				Scene.remove(Users[i].CameraObject);
				Users.splice(i,1);
				InputObject.UserData.splice(i,1);
				
				InputObject.UserDisconnect = "";
				break;
			}
		}
	}
}

function User(Gripping, ID, ControllerModel,
		HandPosition,HandQuaternion,
		CameraPosition,CameraQuaternion,CameraArgument)
{
	var newUserColor = new THREE.Color(Math.random(),Math.random(),Math.random());
	
	if( CameraArgument === "you need to make it" )
	{
		this.CameraObject = new THREE.Object3D();
		
		CameraRadius = 8;
		
		this.CameraObject.add(new THREE.Mesh( 
				new THREE.CylinderGeometry(CameraRadius, CameraRadius/2, 10, 4), 
				new THREE.MeshBasicMaterial({color:0x000000}) ) );
		
		for(var i = 0; i < this.CameraObject.children[0].geometry.vertices.length; i++)
		{
			this.CameraObject.children[0].geometry.vertices[i].applyAxisAngle(Central_Y_axis, TAU / 8);
			this.CameraObject.children[0].geometry.vertices[i].y += CameraRadius; //really this should be deduced based on aperture
			this.CameraObject.children[0].geometry.vertices[i].applyAxisAngle(Central_X_axis, -TAU / 4);
		}
		
		this.CameraObject.add(new THREE.Mesh( 
				new THREE.BoxGeometry(
						CameraRadius * Math.sqrt(2),
						CameraRadius * Math.sqrt(2),
						CameraRadius * Math.sqrt(2),
						CameraRadius * Math.sqrt(2) ), 
						new THREE.MeshBasicMaterial({}) ) );
		this.CameraObject.children[1].material.color.copy(newUserColor);
	}
	else {
		this.CameraObject = CameraArgument;
	}
	
	
//	this.CameraObject.position.copyvec(CameraPosition);
	copyvec(this.CameraObject.position,CameraPosition);
	copyquat(this.CameraObject.quaternion,CameraQuaternion);
//	this.CameraObject.quaternion.copy(CameraQuaternion);
	console.log(CameraQuaternion,CameraPosition)
	
	this.Controller = ControllerModel.clone();
	this.Controller.material = ControllerModel.material.clone();
	this.Controller.material.color.copy(newUserColor);

	this.Controller.position.copy(HandPosition);
	
	//this can be removed once you have tracking
	{
		this.Controller.lookAt(this.CameraObject.position);
		this.Controller.rotateOnAxis(Central_X_axis, TAU / 4);
		copyquat(HandQuaternion,this.Controller.quaternion);
	}
	
	this.Gripping = Gripping;
	this.GetInput = GetInput;
	this.ID = ID;
}

//becomes a function associated with the Users
function GetInput()
{
	for(var i = 0; i < InputObject.UserData.length; i++ ) {
		if(InputObject.UserData[i].ID === this.ID)
		{
			//silly but temporary. When proper controls come along we will not update the first one at all here
			if(Camera.uuid === this.CameraObject.uuid)
			{
				//heh, we could detatch and then reattach
				//we change the camera position during the loop
				Scene.update();
				this.Controller.updateMatrixWorld();
				Camera.updateMatrix();
				Camera.updateMatrixWorld();
				
				var worldspacePosition = Camera.position.clone();
				Camera.localToWorld(worldspacePosition);
//				this.Controller.localToWorld(worldspacePosition);
//				worldspacePosition.applyMatrix4(Camera.matrix);
				
				copyvec(  InputObject.UserData[i].CameraPosition,	worldspacePosition);
				copyquat( InputObject.UserData[i].CameraQuaternion,	this.CameraObject.quaternion);
			}
			else
			{
				copyvec(  this.CameraObject.position,	InputObject.UserData[i].CameraPosition );
				copyquat( this.CameraObject.quaternion,	InputObject.UserData[i].CameraQuaternion );
			}
			
			copyvec( this.Controller.position,		InputObject.UserData[i].HandPosition);
			copyquat(this.Controller.quaternion, 	InputObject.UserData[i].HandQuaternion);	
			this.Gripping = InputObject.UserData[i].Gripping;
			
			this.Controller.updateMatrixWorld();
			
			break;
		}
	}
}

socket.on('UserStateUpdate', function(msg)
{
	//note that this will not happen if InputObject.UserData.length === 0. i.e. first user will be us.
	for(var i = 0; i < InputObject.UserData.length; i++ ) {
		if(msg.ID === InputObject.UserData[i].ID ) {
			copyvec(	InputObject.UserData[i].CameraPosition, 	msg.CameraPosition);
			copyquat(	InputObject.UserData[i].CameraQuaternion, 	msg.CameraQuaternion);
			copyvec(	InputObject.UserData[i].HandPosition,		msg.HandPosition);
			copyquat(	InputObject.UserData[i].HandQuaternion,		msg.HandQuaternion);
			InputObject.UserData[i].Gripping = msg.Gripping;
			
			break;
		}
		
		if(i === InputObject.UserData.length - 1){
			//Couldn't find our user. So, new user
			InputObject.UserData.push(msg);
		}
	}
});

socket.on('UserDisconnected', function(msg)
{
	if(InputObject.UserDisconnect !== ""){
		var textGeo = new THREE.TextGeometry( "TWO USERS DISCONNECTED SIMULTANEOUSLY!!!", {

			font: font,

			size: size,
			height: height,
			curveSegments: curveSegments,

			bevelThickness: bevelThickness,
			bevelSize: bevelSize,
			bevelEnabled: bevelEnabled,

			material: 0,
			extrudeMaterial: 1

		});
		var mat = new THREE.MultiMaterial( [
			new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } ), // front
			new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading } ) // side
		] );
		Scene.add(new THREE.Mesh(textGeo,mat));
	}
		
	InputObject.UserDisconnect = msg;
});