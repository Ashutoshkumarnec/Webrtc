var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
var server = require("http").createServer(app);
var io = require("socket.io")(server);
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
let socketIdToNames = {};
server.listen(7008, function() {
  console.warn("Socket Server is listening at 7008");
});
function socketIdsInRoom(name) {
  var socketIds = io.nsps["/"].adapter.rooms[name];
  if (socketIds) {
    var collection = [];
    for (var key in socketIds) {
      collection.push(key);
    }
    return collection;
  } else {
    return [];
  }
}

io.on("connection", function(socket) {
  console.log("connection");
  socket.on("disconnect", function() {
    console.log("disconnect");
    if (socket.room) {
      var room = socket.room;
      io.to(room).emit("leave", socket.id);
      socket.leave(room);
    }
  });

  socket.on("join", function(name, callback) {
    console.log("join", name);
    var socketIds = socketIdsInRoom(name);
    callback(socketIds);
    socket.join(name);
    socket.room = name;
  });

  socket.on("exchange", function(data) {
    console.log("exchange", data);
    data.from = socket.id;
    var to = io.sockets.connected[data.to];
    console.log("To", to);
    // to.emit("exchange", data);
  });
});
