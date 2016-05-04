//A live fish

function UpdateWorld(ModelZero,Hands){
	
//	ModelZero.rotateOnAxis(Central_Y_axis, TAU / 60 / 16);

	UpdateHands(ModelZero,Hands);
	
	ModelZero.children[0].BoundingBoxAppearance.update(ModelZero);
	
//	if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
//	{
//		videoImageContext.drawImage( video, 0, 0 );
//		if ( videoTexture ) 
//			videoTexture.needsUpdate = true;
//	}
}

function Render(ModelZero,Users, ControllerModel) {
	delta_t = ourclock.getDelta();
//	if(delta_t > 0.1) delta_t = 0.1;
	
	ReadInput(Users, ControllerModel,ModelZero);
	UpdateWorld(ModelZero, Users);
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 ); //debugging only
	requestAnimationFrame( function(){
		Render(ModelZero,Users,ControllerModel);
	} );
	OurVREffect.render( Scene, Camera );
}
