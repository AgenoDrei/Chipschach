var level;
var HOST = 'localhost';
var main = function() {
//init
	for (var x = 0; x < 8; x++) { // 64 divs in cr-stage erstellen
		var col_id = "col" + x;
		var col = document.createElement('div');
		col.setAttribute('id', col_id);
		col.setAttribute('class', 'col');
		document.getElementById('cr-stage').appendChild(col);

		for (var y = 0; y < 8; y++) {
			var tile_class = x + "|" + y;
			var tile = document.createElement('div');
			tile.setAttribute('id', tile_class);
			tile.setAttribute('class', 'tile');
			tile.setAttribute('ondragover', 'allowDrop(event)');
			tile.setAttribute('ondrop', 'drop(event)');
			tile.setAttribute('onclick', 'if(this.innerHTML!=""){this.innerHTML = ""; deleteElementFromArray(this.id, figures)}')

			var col_name = "col" + x;
			document.getElementById(col_name).appendChild(tile);
		}
	}
//control Size
	window.onresize = function(event) {
		if (window.innerWidth < 1350) {
			$('#body-container').hide();
			$('#errorInfo').show();
		} else if (window.innerWidth >= 1350) {
			$('#body-container').show();
			$('#errorInfo').hide();
		}
	};
//nav
	$('#modus').change(function() {
		switch ($('#modus').val()) {
			case 'sp':
		    	$('#min-turns').show();
		    	$('#win-condition').hide();
		    	break;
			case 'mp':
		    	$('#min-turns').hide();
		    	$('#win-condition').hide();
		    	break;
			case 'mp_mini':
		    	$('#win-condition').show();
		    	$('#min-turns').hide();
		    	break;
			default:
				break;
		}
	});

	$('#close').click(function() { // Back to menu
		window.location.href = "menu";
	});

	$('#delete').click(function() {
		if (deleteMode == "off") {
			$(this).css({
				'box-shadow' : '0px 0px 20px orange'
			})
			deleteMode = "on";
		} else if (deleteMode == "on") {
			$(this).css({
				'box-shadow' : '0px 0px 0px #fff'
			})
			deleteMode = "off";
		}
	});

	$('#save').click(function() {
		if (isValidLevel(figures) == ""){
			level = {
				type : 'lvl',
				board : {},
				name : $('#name').val(),
				description : $('#description').val(),
				win: 0
			}
			for (var i = 0; i < figures.length; i++) {	//board füllen
				level.board[i] = figures[i];
			}
			switch ($('#modus').val()) {
				case 'sp':
					level.filename = "edit_sp_" + $('#name').val();
					level.min_turns = $('#sp_min_turns').val();
					break;
				case 'mp':
					level.filename = "edit_mp_l_" + $('#name').val();
					break;
				case 'mp_mini':
					level.filename = "edit_minischach_" + $('#name').val();
					level.win = $('#mini_win').val();
					break;
			}
			//alternative switch HOST to $('#adress').val()
			var adress = 'ws://' + HOST + ':1765';
			console.log(JSON.stringify(level));
			
			$.post( "level/newLevel", level, function( data ) {
				console.log("Posted level sucessfull to the server!");
				alert("Level erstellt!");
			});
			
		} else {
			window.alert(isValidLevel(figures));
		}
	});
	
}

function saveSuccess(bool) {
	if (bool) {
		window.alert("Level gespeichert!");
		// clear content and reload page
		$('#name').val("");
		$('#description').val("");
		figures = [];
		history.go(0);

	} else {
		window.alert("Keine Verbindung");
	}
}
$(document).ready(main);