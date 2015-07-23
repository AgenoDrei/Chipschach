/*
 * global Game Object, here all important functions and varibales for the game procedure stored
 */
Game = {
	// Definition of the chessboard
	map_grid : {
		width : 8,
		height : 8,
		tile : { //Real size in pixel for every tile
			height : 70,
			width : 70
		}
	},

	mouse : undefined, //container for the mouse Object
	mousePos : { 	//saves the last click Pos of the mouse
		x : -1,
		y : -1
	},

	board : [],	//container for the virtual board, every figure is saved here
	turns : 0, //current turn
	playerTurn : 'yellow', 
	chess: '', //if somebody is check
	friendlyFire: false, //only important for checkmate
	difficulty : 0, //difficulty of the game: 0: only chips, 1: changing turns 2: beating is allowed

	// Saves the recent clicked element
	clicked : {
		'yellow' : { //from blue
			x : -1,
			y : -1,
			active : false //only active when a existing figure was clicked
		},
		'blue' : { //and yellow
			x : -1,
			y : -1,
			active : false //only active when a existing figure was clicked
		}
	},

	lastTurn : { // lastTurn for the undo function is saved
		oldX : -1,
		oldY : -1,
		newX : -1,
		newY : -1,
		oldType : '',	//type of the beaten figure
		oldColor : '',	//color of the beaten figure
		avaible : false, //only one undo per turn
		field : 'empty' //store for the field highlight object
	},

	// Initialize and start our game
	start : function() {
		// Start crafty
		Crafty.init(560, 560);
		Crafty.canvas.init();
		Crafty.scene('Initiate');	//Switch to "Initiate" scene
	},

	/*
	 * Move a figure from a to b, checks if the turn is valid
	 * 
	 * x, y: destination
	 * oldX, oldY: origin
	 */
	move : function(x, y, oldX, oldY) {
		var figure = Game.board[oldX][oldY]; //Grab the to be moved figure
		if (Rules[figure.type](oldX, oldY, x, y)) { // if the Rules allow the intended move, move the figure

	
			if(Game.board[x][y] != 'empty') { //Beat Figure on field
				var data = {
						x : x,
						y : y
					};
				
				//Save the information about the beaten figure
				Game.lastTurn.oldType = Game.board[data.x][data.y].type;
				Game.lastTurn.oldColor = Game.board[data.x][data.y].player;
				if(Game.clicked[Game.getEnemy()].x == x && Game.clicked[Game.getEnemy()].y == y){ //if the selected figure was beaten, remove selection
					Game.clicked[Game.getEnemy()].x = -1;
					Game.clicked[Game.getEnemy()].y = -1;
					Game.clicked[Game.getEnemy()].active = false;
				}
				Crafty.trigger('kill_figure', data); //trigger kill boardwide
			}
			else { //No figure was beaten
				Game.lastTurn.oldType = '';
				Game.lastTurn.oldColor = '';
			} 
				

			// Update the Game Board
			Game.board[x][y] = figure;
			Game.board[oldX][oldY] = 'empty';
			// Crafty Sprite is moved
			figure.x = x * Game.map_grid.tile.width;
			figure.y = y * Game.map_grid.tile.width;
			
			// Log the old position for undo
			Game.lastTurn.oldX = oldX
			Game.lastTurn.oldY = oldY;
			Game.lastTurn.newX = x;
			Game.lastTurn.newY = y;
			Game.lastTurn.avaible = true;

			// Update selected Element
			Game.clicked[Game.playerTurn].x = x;
			Game.clicked[Game.playerTurn].y = y;

			return true;
		}

		else { //Move was not allowed
			Crafty.audio.play('buzz');
			toastr.warning('Unmöglicher Zug!')
			console.log('DEBUG> Denied!');
			return false;
		}

	},

	/*
	 *  Undo function, revokes last 
	 */
	undo : function(turn) {
		if (Game.lastTurn.avaible) { //only one undo per turn
			var figure = Game.board[Game.lastTurn.newX][Game.lastTurn.newY]; //Grab figure
			Game.board[Game.lastTurn.oldX][Game.lastTurn.oldY] = figure; //Reset figure on Board
			figure.x = Game.lastTurn.oldX * Game.map_grid.tile.width; //Reset sprite
			figure.y = Game.lastTurn.oldY * Game.map_grid.tile.width;
			
			if(Game.lastTurn.oldType != '') { //Reset beaten figure
				//Recreate the crafty Component
				var type = 'PlayerFigure'; 
				Game.board[Game.lastTurn.newX][Game.lastTurn.newY] = Crafty.e(type, 'Spr'+Game.lastTurn.oldType+Game.up(Game.lastTurn.oldColor)).at(Game.lastTurn.newX, Game.lastTurn.newY);
				Game.board[Game.lastTurn.newX][Game.lastTurn.newY].type = Game.lastTurn.oldType;
				Game.board[Game.lastTurn.newX][Game.lastTurn.newY].player = Game.lastTurn.oldColor;
				
				//Component was not beaten, change win statistic
				if(Game.lastTurn.oldType == 'Chip' && Game.lastTurn.oldColor != 'green')Win.killedChips[figure.player]--; 
				else if(Game.lastTurn.oldColor == 'green')Win.killedGreenChips[figure.player]--;
				else if(Game.lastTurn.oldType != 'Chip')Win.killedFigures[figure.player]--;
			} else {
				Game.board[Game.lastTurn.newX][Game.lastTurn.newY] = 'empty';
			}
			
			//Reset click selection
			Game.clicked[Game.playerTurn].x = Game.lastTurn.oldX;
			Game.clicked[Game.playerTurn].y = Game.lastTurn.oldY;
			if (Game.difficulty != 0 && turn) {
				Game.clicked[Game.getEnemy()].x = Game.lastTurn.oldX;
				Game.clicked[Game.getEnemy()].y = Game.lastTurn.oldY;
				Game.nextTurn();
			}
			Game.lastTurn.avaible = false; //No more undoing this turn
			Game.turns--; //turn was not valid, doesnt count
			return true;
		}
		return false;
	},
	
	/*
	 * toggle the selection and the player indicators on the right and left side
	 * changes the playerTurn
	 */
	nextTurn: function() {
		$('#turn'+Game.up(Game.playerTurn)).toggle();
		Game.setColor(Game.clicked[Game.playerTurn].x, Game.clicked[Game.playerTurn].y, false);
		Game.setColor(Game.clicked[Game.getEnemy()].x, Game.clicked[Game.getEnemy()].y, true);
		Game.playerTurn = Game.getEnemy();
		$('#turn'+Game.up(Game.playerTurn)).toggle();
		
		$('#chipCounter_value1').text(Win.killedChips.yellow + Win.killedGreenChips.yellow);
		$('#chipCounter_value2').text(Win.killedChips.blue + Win.killedGreenChips.blue);
	},

	/*
	 * decides the layout of the win-menu
	 * 
	 * color: who has won
	 * text: main text in the win menu
	 * opt: optional additionally text
	 */
	win : function(color, text, opt) {
		$('#menu h3').text('Glückwunsch! Spiel geschafft!')
		if (Game.difficulty != 0) {
			$('#menu p').text('Spieler ' + Game.translate(color) + ' hat gewonnen!');
			$('#menu p').append('<p>'+ text + '</p>');
		}
		else 
			$('#menu p').text('');
		if(opt != undefined)
			$('#menu p').append('<p>'+ opt + '</p>');
		
		$('#btn_sp_start').text('Restart');
		$('#btn_sp_start').removeClass('btn btn-success btn-lg');
		$('#btn_sp_start').addClass('btn btn-info btn-lg');
		$('#btn_mp_start').text('Restart');
		$('#btn_mp_start').removeClass('btn btn-success btn-lg');
		$('#btn_mp_start').addClass('btn btn-info btn-lg');
		$('#btn_nextLevel').show();
		$('#btn_nextLevel').css({
			'display' : 'block',
			'margin' : '0 auto',
			'width' : '225px'
		});
        //ToDo
        if(level.search(/minischach.+/) != -1) $('#btn_nextLevel').hide();

		Crafty.scene('Win'); //Switch to "Win" Scene
	},
	
	/*
	 * creates an crafty object that highlights the field of the lastTurn on the game board
	 * 
	 *  onoff: decides if the lastTurn is shown or not
	 */
	showLastTurn : function(onoff) {
			if (onoff) {
				Game.lastTurn.field = Crafty.e('Field').at(Game.lastTurn.oldX, Game.lastTurn.oldY);
			} else if (!onoff) {
				Crafty.trigger('kill_lastTurnField');
			}
	},

	/*
	 * loads the level-file from the folder
	 * level is selected by the GET parameter in the url of the html site
	 * 
	 * creates <script> node in the html file from the value of one GET parameter, can be modified for different GET keys
	 */
	getLevelPath : function() {
		var key = 'level';
		var value;
		
		//Getting the get parameter from the url
		var query = window.location.search.substring(1);
		var pairs = query.split('&');
		if (pairs.length > 1) {
			console.log("Please enter only one parameter!")
			return undefined;
		}
		
		//Split get parameter in key and value, e.g. level : sp_tower_1
		var pair = pairs[0].split('=');
		if (pair[0] == key) {
			if (pair[1].length > 0)
				value = pair[1];
		} else {
			console.log("Please enter at least one parameter!");
			return undefined;
		}

		value += '.js';
		
		//Create script tag in the html file
		var scriptname = value; //Create js file location
		console.log("DEBUG> Level Path: " + scriptname);
		return scriptname;
		
		/*var snode = document.createElement('script'); //Create script tag
		snode.setAttribute('type', 'text/javascript');
		snode.setAttribute('src', scriptname);
		document.getElementsByTagName('head')[0].appendChild(snode); //append snode
		console.log("File " + scriptname + " included!");
		
		return true;
		*/
	},

	/*
	 * returns the color of the enemy
	 * 
	 * color: only optional
	 * 		without color it will use the global variable player
	 */
	getEnemy : function(color) {
		if (color != undefined) {
			if (color == 'blue')
				return 'yellow';
			else if (color == 'yellow')
				return 'blue';
		} else {
			if (Game.playerTurn == 'blue')
				return 'yellow';
			else if (Game.playerTurn == 'yellow')
				return 'blue';
		}
	},

	/*
	 * trigger a color change event for one specific figure on the field
	 * 
	 * x, y: destination of color change
	 * bool: color on or off
	 */
	setColor : function(x, y, bool) {
		if (bool) {
			Crafty.trigger('setColor', {
				x : x,
				y : y,
				color : 'rgba(0,255,0,0.5)'
			});
		} else if (!bool) {
			Crafty.trigger('setColor', {
				x : x,
				y : y,
				color : 'rgba(0,255,0,0)'
			});
		}
	},

	/*
	 * resets all important values for the game
	 */
	reset : function() {
		Game.board = [];
		Game.turns = 0;
        Game.clicked.yellow.x = -1;
        Game.clicked.yellow.y = -1;
        Game.clicked.blue.x = -1;
        Game.clicked.blue.y = -1;
		Win.chips.yellow = 0;
		Win.chips.blue = 0;
		Win.chips.green = 0;
		Win.figures.yellow = 0;
		Win.figures.blue = 0;
		Win.killedFigures.yellow = 0;
		Win.killedFigures.blue = 0;
		Win.killedChips.yellow = 0;
		Win.killedChips.blue = 0;
		Win.killedGreenChips.blue = 0;
		Win.killedGreenChips.yellow = 0;
		Game.lastTurn.oldX = -1;
		Game.lastTurn.oldY = -1;
		Game.lastTurn.newX = -1;
		Game.lastTurn.newY = -1;
		Game.playerTurn = 'yellow';
		Game.clicked[Game.playerTurn].active = false;
        Game.clicked[Game.getEnemy()].active = false;
		$('#turnBlue').hide();
		$('#turnYellow').show();
		$('#chipCounter_value1').text('0');
		$('#chipCounter_value2').text('0');
		$('#moveCounter_value').text('0');
		$('#chipCounter_value').text('0');
		Game.mouse = undefined;
		console.log('DEBUG> Game reseted!')
	},
	
	//Translates player name to German
	translate : function(string) {
		switch(string) {
		case 'yellow' || 'Yellow':
			return 'Gelb';
		case 'blue' || 'Blue':
			return 'Blau';
		default :
			return 'Translate error';
		}	
	},
	
	/*
	 * change the first letter of a sting to uppercase
	 */
	up : function (string) {
		return string.charAt(0).toUpperCase() + string.substring(1);
	},

	/*
	 * craft crafty pixel units to board units
	 */
	craftToNormalX : function(cX) {
		return (cX / Game.map_grid.tile.height);
	},

	craftToNormalY : function(cY) {
		return (cY / Game.map_grid.tile.height);
	},

	/*
	 * returns width & height of the Crafty stage
	 */ 
	width : function() {
		return this.map_grid.width * this.map_grid.tile.width;
	},

	height : function() {
		return this.map_grid.height * this.map_grid.tile.height;
	}
}