//Requirements
var game = require('./logic.js'); //link to the game logic file
var win = require('./win.js'); //

/*
 * Object 'Rules' contains functions dependent on the type of Figure you hand over to the object
 * - all Upper_Case
 * - partially quite heavy in logic algorithms ...
 * - contains basic move-Rules; when those are confirmed it checks the beatElement(oldX, oldY, x, y)
 * -> exceptions: King won't be able to move next to another King
 * -> exceptions still to implement: en-passon at 'Pawn' (, Check at 'King'?)
 */

var rules = {
	'Tower' : function(oldX, oldY, x, y, gameRef) {

		if (oldX != x && oldY != y)
			return false;

		if (oldY == y) {
			if (oldX > x) {
				for (var i = oldX - 1; i > x; i--) {
					if (gameRef.board[i][oldY] != 'empty')
						return false;
				}
			} else if (x > oldX) {
				for (var i = oldX + 1; i < x; i++) {
					if (gameRef.board[i][oldY] != 'empty')
						return false;
				}

			}
		} else if (oldX == x) {
			if (oldY > y) {
				for (var i = oldY - 1; i > y; i--) {
					if (gameRef.board[oldX][i] != 'empty')
						return false;
				}
			} else if (y > oldY) {
				for (var i = oldY + 1; i < y; i++) {
					if (gameRef.board[oldX][i] != 'empty')
						return false;
				}
			}
		}

		return beatElement(oldX, oldY, x, y, gameRef);
	},

	'Bishop' : function(oldX, oldY, x, y, gameRef) {
		if (Math.abs(oldX - x) == Math.abs(oldY - y)) {
			if ((oldX - x < 0) && (oldY - y > 0)) { // zieht nach RechtsOben
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (gameRef.board[oldX + i][oldY - i] != 'empty')
						return false;
				}
			} else if ((oldX - x < 0) && (oldY - y < 0)) { // zieht nach
				// RechtsUnten
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (gameRef.board[oldX + i][oldY + i] != 'empty')
						return false;
				}
			} else if ((oldX - x > 0) && (oldY - y < 0)) { // zieht nach
				// LinksUnten
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (gameRef.board[oldX - i][oldY + i] != 'empty')
						return false;
				}
			} else if ((oldX - x > 0) && (oldY - y > 0)) { // zieht nach
				// RechtsOben
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (gameRef.board[oldX - i][oldY - i] != 'empty')
						return false;
				}
			}

			return beatElement(oldX, oldY, x, y, gameRef);
		}

	},

	'Knight' : function(oldX, oldY, x, y, gameRef) {
		if (((Math.abs(oldX - x) == 2) && (Math.abs(oldY - y) == 1)) || ((Math.abs(oldY - y) == 2) && (Math.abs(oldX - x) == 1)))
			return beatElement(oldX, oldY, x, y, gameRef);
	},

	'King' : function(oldX, oldY, x, y, gameRef) {
		if ((Math.abs(oldX - x) <= 1) && (Math.abs(oldY - y) <= 1)) {
			for (var i = -1; i <= 1; i++)
				for (var j = -1; j <= 1; j++) {
					if ((gameRef.board[x + i][y + j] != 'empty') && (gameRef.board[x + i][y + j].type == 'King')
							&& (gameRef.board[x + i][y + j].color != gameRef.board[oldX][oldY].color))
						return false;
				}

			return beatElement(oldX, oldY, x, y, gameRef);
		}
	},

	'Queen' : function(oldX, oldY, x, y, gameRef) {
		// wenn wie der Läufer gelaufen:
		if (Math.abs(oldX - x) == Math.abs(oldY - y)) {
			if ((oldX - x < 0) && (oldY - y > 0)) { // zieht nach RechtsOben
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (gameRef.board[oldX + i][oldY - i] != 'empty')
						return false;
				}
			} else if ((oldX - x < 0) && (oldY - y < 0)) { // zieht nach
				// RechtsUnten
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (gameRef.board[oldX + i][oldY + i] != 'empty')
						return false;
				}
			} else if ((oldX - x > 0) && (oldY - y < 0)) { // zieht nach
				// LinksUnten
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (gameRef.board[oldX - i][oldY + i] != 'empty')
						return false;
				}
			} else if ((oldX - x > 0) && (oldY - y > 0)) { // zieht nach
				// RechtsOben
				for (var i = 1; i < Math.abs(oldX - x); i++) {
					if (gameRef.board[oldX - i][oldY - i] != 'empty')
						return false;
				}
			}

			return beatElement(oldX, oldY, x, y, gameRef);
		} else if (oldY == y || oldX == x) {
			// wenn wie der Turm gezogen:
			if (oldY == y) {
				if (oldX > x) {
					for (var i = oldX - 1; i > x; i--) {
						if (gameRef.board[i][oldY] != 'empty')
							return false;
					}
				} else if (x > oldX) {
					for (var i = oldX + 1; i < x; i++) {
						if (gameRef.board[i][oldY] != 'empty')
							return false;
					}
				}

			} else if (oldX == x) {
				if (oldY > y) {
					for (var i = oldY - 1; i > y; i--) {
						if (gameRef.board[oldX][i] != 'empty')
							return false;
					}
				} else if (y > oldY) {
					for (var i = oldY + 1; i < y; i++) {
						if (gameRef.board[oldX][i] != 'empty')
							return false;
					}
				}
			}

			return beatElement(oldX, oldY, x, y, gameRef);
		}

		return false;
	},

	'Pawn' : function(oldX, oldY, x, y, gameRef) {
		if (gameRef.board[oldX][oldY].color == 'yellow') {
			if ((oldX == x) && ((oldY - y == 1) || ((oldY - y == 2) && (oldY == 6)))) {
				if (oldY - y == 1) {
					if (gameRef.board[x][y] != 'empty')
						return false;
					return true;
				}
				if (oldY - y == 2) {
					for (var i = 1; i > -1; i--)
						if (gameRef.board[x][y + i] != 'empty')
							return false;
					return true;

				}
			} else if ((Math.abs(oldX - x) == 1) && (oldY - y == 1)) {
				if (gameRef.board[x][y] != 'empty')
					return beatElement(oldX, oldY, x, y, gameRef);
			}
		}

		else if (gameRef.board[oldX][oldY].color == 'blue') {
			if ((oldX == x) && ((oldY - y == -1) || ((oldY - y == -2) && (oldY == 1)))) {
				if (oldY - y == -1) {
					if (gameRef.board[x][y] != 'empty')
						return false;
					return true;
				}
				if (oldY - y == -2) {
					for (var i = 1; i > -1; i--)
						if (gameRef.board[x][y - i] != 'empty')
							return false;
					return true;
				}
			} else if ((Math.abs(oldX - x) == 1) && (oldY - y == -1)) {
				if (gameRef.board[x][y] != 'empty')
					return beatElement(oldX, oldY, x, y, gameRef);
			}
		} else
			return false;
	}

}

