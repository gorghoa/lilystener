var $intensity = document.getElementById('intensity');
var $audio= document.getElementById('audio');
var $audioTrigger = document.getElementById('listen');
var $step =  document.getElementById('step');
var $intnumber =  document.getElementById('intnumber');
var $body = document.getElementsByTagName('body')[0];
var $history = document.getElementById('history');
var $host= document.getElementById('host');
var $diag= document.getElementById('diag');

var host=localStorage.getItem('host') || document.location.host || "";
var socket;
$host.onclick = function() {
    tmpHost = prompt("host",host);
    if(!tmpHost) return;

    host = tmpHost;
    localStorage.setItem('host',host);
    handleSocket(host);

};

var lasttimeupdate=Date.now();


var ping = function(text) {
    text = text || "&nbsp;";
    var elm = document.getElementById('ping');
    elm.innerHTML="<p><small>last update</small><br/>"+text+"</p>";
    var newone = elm.cloneNode(true);
    elm.parentNode.replaceChild(newone, elm);
};

var log = function(step) {
    hist.push({time:Date.now(),step:step});
    if(hist.length>20) hist.shift();

    $diag.innerHTML="";

    refreshHistory();
    _(hist).forEach(function(item) {
        elDiag = document.createElement('div');
        s = (_(['low','medium','high']).contains(item.step.step)) ? item.step.step : 'connection';
        elDiag.className = s;
        $diag.appendChild(elDiag);
    });
};

var hist = new Array();

Notification.requestPermission( function(status) {
});

window.navigator.requestWakeLock = window.navigator.requestWakeLock || function(){};
var lock = window.navigator.requestWakeLock('wifi');
var lockcpu = window.navigator.requestWakeLock('cpu');

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

  var intensityHandler = function(data) {
    $intnumber.value = parseInt(data,10);

  };
  document.addEventListener('visibilitychange',function() {

    if(typeof socket  === 'object') {
        if(!document.hidden) {
          socket.on('intensity', intensityHandler);
        } else {
          socket.removeAllListeners('intensity');
        }
    }
  });


  var handleSocket = function (host) {

      socket = io(host);
      socket.on('intensity', intensityHandler);
      $step.innerHTML = 'connecting…' + host;

      socket.on('step', stepHandler);

      socket.on('connect',function() {
            log({step:"connected to "+host,time:Date.now()});
      });
  };


 var refreshHistory = function() {

    var s,el,elDia;
    $history.innerHTML="";
    _(hist).forEachRight(function(item) {
        el = document.createElement('li');
        el.innerHTML = '<div>'+moment(item.time).format('H:mm:ss')+'</div><div>' + item.step.step +'</div>';
        $history.appendChild(el);
    });

 };

 setInterval(function() {

    if((Date.now()-lasttimeupdate)>30000) {
        new Notification("Connection with you baby lost!!!",{tag:'yourbaby'});
        log({step:"Connection with you baby lost!!!",time:Date.now()});
        $step.innerHTML = "Connection lost " + moment(lasttimeupdate).fromNow();
        $body.className = 'connection';
        lastStep = 'connectionerror';
    }

    refreshHistory();

 },10000);
  
  var stepHandler =  function (data) {
    $step.innerHTML = data.step;
    $body.className = data.step;

    lasttimeupdate=Date.now();
    log(data);
    ping(moment().format('H:mm:ss'));

    if((lastStep!=data.step || data.step==='high') && document.hidden ) {
            var n = new Notification("Your baby!", {body: data.step, tag:'yourbaby',icon: window.location.origin + '/imgs/'+data.step+'.jpg'});
    }
    if(lastStep!=data.step) {
        lastStep=data.step;
    }

  };



handleSocket(host);
