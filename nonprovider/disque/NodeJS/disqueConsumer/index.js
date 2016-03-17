var disque = require('disque.js');
var client = disque.connect(['127.0.0.1:7711', '127.0.0.1:7712', '127.0.0.1:7713']);

function getJob(){
  // Meanwhile in a parallel universe 
  client.getjob(['queue1'], function(err, jobs) {
    jobs.forEach(function(job) {
      var queue   = job[0]
        , id      = job[1]
        , payload = job[2];
   
      //doVeryHeavyWork(payload);
   
      client.ackjob(id, function(err) {
        if (err) return console.error(err);
   
        console.log('Processed job ' + id);
        setTimeout(function() { getJob(); }, 2);
      });
    });
  });
}


getJob();

