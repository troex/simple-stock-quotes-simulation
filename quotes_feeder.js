var net = require('net');

var pairs = { // initial seeding
  'USD/CAD': 1.02029989,
  'EUR/JPY': 97.7538829,
  'EUR/USD': 1.2273,
  'EUR/CHF': 1.20091588,
  'USD/CHF': 0.978502304,
  'EUR/GBP': 0.793085622,
  'GBP/USD': 1.5475,
  'AUD/CAD': 1.03939,
  'NZD/USD': 0.7962,
  'GBP/CHF': 1.51423232,
  'AUD/USD': 1.01900,
  'GBP/JPY': 123.257666,
  'USD/JPY': 79.649542,
  'CHF/JPY': 81.3994425,
  'EUR/CAD': 1.25221405,
  'AUD/JPY': 81.1628833,
  'EUR/AUD': 1.20441609,
  'AUD/NZD': 1.27982919
};
var pair_keys = Object.keys(pairs);

var server = net.createServer(function(c) { //'connection' listener
  console.log('server connected ' + c.remoteAddress);
  c.on('end', function() {
    console.log('server disconnected');
  });
  c.on('data', function(data) {
    var cmd = data.toString();
    cmd = cmd.replace(/(\n|\r)+$/, '');
    switch (cmd) {
      case 'quit':
      case 'exit':
        console.log('client exiting ' + c.remoteAddress);
        c.end('bye\n');
    }
  });
  c.write('# hello ' + c.remoteAddress + '\n');
  sendData(c);
});
server.listen(8124, function() { //'listening' listener
  console.log('server bound');
});

function sendData(c) {
  var ts = new Date().getTime() //+ '.' + d.getMilliseconds();
  if (c.writable) {
    var key = pair_keys[Math.floor(Math.random() * pair_keys.length)];
    var value = pairs[key];

    diff = Math.random() * value * 0.005; // not more than 0.5% change from previous value
    if (Math.random() < 0.5) { // simulate up/down
      diff *= -1;
    }
    pairs[key] += diff;

    c.write(ts + ' ' + key + ' ' + (value + diff).toFixed(4) + '\n');
    setTimeout(function() { sendData(c) }, parseInt(Math.random() * 500))
  }
}