var express = require("express");
var app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);
app.use(express.logger());

app.get('/', function(request, response) {
  response.send('Hello World poochat!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
