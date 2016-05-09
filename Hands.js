function UpdateHands(ModelZero,Users)
{	
	//aesthetic stuff
	if(Users[0].Controller.Gripping){
//		Users[0].Controller.material.color.g = 1;
//		Users[0].Controller.scale.set(0.8,0.8,0.8);
	}
	else {
//		Users[0].Controller.material.color.g = 0;
//		Users[0].Controller.scale.set(1,1,1);
	}
	
	//The only camera in the scene that can be gripped is the real camera.
	//Note this does introduce minor disagreement - for the person whose controller it is, they're not holding that camera.
	
	
	
	for(var i = 0; i < Users.length; i++){
		if(Users[i].Gripping)
		{
			if( point_in_BoxHelper(Users[i].Controller.position,
					ModelZero.children[0].BoundingBoxAppearance.geometry.attributes.position.array) )
			{
				var alreadyholdingthisobject = 0;
				for(var j = 0; j < Users[i].Controller.children.length; j++){
					if(Users[i].Controller.children[j].uuid === ModelZero.uuid)
						alreadyholdingthisobject = 1;
				}
				
				if(!alreadyholdingthisobject)
				{
					Users[i].Controller.updateMatrixWorld();
					THREE.SceneUtils.attach(ModelZero, Scene, Users[i].Controller);
				}
			}
			
			//i > 0 because it's hard to think of a situation in which you want to hold your own camera
			if( i > 0 && Users[i].Controller.position.distanceTo( Camera.position ) < 30.4 )
			{
				var alreadyholdingthisobject = 0;
				for(var j = 0; j < Users[i].Controller.children.length; j++)
				{
					if(Users[i].Controller.children[j].uuid === Camera.uuid)
						alreadyholdingthisobject = 1;
				}
				
				if(!alreadyholdingthisobject)
				{
					Users[i].Controller.updateMatrixWorld();
					THREE.SceneUtils.attach(Camera, Scene, Users[i].Controller);
				}
			}
		}
		else{
			Users[i].Controller.updateMatrixWorld();
			for(var j = 0; j < Users[i].Controller.children.length; j++){
//				Users[i].Controller.children[j].updateMatrix();
				//could you be doing something funny elsewhere with camera? YEOP
				//could it be that picking it up should be triggering some matrix thing and that's failing to happen?
				Users[i].Controller.children[j].updateMatrixWorld();
				THREE.SceneUtils.detach(Users[i].Controller.children[j], Users[i].Controller, Scene);
				console.log(Camera.position, Camera.quaternion)
			}
		}
	}
}

function point_in_BoxHelper(ourpoint,boxgeometryarray){
	//going to assume that these always hold true
	var maxX = boxgeometryarray[0];
	var maxY = boxgeometryarray[1];
	var maxZ = boxgeometryarray[2];
	
	var minX = boxgeometryarray[18];	
	var minY = boxgeometryarray[19];	
	var minZ = boxgeometryarray[20];
	
	if( minX <= ourpoint.x && ourpoint.x <= maxX &&
		minY <= ourpoint.y && ourpoint.y <= maxY &&
		minZ <= ourpoint.z && ourpoint.z <= maxZ )
		return 1;
	else return 0;
}