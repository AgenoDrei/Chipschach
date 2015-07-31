var express = require('express');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

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
	console.log("Params: " + levelTag + ", Tags: " + tags);
	var filename = 'data/level/'+tags[0] + '/' + levelTag + '.js';
	
	fs.readFile(filename, 'utf8', function (err, data) {
		if (err) throw err;
			res.send(data);
		});
	// res.end();
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
router.get('global', function(req, res, next) {
	res.render('global', null);
});


module.exports = router;
