var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
var server = require("https").createServer(app);
var io = require("socket.io")(server);
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.get("/check", function(req, res) {
  res.send("hlw");
});
app.set("port", process.env.PORT || 5000);
let socketIdToNames = {};
server.listen(app.get("port"), function() {
  console.log("Socket Server is listening at ", app.get("port"));
});
io.on("connection", function(socket) {
  console.log("connected", socket.id);
  socket.on("disconnect", function() {
    console.log("Disconnected");
    socket.broadcast.to(socket.id).emit("leave");
  });
  socket.on("exchange", function(data) {
    console.log("data sent", data);
    socket.broadcast.to(socketIdToNames[data.to]).emit("exchange", data);
  });

  socket.on("AddUser", function(data) {
    console.log("User Added");
    socketIdToNames[data.name] = socket.id;
  });
  socket.on("Permission", function(data) {
    socket.broadcast.to(socketIdToNames[data.to]).emit("Permission", data);
  });
  socket.on("Reconnected", function(data) {
    console.log("Reinitialised", data);
    socketIdToNames[data] = socket.id;
  });
  socket.on("EndCall", function(data) {
    socket.broadcast.to(socketIdToNames[data.to]).emit("Permission", data);
  });
});
