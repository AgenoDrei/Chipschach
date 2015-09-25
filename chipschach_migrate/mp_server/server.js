//Requirements
var WebSocketServer = require('websocket').server; //Websockets
var game = require('./logic.js'); //Game Logic
var http = require('http');	//HTTP-Server


// HTTP-Server
var server = http.createServer(function(req, res) {
	res.writeHead(404);
	res.end();
});

//Constants
var PORT = (process.env.VCAP_APP_PORT || 3001);		//Server-Port
var ADDRESS = '0.0.0.0'	//Server-Address
var MAXROOMS = 5;  		//Amount of open server rooms
var DEBUG = true;
var ID = 42 - 1; //Because ... reasons

server.listen(PORT, function() { //start http server
	console.log("Server bound to port " + PORT);
	// require('dns').lookup(require('os').hostname(), function (err, add, fam) { //get the ip address
		  // console.log('Server is on: '+add);
		// })
});

// Upgrade http server to WebSocket
var wsserver = new WebSocketServer({
	httpServer : server,
	autoAcceptConnections : false //hey i will do that
});

//Construct for a single game Room
function Room() {
	this.connection1 = null;
	this.connection2 = null;
	this.game = null;	//Store the game logic object
	this.currentTurn = 1;
	this.name = null;
	this.id = -1;
}
var rooms = []; //Store for the rooms
exports.rooms = rooms;

//Create 5 [MAXROOMS] empty rooms
for(var i = 0; i < MAXROOMS; i++) {
	rooms[i] =  new Room();
}

//When a new connection is opened
wsserver.on("request", function(req) {
	ID++;
    console.log("Server: New Connection " + req.origin);
	var connection = req.accept("kekse", req.origin); //Accept connection with "kekse" protocol
	console.log("Connection " + connection.remoteAddress + " accepted.");
	
	/*for(var i = 0; i < MAXROOMS; i++) {	//Search for an empty room
		if(rooms[i].connection1 == null) { //Hey we got one, Yay
			var connection = req.accept("kekse", req.origin); //Accept connection with "kekse" protocol
			console.log("Connection " + connection.remoteAddress + " accepted."); 
			rooms[i].connection1 = connection;	//Hand over the connection to the latest room
			rooms[i].connection1.sendUTF('{"type": "hello", "player": "1"}'); //Send a welcome to the new connection
			rooms[i].game = new game.Game(i);  //Create a new game logic in the room
			if(DEBUG)console.log("Server : ", '{"type": "hello", "player": "1"}');
			break; //Nothing else to do, go and play!
		} else if(rooms[i].connection1 != null && rooms[i].connection2 == null) { //No empty rooms? Search for one with only one connection
			var connection = req.accept("kekse", req.origin); //Same stuff as above
			console.log("Connection " + connection.remoteAddress + " accepted.");
			rooms[i].connection2 = connection;
			rooms[i].connection2.sendUTF('{"type": "hello", "player": "2"}');
			rooms[i].connection1.sendUTF('{"type": "enemy", "player": "2"}'); //Player 1 has to know his enemy
			rooms[i].game.sendLevel(); //Send the Level to both players
			rooms[i].game.sendDetails(); //Send some Level information
			if(DEBUG)console.log("Server : ", '{"type": "hello", "player": "2"}');
			if(DEBUG)console.log("Server : ", '{"type": "enemy", "player": "2"}');
			break;
		} else if(i == MAXROOMS-1) {
			req.reject(); //We're full, go away!
			return;
		}
	}*/
	
	//When a client sends a message
	connection.on("message", function(message) {

		if(DEBUG)console.log("Client : ", JSON.parse(message.utf8Data));
		
		evaluate(connection, message); //Do some stuff with it, analytics you know :P
		
	});
	
	//When a client closes the connection
	connection.on("close", function(reasonCode, description) {

		console.log("Connection " + connection.remoteAddress + " closed (reason: " + reasonCode + ").");

		endGame(connection); //Close all connections
	});

});

//Evaluates the message -> look at the protocol in the wiki
function evaluate(connection, message) {
	try {
		var m = JSON.parse(message.utf8Data);	//get a object from the datastring
	} catch (e) { // No valid JSON, send error
		connection.sendUTF('{"type": "error", "message": "json"}'); //No valid string 
		return;
	}
	
	if(m.type == "hello") {
		if(m.player == '1') {
			for(var i = 0; i < MAXROOMS; i++) {	//Search for an empty room
				if(rooms[i].connection1 == null) { //Hey we got one, Yay
					rooms[i].connection1 = connection;	//Hand over the connection to the latest room
					rooms[i].name = m.name;
					rooms[i].connection1.sendUTF('{"type": "hello", "player": "1"}'); //Send a welcome to the new connection
					rooms[i].game = new game.Game(i);  //Create a new game logic in the room
					rooms[i].id = ID;
					if(DEBUG)console.log("Server : ", '{"type": "hello", "player": "1"}');
				break; //Nothing else to do, go and play!
				} else {
					connection.sendUTF('{"type": "exit", "msg": "No free Server Rooms!"}');
				}
			}
		} else if(m.player == '2') {
			for(var i = 0; i < MAXROOMS; i++) {
				if(rooms[i].name == m.name && rooms[i].connection2 == null) { //Search for correct room
					rooms[i].connection2 = connection;
					rooms[i].connection2.sendUTF('{"type": "hello", "player": "2"}');
					rooms[i].connection1.sendUTF('{"type": "enemy", "player": "2"}'); //Player 1 has to know his enemy
					rooms[i].game.sendLevel(); //Send the Level to both players
					rooms[i].game.sendDetails(); //Send some Level information
					if(DEBUG)console.log("Server : ", '{"type": "hello", "player": "2"}');
					if(DEBUG)console.log("Server : ", '{"type": "enemy", "player": "2"}');
					break;
				} else {
					connection.sendUTF('{"type": "exit", "msg" : "There does not exist a Server with that name!"}');
				}
			}
		}		
	} else {
		//Search for the room, where the current connection is saved
		var roomID;
		for(i = 0; i < MAXROOMS; i++) 
			if(rooms[i].connection1 == connection || rooms[i].connection2 == connection) { //player 1 or 2
			roomID = i;
		}
		if(DEBUG)console.log('Room ID: ' + roomID);
			
		// Evaluation
		switch (m.type) { //see protocol
		case "turn": // Client sends a turn order
				if ((rooms[roomID].currentTurn == 1 && rooms[roomID].connection1 == connection) //Is it the turn of the client 1....
					|| (rooms[roomID].currentTurn == 2 && rooms[roomID].connection2 == connection)) { //... or 2?
				var gameState = rooms[roomID].game.turn(convertPlayer(rooms[roomID].currentTurn), m.x, m.y, m.oldX, m.oldY); //Let the game logic do its work
				respond(connection, m, gameState, roomID); //Answer the client
			}
				else 
					connection.sendUTF('{"type": "error", "message": "turn"}'); //It is not your turn!
			
			break;
		case "setGameProperties": //which level, which difficulty: set to 2
			rooms[roomID].game.setGameProperties(m.name, 2);
			break;
		case "undo": //Not used, only debug
			rooms[roomID].game.undo(rooms[roomID].currentTurn);
			break;
		case 'yield':
			rooms[roomID].game.yield(convertPlayer(rooms[roomID].currentTurn));
			break;
		default: //Not used in the protocol
			connection.sendUTF('{"type": "error", "message": "cmd"}');
			break;
		}
	}
}

