//Requirements
var game = require('./logic.js'); //Access to game object
var rules = require('./rules.js'); //

/*
 * Win-Object:
 * - chips, figures, killedChips, killedFigures, killedGreenChips
 * - isWin(id)
 * - isChipsWin()
 * - isFiguresWin()
 * - isCheckmate(enemyColor)
 * - isFigureOnField(fields, type)
 */

var win = function win(gameRef) {
	var that = this;
	this.gameRef = gameRef;
	this.chips = {
		yellow : 0,
		blue : 0,
		green : 0,
		red : 0
	};
	this.figures = {
		yellow : 0,
		blue : 0
	};

	this.killedChips = {
		yellow : 0,
		blue : 0
	};

	this.killedFigures = {
		yellow : 0,
		blue : 0,
	};

	this.killedGreenChips = { //green Chips are more specific in use, because they have to be counted and checked separately for both players
		yellow : 0,
		blue : 0
	};
	
	/*
	 * depending on the win_condition declared in the Level-File, isWin() says which type of win to check for which number
	 * -> all the different (later following) win_conditions are implemented/used here!
	 * --> 0-9 is used for local Single-/Multiplayer (0 for Singleplayer)
	 * --> 10-99 for minischach
	 */
	
	this.isWin = function(id, player, gameRef) { //Referenzen auf das WinObjekt und das GameObjekt
		debugger;
		switch (id) {
		case 0: case "0":
			isChipsWin(player, that, gameRef);
			break;
		case 1: case "1":
			isFiguresWin(player, that, gameRef);
			break;
		case 2: case "2":
			isChipsWin(player, that, gameRef);
			isFiguresWin(player, that, gameRef);
			break;
		case 3: case "3":
			isCheckmate(gameRef.getEnemy(), that, gameRef);
			break;
		case 10: case "10":
			isFiguresWin(player, that, gameRef);
			isFigureOnField([{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0}], 'Pawn', player, that, gameRef);
			break;
		}
	}
	
	
	this.clear = function() {
		that.chips.yellow = 0;
		that.chips.blue = 0;
		that.chips.red = 0;
		that.chips.green = 0;
		that.killedChips.blue = 0;
		that.killedChips.yellow = 0;
		that.killedGreenChips.blue = 0;
		that.killedGreenChips.yellow = 0;
		that.figures.yellow = 0;
		that.figures.blue = 0;
		that.killedFigures.yellow = 0;
		that.killedFigures.blue = 0;
	}

	
}

exports.win = win;


/*
 * Checks whether all green chips are taken, then if all yellow or blue Chips are taken.
 * Also compares who took more green chips
 */
function isChipsWin(player, that, gameRef) {
	if ((that.killedGreenChips['yellow'] + that.killedGreenChips['blue']) == that.chips.green
			&& (that.killedChips[player] - that.chips.blue) == 0) {
		if (that.killedGreenChips['yellow'] > that.killedGreenChips['blue']) {
			gameRef.winState = player;
		} else if (that.killedGreenChips['yellow'] < that.killedGreenChips['blue']) {
			gameRef.winState = player;
		} else
			gameRef.winState = player;
	}
}

/*
 * self-explanatory...
 */
function isFiguresWin(player, that, gameRef) {
	if ((that.killedFigures[player] - that.figures[gameRef.getEnemy(player)]) == 0)
		gameRef.winState = player;
}

/*
 * One of the biggest Issues so far: Checkmate... (Debugging is hell!)
 * Can be divided into 4-5 Parts:
 * - (0) is only run if someone is 'Chess'
 * - (1) then it searches for the King and saves his coordinates
 * - (2) it then checks whether he is able to move into without being beatable (being 'Chess') afterwards, too
 * - (3) now it tries to beat the 'checking' figure (it hereby safes all (/!\can be 1 or 2!) 'checking' figures)
 * -> (4) and if the figure cannot be beaten: it tries to move a figure between the 'checking' figure and the King
 */
