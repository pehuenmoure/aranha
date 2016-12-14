var express = require('express'); // web server application
var http = require('http');				// http basics
var app = express();							// instantiate express server
var server = http.Server(app);		// connects http library to server
var serialport = require('serialport');	// serial library
var request = require('request');
var serverPort = 8000;

// use express to create the simple webapp
app.use(express.static('/public'));		// find pages in public directory

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html');
});

// var httpsServer = https.createServer(options, app);
// httpsServer.listen(443);

// http.createServer(function (req, res) {
// 	res.writeHead(302, {
// 		'Location': 'https://' + req.headers.host + req.url
// 	});
// 	res.end();
// }).listen(80);

// check to make sure that the user calls the serial port for the arduino when
// running the server

// if(!process.argv[2]) {
//     console.error('Usage: node '+process.argv[1]+' SERIAL_PORT');
//     process.exit(1);
// }

// // start the serial port connection and read on newlines
// var serial = new serialport.SerialPort(process.argv[2], {
//     parser: serialport.parsers.readline('\r\n')
// });

var io = require('socket.io')(server);	// connect websocket library to server
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
    console.log('a user connected');

	// LOOKING AROUND
    socket.on('calibrate', function() {
        console.log('calibrating');
        //serial.write('1');
    });
});

// this is the serial port event handler.
// read the serial data coming from arduino - you must use 'data' as the first argument
// and send it off to the client using a socket message
// serial.on('data', function(data) {
//     console.log('data:', data);
//     io.emit('server-msg', data);
// });

// start the server and say what port it is on
server.listen(serverPort, function() {
    console.log('listening on *:%s', serverPort);
});

var username = '647eef5c-131c-40ad-a7bf-f39b024306bb';
var password = 'MMcJeTYiJsGx';
var urlStart = "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?voice=en-US_AllisonVoice"
var urlEnd = "&voice=es-ES_EnriqueVoice";
var auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

function getAudio(text, finishCallback){
	console.log('starting to download: ' + text);
	var url = urlStart;
	//console.log(url);

	var body = '{ "text": "<speak><prosody pitch=\\"+10Hz\\"><prosody rate=\\"-10.0%\\">' + text + '</prosody></prosody></speak>" }';
	//console.log('Getting audio for ' + text);

	//var stream = fs.createWriteStream('public/audio/' + 'test' +'.wav');
	request.post({
	        url : url,
	        headers : {
	        	'content-type': 'application/json',
	            "Authorization" : auth,
	            'Accept': 'audio/wav'
	        },
	        body: body,
	        //voice: ,
	        encoding: null
	    },
	    function(err, res){
	    	if(res){
	    		if (res.body.includes('<HTML><BODY>') || res.body.includes('Forwarding error')){
	    			console.log('Did not download '+ text);
	    		}else{
			    	fs.writeFileSync('public/audio/' + text + '.wav', res.body);
			    	if(finishCallback){
				    	finishCallback();
				    }
				}
		    }

		    if(err){
		    	console.log(err);
		    }
	    }
	);
}