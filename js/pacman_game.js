var generator;
var canvas;
var ctx;
let pacman;
let ghosts;
let fruits;
let loopExecId;
let fruitSize;
let fruitColor;
let ghostSpeedCounter;

function gameInit(gameLevel) {
    clearInterval(loopExecId);
    $("#massage-container").html(``);
    let mazeWidth = 10, mazeHeight = 10, cellSize = 30, mazeDifficulty = 5, ghostSpeed = 1;
    if(gameLevel == 1){
        mazeWidth = 10;
        mazeHeight = 10;
        cellSize = 68;
        mazeDifficulty = 10;
        ghostSpeed = 3;
    } else if(gameLevel == 2){
        mazeWidth = 15;
        mazeHeight = 15;
        cellSize = 45;
        mazeDifficulty = 20;
        ghostSpeed = 2;
    } else if(gameLevel == 3){
        mazeWidth = 20;
        mazeHeight = 20;
        cellSize = 34;
        mazeDifficulty = 40;
        ghostSpeed = 1;
    }
    generator = new MazeGenerator();
    generator.init(mazeWidth, mazeHeight);
    generator.cellSize = cellSize;

    pacman = {
        x: 0,
        y: 0,
        size: generator.cellSize / 2,
        speed: 1,
        direction: { x: 0, y: 0 }
    };

    ghosts = [
        {
            x: mazeWidth-1,
            y: mazeHeight-1, 
            size: generator.cellSize / 2,
            speed: ghostSpeed, 
            direction: { x: 0, y: 0 }, 
            path: [],
            color: "red",
            pathDotX: 9
        },
        {
            x: 0, 
            y: mazeHeight-1, 
            size: generator.cellSize / 2, 
            speed: ghostSpeed, 
            direction: { x: 0, y: 0 },
            path: [],
            color: "pink",
            pathDotX: 6
        },
        {
            x: mazeWidth-1, 
            y: 0,
            size: generator.cellSize / 2, 
            speed: ghostSpeed, 
            direction: { x: 0, y: 0 },
            path: [],
            color: "blue",
            pathDotX: 3
        }
    ];

    fruitSize = 5;
    fruitColor = "orange";
    generateFruits(3, mazeHeight-3);
    $("#screen-container").html(`<canvas id="screen" width="${generator.cellSize * generator.width}" height="${generator.cellSize * generator.height}" />`);
    generateNewMaze(mazeDifficulty);
    ghostSpeedCounter = 0;
    loopExecId = setInterval(() => gameLoop(), 500);
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    let cell = generator.getCell(pacman.x, pacman.y);
    switch (event.key) {
        case 'ArrowUp':
            if(!cell.walls[0])
                pacman.direction = { x: 0, y: -pacman.speed };
            break;
        case 'ArrowRight':
            if(!cell.walls[1])
                pacman.direction = { x: pacman.speed, y: 0 };
            break;
        case 'ArrowDown':
            if(!cell.walls[2])
                pacman.direction = { x: 0, y: pacman.speed };
            break;
        case 'ArrowLeft':
            if(!cell.walls[3])
                pacman.direction = { x: -pacman.speed, y: 0 };
            break;

    }
});

/* Generate new maze */
function generateNewMaze(mazeDifficulty) {
    generator.rndSeed = Date.now();
    generator.generate(mazeDifficulty);
    canvas = $("#screen")[0];
    ctx = canvas.getContext("2d");
    drawMaze();
    drawPacman();
}

/* Draw maze on canvas */
function drawMaze() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, generator.cellSize * generator.width, generator.cellSize * generator.height);

    ctx.strokeStyle = "white";
    ctx.beginPath();

    for(let y=0;y<generator.height;y++) {
        for(let x=0;x<generator.width;x++) {
            let cell = generator.getCell(x, y);
            if(cell) {
                if(cell.walls[0]) {
                    ctx.moveTo(x * generator.cellSize, y * generator.cellSize);
                    ctx.lineTo((x + 1) * generator.cellSize, y * generator.cellSize);
                }
                if(cell.walls[1]) {
                    ctx.moveTo((x + 1) * generator.cellSize, y * generator.cellSize);
                    ctx.lineTo((x + 1) * generator.cellSize, (y + 1) * generator.cellSize);
                }
                if(cell.walls[2]) {
                    ctx.moveTo((x + 1) * generator.cellSize, (y + 1) * generator.cellSize);
                    ctx.lineTo(x * generator.cellSize, (y + 1) * generator.cellSize);
                }
                if(cell.walls[3]) {
                    ctx.moveTo(x * generator.cellSize, (y + 1) * generator.cellSize);
                    ctx.lineTo(x * generator.cellSize, y * generator.cellSize);
                }
            }
        }
    }
    ctx.stroke();
}

// Draw Pac-Man
function drawPacman() {
    ctx.beginPath();
    ctx.arc(pacman.x * generator.cellSize + pacman.size, pacman.y * generator.cellSize + pacman.size, pacman.size, 0.1 * Math.PI, 1.9 * Math.PI);  // Pac-Man mouth open
    ctx.lineTo(pacman.x * generator.cellSize + pacman.size, pacman.y * generator.cellSize + pacman.size);  // Close mouth
    ctx.fillStyle = "yellow";
    ctx.fill();
}

