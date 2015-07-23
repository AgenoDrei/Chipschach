var connection = null;

function connect(host) {

	connection = new WebSocket(host, [ "kekse" ]);

	connection.onopen = function(e) {
		console.log("WebSocket: Connection established");
	}

	connection.onclose = function(e) {
		console.log("WebSocket: Connection closed");

		// If there was an error, the connection already is set to null and a
		if (connection == null)
			return;
		connection = null;
		console.log("Die Verbindung wurde geschlossen.");
	}

	connection.onerror = function(e) {
		// console.error("WebSocket Fehler: " + e);
		connection = null;
		console.log("Ein Fehler ist aufgetreten.");
		console.log("Die Verbindung wurde geschlossen.");
		saveSuccess(false);
	}

	connection.onmessage = function(e) {
		console.log("Server> ", e.data);
		var m = JSON.parse(e.data);

		switch (m.type) {
		case 'hello':
			send(JSON.stringify(level));
			break;
		case 'exit':
			connection.close();
			saveSuccess(true);
			break;
		}

		
	}
}

function send(text) {
	connection.send(text);
	console.log("Client> ", text);
}