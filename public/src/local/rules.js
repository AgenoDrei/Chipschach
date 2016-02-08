/*
 * Object 'Rules' contains functions dependent on the type of Figure you hand over to the object
 * - all Upper_Case
 * - partially quite heavy in logic algorithms ...
 * - contains basic move-Rules; when those are confirmed it checks the beatElement(oldX, oldY, x, y)
 * -> exceptions: King won't be able to move next to another King
 * -> exceptions still to implement: en-passon at 'Pawn' (, Check at 'King'?)
 */
Rules = {
	'Tower' : function(oldX, oldY, x, y) {

		if (oldX != x && oldY != y)	//non-linear movement? (if not, check direction and check if sth is in the way)
			return false;

		if (oldY == y) {	//horizontal movement
			if (oldX > x) {	
				for (var i = oldX - 1; i > x; i--) {
					if (Game.board[i][oldY] != 'empty')
						return false;
				}
			} else if (x > oldX) {
				for (var i = oldX + 1; i < x; i++) {
					if (Game.board[i][oldY] != 'empty')
						return false;
				}

			}
		} else if (oldX == x) {	//vertical movement
			if (oldY > y) {
				for (var i = oldY - 1; i > y; i--) {
					if (Game.board[oldX][i] != 'empty')
						return false;
				}
			} else if (y > oldY) {
				for (var i = oldY + 1; i < y; i++) {
					if (Game.board[oldX][i] != 'empty')
						return false;
				}
			}
		}

		return beatElement(oldX, oldY, x, y);
	},

	'Bishop' : function(oldX, oldY, x, y) {
		if (Math.abs(oldX - x) == Math.abs(oldY - y)) {	//if movement is diagonal (...check direction and check if sth is in the way)
			if ((oldX < x) && (oldY > y)) { // moving NorthEast
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (Game.board[oldX + i][oldY - i] != 'empty')
						return false;
				}
			} else if ((oldX < x) && (oldY < y)) { // moving SouthEast
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (Game.board[oldX + i][oldY + i] != 'empty')
						return false;
				}
			} else if ((oldX > x) && (oldY < y)) { // moving SouthWest
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (Game.board[oldX - i][oldY + i] != 'empty')
						return false;
				}
			} else if ((oldX > x) && (oldY > y)) { //moving NorthWest
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (Game.board[oldX - i][oldY - i] != 'empty')
						return false;
				}
			}

			return beatElement(oldX, oldY, x, y);
		}

	},

	'Knight' : function(oldX, oldY, x, y) {
		if (((Math.abs(oldX - x) == 2) && (Math.abs(oldY - y) == 1)) || ((Math.abs(oldY - y) == 2) && (Math.abs(oldX - x) == 1)))	//check for L-like Movement^^
			return beatElement(oldX, oldY, x, y);
	},

	'King' : function(oldX, oldY, x, y) {
		if ((Math.abs(oldX - x) <= 1) && (Math.abs(oldY - y) <= 1)) {	//Kings are not allowed to stand next to each other
			for (var i = -1; i <= 1; i++)	//...so check the surrounding fields... 
				for (var j = -1; j <= 1; j++) {
					if ( (Game.board[x + i][y + j] != 'empty') && (Game.board[x + i][y + j].type == 'King') 
							&& ( Game.board[x + i][y + j].color != Game.board[oldX][oldY].color ) ) //...and check for an enemy King
						return false;
				}
			
			return beatElement(oldX, oldY, x, y);
		}
	},

	'Queen' : function(oldX, oldY, x, y) {
		if (Math.abs(oldX - x) == Math.abs(oldY - y)) {	//moving like the Bishop...
			if ((oldX - x < 0) && (oldY - y > 0)) {
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (Game.board[oldX + i][oldY - i] != 'empty')
						return false;
				}
			} else if ((oldX - x < 0) && (oldY - y < 0)) {
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (Game.board[oldX + i][oldY + i] != 'empty')
						return false;
				}
			} else if ((oldX - x > 0) && (oldY - y < 0)) {
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (Game.board[oldX - i][oldY + i] != 'empty')
						return false;
				}
			} else if ((oldX - x > 0) && (oldY - y > 0)) {
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (Game.board[oldX - i][oldY - i] != 'empty')
						return false;
				}
			}

			return beatElement(oldX, oldY, x, y);
		} else if (oldY == y || oldX == x) {	//moving like the Tower...
			if (oldY == y) {
				if (oldX > x) {
					for (var i = oldX - 1; i > x; i--) {
						if (Game.board[i][oldY] != 'empty')
							return false;
					}
				} else if (x > oldX) {
					for (var i = oldX + 1; i < x; i++) {
						if (Game.board[i][oldY] != 'empty')
							return false;
					}
				}

			} else if (oldX == x) {
				if (oldY > y) {
					for (var i = oldY - 1; i > y; i--) {
						if (Game.board[oldX][i] != 'empty')
							return false;
					}
				} else if (y > oldY) {
					for (var i = oldY + 1; i < y; i++) {
						if (Game.board[oldX][i] != 'empty')
							return false;
					}
				}
			}

			return beatElement(oldX, oldY, x, y);
		}

		return false;
	},

	'Pawn' : function(oldX, oldY, x, y) {
		if (Game.board[oldX][oldY].player == 'yellow') {	//for yellow Pawns
			if ((oldX == x) && ((oldY - y == 1) || ((oldY - y == 2) && (oldY == 6)))) {	//vertical movement for (1 field) OR (2 fields and starting from the starting-row) 
				if (oldY - y == 1) {	//is the field in front of the Pawn occupied?
					if (Game.board[x][y] != 'empty')
						return false;
					return true;
				}
				if (oldY - y == 2) {	//are the 2 fields in front of the Pawn occupied?
					for (var i = 1; i > -1; i--)
						if (Game.board[x][y + i] != 'empty')
							return false;
					return true;

				}
			} else if ((Math.abs(oldX - x) == 1) && (oldY - y == 1)) {	//or mby the Pawn is beating sth diagonal to him
				if (Game.board[x][y] != 'empty')
					return beatElement(oldX, oldY, x, y);
			}
		}

		else if (Game.board[oldX][oldY].player == 'blue') {	//for blue Pawns, same logic compared to the yellow Pawn...
			if ((oldX == x) && ((oldY - y == -1) || ((oldY - y == -2) && (oldY == 1)))) {
				if (oldY - y == -1) {
					if (Game.board[x][y] != 'empty')
						return false;
					return true;
				}
				if (oldY - y == -2) {
					for (var i = 1; i > -1; i--)
						if (Game.board[x][y - i] != 'empty')
							return false;
					return true;
				}
			} else if ((Math.abs(oldX - x) == 1) && (oldY - y == -1)) {
				if (Game.board[x][y] != 'empty')
					return beatElement(oldX, oldY, x, y);
			}
		} else
			return false;
	}
}