/*
 * Respond to the client dependent on the gameState
 * 
 *  0: normal turn, is allowed
 *  1: turn allowed, player 1 wins
 *  2: turn allowed, player 2 wins
 *  
 *  -1: turn forbidden, the player was put in check
 *  -2: turn forbidden, field blocked, or invalid turn	
 *  
 */
function respond(connection, m, gameState, roomID) {
	// Check wether the turn is allowed/someone won
	switch (gameState) {
	case 0:
		// Turn allowed
		rooms[roomID].connection1.sendUTF('{"type": "turn", "x": "' + m.x + '", "y": "' + m.y + '", "oldX": "' + m.oldX + '", "oldY": "' + m.oldY + '", "player": "' + rooms[roomID].currentTurn + '"}');
		rooms[roomID].connection2.sendUTF('{"type": "turn", "x": "' + m.x + '", "y": "' + m.y + '", "oldX": "' + m.oldX + '", "oldY": "' + m.oldY + '", "player": "' + rooms[roomID].currentTurn + '"}');
		if (rooms[roomID].currentTurn == 1)
			rooms[roomID].currentTurn = 2;
		else
			rooms[roomID].currentTurn = 1;
		break;
	case 1:
		// Turn allowed
		rooms[roomID].connection1.sendUTF('{"type": "win", "x": "' + m.x + '", "y": "' + m.y + '", "oldX": "' + m.oldX + '", "oldY": "' + m.oldY + '", "player": "' + rooms[roomID].currentTurn + '"}');
		rooms[roomID].connection2.sendUTF('{"type": "win", "x": "' + m.x + '", "y": "' + m.y + '", "oldX": "' + m.oldX + '", "oldY": "' + m.oldY + '", "player": "' + rooms[roomID].currentTurn + '"}');
//		endGame(connection); // end the game
		break;
	case 2:
		// Turn allowed, player 2 wins
		rooms[roomID].connection1.sendUTF('{"type": "win", "x": "' + m.x + '", "y": "' + m.y + '", "oldX": "' + m.oldX + '", "oldY": "' + m.oldY + '", "player": "' + rooms[roomID].currentTurn + '"}');
		rooms[roomID].connection2.sendUTF('{"type": "win", "x": "' + m.x + '", "y": "' + m.y + '", "oldX": "' + m.oldX + '", "oldY": "' + m.oldY + '", "player": "' + rooms[roomID].currentTurn + '"}');
//		endGame(connection); //end the game
		break;
	case -1:
		// Turn forbidden, check
		connection.sendUTF('{"type": "error", "message": "check"}');
		break;
	case -2:
		// Turn forbidden, no valid turn
		connection.sendUTF('{"type": "error", "message": "impossible"}');
		break;
	}
}

/*
 * Closes all connections
 */
function endGame(connection) {
	var roomID = -1;
	//Search the affected room
	for (i = 0; i < MAXROOMS; i++) {
		if (rooms[i].connection1 == connection || rooms[i].connection2 == connection) {
			roomID = i;
		}
	}
	//if the conneciton is already closed do nothing
	if(roomID == -1) return;

	try {
		//message for the clients to disconnect
		rooms[roomID].connection1.sendUTF('{"type": "exit"}');
		rooms[roomID].connection2.sendUTF('{"type": "exit"}');

	} catch (e) {
	} finally {
		//reset the game room
		rooms[roomID].currentTurn = 1;
		rooms[roomID].connection1 = null;
		rooms[roomID].connection2 = null;
		rooms[roomID].game.clear();
	}
}

/*
 * only important for the game logic, sends messsage to both player in the affected room
 */
exports.sendToPlayers = function(text, i) {
	rooms[i].connection1.sendUTF(text);
	rooms[i].connection2.sendUTF(text);
	if(DEBUG)console.log('Server> ', text);
}

/* 
 * convert player number to 'yellow' or 'blue'
 */
function convertPlayer(player) {
	if(player == 1)
		return 'yellow';
	else if(player == 2)
		return 'blue';
}
