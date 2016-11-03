function SnakeGame(gridSize, socketio) {

    var io = socketio;
    var id = 0;
    var gridSize = gridSize;
    var players = {};
    var running = false;
    var stopFlag = false;
    var frame = 0;

    function Snake(id, color, playerName, snakeGame) {

        this.id = id;
        this.snakeGame = snakeGame
        this.color = color;
        this.playerName = playerName;
        this.coords = { x: 0, y: 0 };
        this.lastCoords = { x: 0, y: 0 };
        this.nextMove = 0; //0 = none, 1 = up, 2 = right, 3 = down, 4 = left
        this.lastMove = 1;
        this.dead = false;
        this.tail = [];

        this.updateMove = function updateMove(input){
            if(input == 1 || input == 2 || input == 3 || input == 4){
                this.nextMove = input;
            }
        }
        this.getCoords = function getCoords() {
            return coords;
        }
        this.setX = function setX(x) {
            this.coords.x = x;
        }
        this.setY = function setY(y) {
            this.coords.y = y;
        }
        this.moveY = function moveY(upBool) {
            this.lastCoords = this.coords;
            if (upBool) {
                if (this.snakeGame.checkCollisions({x: this.coords.x, y: this.coords.y + 1})) { this.dead = true; return false; }
                this.coords.y = this.coords.y + 1;
            }
            else {
                if (this.snakeGame.checkCollisions({x: this.coords.x, y: this.coords.y - 1})) { this.dead = true; return false; }
                this.coords.y = this.coords.y - 1;
            }
            return true;
        }
        this.moveX = function moveX(rightBool) {
            this.lastCoords = this.coords;
            if (rightBool) {
                if (this.snakeGame.checkCollisions({x: this.coords.x + 1, y: this.coords.y})) { this.dead = true; return false; }
                this.coords.x = this.coords.x + 1;
            }
            else {
                if (this.snakeGame.checkCollisions({x: this.coords.x - 1, y: this.coords.y})) { this.dead = true; return false; }
                this.coords.x = this.coords.x - 1;
            }
            return true;
        }
        this.addTail = function addTail() {
            this.tail.push(new SnakeTail(this));
        }

        this.processMove = function processMove() {
            if (this.nextMove == 1 && this.lastMove != 3) { this.lastMove = this.nextMove; return this.moveY(true); }
            if (this.nextMove == 2 && this.lastMove != 4) { this.lastMove = this.nextMove; return this.moveX(true); }
            if (this.nextMove == 3 && this.lastMove != 1) { this.lastMove = this.nextMove; return this.moveY(false); }
            if (this.nextMove == 4 && this.lastMove != 2) { this.lastMove = this.nextMove; return this.moveX(false); }
            this.nextMove = this.lastMove;
            this.processMove();
        }

        this.updateTail = function updateTail() {
            this.tail.forEach(item => {
                item.updateMove();
            })
        }
    }

    function SnakeTail(snake) {
        this.snake = snake;
        this.coords = { x: 0, y: 0 };
        this.lastCoords = { x: 0, y: 0 };
        this.parent = {};
        this.endFlag = true;

        if (snake.tail.length == 0) {
            this.coords = snake.lastCoords;
            this.endFlag = true;
        }
        else {
            snake.tail.forEach(iten => {
                if (item.endFlag) {
                    item.endFlag = false;
                    this.coords = item.lastCoords;
                }
            })
        }

        this.updateMove = function updateMove() {
            this.lastCoords = this.coords;
            if (!this.parent.coords) {
                this.coords = this.snake.lastCoords;
            }
            else {
                this.coords = this.parent.coords;
            }
        }
    }

    // SnakeGame Functions
    this.newPlayer = function newPlayer(color, playerName) {
        id++;
        players[id] = new Snake(id, color, playerName, this);
        var startCoords = this.randomClearSpot();
        players[id].setX(startCoords.x);
        //players[id].setY(startCoords.y);
        players[id].setY(0);
    }

    this.randomClearSpot = function randomClearSpot() {
        var newX = Math.floor(Math.random() * gridSize);
        var newY = Math.floor(Math.random() * gridSize);
        var coords = { x: newX, y: newY };
        if (!this.checkCollisions(coords)) { return coords; }
        return randomClearSpot();
    }

    this.checkCollisions = function checkCollisions(coords) {
        var hit = false;
        if(coords.x < 0 || coords.x >= gridSize){ hit = true;}
        if(coords.y < 0 || coords.y >= gridSize){ hit = true;}
        for (player in players) {
            var snake = players[player]
            snake.tail.forEach(item => {
                if (item.coords.x == coords.x && item.coords.y == coords.y) { hit = true; }
            })
            if (snake.coords.x == coords.x && snake.coords.y == coords.y) { hit = true; }
        }
        return hit;
    }

    this.cleanDeadSnakes = function cleanDeadSnakes() {
        for (player in players) {
            var snake = players[player];
            if (snake.dead) {
                delete(players[player])
            }
        }
    }

    this.broadcastGame = function broadcastGame(){
        io.emit('game', {players: players, config: 
            {
                gridSize: gridSize
            }
        });
    }

    this.updateMove = function updateMove(data){
        var id = data.id;
        for( player in players){
            var snake = players[player];
            if(snake.id == id){
                snake.updateMove(data.input)
            }
        }
    }


    //Main game function
    this.runGame = function runGame(interval) {
        running = true;
        if (stopFlag) {
            stopFlag = false;
            running = false;
            console.log("Game ending...")
            return;
        }
        console.log("Running Game, Frame: " + frame);
        frame++;

        for (player in players) {
            var snake = players[player];
            snake.processMove();
            snake.updateTail();
            console.log(snake.id + " x:" +snake.coords.x + ", y:" + snake.coords.y)
        }

        this.broadcastGame();
        this.cleanDeadSnakes();

        return setTimeout(() => { this.runGame(interval) }, interval);
    }

}

module.exports = {
    SnakeGame,
    updateMove: SnakeGame.updateMove
}