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
	console.log("Params: " + levelTag);
	var tags = levelTag.split("_");
	console.log(tags);
	
	var obj;
	fs.readFile('data/level/'+tags[0] + '/' + levelTag + '.js', 'utf8', function (err, data) {
		if (err) throw err;
			res.send(data);
		});
	// res.end();
});


module.exports = router;
