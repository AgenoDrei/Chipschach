var c = null; //variable for the current connection, connection is sadly already used as an idetifier

/*
 * connects to a websocket server
 * 
 * host: the complete adress of a server
 * 		e.g "ws://localhost:1764"
 */
function connectToLevelServer(host) {

	c = new WebSocket(host, [ "kekse" ]); //create new Connection

	//when a connection is opened
	c.onopen = function(e) {
		console.log("WebSocket: Connection established");
	}
	
	//when a connection is closed
	c.onclose = function(e) {
		console.log("WebSocket: Connection closed");

		// If there was an error, the connection already is set to null and a
		if (c == null)
			return;
		c = null;
		console.log("Die Verbindung wurde geschlossen.");
	}

	//when there was an error
	c.onerror = function(e) {
		// console.error("WebSocket Fehler: " + e);
		c = null;
		console.log("Ein Fehler ist aufgetreten.");
		console.log("Die Verbindung wurde geschlossen.");
	}
	
	//Evaluation of server Messages
	c.onmessage = function(e) {
		console.log("Server> ", e.data);
		var m = JSON.parse(e.data); //parse Server string to object

		switch (m.type) { //see protocl in the wiki
		case 'hello':
			sendText('{"type" : "get"}'); //after being greeted by the server request the files
			break;
		case 'get':
			//Reading the files and projecting them in the dropdown level menu on the left side
			for(i in m.files) {
				$('#level').append('<option value="'+m.files[i]+'">'+m.names[i]+' Level</option>');
			}
			break;
		case 'exit':
			//close connection and remove the default options if the result of the connection was positiv
			c.close();
			if($('#level').children().length > 2) {
				$('#level option:first').remove();
				$('#level option:first').remove();
			}
			break;
		}

		
	}
}

/*
 * function to send text to the server
 * 		please use only protocl text, everything else will be ignored
 */
function sendText(text) {
	c.send(text);
	console.log("Client> ", text);
}