function main() {
	//fadeIn onto Menu-Items
	//$('.cell').fadeIn(1000);
	$('.cell').css("display", "table-cell");
	
	//setup Accordion
	$('.accordion div:nth-child(even)').hide();
	$('.accordion div:nth-child(odd)').click(function() {
		$('.accordion div:nth-child(even)').hide();
		$(this).next().slideToggle(500);
	});
	
	// Event: Close-Icon
	$('.logo_exit').click(function() {
		window.location.href = "http://www.schach-fuer-kids.de/";
	});

	// Event: choose the Menu
	var oneIsActive = false;

	// Event: logoimg >> 'Impressum'
	$('.logo').click(function() {
		if (!oneIsActive) {
			$("#overlay").fadeIn(400);
			$('#impressum').css("z-index", "100");
			oneIsActive = true;
			setTimeout(function() {
				$('#impressum').fadeIn(500);
			}, 200);
		}
		
	});
	// Event: logoimg_Impressum >> back to Menu
	$('#impressum img').click(function() {
		$('#impressum').fadeOut(500);
		$("#overlay").fadeOut(400);
		oneIsActive = false;
	});
	
	
	$('.logo_singleplayer').click(function() { // Singleplayer anzeigen
		if (!oneIsActive) {
			$("#overlay").fadeIn(400);
			$('#singleplayer').css("z-index", 100);
			oneIsActive = true;
			$(this).fadeTo("slow", 0.5);
			setTimeout(function() {
				$('#singleplayer').show();
			}, 500);
		}
	});
		$('#btn_sp_back').click(function() { // ...und zurück
			$('#singleplayer').hide();
			$("#overlay").fadeOut(400);
			$('.logo_singleplayer').fadeTo("slow", 0.8);
			oneIsActive = false;
		});

	$('.logo_multiplayer_lokal').click(function() { // Multiplayer_lokal anzeigen
		if (!oneIsActive) {
			$("#overlay").fadeIn(400);
			$('#multiplayer_lokal').css("z-index", 100);
			oneIsActive = true;
			$(this).fadeTo("slow", 0.5);
			setTimeout(function() {
				$('#multiplayer_lokal').show();
			}, 500);
		}
	});
		$('#btn_mp_l_back').click(function() { // ...und zurück
			$("#overlay").fadeOut(400);
			$('#multiplayer_lokal').hide();
			$('.logo_multiplayer_lokal').fadeTo("slow", 0.8);
			oneIsActive = false;
		});
	
	$('.logo_minischach').click(function() { //minischach anzeigen
		if (!oneIsActive) {
			$("#overlay").fadeIn(400);
			$('#minischach').css("z-index", 100);
			oneIsActive = true;
			$(this).fadeTo("slow", 0.5);
			setTimeout(function() {
				$('#minischach').show();
			}, 500);
		}
	});
		$('#btn_mini_back').click(function() { // ...und zurück
			$('#minischach').hide();
			$("#overlay").fadeOut(400);
			$('.logo_minischach').fadeTo("slow", 0.8);
			oneIsActive = false;
		});		
		
	$('.logo_classicChess').click(function() { // Klassisches Schach anzeigen
		if (!oneIsActive) {
			$('#classicChess').css("z-index", "100");
			$("#overlay").fadeIn(400);
			oneIsActive = true;
			$(this).fadeTo("slow", 0.5);
			setTimeout(function() {
				$('#classicChess').show();
			}, 500);
		}
	});
		$('#btn_classic_continue').click(function() {
			window.location.href = "../local/multiplayer.html?level=level/minischach/minischach_grundstellung";
		});
		$('#btn_classic_back').click(function() { // ...und zurück
			$("#overlay").fadeOut(400);
			$('#classicChess').hide();
			$('.logo_classicChess').fadeTo("slow", 0.8);
			oneIsActive = false;
		});
	
	$('.logo_multiplayer_global').click(function() { // Editor anzeigen
		if (!oneIsActive) {
			$('#multiplayer_global').css("z-index", 100);
			$("#overlay").fadeIn(400);
			oneIsActive = true;
			$(this).fadeTo("slow", 0.5);
			setTimeout(function() {
				$('#multiplayer_global').show();
			}, 500);
		}
	});
		$('#btn_mp_g_continue').click(function() {
			window.location.href = "../global/multiplayer";
		});
		$('#btn_mp_g_back').click(function() { // ...und zurück
			$("#overlay").fadeOut(400);
			$('#multiplayer_global').hide();
			$('.logo_multiplayer_global').fadeTo("slow", 0.8);
			oneIsActive = false;
		});		
		
	$('.logo_editor').click(function() { // Editor anzeigen
		if (!oneIsActive) {
			$("#overlay").fadeIn(400);
			$('#editor').css("z-index", 100);
			oneIsActive = true;
			$(this).fadeTo("slow", 0.5);
			setTimeout(function() {
				$('#editor').show();
			}, 500);
		}
	});
		$('#btn_edit_continue').click(function() {
			window.location.href = "../editor";
		});
		$('#btn_edit_back').click(function() { // ...und zurück
			$('#editor').hide();
			$("#overlay").fadeOut(400);
			$('.logo_editor').fadeTo("slow", 0.8);
			oneIsActive = false;
		});	

}

$(document).ready(main);