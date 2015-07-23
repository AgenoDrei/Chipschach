//Requirements
var fs = require('fs'); //For reading the level file
var server = require('./server.js'); //link to the server
var rules = require('./rules.js'); //chess rules
var win = require('./win.js'); //everything to check if someone won
var cc = require('change-case'); //change case of strings
var DEBUG = false;
var PATH = "./level/";
/* 
 * provided constructor of a game object
 * 
 * id: in which server room is the instance saved
 */
exports.Game = function Game(id) {
	var thiz = this; //Reference to the object itself, javascript can do some crazy stuff otherwise
	this.idPlayer1 = id; //the room id
	this.board = []; //store for the chessboard
	this.difficulty = 2; //difficulty, is fixed to 2
	this.winState = 0; //State of the game, 0: no one has won
	this.player = 'yellow'; //what is the current turn
	this.Level = {}; //Store for the Level object
	//Store for the lastTurn data
	this.lastTurn = {
		oldX : -1, //old pos
		oldY : -1,
		newX : -1, //pos after move
		newY : -1,
		oldType : '', //type of the beated figure
		oldColor : '', //color of the beaten figure
		avaible : false //only on undo is possible
	};
	this.chess = ''; //is someone put in check
	this.friendlyFire = false; //only important for checkmate
	
	//Initiate the chessboard
	for (var y = -1; y <= 8; y++) {
		thiz.board[y] = [];
		for (var x = -1; x <= 8; x++) {
			thiz.board[y][x] = 'empty'; //All fields are "empty"
		}
	}
	//New object for saving everything relevant to winning
	this.win = new win.win(thiz);
	
	/*
	 * integrates the from the client requested level file, you know client first ;)
	 * 
	 * lvl: filename
	 * diff: requested difficulty, currently it will only be 2
	 */
	this.setGameProperties = function(lvl,diff) {
		//node.js cannot usually integrate .js files, it needs prepard modules, but this is a workaround for the level files
		eval(fs.readFileSync(PATH + lvl) + '');
		if(DEBUG)console.log('Level-File ' + lvl + ' included!');

		if (diff == 2)
			thiz.difficulty = 2;
	}
	/*
	 * send the included level object to both players
	 */
	this.sendLevel = function() {
		for (key in Level.board) { //Runs through the board in the level file
			// Send Figure to client, all are send apart from each other
			server.sendToPlayers('{"type" : "lvl", "x" : "' + Level.board[key].x + '", "y" : "' + Level.board[key].y + '", "figure" : "'
					+ Level.board[key].type + '", "color" : "' + cc.lowerCase(Level.board[key].color) + '"}', thiz.idPlayer1);
			// Save figure on board
			thiz.board[Level.board[key].x][Level.board[key].y] = {
				x : Level.board[key].x,	//x-Pos
				y : Level.board[key].y, //y-Pos
				type : Level.board[key].type, //Type of the figure 
				color : cc.lowerCase(Level.board[key].color) //Color
			};
			// Count chips and figures in the win object
			if (Level.board[key].type == "Chip") {
				thiz.win.chips[cc.lowerCase(Level.board[key].color)]++;
			} else if (Level.board[key].type != "Chip")
				thiz.win.figures[cc.lowerCase(Level.board[key].color)]++;
		}
	}
	
	/*
	 * send some level information like the name and the description
	 */
	this.sendDetails = function() {
		server.sendToPlayers('{"type": "details", "name" : "'+Level.name+'", "description" : "'+Level.description+'"}', thiz.idPlayer1);
	}
	
	/*
	 * gets a turn from the server
	 * combines the functionality of the 'move' method and the game logic of the local game 
	 * 
	 * player: who plays?
	 * x, y: requested pos to move
	 * oldX, oldY: origin(not steam)
	 */
	this.turn = function(player, x, y, oldX, oldY) {
		thiz.player = player; //Save the current player globally 
		//if the parameter are strings, convert them
		x = parseInt(x); 
		y = parseInt(y);
		oldX = parseInt(oldX);
		oldY = parseInt(oldY);

		
		if (rules.rules[thiz.board[oldX][oldY].type](oldX, oldY, x, y, thiz)) {	//If allowed move, move the figure
			//Save information about the turn for undo
			thiz.lastTurn.oldX = oldX;
			thiz.lastTurn.oldY = oldY;
			thiz.lastTurn.newX = x;	
			thiz.lastTurn.newY = y;
			thiz.lastTurn.avaible = true;
			
			//Whether a figure is beaten
			if (thiz.board[x][y] != 'empty') {
				//Save the information about it...
				thiz.lastTurn.oldType = thiz.board[x][y].type;
				thiz.lastTurn.oldColor = thiz.board[x][y].color;
				
				//... and count the killed figures and chips in the win object
				if(thiz.board[x][y].type == 'Chip') { //if it is a chip...
					if(thiz.board[x][y].color == 'green')//...and it is green...
						thiz.win.killedGreenChips[player]++;
					else if(thiz.board[x][y].color == 'red' )//...or red...
						return -1; //ups not allowed 
					else if(thiz.board[x][y].color == 'blue')//...or blue...
						thiz.win.killedChips['yellow']++;
					else if(thiz.board[x][y].color == 'yellow')//...or yellow...
						thiz.win.killedChips['blue']++;
					
				} else if(thiz.board[x][y] != 'Chip') { //...or a figure.
					thiz.win.killedFigures[player]++;
				}
			} else {
				//move to an empty field, no figure to save
				thiz.lastTurn.oldType = '';
				thiz.lastTurn.oldColor = '';
			} 
				
			//Moves the figure on the board and saves its new positions
			thiz.board[x][y] = thiz.board[oldX][oldY];
			thiz.board[x][y].x = x;
			thiz.board[x][y].y = y;
			thiz.board[oldX][oldY] = 'empty';
			
			//When the player is in check, undo his move
			if (rules.isChess(player, thiz)) {
				thiz.undo(player);
				return -1; //Send error to Player
			} else {
				thiz.chess = ''; //No one is chess

				if (rules.isChess(thiz.getEnemy(player), thiz)) { //When the current tun puts the enemy in check
					thiz.chess = thiz.getEnemy(player); //Set check
					if(DEBUG)console.log('Chess: ' + thiz.chess);
					server.sendToPlayers('{"type": "error", "message": "check"}', thiz.idPlayer1); //Send check warning to both players
				}
				
				thiz.win.isWin(Level.win, player, thiz); //Validation whether someone won
				if (thiz.winState == 'yellow')
					return 1;  //Player yellow has won
				if (thiz.winState == 'blue')
					return 2; //Player blue has won

				return 0;
			}

		} else //Turn was not allowed, invalid move
			return -2;
	}
	
	/*
	 * is actived when a player yields, stops the game
	 */
	this.yield = function(player) {
		server.sendToPlayers('{"type": "win", "x": "' + 0 + '", "y": "' + 0 + '", "oldX": "' + 0 + '", "oldY": "' + 0 + '", "player": "' + thiz.convertPlayer(thiz.getEnemy(player)) + '"}', thiz.idPlayer1);
	}
	
	/*
	 * undo the last move of a player
	 *
	 * player: which player to undo
	 */
	this.undo = function(player) {
		if (thiz.lastTurn.avaible) { //only one turn can be reseted
			var figure = thiz.board[thiz.lastTurn.newX][thiz.lastTurn.newY]; //Grab the last moved figure
			thiz.board[thiz.lastTurn.oldX][thiz.lastTurn.oldY] = figure; //Update the board
			thiz.board[thiz.lastTurn.oldX][thiz.lastTurn.oldY].x = thiz.lastTurn.oldX; //update the pos
			thiz.board[thiz.lastTurn.oldX][thiz.lastTurn.oldY].y = thiz.lastTurn.oldY;

			//if a figure was killed in the last turn
			if (thiz.lastTurn.oldType != '') {
				//Recreate it on the client side
				server.sendToPlayers('{"type" : "lvl", "x" : "' + thiz.lastTurn.newX + '", "y" : "' + thiz.lastTurn.newY + '", "figure" : "' + thiz.lastTurn.oldType
						+ '", "color" : "' + cc.lowerCase(thiz.lastTurn.oldColor) + '"}', thiz.idPlayer1);
				//Recreate it on the server board
				thiz.board[thiz.lastTurn.newX][thiz.lastTurn.newY] = {
					x : thiz.lastTurn.newX,
					y : thiz.lastTurn.newY,
					type : thiz.lastTurn.oldType,
					color : thiz.lastTurn.oldColor
				};
				//Update the win object, all killed objects were recreated
				if(thiz.lastTurn.oldType == 'Chip' && thiz.lastTurn.oldColor != 'green')thiz.win.killedChips[figure.color]--;
				else if(thiz.lastTurn.oldColor == 'green')thiz.win.killedGreenChips[figure.color]--;
				else if(thiz.lastTurn.oldType != 'Chip')thiz.win.killedFigures[figure.color]--;
			} else //if no figure was killed
				thiz.board[thiz.lastTurn.newX][thiz.lastTurn.newY] = 'empty';
			thiz.lastTurn.avaible = false; //Can only be done once in a turn
			return true;
		}
		return false;
	}
	
	/*
	 * clears the board and the win object
	 */
	this.clear = function() {
		//Reset all variables, see above
		thiz.board = []
		thiz.difficulty = 1; // 1 or 2
		thiz.winState = 0;
		var Level;
		for (var y = -1; y <= 8; y++) {
			thiz.board[y] = [];
			for (var x = -1; x <= 8; x++) {
				thiz.board[y][x] = 'empty';
			}
		}
		//win obj will be cleared
		thiz.win.clear();
	}
	
	/*
	 * returns the color of the enemy
	 * 
	 * color: only optional
	 * 		without color it will use the global variable player
	 */
	this.getEnemy = function(color) {
		if(color == undefined) {
			if(thiz.player == 'yellow') {
				return 'blue';
			}
			else if(thiz.player == 'blue') {
				return 'yellow';
			}
		}else if (color == 'blue')
			return 'yellow';
		else if (color == 'yellow')
			return 'blue';
	}
	this.convertPlayer = function(color) {
		if(color =='blue') {
			return 2;
		} else if(color='yellow') {
			return 1;
		}
	}
	this.translate = function(string) {
		if(string == "yellow" || string == 'Yellow') {
			return 'Gelb';
		} else
			return 'Blau';
	}
}
