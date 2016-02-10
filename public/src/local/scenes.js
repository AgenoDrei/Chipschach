/*
 * In this file are all game States (scenes in Crafty)
 * 	Load: all assets(audio and sprites) are loaded
 * 	Game: Instigates the game and prepares all important variables, makes the mouse useable
 * 	Win: Stops the game and shows the winning screen 
 */

var assetsObj = {
        "audio" : {
                "buzz" : "../../audio/Buzz.mp3",
                "check" : "../../audio/Check.wav"
        },
        "sprites" : {
                "../../img/spritemap.png" : {
                        "tile" : Game.map_grid.tile.width,
                        "tileh" : Game.map_grid.tile.height,
                        "map" : { "SprTowerBlue" : [ 0, 0 ], "SprTowerYellow" : [ 1, 0 ],
                                "SprChipYellow" : [ 2, 0 ], "SprChipBlue" : [ 3, 0 ], "SprChipRed" : [ 4, 0 ], "SprChipGreen" : [ 5, 0 ],
                                "SprPawnBlue" : [ 6, 0 ], "SprPawnYellow" : [ 7, 0 ],
                                "SprQueenBlue" : [ 8, 0 ], "SprQueenYellow" : [ 9, 0 ],
                                "SprKingBlue" : [ 10, 0 ], "SprKingYellow" : [ 11, 0 ],
                                "SprBishopBlue" : [ 12, 0 ], "SprBishopYellow" : [ 13, 0 ],
                                "SprKnightBlue" : [ 14, 0 ], "SprKnightYellow" : [ 15, 0 ] }
                }
        }
}

//var gameCanvas = document.getElementById("cr-stage");

Crafty.scene('Initiate', function() {
	// Load all files
	 Crafty.load(assetsObj, function() {
                console.log('DEBUG> Initating!');
                console.log('DEBUG> Sprites loaded!')

		initMouse(); // Instigates the mouse

		// Initiate the empty board from -1 to 8(10x10). We need some more space
		// here for some functions.
		Game.board = new Array(Game.map_grid.width);
		for (var x = -1; x <= Game.map_grid.width; x++) {
			Game.board[x] = new Array(Game.map_grid.height);
			for (var y = -1; y <= Game.map_grid.height; y++) {
				Game.board[x][y] = 'empty';
			}
		}

		// Evaluates the level file
		$.each(Level.board, function(key, value) {
			var type = 'PlayerFigure'; // Default type for components on the
			var spr = 'Spr' + value.type + value.color; // Default Sprite Syntax
			// Creation and initialization of the Crafty component
			Game.board[value.x][value.y] = Crafty.e(type, spr).at(value.x, value.y);
			Game.board[value.x][value.y].type = value.type;
			Game.board[value.x][value.y].player = value.color.toLowerCase();
			// Count the stats up in the win object
			if (value.type == 'Chip') {
				if (value.color.toLowerCase() != 'red') {
					if (value.color.toLowerCase() == 'yellow') {
						Win.chips.yellow++;
					} else if (value.color.toLowerCase() == 'blue') {
						Win.chips.blue++;
					} else if (value.color.toLowerCase() == 'green') {
						Win.chips.green++;
					}
				}
			} else {
				if (value.color == "Yellow")
					Win.figures.yellow++;
				else if (value.color == "Blue")
					Win.figures.blue++;
			}
		});

		console.log('DEBUG> Game started!');

	});
});

Crafty.scene('Win', function() {
	// Disable the mouse listener
	Crafty.removeEvent(Game.mouse, Crafty.stage.elem, "mousedown", Game.mouse.onMouseDown);

	$('#menu').show();
});

/*
 * binds a mouse component to the entire crafty window
 * 		the intern 'Click listener' can be seen as the game loop of Crafty!!!
 */
