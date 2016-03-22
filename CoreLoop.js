function UpdateWorld(){
}

function ReadInput(){
}

function render() {
	delta_t = ourclock.getDelta();
	if(delta_t > 0.1) delta_t = 0.1;
	//delta_t = 0.01;
	
	ReadInput();
	UpdateWorld();
	
	//setTimeout( function() { requestAnimationFrame( render );}, 100 );
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}
Init();
render();