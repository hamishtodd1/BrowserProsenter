function Download_initial_stuff(PreInitChecklist) {
	//Trp-Cage Miniprotein Construct TC5b, 20 residues: 1l2y. Rubisco: 1rcx
	var testproteinlink = "http://files.rcsb.org/download/1L2Y.pdb";
	var testobjlink = "http://threejs.org/examples/obj/male02/male02.obj"; //TODO don't waste their bandwidth
	
	var OurLoadedThingsLinks = Array();
	OurLoadedThingsLinks[0] = "http://hamishtodd1.github.io/BrowserProsenter/Data/vr_controller_vive_1_5.obj";
	OurLoadedThingsLinks[1] = "gentilis.js";
//	OurLoadedThingsLinks[1] = testproteinlink;
	
	var OurLoadedThings = Array(OurLoadedThingsLinks.length);
	for(var i = 0; i < OurLoadedThingsLinks.length; i++)
		PreInitChecklist.Downloads[i] = 0;
	
	for(var i = 0; i < OurLoadedThingsLinks.length; i++){
		var format;
		//TODO should look for the "."
		if(OurLoadedThingsLinks[i][OurLoadedThingsLinks[i].length - 1] === "/" )
			format = OurLoadedThingsLinks[i].substr(OurLoadedThingsLinks[i].length - 4,3);
		else
			format = OurLoadedThingsLinks[i].substr(OurLoadedThingsLinks[i].length - 3,3);
		
		if(format === "obj")
			Loadobj_initially(OurLoadedThingsLinks[i],i,OurLoadedThings, PreInitChecklist);
		else if( format === "pdb")
			Loadpdb_initially(OurLoadedThingsLinks[i],i,OurLoadedThings, PreInitChecklist);
		else if( format === ".js")
			Loadfont_initially(OurLoadedThingsLinks[i],i,OurLoadedThings, PreInitChecklist);

		else console.log("unrecognized format: " + format);
	}
	
	
	/*
	 * Ok the next thing is sound
	 * You're also going to have a new folder on your github page for all this crap
	 * Aaaand we'll do slides too
	 */
}

function Loadpdb(linkstring, Models)
{
	if(linkstring.length === 4)
	{
		linkstring = "http://files.rcsb.org/download/" + linkstring + ".pdb"
	}
	OurPDBLoader.load(linkstring,
		function ( geometryAtoms, geometryBonds, json ) {
			Models.push( Create_first_model( geometryAtoms ) );
			
			Collisionbox_and_sceneaddition( Models[Models.length - 1] );
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load PDB" ); }
	);
}

function Collisionbox_and_sceneaddition(Model)
{
	Scene.add( Model);
	
	Model.children[0].BoundingBoxAppearance = new THREE.BoxHelper(Model.children[0]);
	if(debugging)
		Model.children[0].BoundingBoxAppearance.visible = true;
	else
		Model.children[0].BoundingBoxAppearance.visible = false;
	
	Scene.add( Model.children[0].BoundingBoxAppearance );
}

function Loadfont_initially(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist)
{
	var OurFontLoader = new THREE.FontLoader();
	OurFontLoader.load(  linkstring, 
		function ( reponse ) {
			gentilis = reponse;
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load font" ); }
	);
}

//separated these out so that "ThisIndex" becomes call-by-parameter
function Loadpdb_initially(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist)
{	
	OurPDBLoader.load(linkstring,
		function ( geometryAtoms, geometryBonds, json ) {
			OurLoadedThings[ThisIndex] = Create_first_model( geometryAtoms );
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load PDB" ); }
	);
}
function Loadobj_initially(linkstring,ThisIndex,OurLoadedThings, PreInitChecklist)
{
	OurOBJLoader.load(linkstring,
		function ( object ) {
			OurLoadedThings[ThisIndex] = object;
			PreInitChecklist.Downloads[ThisIndex] = 1;
			AttemptFinalInit(OurLoadedThings,PreInitChecklist);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load OBJ" ); }
	);
}