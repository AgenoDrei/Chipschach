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
	
	mouse : undefined, 	//container for the mouse Object
	mousePos : { 		//saves the last click Pos of the mouse
		x : -1,
		y : -1
	},

	board : [], //container for the virtual board, every figure is saved here
	playerTurn : 'yellow', //current turn
	turn : true, //disables the mouse while the server process the turn
	difficulty : 1, //difficulty, will be set to 2
	turns : 0,

	// Saves the last clicked element
	clicked : {
		x : -1,
		y : -1,
		active : false //only active when a existing figure was clicked
	},

	/*
	 * Initialize and start our game
	 */
	start : function() {
		Crafty.init(560, 560);
		Crafty.canvas.init();
		Crafty.scene("Load"); //Switch to the first game scene

	},
	
	/*
	 * creates Figure on the board with crafty, can only triggered by the server
	 */
	createFigure : function(x, y, figure, color) {
		var type = "PlayerFigure"; //all Figures are "PlayerFigure"s
		var spr = "Spr" + figure + Game.up(color); //also fixed definition
		Game.board[x][y] = Crafty.e(type, spr).at(x, y); //create and save in the board
		Game.board[x][y].type = figure;
		Game.board[x][y].player = color;
		console.log("Figure created!!")
	},

	/*
	 * gets a move from the server, does just the execution, in this case: server first
	 * server only sends blessed moves: HALLEULJIAH 
	 * x, y: move to
	 * oldX, oldY, origin
	 * player: who moves 
	 */
	move : function(x, y, oldX, oldY, player) {
		var figure = Game.board[oldX][oldY];

		//If the field is not empty
		if (Game.board[x][y].type != undefined) {
			var data = {
				x : x,
				y : y
			};
			Crafty.trigger('kill_figure', data); //Destroy the figure
			if(x == Game.clicked.x && y == Game.clicked.y) { //if the figure was selected, remove the selection
				Game.clicked.x = -1;
				Game.clicked.y = -1;
				Game.clicked.active = false;
			}
		}

		// Update the Game Board
		Game.board[x][y] = figure;
		Game.board[oldX][oldY] = 'empty';
		// Crafty Sprite is moved
		figure.x = x * Game.map_grid.tile.width;
		figure.y = y * Game.map_grid.tile.width;

		Game.nextTurn(); //Toggle next turn
		// Update selected Element
		
		if (player == Game.playerTurn) { //if your selected figure was moovved
			Game.clicked.x = x;
			Game.clicked.y = y;
		}
		return true;

	},
	
	/*
	 * Toggles the turn indicator left and right of the field
	 */
	nextTurn : function() {
		$('#turnYellow').toggle();
		$('#turnBlue').toggle();
		Game.turns++;
		
	},
	
	/*
	 * Function is executed, when the server sends a message about winning
	 */
	win : function(color, type) {
		//Here could be removed some useless stuff
		$('#menu h3').text('Glückwunsch! Spiel geschafft!')
		$('#menu p').text('Spieler ' + Game.translate(color) + ' hat gewonnen!');
		
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

		Crafty.scene('Win'); //Switch to win scene
	},

	/*
	 * returns the other player
	 */
	getEnemy : function() {
		if (Game.playerTurn == 'blue')
			return 'yellow';
		else if (Game.playerTurn == 'yellow')
			return 'blue';
	},

	/*
	 * toggles the color of a figure on or off
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
	 * resets the game
	 */
	reset : function() {
		Game.board = [];
		Game.turns = 0;
		Game.playerTurn = 'yellow';
		Game.clicked.active = 'false';
		Game.mouse = undefined;
		console.log('DEBUG> Game reseted!')
	},
	
	/*
	 * change the first literal of a sting to UpperCase
	 */
	up : function(string) {
		return string.charAt(0).toUpperCase() + string.substring(1);
	},
	
	//Translates player name to German
	translate : function(string) {
		switch(string) {
		case 'yellow' || 'Yellow' || 'YELLOW':
			return 'Gelb';
		case 'blue' || 'Blue' || 'BLUE':
			return 'Blau';
		default :
			return 'Translate error';
		}	
	},
	
	/*
	 * convert Crafty pixel units to chess board division
	 */
	craftToNormalX : function(cX) {
		return (cX / Game.map_grid.tile.height);
	},

	craftToNormalY : function(cY) {
		return (cY / Game.map_grid.tile.height);
	},

	/*
	 * returns the width and height of the Crafty field
	 */
	width : function() {
		return this.map_grid.width * this.map_grid.tile.width;
	},

	height : function() {
		return this.map_grid.height * this.map_grid.tile.height;
	}
}