function initMouse() {
	Game.mouse = Crafty.e("2D, Mouse").attr({
		w : Game.width(),
		h : Game.height(),
		x : 0,
		y : 0
	});
	//Everytime somewhere is clicked, this method is executed
	Game.mouse.bind('MouseDown', function(e) {
		//Calculates the board field that is clicked, e.g Floor(157.231 / 70) = 2 
		Game.mousePos.x = Math.floor(Crafty.mousePos.x / Game.map_grid.tile.width);
		Game.mousePos.y = Math.floor(Crafty.mousePos.y / Game.map_grid.tile.width);
		console.log("x: " + Game.mousePos.x + " - y: " + Game.mousePos.y);
		console.log("w: " + Game.width() + " - h: " + Game.height());

		if (Game.clicked[Game.playerTurn].active && Game.clicked[Game.playerTurn].x == Game.mousePos.x
				&& Game.clicked[Game.playerTurn].y == Game.mousePos.y &&Game.board[Game.mousePos.x][Game.mousePos.y].type != 'Chip') { //Click on the same figure again
			// Remove Highlight and selection
			Game.setColor(Game.clicked[Game.playerTurn].x, Game.clicked[Game.playerTurn].y, false);
			Game.clicked[Game.playerTurn].x = -1;
			Game.clicked[Game.playerTurn].y = -1;
			Game.clicked[Game.playerTurn].active = false;
		}
		// CLick on a figure when it is the right turn, there is no chip and the field is not empty
		else if ((Game.board[Game.mousePos.x][Game.mousePos.y].player == Game.playerTurn && Game.difficulty != 0 && Game.board[Game.mousePos.x][Game.mousePos.y].type != 'Chip') //when it is the right turn
				|| ((Game.board[Game.mousePos.x][Game.mousePos.y].type != 'Chip') && (Game.board[Game.mousePos.x][Game.mousePos.y] != 'empty') && (Game.difficulty == 0))) {
			
			if (Game.mousePos.x != Game.clicked[Game.playerTurn].x || Game.mousePos.y != Game.clicked[Game.playerTurn].y) {
				Game.setColor(Game.clicked[Game.playerTurn].x, Game.clicked[Game.playerTurn].y, false); //Remove highlight from old field
			}
			//Update the last clicked element
			Game.clicked[Game.playerTurn].x = Game.mousePos.x;
			Game.clicked[Game.playerTurn].y = Game.mousePos.y
			Game.clicked[Game.playerTurn].active = true;
			console.log("DEBUG> Clicked!!");
			//Highlight the clicked element
			Game.setColor(Game.clicked[Game.playerTurn].x, Game.clicked[Game.playerTurn].y, true);
		} else if (Game.clicked[Game.playerTurn].active) { // Click on a valid field
			if (Game.move(Game.mousePos.x, Game.mousePos.y, Game.clicked[Game.playerTurn].x, Game.clicked[Game.playerTurn].y)) { //After allowed move
				Game.turns++; //Increase turn number
				if (Game.difficulty != 0) { //Only multiplayer
					if (isChess(Game.playerTurn)) { //if moved during check
						Game.undo(false); //undo the move

						Crafty.audio.play('check'); //make some fancy noise
						toastr.warning('Schach!') //and a warning toast
						console.log('DEBUG> Denied!'); //and whupwhup
					} else {
						Game.chess = ''; //else reset chess
						
						if (isChess(Game.getEnemy())) { //if you set your enemy check
							Game.chess = Game.getEnemy();
							Crafty.audio.play('check'); //also do some stuff
							toastr.warning('Schach!')
						}

						Win.isWin(Level.win); //validation whether someone won
						
						Game.nextTurn(); 

						console.log('DEBUG> Allowed!');
					}
				} else {
					Win.isWin(Level.win); //validation for singleplayer
					$('#moveCounter_value').text(Game.turns);
					$('#chipCounter_value').text(Win.killedChips.yellow + Win.killedGreenChips.yellow);
				}
			}
		}
	});

	//Crafty.addEvent(Game.mouse, Crafty.stage.elem, "mousedown", Game.mouse.onMouseDown);
}
