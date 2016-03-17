var disque = require('disque.js');
var client = disque.connect(['127.0.0.1:7711', '127.0.0.1:7712', '127.0.0.1:7713']);
 

function queueIt(){
  client.addjob('queue1', 'foo', 0, function(err, res) {
    if (err) return console.error(err);
   
    console.log('Added job with ID ' + res);
    setTimeout(function() { queueIt(); }, 2);
  });
}

queueIt();