function isCheckmate(enemyColor, that, gameRef) {
	var text = gameRef.translate(gameRef.getEnemy()) + ' wurde Schachmatt gesetzt!';
	
	//is 'Chess' set?
	if(gameRef.chess != enemyColor)
		return false;			
	
	//search for the King
	var king = rules.searchFigure(enemyColor, 'King', gameRef);
	var kingX = king.x;
	var kingY = king.y;
	console.log("Der König ward gefunden!");
	
	//Can he move?
	for (var i = kingX - 1; i <= kingX + 1; i++) {	
		for (var j = kingY - 1; j <= kingY + 1; j++) {
			if(j==-1 || j==8 || i==-1 || i == 8)
				continue;
			if (rules.rules['King'](kingX, kingY, i, j, gameRef))
				if (!rules.isBeatable_ffOn(enemyColor, i, j, gameRef))
					return false;
		}
	}
	console.log("...doch er konnte sich nicht bewegen!!")
	
	//Can checking Figure be beaten?
	var realCheckmate = true;
	var checkFigures = 0;
	var checkingFigures = [];
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {	//search the whole field
			if (gameRef.board[i][j].type != undefined) {
				if(rules.rules[gameRef.board[i][j].type](i, j, kingX, kingY, gameRef)) {	//...checking figure
					checkFigures++;
					checkingFigures[checkingFigures.length] = {		//save checking figure(s)
							x: i,
							y: j,
							type: gameRef.board[i][j].type
					}
					if (rules.isBeatable(gameRef.getEnemy(), i, j, gameRef))	//if it can be beaten: no Checkmate!! 
						realCheckmate = !realCheckmate;
					else
						break;
				}
			}
		}
	}
	if(checkFigures > 1) { //check from 2 angles without being able to move means checkmate ^^
		console.log("checkmate, mate")
		gameRef.winState = gameRef.player;
		return;
	} else if (checkFigures == 0){ 
		console.log("DEBUG >> noone approaching?!?");
	} else {	//... if the checking figure cannot be beaten, then ...
		if (!realCheckmate)
			return; //only happens, when there is one checking figure and it CAN be beaten
		
		console.log("Die Bedrohung war nicht abzuwenden!!!")
		
		//can sb move in between the checking figure and the King
		for (var i = 0; i < checkingFigures.length; i++) {
			if (checkingFigures[i].type != 'Pawn') {	//'Pawn' can't be, 'Knight' is never in-line or diagonal, 'King' is never checking anyways!
				if (checkingFigures[i].x == kingX || checkingFigures[i].y == kingY){	
					//Check in-line
					if (checkingFigures[i].x > kingX) {	//Schach von rechts
						for (var xNew = checkingFigures[i].x - 1; xNew > kingX; xNew--) {
							if (rules.isBeatable_exclKing(gameRef.getEnemy(enemyColor), xNew, kingY, gameRef)) {
								console.log("- Er wird von Osten bedroht");
								return false;
							}
						}
					} else if (checkingFigures[i].y > kingY) {	//Schach von unten
						for (var yNew = checkingFigures[i].y - 1; yNew > kingY; yNew--) {
							if (rulesisBeatable_exclKing(gameRef.getEnemy(enemyColor), kingX, yNew, gameRef)) {
								console.log("- Er wird von Süden bedroht");
								return false;
							}
						}
					} else if (checkingFigures[i].x < kingX) {	//Schach von links
						for (var xNew = checkingFigures[i].x + 1; xNew < kingX; xNew++) {
							if (rules.isBeatable_exclKing(gameRef.getEnemy(enemyColor), xNew, kingY, gameRef)) {
								console.log("- Er wird von Westen bedroht");
								return false;
							}
						}
					} else if (checkingFigures[i].y < kingY) {	//Schach von oben
						for (var yNew = checkingFigures[i].y + 1; yNew < kingY; yNew++) {
							if (isBeatable_exclKing(gameRef.getEnemy(enemyColor), kingX, yNew, gameRef)) {
								console.log("- Er wird von Norden bedroht");
								return false;
							}
						}
					}
				} else if ( Math.abs(checkingFigures[i].x - kingX) == Math.abs(checkingFigures[i].y - kingY) ) {	
				//Schach schräg
					if ( (checkingFigures[i].x > kingX) && (checkingFigures[i].y < kingY) ) {	//Schach von rechtsOben
						for (var j = 1; j < Math.abs(checkingFigures[i].x - kingX); j++) {
							var xTemp = checkingFigures[i].x;
								xTemp -= j;
							var yTemp = checkingFigures[i].y;
								yTemp +=j;
								
							if (rules.isBeatable_exclKing(gameRef.getEnemy(enemyColor), xTemp, yTemp, gameRef)) {
								console.log("- Er wírd von NordOsten bedroht");
								return false;
							}
						}
					} else if ( (checkingFigures[i].x > kingX) && (checkingFigures[i].y > kingY) ) {	//Schach von rechtsUnten
						for (var j = 1; j < Math.abs(checkingFigures[i].x - kingX); j++) {
							var xTemp = checkingFigures[i].x;
								xTemp -= j;
							var yTemp = checkingFigures[i].y;
								yTemp -=j;
							
							if (rules.isBeatable_exclKing(gameRef.getEnemy(enemyColor), xTemp, yTemp, gameRef)) {
								console.log("- Er wírd von SüdOsten bedroht");
								return false;
							}
						}
					} else if ( (checkingFigures[i].x < kingX) && (checkingFigures[i].y > kingY) ) {	//Schach von linksUnten
						for (var j = 1; j < Math.abs(checkingFigures[i].x - kingX); j++) {
							var xTemp = checkingFigures[i].x;
								xTemp += j;
							var yTemp = checkingFigures[i].y;
								yTemp -=j;
							
							if (rules.isBeatable_exclKing(gameRef.getEnemy(enemyColor), xTemp, yTemp, gameRef)) {
								console.log("- Er wírd von SüdWesten bedroht");
								return false;
							}
							}
					} else if ( (checkingFigures[i].x < kingX) && (checkingFigures[i].y < kingY) ) {	//Schach von linksOben
						for (var j = 1; j < Math.abs(checkingFigures[i].x - kingX); j++) {
							var xTemp = checkingFigures[i].x;
								xTemp += j;
							var yTemp = checkingFigures[i].y;
								yTemp +=j;
							
							if (rules.isBeatable_exclKing(gameRef.getEnemy(enemyColor), xTemp, yTemp, gameRef)) {
								console.log("- Er wírd von NordWesten bedroht");
								return false;
							}
						}
					}
				}
			}
		}

		console.log("checkmate, mate")
		gameRef.winState = gameRef.player;
	}
}

/*
 * Tests for a specific figure-type and whether it reaches a specific coordinate
 * -> minischach needs those kinds of constructs
 */
function isFigureOnField(fields, type, player, that,  gameRef) {
	for (var i = 0; i < fields.length; i++) {
		if (gameRef.board[fields[i].x][fields[i].y].type == type) {
			gameRef.winState = player;
		}
	}
}

