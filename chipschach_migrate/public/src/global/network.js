var connection = null; //stores the current connection

/*
 * connects to a websocket server
 * 
 * host: the complete adress of a server
 * 		e.g "ws://localhost:1764"
 */
function connect(host, player, roomName) {
	
connection = new WebSocket(host, ["kekse"]); //create new Connection 
	
	//when a connection is opened
	connection.onopen = function(e) {
		console.log("WebSocket: Connection established");
		send('{"type": "hello", "player": "'+player+'", "name": "'+roomName+'"}');
	}
	
	//when a connection is closed
	connection.onclose = function(e) {
		console.log("WebSocket: Connection closed");

		// If there was an error, the connection already is set to null and a
		if(connection == null) return;
		connection = null;
		console.log("Die Verbindung wurde geschlossen.");
		//location.reload();
	}
	
	//when there was an error
	connection.onerror = function(e) {
		//console.error("WebSocket Fehler: " + e);
		connection = null;
		console.log("Ein Fehler ist aufgetreten.");
		toastr.error("Verbindungsfehler :(");
		//setTimeout(function(){location.reload();},2000);
	}
	
	//Evaluation of server messages
	connection.onmessage = function(e) {
		
		var m = JSON.parse(e.data); //parse Server string to object
		
		//please look into the protocol at the wiki
		switch(m.type) {
		case 'hello':
			if(m.player == '1') { //if the servers decides you are player 1...
				$('#btn_mp_start').hide();
				$('#btn_difficulty').hide();
				$('#menu p').hide();
				$('.spinner').show();
				send('{"type": "setGameProperties", "difficulty" : "' + Game.difficulty + '", "name" : "'+$('#level').val()+'"}'); //you can select the level
				Game.playerTurn = 'yellow';
			} else { //or player 2
				$('#menu').hide();
				Game.playerTurn = 'blue';
				Game.turn = false;
				$('#attributes').hide();
				$('#profile-container2').show();
			}
			break;
		case 'enemy': //player 1 get the message that a enemy is online
			$('#menu').hide();
			$('.spinner').hide();
			$('#attributes').hide();
			$('#profile-container2').show();
			break;
		case 'lvl': //used to create the level on the board, figures are served by the server
			Game.createFigure(m.x, m.y, m.figure, m.color);
			break;
		case 'details':
			$('#help .name p').text(m.name);
			$('#help .description p').text(m.description);
			$('#help').show();
			$('#showHelp').css({
				'box-shadow' : '0px 0px 20px orange'
			});
			break;
		case 'turn': //if a valid turn was made the server send it to both players
			Game.move(m.x, m.y, m.oldX, m.oldY, convertPlayer(m.player));
			if(m.player == 1 && Game.playerTurn == 'blue') //if it was the turn of the enemy, you are now allowed to move again
				Game.turn = true;
			else if(m.player == 2 && Game.playerTurn == 'yellow')
				Game.turn == true;
			break;
		case 'error': //if your move was invalid, or there was an global error
			if(m.message == 'impossible') {
				Crafty.audio.play('buzz');
				toastr.warning('Unmöglicher Zug!');
			} else if(m.message == 'turn') {
				Crafty.audio.play('buzz');	
				toastr.warning('Du bist nicht dran!');
			} else if(m.message == 'check') {
				Crafty.audio.play('check');
					toastr.warning('Schach!');
			}
			break;
		case 'exit': //when the server closes the connection
			console.log("Die Verbindung wurde getrennt!");
			connection.close();
			//location.reload();
			break;
		case 'win': //when a player has won the game
			Game.move(m.x, m.y, m.oldX, m.oldY, convertPlayer(m.player));
			
			$('#btn_difficulty').hide();
			$('#menu p').text('Spieler '+ Game.translate(convertPlayer(m.player)) + ' hat gewonnen!');
			$('#menu h3').text('Glückwunsch!');
			Crafty.scene('Win'); //switch to the winning scene
			
			break;
		}
		
		console.log("Server> ",e.data);
	}
}

/*
 * function to send text to the server
 * 		please use only protocol text, everything else will be ignored
 */
function send(text) {
	connection.send(text);
	console.log("Client> ", text);
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
