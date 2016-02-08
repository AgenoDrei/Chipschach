fs = require('fs');

var fileData = null;
var fileNames = [3];
var fileName = null;
var resultString = null;
var types = {
	"bishop" : "Lauefer",
	"rook" : "Turm",
	"pawn" : "Bauer",
	"queen" : "Dame",
	"king" : "Koenig",
	"knight" : "Springer"
}

fs.readdir('mp_global', function(err, files) {
    if(err) return console.log(err);
    fileNames[0] = files;
    
    for(var i = 0; i < files.length; i++) {
        //if(files[i].indexOf("mini") > -1) console.log('"'+files[i]+'",');
	console.log(files[i]);
	fileName = files[i];

	var split = fileName.split("_");
	
	var figureType = split[1];
	var mainLevel = split[2];
	var subLevel = split[3].split("\.")[0];

	var data = fs.readFileSync("mp_global/"+fileName, 'utf8');
	fileData = JSON.parse(data.substring(8));
	fileData.win = "2";
	//fileData.name = "Einzelspieler - "+types[figureType]+" - Level "+mainLevel+"."+subLevel; 
	resultString = 'Level = ' + JSON.stringify(fileData);
	fs.writeFileSync('mp_global/'+fileName, resultString);
	
    }
});
//console.log(files);
    
     // var data = {};
        // data.values = {};
        // data.sp = {};
        // data.mp = {};
        // data.mini = {};

    
//for(var i = 0; i < files.length; i++) {
        // console.log(files[i]);
        // fileName = files[i];
        // var data = fs.readFileSync('edit/'+fileName, 'utf8');
        
        // // fs.readFile('edit/'+files[i], 'utf8', function (err,data) {
            // // if (err) return console.log(err);
        // fileName = fileName.substring(0, (fileName.length)-3);
        // fileName = fileName.replace('roon', 'rook');
        // fileName = fileName.replace('edit_minischach', 'mp');
            
        // fileData = JSON.parse(data.substring(8));
        // fileData.win = '0';
        // fileData.name = fileName;
        // fileData.filename = fileName;
        // // console.log(fileData);
        // resultString = 'Level = ' + JSON.stringify(fileData);
        // fs.writeFileSync('results/'+fileName+'.js', resultString);
        // //});
    // }
// });


