/*
 * In this file are all game States (scenes in Crafty)
 * 	Load: all assets(audio and sprites) are loaded
 * 	Game: Instigates the game and prepares all important variables, makes the mouse useable
 * 	Win: Stops the game and shows the winning screen
 */
Crafty.scene('Load', function() {

	// Initiate the empty board
	Game.board = new Array(Game.map_grid.width);
	for (var x = -1; x <= Game.map_grid.width; x++) {
		Game.board[x] = new Array(Game.map_grid.height);
		for (var y = -1; y <= Game.map_grid.height; y++) {
			Game.board[x][y] = 'empty';
		}
	}

	console.log('DEBUG> Game started!');
	//Load all files
	Crafty.load([ '../../img/spritemap.png' ], function() {
		console.log('DEBUG> Initating!');
		//Slices the spritemap and the different sprites
		Crafty.sprite(Game.map_grid.tile.width, '../../img/spritemap.png', {
			SprTowerBlue : [ 0, 0 ],
			SprTowerYellow : [ 1, 0 ],
			SprChipYellow : [ 2, 0 ],
			SprChipBlue : [ 3, 0 ],
			SprChipRed : [ 4, 0 ],
			SprChipGreen : [ 5, 0 ],
			SprPawnBlue : [ 6, 0 ],
			SprPawnYellow : [ 7, 0 ],
			SprQueenBlue : [ 8, 0 ],
			SprQueenYellow : [ 9, 0 ],
			SprKingBlue : [ 10, 0 ],
			SprKingYellow : [ 11, 0 ],
			SprBishopBlue : [ 12, 0 ],
			SprBishopYellow : [ 13, 0 ],
			SprKnightBlue : [ 14, 0 ],
			SprKnightYellow : [ 15, 0 ]
		});
		
		//Declare the audio sounds
		Crafty.audio.add('buzz', [ '../../audio/Buzz.mp3']);
		Crafty.audio.add('check', [ '../../audio/Check.wav']);

		console.log('DEBUG> Sprites loaded!')
		
		initMouse(); //Instigates the mouse

	});

});

Crafty.scene('Win', function() {
	// Disable the mouse listener
	Crafty.removeEvent(Game.mouse, Crafty.stage.elem, "mousedown", Game.mouse.onMouseDown);

	$('#btn_mp_start').text('Restart');
	$('#menu').show();
	$('#menu p').show();
	$('#btn_mp_start').show();
});

/*
 * binds a mouse component to the entire crafty window
 */
function initMouse() {
	Game.mouse = Crafty.e("2D, Mouse").attr({
		w : Game.width(),
		h : Game.height(),
		x : 0,
		y : 0
	});
	//Everytime somewhere is clicked, this method is executed
	Game.mouse.bind('Click', function(e) {
		//Calculates the board field that is clicked, e.g Floor(157.231 / 70) = 2 
		Game.mousePos.x = Math.floor(Crafty.mousePos.x / Game.map_grid.tile.width);
		Game.mousePos.y = Math.floor(Crafty.mousePos.y / Game.map_grid.tile.width);
		console.log(Game.mousePos.x, Game.mousePos.y);
		console.log("x: " + Crafty.mousePos.x + " - y: " + Crafty.mousePos.y);

		// CLick on a figure
		if ((Game.board[Game.mousePos.x][Game.mousePos.y].player == Game.playerTurn) && Game.turn	//if the figure has the same color as the player who is next
				&& Game.board[Game.mousePos.x][Game.mousePos.y].type != 'Chip') { //and wether it is no 
			if (Game.mousePos.x != Game.clicked.x || Game.mousePos.y != Game.clicked.y) { 
				Game.setColor(Game.clicked.x, Game.clicked.y, false);
			}
			//Save the selected figure
			Game.clicked.x = Game.mousePos.x;
			Game.clicked.y = Game.mousePos.y
			Game.clicked.active = 'true';

			console.log("DEBUG> Clicked!!");
			Game.setColor(Game.clicked.x, Game.clicked.y, true); //Highlight the figure in green
		} else if (Game.clicked.active == 'true' && Game.clicked.x == Game.mousePos.x 
				&& Game.clicked.y == Game.mousePos.y) { //Click on the selceted figure again
			Game.setColor(Game.clicked.x, Game.clicked.y, false);
			Game.clicked.x = -1;
			Game.clicked.y = -1;
			Game.clicked.active = 'false';

			// Click on a field, make a turn
		} else if (Game.clicked.active == 'true' && Game.turn) {
			send('{"type" : "turn", "x" : "' + Game.mousePos.x + '", "y" : "' + Game.mousePos.y + '", "oldX" : "' + Game.clicked.x
					+ '", "oldY" : "' + Game.clicked.y + '"}'); //send turn request to server
		} else {
			toastr.warning('Du bist nicht dran!');
		}
	});
	
	//bind mouse to Crafty stage
	Crafty.addEvent(Game.mouse, Crafty.stage.elem, "mousedown", Game.mouse.onMouseDown);
}