function drawGhost(ghost) {
    ctx.beginPath();
    ctx.arc(ghost.x * generator.cellSize + ghost.size, ghost.y * generator.cellSize + ghost.size, ghost.size, 0, 2 * Math.PI);
    ctx.fillStyle = ghost.color;
    ctx.fill();
}

// Draw ghosts
function drawGhosts() {
    ghosts.forEach(ghost => {drawGhost(ghost);});
}

// Move Pac-Man and handle collision
function movePacman() {
    const newX = pacman.x + pacman.direction.x;
    const newY = pacman.y + pacman.direction.y;
    pacman.x = newX;
    pacman.y = newY;
    pacman.direction = {x: 0, y: 0};
}

// Move Pac-Man and handle collision
function moveGhost(ghost) {
    if (ghostSpeedCounter % ghost.speed == 0) {
        let ghostCells = initGhostPathCells();
        if (ghost.path.length == 0 || ghost.path[0].x !== pacman.x || ghost.path[0].y !== pacman.y) {
            ghost.path.length = [];
            dfsSearch(ghost, ghost.x, ghost.y, ghostCells);
        }
        if (ghost.path.length) {
            let nextCell = ghost.path.pop();
            if (nextCell.x == ghost.x && nextCell.y == ghost.y && ghost.path.length) {
                nextCell = ghost.path.pop();
            }
            ghost.x = nextCell.x;
            ghost.y = nextCell.y;
        }
    }
    ghost.path.forEach(coord => {
        ctx.beginPath();
        ctx.arc(coord.x * generator.cellSize + 15 + ghost.pathDotX, coord.y * generator.cellSize + 15, 1, 0, 2 * Math.PI);
        ctx.fillStyle = ghost.color;
        ctx.fill();
    });

}

function moveGhosts() {
    ghosts.forEach(ghost => {moveGhost(ghost);});
    ghostSpeedCounter++;
}

// Game loop
function gameLoop() {
    clearCanvas();
    drawMaze();
    drawFruits();
    moveGhosts();
    drawGhosts();
    movePacman();
    drawPacman();
    isEatFruitCheck();
    isGameOverCheck();
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function dfsSearch(ghost, x, y, ghostCells){
    let cell = generator.getCell(x, y);
    ghostCells[x][y].visited = true;
    if(x == pacman.x && y == pacman.y){
        ghost.path.push({ x: x, y: y });
        return true;
    }
    if(cell && !cell.walls[0] && 0 <= y-1 && !ghostCells[x][y-1].visited){
        if (dfsSearch(ghost, x, y-1, ghostCells)){
            ghost.path.push({ x: x, y: y });
            return true;
        }
    }
    if(cell && !cell.walls[1] && generator.width > x+1 && ghostCells[x+1][y] && !ghostCells[x+1][y].visited){
        if (dfsSearch(ghost, x+1, y, ghostCells)){
            ghost.path.push({ x: x, y: y });
            return true;
        }
    }
    if(cell && !cell.walls[2] && generator.height > y+1 && ghostCells[x][y+1] && !ghostCells[x][y+1].visited){
        if (dfsSearch(ghost, x, y+1, ghostCells)){
            ghost.path.push({ x: x, y: y });
            return true;
        }
    }
    if(cell && !cell.walls[3] && 0 <= x-1 && ghostCells[x-1][y] && !ghostCells[x-1][y].visited){
        if (dfsSearch(ghost, x-1, y, ghostCells)){
            ghost.path.push({ x: x, y: y });
            return true;
        }
    }
    ghostCells[x][y].visited = false;
    return false;    
}

function initGhostPathCells() {
    let cells = [];
    for(let y=0;y<generator.width;y++) {
        cells.push([]);
        for(let x=0;x<generator.height;x++) {
            cells[y].push(new MazeCell(x, y));
        }
    }
    return cells;
}

function drawFruit(fruit) {
    ctx.beginPath();
    ctx.arc(fruit.x * generator.cellSize + generator.cellSize/2, fruit.y * generator.cellSize + generator.cellSize/2, fruitSize, 0, 2 * Math.PI);
    ctx.fillStyle = fruitColor;
    ctx.fill();
}

// Draw ghosts
function drawFruits() {
    fruits.forEach(fruit => {drawFruit(fruit);});
}

// Draw ghosts
function generateFruits(from, to) {
    fruits = [];
    for(let y=from;y<to;y++) {
        for(let x=from;x<to;x++) {
            if(y == from || y == to-1 || x == from || x == to-1)
            fruits.push({x: x, y: y });
        }
    }
}

// Clear canvas
function isGameOverCheck() {
    if(fruits.length == 0){
        clearInterval(loopExecId);
        clearCanvas();
        $("#massage-container").html(`<p>You win</p>`);
    }
    ghosts.forEach(ghost => {
        if(ghost.x == pacman.x && ghost.y == pacman.y){
            clearInterval(loopExecId);
            clearCanvas();
            $("#massage-container").html(`<p>Game over</p>`);
        }
    });
}

// Clear canvas
function isEatFruitCheck() {
    fruits = fruits.filter((fruit) => fruit.x !== pacman.x || fruit.y !== pacman.y);
}