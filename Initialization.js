function Init(){
	Scene = new THREE.Scene();
	Camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);
	
	Camera.position.set(0,15,10);
}