/*
 * Checks, whether the moving figure can beat a figure standing (perhaps) on the x|y (-> also works if there is nothing to beat)
 */
function beatElement(oldX, oldY, x, y) {
	if (x == oldX && y == oldY)	//cannot (!) be removed ... otherwise ,when testing Checkmate, figures are able to cover themselves ... damn you 'Checkmate'!
		return false;
	
	//when it is not a chip and the beating is off and the field is not empty
	if (Game.board[x][y].type != 'Chip' && Game.difficulty < 2 && Game.board[x][y] != 'empty')
		return false;
	//wjem it is not a chip and beating is on and the field is not empty
	else if (Game.board[x][y].type != 'Chip' && Game.difficulty == 2 && Game.board[x][y] != 'empty') {
		if (Game.board[x][y].player == Game.board[oldX][oldY].player && !Game.friendlyFire) {	// friendlyFire für Abfrage bei Schachmatt ('ist Figur gedeckt')
			return false;
		} else {
			return true;
		}
	} else if (Game.board[x][y].type == 'Chip') {
		if (Game.board[x][y].player == 'red')
			return false;
		else if (Game.board[x][y].player == 'green')
			return true;
		else if (Game.board[x][y].player == 'blue' && Game.board[oldX][oldY].player == 'yellow')
			return true;
		else if (Game.board[x][y].player == 'yellow' && Game.board[oldX][oldY].player == 'blue')
			return true;
		else if (Game.board[x][y].player == 'yellow' && Game.board[oldX][oldY].player == 'yellow')
			return false;
		else if (Game.board[x][y].player == 'blue' && Game.board[oldX][oldY].player == 'blue')
			return false;
	}
	else
		return true;
}

