var mic = require('microphone');
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var colique = require('./colique');

mic.startCapture({mp3output:true,alsa_device:'hw:0,0',arecord_args:['-vvv'],debug:true});

var listeners = [];
var listen = function(res) {
    if(!res) listeners.pop();
    if(res) {
        listeners.push(res);
        return mic.audioStream.pipe(res);
    } 
};

mic.audioStream.on('data',function(data) {
    //flush
});

process.on('uncaughtException',function(e) {
    console.log('EXCEPTION',e);
});

app.listen(7777);

process.on('exit', function(code) {
    console.log('exit',code);
});

function handler (req, res) {

  if(req.url==='/audio.mp3') {
    res.on('close',function() {
        listen();
        console.log('close');
    });
    return listen(res);
  } 

  if(req.url.match(/jpg|js|css$/)) {
      fs.readFile(__dirname + '/client/' + req.url,
      function (err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading '+req.url);
        }

        res.writeHead(200);
        return res.end(data);
      });
  } 
  else{ 

  fs.readFile(__dirname + '/client/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
  
  }
}

var per=0;
var per_buffer=null;
mic.infoStream.on('data',function(data) {
    if(per_buffer = data.toString().match(/ (\d+)%/)) {
        per = per_buffer[1];
        colique.addIntensity(per);
    }
});

var inter = setInterval(function() { 
    console.log(colique.getCurrentStep(),colique.paliatedIntensity);
    io.sockets.emit('step',colique.getCurrentStep());
},5000);


io.on('connection', function (socket) {
    socket.emit('step',colique.getCurrentStep());
});
