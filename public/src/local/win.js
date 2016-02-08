/*
 * Win-Object:
 * - chips, figures, killedChips, killedFigures, killedGreenChips
 * - isWin(id)
 * - isChipsWin()
 * - isFiguresWin()
 * - isCheckmate(enemyColor)
 * - isFigureOnField(fields, type)
 */
Win = {
	chips : {
		yellow : 0,
		blue : 0,
		green : 0
	},
	figures : {
		yellow : 0,
		blue : 0
	},

	killedChips : {
		yellow : 0,
		blue : 0
	},

	killedFigures : {
		yellow : 0,
		blue : 0,
	},

	killedGreenChips : {	//green Chips are more specific in use, because they have to be counted and checked separately for both players
		yellow : 0,
		blue : 0
	},
	
	/*
	 * depending on the win_condition declared in the Level-File, isWin() says which type of win to check for which number
	 * -> all the different (later following) win_conditions are implemented/used here!
	 * --> 0-9 is used for local Single-/Multiplayer (0 for Singleplayer)
	 * --> 10-99 for minischach
	 */
	isWin : function(id) {	
		switch (id) {
		case 0: case "0":
			Win.isChipsWin();
			break;
		case 1: case "1": 
			Win.isFiguresWin();
			break;
		case 2: case"2":
			Win.isChipsWin();
			Win.isFiguresWin();
			break;
		case 3: case "3":
			Win.isCheckmate(Game.getEnemy());
			break;
		case 10: case "10":
			Win.isFiguresWin();
			Win.isFigureOnField([{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0},{x:0,y:7},{x:1,y:7},{x:2,y:7},{x:3,y:7},{x:4,y:7},{x:5,y:7},{x:6,y:7},{x:7,y:7}], 'Pawn');
			break;
        case 11: case "11":
			Win.isChipsWin();
			Win.isFigureOnField([{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0},{x:0,y:7},{x:1,y:7},{x:2,y:7},{x:3,y:7},{x:4,y:7},{x:5,y:7},{x:6,y:7},{x:7,y:7}], 'Pawn');
			break;
		}
	},
	
	/*
	 * Checks whether all green chips are taken, then if all yellow or blue Chips are taken.
	 * Also compares who took more green chips
	 */
	isChipsWin : function() {
		var text = 'Es wurden mit insgesamt ' + Game.turns + ' Zügen alle Chips geschlagen!';
		var opt  = 'Du hast die minimale Zuganzahl erreicht!';	//'opt' as a optional variable (one that does not have to be set (->may be undefined)
		if ((Game.turns) != Level.min_turns) 
			opt = undefined;
		
		if ((Win.killedGreenChips['yellow'] + Win.killedGreenChips['blue']) == Win.chips.green
				&& (Win.killedChips[Game.playerTurn] - Win.chips[Game.getEnemy(Game.playerTurn)]) == 0) {
			if (Win.killedGreenChips['yellow'] > Win.killedGreenChips['blue']) {
				Game.win('yellow', text, opt);
			} else if (Win.killedGreenChips['yellow'] < Win.killedGreenChips['blue']) {
				Game.win('blue', text, opt);
			}
			else
				Game.win(Game.playerTurn, text, opt);
		}
	},
	
	/*
	 * self-explanatory...
	 */
	isFiguresWin : function() {
		var text = Game.translate(Game.playerTurn) + ' hat alle gegnerischen Figuren geschlagen!';
		if ((Win.killedFigures[Game.playerTurn] - Win.figures[Game.getEnemy()]) == 0)
			Game.win(Game.playerTurn, text);
	},
	
	/*
	 * One of the biggest Issues so far: Checkmate... (Debugging is hell!)
	 * Can be divided into 4-5 Parts:
	 * - (0) is only run if someone is 'Chess'
	 * - (1) then it searches for the King and saves his coordinates
	 * - (2) it then checks whether he is able to move into without being beatable (being 'Chess') afterwards, too
	 * - (3) now it tries to beat the 'checking' figure (it hereby safes all (/!\can be 1 or 2!) 'checking' figures)
	 * -> (4) and if the figure cannot be beaten: it tries to move a figure between the 'checking' figure and the King
	 */
	isCheckmate : function(enemyColor) {	
		var text = Game.translate(Game.getEnemy()) + ' wurde Schachmatt gesetzt!';
		
		//is 'Chess' set?
		if(Game.chess != enemyColor)
			return false;			
		
		//search for the King
		var king = searchFigure(enemyColor, 'King');
		var kingX = king.x/Game.map_grid.tile.width;
		var kingY = king.y/Game.map_grid.tile.width;
		console.log("Der König ward gefunden!");
		
		//Can he move?
		for (var i = kingX - 1; i <= kingX + 1; i++) {
			for (var j = kingY - 1; j <= kingY + 1; j++) {
				if(j==-1 || j==8 || i==-1 || i == 8)
					continue;
				if (Rules['King'](kingX, kingY, i, j))
					if (!isBeatable_ffOn(enemyColor, i, j))
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
				if (Game.board[i][j].type != undefined) {
					if(Rules[Game.board[i][j].type](i, j, kingX, kingY)) {	//...checking figure
						checkFigures++;
						checkingFigures[checkingFigures.length] = {		//save checking figure(s)
								x: i,
								y: j,
								type: Game.board[i][j].type
						}
						if (isBeatable(Game.getEnemy(), i, j))	//if it can be beaten: no Checkmate!! 
							realCheckmate = !realCheckmate;
						else
							break;
					}
				}
			}
		}
		if(checkFigures > 1) {	//check from 2 angles without being able to move means checkmate ^^
			console.log("checkmate, mate")
			Game.win(Game.playerTurn, text);
		} else if (checkFigures == 0){
			console.log("DEBUG >> noone approaching?!?");
		} else {	//... if the checking figure cannot be beaten, then ...
			if (!realCheckmate)	//only happens, when there is one checking figure and it CAN be beaten
				return false;
			
			console.log("Die Bedrohung war nicht abzuwenden!!!")
			
			//can sb move in between the checking figure and the King
			for (var i = 0; i < checkingFigures.length; i++) {
				if (checkingFigures[i].type != 'Pawn') {	//'Pawn' can't be, 'Knight' is never in-line or diagonal, 'King' is never checking anyways!
					if (checkingFigures[i].x == kingX || checkingFigures[i].y == kingY){	
					//Check in-line
						if (checkingFigures[i].x > kingX) {	//Check from the East!
							for (var xNew = checkingFigures[i].x - 1; xNew > kingX; xNew--) {
								if (isBeatable_exclKing(Game.getEnemy(enemyColor), xNew, kingY)) {
									console.log("- Er wird von Osten bedroht");
									return false;
								}
							}
						} else if (checkingFigures[i].y > kingY) {	//Check from the South!
							for (var yNew = checkingFigures[i].y - 1; yNew > kingY; yNew--) {
								if (isBeatable_exclKing(Game.getEnemy(enemyColor), kingX, yNew)) {
									console.log("- Er wird von Süden bedroht");
									return false;
								}
							}
						} else if (checkingFigures[i].x < kingX) {	//Check from the West!
							for (var xNew = checkingFigures[i].x + 1; xNew < kingX; xNew++) {
								if (isBeatable_exclKing(Game.getEnemy(enemyColor), xNew, kingY)) {
									console.log("- Er wird von Westen bedroht");
									return false;
								}
							}
						} else if (checkingFigures[i].y < kingY) {	//Check from the North!
							for (var yNew = checkingFigures[i].y + 1; yNew < kingY; yNew++) {
								if (isBeatable_exclKing(Game.getEnemy(enemyColor), kingX, yNew)) {
									console.log("- Er wird von Norden bedroht");
									return false;
								}
							}
						}	
					} else if ( Math.abs(checkingFigures[i].x - kingX) == Math.abs(checkingFigures[i].y - kingY) ) {//Check diagonal
						if ( (checkingFigures[i].x > kingX) && (checkingFigures[i].y < kingY) ) {	//Check from the North-East!
							for (var j = 1; j < Math.abs(checkingFigures[i].x - kingX); j++) {
								var xTemp = checkingFigures[i].x;
									xTemp -= j;
								var yTemp = checkingFigures[i].y;
									yTemp +=j;
									
								if (isBeatable_exclKing(Game.getEnemy(enemyColor), xTemp, yTemp)) {
									console.log("- Er wírd von NordOsten bedroht");
									return false;
								}
							}
						} else if ( (checkingFigures[i].x > kingX) && (checkingFigures[i].y > kingY) ) {	//Check from the South-East!
							for (var j = 1; j < Math.abs(checkingFigures[i].x - kingX); j++) {
								var xTemp = checkingFigures[i].x;
									xTemp -= j;
								var yTemp = checkingFigures[i].y;
									yTemp -=j;
								
								if (isBeatable_exclKing(Game.getEnemy(enemyColor), xTemp, yTemp)) {
									console.log("- Er wírd von SüdOsten bedroht");
									return false;
								}
							}
						} else if ( (checkingFigures[i].x < kingX) && (checkingFigures[i].y > kingY) ) {	//Check from the South-West!
							for (var j = 1; j < Math.abs(checkingFigures[i].x - kingX); j++) {
								var xTemp = checkingFigures[i].x;
									xTemp += j;
								var yTemp = checkingFigures[i].y;
									yTemp -=j;
								
								if (isBeatable_exclKing(Game.getEnemy(enemyColor), xTemp, yTemp)) {
									console.log("- Er wírd von SüdWesten bedroht");
									return false;
								}
								}
						} else if ( (checkingFigures[i].x < kingX) && (checkingFigures[i].y < kingY) ) {	//Check from the North-West!
							for (var j = 1; j < Math.abs(checkingFigures[i].x - kingX); j++) {
								var xTemp = checkingFigures[i].x;
									xTemp += j;
								var yTemp = checkingFigures[i].y;
									yTemp +=j;
								
								if (isBeatable_exclKing(Game.getEnemy(enemyColor), xTemp, yTemp)) {
									console.log("- Er wírd von NordWesten bedroht");
									return false;
								}
							}
						}
					}
				}
			}
	
			console.log("checkmate, mate")
			Game.win(Game.playerTurn, text);
		}
	},
	
	/*
	 * Tests for a specific figure-type and whether it reaches a specific coordinate
	 * -> minischach needs those kinds of constructs
	 */
	isFigureOnField : function(fields, type) {
		var text = '';
		for(var i = 0; i < fields.length; i++) {
			if(Game.board[fields[i].x][fields[i].y].type == type) {
				Game.win(Game.playerTurn, text);
			}
		}
	}                                                                                                                                                                                                  	
}