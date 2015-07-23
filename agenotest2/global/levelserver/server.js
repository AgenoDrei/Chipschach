//Requirements - see sever.js in global/sever
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

var PATH_SAVE = "./global/levelserver/level/";
var PATH_SEND = "./global/sever/level/";


// HTTP-Server
var server = http.createServer(function(req, res) {
	res.writeHead(404);
	res.end();
});

//global Varibales
var PORT = 1765; //Server Port
var connection = null; //current connection store

server.listen(PORT, function() { //start http server
	console.log("Server bound to port " + PORT);
});

//Upgrade http server to WebSocket
var wsserver = new WebSocketServer({
	httpServer : server,
	autoAcceptConnections : false
});


//when a new connection is established
wsserver.on("request", function(req) {
	if (connection == null) {// No connection, this will be the connection
		connection = req.accept("kekse", req.origin);
		console.log("Connection " + connection.remoteAddress + " accepted.");
		connection.sendUTF('{"type": "hello"}');
	} else { // We're full, go away!
		req.reject();
		return;
	}

	//when the client send a message
	connection.on("message", function(message) {

		console.log("Client : ", JSON.parse(message.utf8Data)); 
		
		evaluate(connection, message); //evaluates the message
		
	});
	
	//when the connection is closed
	connection.on("close", function(reasonCode, description) {
		console.log("Connection " + connection.remoteAddress + " closed (reason: " + reasonCode + ").");
		connection.sendUTF('{"type": "exit"}'); //send exit to client
		connection = null; //reset the connection
	});

});

/*
 * evaluates the message, see the protocol in the wiki
 */
function evaluate(connection, message) {
	try {
		var m = JSON.parse(message.utf8Data); //parse client string to object
	} catch (e) { // No valid JSON, send error
		connection.sendUTF('{"type": "error", "message": "json"}');
		return;
	}

	// Evaluation
	switch (m.type) {
	case "lvl": // send positive feedback to client, level was saved 
			connection.sendUTF('{"type" : "lvl", "message": "saved"}')
			saveLevel(m);
			connection.sendUTF('{"type": "exit"}');
			connection = null;
		break;
	case "get": //send a list of all level files to the client
		getFiles(connection);
		break;
	default:
		connection.sendUTF('{"type": "error", "message": "cmd"}');
		break;
	}
}

/*
 * this function saves a level send by the client to the server
 * 
 * m: message object with all the infos from the client
 */
function saveLevel(m) {
	fs.writeFile(PATH_SAVE + m.filename+".js", 'Level = ' + JSON.stringify(m), function(err) { //write string to file, getting infos out of the message object
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	}); 
}

/*
 * this function sends a list of files in the level folder to the client
 * 
 * connection: current connection
 */
function getFiles(connection) {
	var names = [];
	var description = [];
	fs.readdir(PATH_SEND, function(err, files) { //read files in folder
		if(err) { //is there error? Just disconnect
	        console.log(err);
	        connection.sendUTF('{"type": "exit"}');
			connection = null;
	    } else { //send all the files
	    	for(var i = 0; i < files.length; i++) {
	    		var string = fs.readFileSync(PATH_SEND + files[i], 'utf8').slice(8);
	    		var json = JSON.stringify(eval("(" + string + ")"));
	    		names[i] = JSON.parse(json).name;
	    		description[i] = JSON.parse(json).description
	    	}
	    	var obj = {
	    			"type" : "get",
	    			"files": files,
	    			"names" : names,
	    			"description" : description
	    	}
	    	connection.send(JSON.stringify(obj));
	    	console.log(obj.files);
	        console.log("The filenames were send!");
	        connection.sendUTF('{"type": "exit"}'); //send client a message to disconnect from server
			connection = null;
	    }
	});
}