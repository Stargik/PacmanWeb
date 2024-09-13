class MazeCell {
    x; y;
    walls;
    visited;
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
        this.walls = [true, true, true, true];  
        this.visited = false;
    }
    reset() {
        this.visited = false;
        this.walls.fill(true);
    }
}

class MazeGenerator {
    cells;         
    width;         
    height;        
    curCell;       
    stack;          
    cellSize;      
    rndSeed;       
    reseted;        
    constructor(seed) {
        if(typeof seed == 'number')
            this.rndSeed = seed;
        else
            this.rndSeed = Date.now();
        this.stack = [];
        this.cellSize = 5;
        this.reseted = true;
    }
    init(_w, _h) {
        this.width = _w;
        this.height = _h;
        this.cells = null;
        this.initCells();
    }

    initCells() {
        this.cells = [];
        for(let y=0;y<this.height;y++) {
            this.cells.push([]);
            for(let x=0;x<this.width;x++) {
                this.cells[y].push(new MazeCell(x, y));
            }
        }
    }

    getNeighbors(x, y) {
        return [
            this.getCell(x, y - 1),    
            this.getCell(x + 1, y),     
            this.getCell(x, y + 1),    
            this.getCell(x - 1, y),    
        ];
    }

    getCell(x, y) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height)
            return null;
        return this.cells[y][x];
    }

    removeWall(a, b) {
        let x = a.x - b.x;
        if (x === 1) {
            a.walls[3] = false;
            b.walls[1] = false;
        } else if (x === -1) {
            a.walls[1] = false;
            b.walls[3] = false;
        }
        let y = a.y - b.y;
        if (y === 1) {
            a.walls[0] = false;
            b.walls[2] = false;
        } else if (y === -1) {
            a.walls[2] = false;
            b.walls[0] = false;
        }
    }

    reset() {
        for(let y=0;y<this.height;y++) {
            for(let x=0;x<this.width;x++) {
                let cell = this.getCell(x, y);
                if(cell) {
                    cell.reset();
                }
            }
        }
        this.reseted = true;
    }

    generate(mazeDifficulty) {
        var countOfSteps = 0;
        var countOfStepsForLoop = 0;
        if(!this.reseted)
            this.reset();
        this.curCell = this.getCell(0, 0);
        this.curCell.visited = true;
        this.stack.push(this.curCell);
        while(this.stack.length > 0 ) {
            countOfSteps++;
            countOfStepsForLoop++;
            this.curCell = this.stack.pop();
            let neighbors = this.getNeighbors(this.curCell.x, this.curCell.y);
            let unvisitedNeighbors = [];
            for(let i=0;i < neighbors.length;i++) {
                var isAddLoop = countOfStepsForLoop >= mazeDifficulty;
                if(neighbors[i] && (!neighbors[i].visited || isAddLoop)){
                    unvisitedNeighbors.push(neighbors[i]);
                    if(isAddLoop && neighbors[i].visited)
                        countOfStepsForLoop = 0;
                }  
            }
            if(unvisitedNeighbors.length > 0) {
                this.stack.push(this.curCell);
                let neighbor = this.rndElement(unvisitedNeighbors);
                this.removeWall(this.curCell, neighbor);
                neighbor.visited = true;
                this.stack.push(neighbor);
            }
        }
        this.reseted = false;
    }

    rnd() {
        this.rndSeed = (this.rndSeed * 9301 + 49297) % 233280;
        return this.rndSeed / 233280.0;
    }

    rndArbitrary(min, max) {
        return min + this.rnd() * (max - min);
    }

    rndElement(arr) {
        if(!arr || arr.length == 0)
          return null;
        return arr[Math.round(this.rndArbitrary(0, arr.length - 1))];
    }
}