/*
 * Checks, whether a player is 'Checked'
 * - searches for the King of a certain color (searchFigure)
 * -> unfortunately, you will get the coordinates on the cr-stage in px, not the x|y from searchFigure
 * - if this King at x|y is beatable (isBeatable), that player is 'Checked'
 */
function isChess(playerColor) {
	var king = searchFigure(playerColor, 'King');
	if (king != null)
		return isBeatable(playerColor, king.x/Game.map_grid.tile.width, king.y/Game.map_grid.tile.width);
}

/*
 * Finds you the first figure of a specific type and color(/player) and returns it's Crafty-Entity
 * -> x|y not according to 0-7, but to the pixels it is located in the cr-stage
 * - can be easily modified to return not only the first but every figure of a specific type and color(/player) in an Array,
 * 	 but was not neccesarry so far, because the function is only implementedin isChess so far
 */
function searchFigure(player, type) {
	var ret = null;
	var index = 0;
	
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			//when the figure type equals the searched one and its color is correct
			if((Game.board[i][j].player == player) && (Game.board[i][j].type == type)) {
				ret = Game.board[i][j];
				index++;
				break;
			}
		}
		if (index > 0)
			break;
	}
	
	return ret;
}

/*
 * Searches the opponents figures and tries with each located on the field to move (not necessarily beat!!!) x|y, returns true if at least one is able to do so
 * - e.g. 'color' = 'blue'; -> searches yellow figures to beat the blue figure at x|y
 * 
 * - the isBeatable-function has 3 different variants:
 * 		- isBeatable is the ordinary, mostly used one while...
 * 		- ...isBeatable_exclKing & isBeatable_ffOn are used for 'Checkmate' only -.-
 * 		-> isBeatable_exclKing: needed, so that the King is not taken into account when trying for all figures to move in between the checking figure and the King
 * 		-> isBeatableffOn: 'sets friendlyFire on', so that it can't be that the King beats a covered enemy figure. As the beaten figure would not be beaten already, enemie
 * 		figures must be allowed to be checked for being able to beat their own companions. This function is only used when checking if the checked King can move to escape
 * 		the check, can most likely not be implemented anywhere else...
 * 		Also Game.friendlyFire is only set true (and false when leaving) in this very function!
 */
function isBeatable(color, x, y) {
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			if((Game.board[i][j].type != 'Chip') && (Game.board[i][j].player != color) && (Game.board[i][j] != 'empty')) {
				var figure = Game.board[i][j];
				//when the rules allow a move to the specified field
				if (Rules[figure.type](i,j,x,y))
					return true;
			}
		}
	}
	return false;
}
function isBeatable_exclKing(color, x, y) {
	for (var i = 0; i < 8; i++) {	
		for (var j = 0; j < 8; j++) {
			if((Game.board[i][j].type != 'Chip') && (Game.board[i][j].player != color) && (Game.board[i][j] != 'empty') && Game.board[i][j].type != 'King') {
				var figure = Game.board[i][j];
				//when the rules allow a move to the specified field
				if (Rules[figure.type](i,j,x,y))
					return true;
			}
		}
	}
	return false;
}
function isBeatable_ffOn(color, x, y) {
	Game.friendlyFire = true;
	for (var i = 0; i < 8; i++) {	
		for (var j = 0; j < 8; j++) {
			if((Game.board[i][j].type != 'Chip') && (Game.board[i][j].player != color) && (Game.board[i][j] != 'empty')) {
				var figure = Game.board[i][j];
				//when the rules allow a move to the specified field
				if (Rules[figure.type](i,j,x,y)) {	//<<friendlyFire only relevant in rules
					Game.friendlyFire = false;
					return true;
				}
			}
		}
	}
	
	Game.friendlyFire = false;
	return false;
}
