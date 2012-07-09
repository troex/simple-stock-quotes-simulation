var util   = require('util');
var net    = require('net');
var simple = exports;
//var tcp = net.connect(8124, 'titan.systemforex.org');

function bind(fn, scope) {
  var bindArgs = Array.prototype.slice.call(arguments);
  bindArgs.shift();
  bindArgs.shift();

  return function() {
    var args = Array.prototype.slice.call(arguments);
    fn.apply(scope, bindArgs.concat(args));
  };
}

// client.on('data',function(data){
//   console.log(data.toString());
// });

var Client = simple.client = function(host, port) {
  this.host = host || 'localhost';
  this.port = port || 8124;

  // this.timeout = 10; // TODO
  this.connection = null;
  this.encoding = 'utf8';
}

util.inherits(Client, process.EventEmitter);

Client.prototype.connect = function() {
  var connection = net.connect(this.port, this.host);
  connection.setEncoding(this.encoding);
  //connection.setTimeout(this.timeout);
  connection.addListener('connect', bind(this.onConnect, this));
  connection.addListener('data',    bind(this.onReceive, this));
  connection.addListener('end',     bind(this.onEof,     this));
  connection.addListener('timeout', bind(this.onTimeout, this));
  connection.addListener('close',   bind(this.onClose,   this));

  this.connection = connection;
};

Client.prototype.disconnect = function(why) {
  if (this.connection.readyState !== 'closed') {
    this.connection.close();
    console.log('client disconnected');
  }
  // TODO reconnect on lost
  // this.connect();
};

Client.prototype.onConnect = function() {
  console.log('client connected');
};

Client.prototype.onReceive = function(chunk) {
  var data = chunk.toString().replace(/(\n|\r)+$/, ''); // chomp
  //console.log('client got: ' + data);
  if (data.match(/^#/)) {
    return;
  }
  this.emit.apply(this, ['recv', data]);
};

Client.prototype.onEof = function() {
  this.disconnect('eof');
};

Client.prototype.onTimeout = function() {
  this.disconnect('timeout');
};

Client.prototype.onClose = function() {
  this.disconnect('close');
};