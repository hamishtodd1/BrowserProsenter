//the first init
socket.on('OnConnect_Message', function(msg)
{
	Master = msg.Master;
	if(msg.Master)
		console.log("Master");
	else
		console.log("Not master");
	
	var Renderer = new THREE.WebGLRenderer({ antialias: true }); //antialiasing would be nice and we're only aiming for 30fps
	Renderer.setClearColor( 0x101010 );
	Renderer.setPixelRatio( window.devicePixelRatio );
	Renderer.setSize( window.innerWidth, window.innerHeight );
	Renderer.sortObjects = false;
	Renderer.shadowMap.enabled = true;
	Renderer.shadowMap.cullFace = THREE.CullFaceBack;
		
//	var HORIZONTAL_FOV_OCULUS = 110;
	var HORIZONTAL_FOV_VIVE = 110;
//	var HORIZONTAL_FOV_GEAR = 110;
//	var HORIZONTAL_FOV_STAR = 110;
//	
//	var ASPECT_OCULUS = 
	var EYE_PIXELS_HORIZONTAL_VIVE = 1080;
	var EYE_PIXELS_VERTICAL_VIVE = 1200;
	var EYE_ASPECT_VIVE = EYE_PIXELS_HORIZONTAL_VIVE/EYE_PIXELS_VERTICAL_VIVE;
	
	var VERTICAL_FOV_VIVE = HORIZONTAL_FOV_VIVE / EYE_ASPECT_VIVE;
	
	/* Scratch the below, probably, it's vertical that you input.
	 * 
	 * Horizontal FOV (subject to update):
	 * 
	 * Oculus: 110
	 * Vive: 110
	 * GearVR: 96
	 * Google Cardboard: 90
	 * StarVR: 210
	 * 
	 */
	
	document.body.appendChild( Renderer.domElement );
	
	Scene = new THREE.Scene();
	
	//Camera will be added to the scene when the user is set up
	Camera = new THREE.PerspectiveCamera( 70, //VERTICAL_FOV_VIVE, //mrdoob says 70. They seem to change it anyway...
			Renderer.domElement.width / Renderer.domElement.height, //window.innerWidth / window.innerHeight,
			0.001, 700);
	
	Camera.position.copy(INITIAL_CAMERA_POSITION); //initial state subject to change! you may not want them on the floor. Owlchemy talked about this
	var fireplaceangle = msg.Master ? 0 : Math.PI; //called so because they're seated around it
	Camera.position.applyAxisAngle(Central_Y_axis,fireplaceangle);
	Camera.lookAt(new THREE.Vector3());
	
	Add_stuff_from_demo();
//	initVideo();
	
	//us. We'll be added to the user array soon. 
	//This is also the place where this object is "defined"
	InputObject.UserData.push({
		CameraPosition: new THREE.Vector3(),
		CameraQuaternion: new THREE.Quaternion(),
		
		HandPosition: new THREE.Vector3(0,-10000,0), //may get these from somewhere in future
		HandQuaternion: new THREE.Quaternion(),
		
		Gripping: 0,
		ID: msg.ID
	});
	
	//you can add other things to this
	var PreInitChecklist = {
		Downloads: Array()
	};
	
	OurVREffect = new THREE.VREffect( Renderer, Renderer.domElement );
	
	if ( WEBVR.isLatestAvailable() === false ){
//		document.body.appendChild( WEBVR.getMessage() );
	}
	else
	{
		OurVRControls = new THREE.VRControls( Camera,Renderer.domElement );
		if ( WEBVR.isAvailable() === true )
			document.body.appendChild( WEBVR.getButton( OurVREffect ) );
	}
	
	Download_initial_stuff(PreInitChecklist);
});

function PostDownloadInit(OurLoadedThings)
{		 
	var ControllerModel = OurLoadedThings[0].children[1];
	
//	for(var i = 0; i < ControllerModel.geometry.attributes.position.array.length; i++)
//		ControllerModel.geometry.attributes.position.array[i] *= 50;
//	for(var i = 0; i < 8; i++) //hack because units
//		object.scale.multiplyScalar(0.5);
	
	var Models = Array();
	Loadpdb("4ins", Models);
	
	var Users = Array();
	
	Render(Models, Users, ControllerModel);
}