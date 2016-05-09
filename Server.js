var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var MasterID = "none";

app.use(express.static(__dirname ));

//No idea what these things are. Just sends the damn page. 
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//want to make it so there is always a demonstrator, it is annoying to have to restart in the window

io.on('connection', function(socket){
	//these are called when it happens
	if(MasterID === "none"){
		MasterID = socket.id;
		io.to(socket.id).emit('OnConnect_Message', {ID:socket.id,Master:1});
	}
	else
		io.to(socket.id).emit('OnConnect_Message', {ID:socket.id,Master:0});
	
	socket.broadcast.on('UserStateUpdate', function(msg){
		socket.broadcast.emit('UserStateUpdate', msg);
	});
	
	socket.broadcast.on('ModelsReSync', function(msg){
		socket.broadcast.emit('ModelsReSync', msg);
	});
	
	socket.on('disconnect', function () {
		if(socket.id === MasterID)
			MasterID = "none";
		
		//also, remove the copies from all the scenes
		socket.broadcast.emit('UserDisconnected', socket.id);
	});
});

http.listen(3000, function(){
	console.log('Server is listening on localhost:3000, go there in a browser');
});

//Temporarily: we have connection 0, the lecturer, and other connections are spectators who share a camera