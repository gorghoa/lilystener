"use strict";
var colique = {
  hist : [],
  histStep : [],
  steps : {high:60,medium:10},
  countIdem:0,
  addIntensity : function(intensity) {
    var hist=this.hist;
    hist.push(parseInt(intensity,10));

    var slice = hist.slice(Math.max(hist.length - 5, 1))



    var avg = function(arr) {
        var sum=0;
        var length = arr.length;

        for (var i=0;i<arr.length;i++) {
            sum+=arr[i];
        }

        return parseInt(sum/length,10);
    }



    this.paliatedIntensity={intensity:avg(slice),time:Date.now()};
    this.histStep.push(this.paliatedIntensity.intensity);

  },
  getCurrentStep:function() {

    var countIdem=0,last=0,item;
    var arr = this.hist.slice(Math.max(this.hist.length - 100, 1));
    for (var i=0;i<arr.length;i++) {
        item = arr[i];
        if(last==item) countIdem++;
        else { countIdem=0 };
        last=item;
    }

    if(countIdem>99)  {
        return {time:Date.now(),step:'seemIdle',idle:countIdem};
    }

    return {time:this.paliatedIntensity.time,step:this.getStep(this.paliatedIntensity.intensity)};
  },
  getStep:function(intensity) {
    for(var i in this.steps) {
        if(intensity>this.steps[i]) return i;
    }
    return 'low';
  }

};
module.exports = colique;