/*
 * Checks, whether the moving figure can beat a figure (perhaps) standing on the x|y
 */
function beatElement(oldX, oldY, x, y, gameRef) {
	if(x == oldX && y == oldY) { //cannot (!) be removed ... otherwise ,when testing Checkmate, figures are able to cover themselves ... damn you 'Checkmate'!
		return false;
	}
	else if (gameRef.board[x][y] == 'empty') {
		return true;
	} else {
		if (gameRef.board[x][y].type != 'Chip' && gameRef.difficulty < 2)
			return false;
		else if (gameRef.board[x][y].type != 'Chip' && gameRef.difficulty == 2) {
			if (gameRef.board[x][y].color == gameRef.board[oldX][oldY].color && !gameRef.friendlyFire) { // friendlyFire für Abfrage bei Schachmatt ('ist Figur gedeckt')
				return false;
			} else {
				return true;
			}
		} else if (gameRef.board[x][y].type == 'Chip') {
			if (gameRef.board[x][y].color == 'red')
				return false;
			else if (gameRef.board[x][y].color == 'green') {
				return true;
			} else if (gameRef.board[x][y].color == 'blue' && gameRef.board[oldX][oldY].color == 'yellow') {
				return true;
			} else if (gameRef.board[x][y].color == 'yellow' && gameRef.board[oldX][oldY].color == 'blue') {
				return true;
			} else if (gameRef.board[x][y].color == 'yellow' && gameRef.board[oldX][oldY].color == 'yellow') {
				return false;
			} else if (gameRef.board[x][y].color == 'blue' && gameRef.board[oldX][oldY].color == 'blue') {
				return false;
			}
		} else
			return true;
	}
}

