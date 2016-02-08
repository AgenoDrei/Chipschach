var DATA = null;
var LEVEL = null;

var main = function() {
    var query = window.location.search.substring(1);
    var pairs = query.split('&');
    try {
        var msgPair = pairs[0].split('=');
        var msg = msgPair[1];
        if(msg != null && msg != undefined) toastr.error(decodeURIComponent(msg));
    } catch(e) {}//Do nothing
    
    var menuActive = false;
    
    $('.join').click(function(e) {
        $('#joinGame').show();
        $('.overlay').show();
        
        $(".opengames").html("<li id='first'>Keine offenen Spiele!</li>");
        $.getJSON("/global/getRooms", function(data) {
            DATA = data;
            console.log('Server> ', data);
            $.each(data, function(k,v) {
                if(v.id != -1) {
                    $("#first").css("display", "none");
                    $(".opengames").append("<a href='../global?modi=join&name="+v.id+"&level=irrelevat'><li>"+v.name+"</li></a>");
                }
            });
        });
        
    });
    
    $('.create').click(function(e) {
        $('#createGame').show();
        $('.overlay').show();
        
        $("#level").html("<option value='Wähle Level'>Wähle Level</option>");
        $.getJSON("/level/category/mp_global", function(data) {
            LEVEL = data;
            console.log('Server> ', data);
            $.each(data, function(k,v) {
                $("#level").append("<option value='"+v.filename+"'>"+v.name+"</option>");
            });
        });
    });
    
    $('.btn_back').click(function(e) {
        $('#createGame').hide();
        $('#joinGame').hide();
        $('.overlay').hide();
    });
    
    $('#btn_start').click(function(e) {
        if($('#name').val() != "" && $('#level').val() != "Wähle Level")
            location.href="/global?modi=create&name="+$('#name').val()+"&level="+$('#level').val();
        else toastr.warning("Bitte wähle ein Level und einen Spielnamen!");
    });
}

$(document).ready(main);