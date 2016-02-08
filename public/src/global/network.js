var connection = null; //stores the current connection
var level = "";

/*
 * connects to a websocket server
 * 
 * host: the complete adress of a server
 * 		e.g "ws://localhost:1764"
 */
function connect(host, player, nameid, levelName) {
	
connection = new WebSocket(host, ["kekse"]); //create new Connection 
	
	//when a connection is opened
	connection.onopen = function(e) {
		console.log("WebSocket: Connection established");
        level = levelName;
		var user_name = getCookie("Name");
		var user_pic = getCookie("Pic");
		send('{"type": "hello", "player": "'+player+'", "nameid": "'+nameid+'", "user":"'+user_name+'", "profpic":"'+user_pic+'"}');
	}
	
	//when a connection is closed
	connection.onclose = function(e) {
		console.log("WebSocket: Connection closed");

		// If there was an error, the connection already is set to null and a
		if(connection == null) return;
		connection = null;
		setTimeout(function(){location.href="lobby?msg=Die Verbindung wurde geschlossen!";},0);
		//location.reload();
	}
	
	//when there was an error
	connection.onerror = function(e) {
		//console.error("WebSocket Fehler: " + e);
		connection = null;
		console.log("Ein Fehler ist aufgetreten.");
		toastr.error("Verbindungsfehler :(");
		setTimeout(function(){location.href="lobby?msg=Ein Fehler ist aufgetreten!";},2000);
	}
	
	//Evaluation of server messages
	connection.onmessage = function(e) {
		
		var m = JSON.parse(e.data); //parse Server string to object
		
		//please look into the protocol at the wiki
		switch(m.type) {
		case 'hello':
			if(m.player == '1') { //if the servers decides you are player 1...
				var user_name = getCookie("Name");
				var user_pic=getCookie("Pic");
				$('#btn_mp_start').hide();
				$('#btn_difficulty').hide();
				$('#menu p').hide();
				$('.spinner').show();
				//$('#Username_1').append(user_name);
				//$('#pic_1').append("<img src='../profilepics/" + user_pic + ".jpg'>");
				send('{"type": "setGameProperties", "difficulty" : "' + Game.difficulty + '", "name" : "'+level+'"}'); //you can select the level
				Game.playerTurn = 'yellow';
			} else { //or player 2
				var user_name = getCookie("Name");
				var user_pic=getCookie("Pic");
				$('#menu').hide();
				Game.playerTurn = 'blue';
				Game.turn = false;
				$('#attributes').hide();
				$('#profile-container2').show();
				$('#Username_2').append(user_name);
				$('#Username_1').append(m.enemy);
				//$('#pic_2').append("<img src='../profilepics/" + user_pic + ".jpg'>");
				//$('#pic_1').append("<img src='../profilepics/" + m.profpic + ".jpg'>");
				$('#chat').show();

			}
			break;
		case 'enemy': //player 1 gets the message that a enemy is online
			$('#menu').hide();
			$('.spinner').hide();
			$('#attributes').hide();
			$('#profile-container2').show();
			//$('#Username_2').append(m.user);
			$('#chat').show();
			//$('#pic_2').append("<img src='../profilepics/" + m.profpic2 + ".jpg'>");
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
			setTimeout(function(){location.href="lobby?msg=Die Verbindung wurde getrennt!";},0);
			break;
		case 'win': //when a player has won the game
			Game.move(m.x, m.y, m.oldX, m.oldY, convertPlayer(m.player));
			
			$('#btn_difficulty').hide();
			$('#menu p').text('Spieler '+ Game.translate(convertPlayer(m.player)) + ' hat gewonnen!');
			$('#menu h3').text('Glückwunsch!');
			Crafty.scene('Win'); //switch to the winning scene
			
			break;
		case 'picture':
		
			if(m.playerId == '1'){
			//$('#message_field').append('<p>' + m.player + ':');
			$('#chat').hide();
			$('#new_m').show();
			$('#message_field').append("<p> Gegner :");
			
			}
			else if(m.playerId == '0'){
			$('#message_field').append("<p> Du :");
			}
			switch (m.number){// what picture has been clicked; append to messagefield
			case '0':
			$('#message_field').append(" <div id='picture0'> <img src='../../img/BishopBlue.png' style='width:40px; height:40px;'> </div> <br> </p>");
			break;
			case '1':
			$('#message_field').append(" <div id='picture1'> <img src='../../img/PawnBlue.png' style='width:40px; height:40px;'> </div> <br></p>");
			break;
			case '2':
			$('#message_field').append(" <div id='picture2'> <img src='../../img/TowerBlue.png' style='width:40px; height:40px;'> </div> <br></p>");
			break;
			case '3':
			$('#message_field').append(" <div id='picture3'> <img src='../../img/KingBlue.png' style='width:40px; height:40px;'> </div> <br></p>");
			break;
			case '4':
			$('#message_field').append(" <div id='picture4'> <img src='../../img/QueenBlue.png' style='width:40px; height:40px;'> </div> <br></p>");
			break;
			case '5':
			$('#message_field').append(" <div id='picture5'> <img src='../../img/KnightBlue.png' style='width:40px; height:40px;'> </div> <br></p>");
			break;
			}
			break;
			
		case 'message':
		
			if(m.playerId == '0'){// in case you sent the picture show: "Du", else the Username is shown
			$('#message_field').append("<p> Du :");
			}
			 else if (m.playerId =='1'){
				//$('#message_field').append('<p>' + m.player + ':');
				$('#chat').hide();
				$('#new_m').show();
				
				$('#message_field').append("<p> Gegner :");
			}
	
			$('#message_field').append(m.textmessage); // append the message to the messagefield
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

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
} 
