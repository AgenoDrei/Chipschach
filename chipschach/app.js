/*jshint node:true*/

var express = require('express');

// setup middleware
var app = express();
app.use(app.router);
app.use(express.static(__dirname + '/Chipschach')); //setup static public directory

// render index page
app.get('/', function(req, res){
	res.sendfile(__dirname + '/Chipschach/index.html');
});
// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

//Service Information
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.

var host = (process.env.VCAP_APP_HOST || '176.28.8.55');
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
console.log('App started on port ' + port);
app.listen(port, host);

