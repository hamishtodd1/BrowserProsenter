function Download_initial_stuff(PreInitChecklist) {
	//Trp-Cage Miniprotein Construct TC5b, 20 residues
	var testproteinlink = "http://files.rcsb.org/download/1L2Y.pdb";
	var testobjlink = "http://threejs.org/examples/obj/male02/male02.obj"; //TODO don't waste their bandwidth!
	
	var OurLoadedThingsLinks = Array();
	OurLoadedThingsLinks[0] = testproteinlink;
	OurLoadedThingsLinks[1] = "http://hamishtodd1.github.io/BrowserProsenter/Data/vr_controller_vive_1_5.obj";
//	OurLoadedThingsLinks[2] = "http://hamishtodd1.github.io/BrowserProsenter/Data/vr_controller_vive_1_5.mtl";
	
	var OurLoadedThings = Array(OurLoadedThingsLinks.length);
	for(var i = 0; i < OurLoadedThingsLinks.length; i++)
		PreInitChecklist.Downloads[i] = 0;
	
	for(var i = 0; i < OurLoadedThingsLinks.length; i++){
		var format;
		//TODO should look for the "."
		if(OurLoadedThingsLinks[i][OurLoadedThingsLinks[i].length - 1] === "/" )
			format = OurLoadedThingsLinks[i].substr(OurLoadedThingsLinks[i].length - 5,4);
		else
			format = OurLoadedThingsLinks[i].substr(OurLoadedThingsLinks[i].length - 4,4);
		
		if(format === ".obj")
			Loadobj(OurLoadedThingsLinks[i],i,OurLoadedThings, PreInitChecklist);
		else if( format === ".pdb")
			Loadpdb(OurLoadedThingsLinks[i],i,OurLoadedThings, PreInitChecklist);
		else if(format === ".mtl")
			Loadmtl(OurLoadedThingsLinks[i],i,OurLoadedThings, PreInitChecklist);
		else console.log("unrecognized format: " + format);
	}
}

//need these separated out so that "ThisIndex" becomes call-by-parameter
function Loadpdb(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist){
	var OurPDBLoader = new THREE.PDBLoader();	
	OurPDBLoader.load(linkstring,
		function ( geometryAtoms, geometryBonds, json ) {
			OurLoadedThings[ThisIndex] = Create_first_model( geometryAtoms );
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist)
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load PDB" ); }
	);
}
function Loadobj(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist){
	var OurOBJLoader = new THREE.OBJLoader();
	OurOBJLoader.load(linkstring,
		function ( object ) {
			OurLoadedThings[ThisIndex] = object;
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist)
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load OBJ" ); }
	);
}

function Loadmtl(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist){
	var OurMTLLoader = new THREE.MTLLoader();
	OurMTLLoader.load(linkstring,
		function ( materials ) {
			materials.preload();
			var objLoader = new THREE.OBJLoader();
			objLoader.setMaterials( materials );
			objLoader.setPath( '' );
			objLoader.load( linkstring.substr(0,OurLoadedThingsLinks[i].length - 3) + "obj", //bit of an assumption
				function ( object ) {
					OurLoadedThings[ThisIndex] = object;
					PreInitChecklist.Downloads[ThisIndex] = 1;
					AttemptFinalInit(OurLoadedThings,PreInitChecklist)
				},
				function ( xhr ) {}, //progression function
				function ( xhr ) { console.error( "couldn't load OBJ partnered to MTL" ); } );
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load MTL" ); }
	);
}