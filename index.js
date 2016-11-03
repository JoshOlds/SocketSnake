var express = require('express');
var server = express();
var http = require('http').Server(server);
var port = process.env.PORT || 8080;
var io = require('socket.io')(http);
var SnakeGame = require('./controllers/snake-game.js')
var liveUsers = 0;

server.use('/', express.static(`${__dirname}/public/`));


io.on('connection', function (socket){
  liveUsers++;
  console.log('A user has connected. User online: ' + liveUsers)
  socket.on('disconnect', function(){
    liveUsers--;
    console.log('A user has disconnected. Users online: ' + liveUsers)
  });

  socket.on('playerMove', function(data){
    console.log(data)
    snakeGame.updateMove(data)
  })
  
})

var snakeGame = new SnakeGame.SnakeGame(20, io);
snakeGame.newPlayer('red', 'Josh');
snakeGame.runGame(500);

http.listen(port, function(){
  console.log('listening on *:' + port);
});