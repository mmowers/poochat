var mongo = require('mongodb');
var express = require("express");
var app = express();
server = require('http').createServer(app);
io = require('socket.io').listen(server);
app.use(express.logger());


var mongoUri = process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/poochatdb'; 

var db;
mongo.Db.connect(mongoUri, function (err, database) {
  if(err){
    console.log("error connecting to database");
  }else{
    console.log("connected to database");
    db = database;
  }
});






//what if this is only for one route? how do i only apply logic then?
//var rooms = ['Bathroom','Treehouse'];
//var history = {Bathroom:[], Treehouse:[]};
//console.log("initialized");

io.sockets.on('connection', function (socket) {
  console.log("connected");
  //socket.room = 'bathroom';
  //socket.join(socket.room);
  //socket.emit('updaterooms',rooms);
  //socket.emit('refreshchat', history[socket.room]);

  socket.on('newchat', function (msg) {
    db.collection('posts', function(er, collection) {
      if(er){
        console.log("error connecting to collection");
      }else{
        console.log("connected to collection");
        collection.save({text:msg, time:new Date(), room_id:socket.room, red:25, green:25, blue:25}, {safe: true}, function(insErr,insRs) {
        //collection.save({"text":msg, "time":new Date(), "room_id":{"$oid":socket.room}, "red":25, "green":25, "blue":25}, {safe: true}, function(insErr,insRs) {
          if(insErr){
            console.log("error inserting");
          }else{
            console.log("good insertion");
          }
        });
      }
    });
    io.sockets.in(socket.room).emit('addchat', msg);
  });

  socket.on('newroom', function(room){
    socket.leave(socket.room);
    socket.room = room;
    socket.join(socket.room);
    console.log('joined '+room);
    db.collection('posts', function(er, collection) {
      if(er){
        console.log("error connecting to collection");
      }else{
        console.log("connected to collection");
        collection.find({room_id:room}, function(error, cursor){
          cursor.limit(50).sort( { time: -1 } );
          cursor.toArray(function(error, posts){
            if(!posts){
              socket.emit('refreshchat',[]);
            }else{
              socket.emit('refreshchat',posts);
            }
          });
        });
      }
    });
  });

  socket.on('updatelocation', function(loc){
    console.log(loc);
    db.collection('rooms', function(er, collection) {
      if(er){
        console.log("error connecting to collection");
      }else{
        console.log("connected to collection");
        collection.find({lat: {$lt: loc.lat+1}, lat: {$gt: loc.lat-1},
                         lng: {$lt: loc.lng+1}, lng: {$gt: loc.lng-1}}, function(error, cursor){
          cursor.toArray(function(error, rooms){
            if(!rooms){
              socket.emit('updaterooms',[]);
            }else{
              socket.emit('updaterooms',rooms);
            }
          });
        });
      }
    });
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
