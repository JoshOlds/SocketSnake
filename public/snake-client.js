var socket = io();

socket.on('game', function (data) {
    updateGrid(data);
});

$('body').on('keypress', function(e){
    var code = e.keyCode || e.which;
    console.log("Pressed: " + code)
    if(code == 119) { //'w'
        socket.emit('playerMove', {id: 1, input: 3})
    }
    if(code == 97){ //'a'
        socket.emit('playerMove', {id: 1, input: 4})
    }
    if(code == 115){ //'s'
        socket.emit('playerMove', {id: 1, input: 1})
    }
    if(code == 100){ //'d'
        socket.emit('playerMove', {id: 1, input: 2})
    }
})

function initializeGrid(size){
    var grid = [];
    for(var y = 0; y < size; y++){
        var tempArr = [];
        for(var x = 0; x < size; x++){
            tempArr.push({});
        }
        grid.push(tempArr);
    }
    return grid;
}

function updateGrid(data){
    var snakeGrid = $('#snake-grid')
    var gridSize = data.config.gridSize;
    var players = data.players;

    var template = '';
    var grid = initializeGrid(data.config.gridSize);

    for(player in players){
        var snake = players[player];
        grid[snake.coords.y][snake.coords.x] = {color: snake.color}
        snake.tail.forEach(item =>{
            grid[item.coords.y][item.coords.x] = snake.color;
        })
    }

    //Write to template
    for(var y = 0; y < grid.length; y++){
        template += `<div class="row">`;
        for(var x = 0; x < grid[y].length; x++){
            if(grid[y][x].color){
                template += `<div class="box" style="background: ${grid[y][x].color}"></div>`
            }else{
                template += `<div class="box"></div>`
            }
        }
        template += `</div>`
    }
    snakeGrid.html(template);



}