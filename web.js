var express = require("express");
var app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);
app.use(express.logger());

//what if this is only for one route? how do i only apply logic then?
var rooms = ['Bathroom','Treehouse'];
var history = {Bathroom:[], Treehouse:[]};
console.log("initialized");

io.sockets.on('connection', function (socket) {
  console.log("connected");
  //socket.room = 'bathroom';
  //socket.join(socket.room);
  socket.emit('updaterooms',rooms);
  //socket.emit('refreshchat', history[socket.room]);

  socket.on('newchat', function (msg) {
    var obj = {
        time: (new Date()).getTime(),
        text: msg,
    };
    history[socket.room].push(obj);
    history[socket.room] = history[socket.room].slice(-100);
    io.sockets.in(socket.room).emit('addchat', obj);
  });

  socket.on('newroom', function(room){
    socket.leave(socket.room);
    socket.room = room;
    socket.join(socket.room);  
    socket.emit('refreshchat', history[socket.room]);
  });
});


//routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/poop', function (req, res) {
  res.sendfile(__dirname+'/poop.html');
});

//app.get('/', function(request, response) {
//  response.send('Hello World poochat!!!');
//});

var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on " + port);
});
