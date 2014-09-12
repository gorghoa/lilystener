var $intensity = document.getElementById('intensity');
var $audio= document.getElementById('audio');
var $audioTrigger = document.getElementById('listen');
var $step =  document.getElementById('step');
var $intnumber =  document.getElementById('intnumber');
var $body = document.getElementsByTagName('body')[0];
var $history = document.getElementById('history');

var lasttimeupdate=Date.now();


var ping = function(text) {
    text = text || "";
    var elm = document.getElementById('ping');
    elm.innerHTML=text;
    var newone = elm.cloneNode(true);
    elm.parentNode.replaceChild(newone, elm);
};

var hist = new Array();

Notification.requestPermission( function(status) {
});

window.navigator.requestWakeLock = window.navigator.requestWakeLock || function(){};
var lock = window.navigator.requestWakeLock('wifi');

var lastStep=null;

  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;



  $audioTrigger.onclick = function() {
        if($audio.paused) {
            $audio.src="/audio.mp3";
            $audio.play();
            $audioTrigger.innerHTML='Mute';
        } else {
            $audio.pause();
            $audio.src="";
            $audioTrigger.innerHTML='Listen';
        }
  };
  var socket = io(document.location.host);
  var creatures = document.getElementsByClassName('click-anim');


  var intensityHandler = function(data) {
    $intnumber.value = parseInt(data,10);

  };
  socket.on('intensity', intensityHandler);

  document.addEventListener('visibilitychange',function() {
        if(!document.hidden) {
          socket.on('intensity', intensityHandler);
        } else {
          socket.removeAllListeners('intensity');
        }
  });


 setInterval(function() {

    if((Date.now()-lasttimeupdate)>5000) {
        new Notification("Connection with you baby lost!!!",{tag:'yourbaby'});
        $step.innerHTML = "Connection lost " + moment(lasttimeupdate).fromNow();
        $body.className = 'connection';
        lastStep = 'connectionerror';
    }

    $history.innerHTML="";
    _(hist).forEachRight(function(item) {
        var el = document.createElement('li');
        el.innerHTML = '<small>'+moment(item.time).fromNow()+'</small>,' + item.step;
        $history.appendChild(el);
    });

 },10000);
  
  var stepHandler =  function (data) {
    $step.innerHTML = data;
    $body.className = data;

    lasttimeupdate=Date.now();
    hist.push({time:Date.now(),step:data});
    if(hist.length>20) hist.shift();
    ping();

    if((lastStep!=data || data==='high') && document.hidden ) {
            var n = new Notification("Your baby!", {body: data, tag:'yourbaby',icon: window.location.origin + '/'+data+'.jpg'});
    }
    if(lastStep!=data) {
        lastStep=data;
        _(creatures).forEach(function(creature) {
            creature.classList.remove('show');
            document.getElementById(lastStep + '-creature' ).classList.toggle('show',true);
        }); 
    }

    if(data === 'medium') {
       window.navigator.vibrate([100]); 
    }
  };
  socket.on('step', stepHandler);
