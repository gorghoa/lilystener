"use strict";
var colique = {
  hist : [],
  steps : {high:60,medium:10},
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

  },
  getCurrentStep:function() {
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
