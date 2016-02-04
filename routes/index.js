var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' }); TODO Optional LOGIN
  res.redirect('menu');
});

// auf der Login Seite die später mal kommt müssen die drei eingebaut werden:
//				res.cookie('Name',user.userName); 	//creates a new Cookie; value= userName
//				res.cookie('Pic',user.profilepic); 	//creates a new Cookie; value= Profilepicture
//				res.cookie('Group',user.group); 	//creates a new Cookie; value= usergroup

router.get('/menu_data', function(req, res, next) {
	var obj;
	fs.readFile('data/data.json', 'utf8', function (err, data) {
		if (err) throw err;
			obj = JSON.parse(data);
			res.json(obj);
		});
});

router.get('/level/:name', function(req, res, next) {
	var levelTag = req.params.name;
	var tags = levelTag.split("_");
    if(tags[1] == undefined || tags[1] == null) {
        res.send("Invalid filename!");
        //return;
    }
	var filename = 'data/level/'+tags[0] + '/' + levelTag + '.js';
	
	fs.readFile(filename, 'utf8', function (err, data) {
		if (err) throw err;
			res.send(data);
		});
	// res.end();
});

router.get('/level/category/:type', function(req, res, next) {
	var type = req.params.type;
	if(type != "editor" && type != "minischach" && type != "mp" && type != "mp_global" && type != "sp") {
        res.send("Invalid type");
        return;
    }
    
	console.log("Server> Type " + type + " selected!");
	var filepath = 'data/level/'+type;
    //TODO
    
    fs.readdir(filepath, function(err, files) {
        var response = [];
        var count = 0;
	
        files.forEach(function(item) {
                var obj = fs.readFileSync(filepath+"/"+item);
                var content = ((obj.toString()).split("="))[1];
                var jsonContent = JSON.stringify(eval("(" + content + ")"))
                var name = (JSON.parse(jsonContent)).name;
                console.log(name);
                response[count] = {"name" : name, "filename" : item, "id" : count};
                count++;
        });
        res.json(response);
    });
});

router.post('/level/newLevel', function(req, res, next) {
	console.log(req.body);
	var obj = req.body;
	var filename = "data/level/editor/" + obj.filename + ".js";
	var filedata = "Level = " + JSON.stringify(obj);
	
	fs.writeFile(filename, filedata, function (err) {
		if (err) return console.log(err);
		console.log(filename + ' > ' + filedata);
		res.end();
	});
});

router.get('/menu', function(req, res, next) {
	var obj;
	fs.readFile('data/data.json', 'utf8', function (err, data) {
		if (err) throw err;
			obj = JSON.parse(data);
			res.render('menu', obj);
		});
		
	
});

router.get('/singleplayer', function(req, res, next) {
	res.render('singleplayer', null);
});
router.get('/multiplayer', function(req, res, next) {
	res.render('multiplayer', null);
});
router.get('/editor', function(req, res, next) {
	res.render('editor', null);
});
router.get('/global', function(req, res, next) {
	res.render('global', null);
});
router.get('/lobby', function(req, res, next) {
	res.render('lobby', null);
});


router.get('/global/getRooms', function(req, res, next) {
	var server = req.app.locals.server;
	var obj = server.rooms;
	var response = [];
	var count = 0;
	
	obj.forEach(function(item) {
        if(!item.full) {
            response[count] = {"name" : item.name, "id" : item.id};
            count++;
        }
	});
	res.json(response);
});

module.exports = router;
