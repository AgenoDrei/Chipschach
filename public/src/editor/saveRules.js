var isValidLevel = function(figures) {
	var error = "";
	
// multiple Kings of one color?
	var countKingYellow = 0;
	var countKingBlue = 0;
	
	for (var i = 0; i < figures.length; i++) {
		if (figures[i].type == 'King' && figures[i].color == 'Yellow')
			countKingYellow++;
		if (figures[i].type == 'King' && figures[i].color == 'Blue')	
			countKingBlue++;			
	}
	if (countKingYellow > 1 || countKingBlue > 1)
		error += "Es kann nur Einen (König pro Farbe) geben!\n";
	
// Kings placed next to each other?
	for (var i = 0; i < figures.length; i++) {	// Im Figures-Array...
		if (figures[i].type == 'King') {	/// ...falls ein König gefunden wurde...
			var kingX = parseInt(figures[i].x);
			var kingY = parseInt(figures[i].y);
			for (var x = kingX - 1; x <= kingX + 1; x++)
				for (var y = kingY - 1; y <= kingY + 1; y++) {	// ...gehe die Felder um den König durch...
					for (var j = 0; j < figures.length; j++)	// ... und überprüfe, ob im Figures-Array
						if (figures[j].x == x && figures[j].y == y && figures[j].type == 'King' && figures[j].color != figures[i].color)	// ... sich an diesem Feld ein anderer König befindet
							error += "Könige geben sich nicht die Hand!\n";
				}
		}
	}
// Singleplayer, but no/multiple colors placed?
	if ($('#modus').val() == 'sp'){
		var yellowFigures = 0;
		var blueFigures = 0;
		
		for (var i = 0; i < figures.length; i++) {
			if (figures[i].color == 'Yellow' && figures[i].type != 'Chip')
				yellowFigures++;
			else if (figures[i].color == 'Blue' && figures[i].type != 'Chip')
				blueFigures++;
		}
		
		if (yellowFigures != 0 && blueFigures != 0)
			error += "Es wurden gelbe und blaue Figuren gesetzt, obwohl nur eine Farbe spielen darf. Bitte nur eine Farbe für den Singleplayer setzen.\n";
		if (yellowFigures == 0 && blueFigures == 0)
			error += "Es wurden keine Figuren gesetzt.\n";
	}
	
//Multiplayer, but only one color placed?
	if ($('#modus').val() == 'mp' || $('#modus').val() == 'mp_mini'){
		var yellowFigures = 0;
		var blueFigures = 0;
		
		for (var i = 0; i < figures.length; i++) {
			if (figures[i].color == 'Yellow' && figures[i].type != 'Chip')
				yellowFigures++;
			else if (figures[i].color == 'Blue' && figures[i].type != 'Chip')
				blueFigures++;
		}
		
		if (yellowFigures != 0 && blueFigures == 0)
			error += "Es wurden nur gelbe Figuren gesetzt, bitte setz auch noch blaue Figuren, wenn du ein Mehrspielerlevel erstellen willst.\n";
		if (yellowFigures == 0 && blueFigures != 0)
			error += "Es wurden nur blaue Figuren gesetzt, bitte setz auch noch gelbe Figuren, wenn du ein Mehrspielerlevel erstellen willst.\n";
		if (yellowFigures == 0 && blueFigures == 0)
			error += "Es wurden keine Figuren gesetzt.\n";
	}
//check Level-Details
	if ($('input#name').val() == "")
		error += "Bitte einen Namen für das Level eintragen!\n";
	
	if ($('#description').val() == "")
		error += "Bitte eine Beschreibung für das Level angeben!\n";
	
	switch ($('select#modus').val()) {
		case 'sp':
			if ($('input#sp_min_turns').val() == "")
				error += "Bitte eine minimale Zugzahl für das Einzelspieler-Level eintragen!"
			break;
		case 'mp':
			break;
		case 'mp_mini':
			break;
		default:
			console.log(">> Error concerning Modus-Select <<");
			break;
	}
	
	
	return error;
}