/*
 * Checks, whether a player is 'Checked'
 * - searches for the King of a certain color (searchFigure)
 * -> unfortunately, you will get the coordinates on the cr-stage in px, not the x|y from searchFigure
 * - if this King at x|y is beatable (isBeatable), that player is 'Checked'
 */
var isChess = function (playerColor, gameRef) {
	var king = searchFigure(playerColor, 'King', gameRef);
	if (king != null)
		return isBeatable(playerColor, king.x, king.y, gameRef);
}

/*
 * Finds you the first figure of a specific type and color(/player) and returns it's Crafty-Entity
 * -> x|y not according to 0-7, but to the pixels it is located in the cr-stage
 * - can be easily modified to return not only the first but every figure of a specific type and color(/player) in an Array,
 * 	 but was not neccesarry so far, because the function is only implementedin isChess so far
 */
var searchFigure = function(player, type, gameRef) {
	var ret = null;
	var index = 0;
	
	for (var i = 0; i < 8; i++) {	//König der jeweiligen Farbe suchen, [x|y] ausgeben
		for (var j = 0; j < 8; j++) {
			if((gameRef.board[i][j].color == player) && (gameRef.board[i][j].type == type)) {
				ret = gameRef.board[i][j];
				index++;
				break;
			}
		}
		if ((type == 'King' || type == 'Queen') && index > 0)
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
var isBeatable = function(color, x, y, gameRef) {	//bsp.: Color = 'blue'; -> Suche gelbe Figur die auf x|y ziehen kann, dann (true)
	for (var i = 0; i < 8; i++) {	//suche gegnerische Figuren und versuche mit jeder einzelnen den Zug auf das Zielfeld
		for (var j = 0; j < 8; j++) {
			if((gameRef.board[i][j].type != 'Chip') && (gameRef.board[i][j].color != color) && (gameRef.board[i][j] != 'empty')) {
				var figure = gameRef.board[i][j];
				
				if (rules[figure.type](i,j,x,y, gameRef))
					return true;
			}
		}
	}
	return false;
}
var isBeatable_exclKing = function(color, x, y, gameRef) {	//bsp.: Color = 'blue'; -> Suche gelbe Figur die auf x|y ziehen kann, dann (true)
	for (var i = 0; i < 8; i++) {	
		for (var j = 0; j < 8; j++) {
			if((gameRef.board[i][j].type != 'Chip') && (gameRef.board[i][j].color != color) && (gameRef.board[i][j] != 'empty') && gameRef.board[i][j].type != 'King') {
				var figure = gameRef.board[i][j];
				
				if (rules[figure.type](i,j,x,y, gameRef))
					return true;
			}
		}
	}
	return false;
}
var isBeatable_ffOn = function(color, x, y, gameRef) {	//mit friendly fire on (nur checkmate)
	gameRef.friendlyFire = true;
	for (var i = 0; i < 8; i++) {	
		for (var j = 0; j < 8; j++) {
			if((gameRef.board[i][j].type != 'Chip') && (gameRef.board[i][j].color != color) && (gameRef.board[i][j] != 'empty') && gameRef.board[i][j].type != 'King') {
				var figure = gameRef.board[i][j];
				
				if (rules[figure.type](i,j,x,y, gameRef)) {
					gameRef.friendlyFire = false;
					return true;
				}
			}
		}
	}
	gameRef.friendlyFire = false;
	return false;
}
exports.isChess = isChess;
exports.searchFigure = searchFigure;
exports.isBeatable = isBeatable;
exports.isBeatable_exclKing = isBeatable_exclKing;
exports.isBeatable_ffOn = isBeatable_ffOn;
exports.rules = rules;