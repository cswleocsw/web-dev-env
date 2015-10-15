var express = require('express');
var app = express();
var server = require('http').createServer(app);

app.use(express.static('build'));

server.listen(3000, function() {
  console.log('server start...');
});
