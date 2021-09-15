let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let mousedown = false;

let mazeWidth = 20;
let mazeHeight = 20;
let squareSize = 24;
let spaceSize = 1;
let canvasRect;

let mazeMatrix = [];
let startSquare, endSquare = null;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class Index {
    constructor(i, j) {
        this.i = i;
        this.j = j;
    }
}

const directions = {
	UP: "up",
	RIGHT: "right",
	DOWN: "down",
	LEFT: "left",
};

const squareModes = {
    WALL: "wall",
    EMPTY: "empty",
    START: "start",
    END: "end", 
};

let currentSquareMode = squareModes.WALL;

function clickPositionToIndex(posX, posY) {
    canvasRect = canvas.getBoundingClientRect();

    let indexX = Math.floor((posX - canvasRect.left) / (squareSize + spaceSize));
    indexX = clamp(indexX, 0, mazeWidth-1);

    let indexY = Math.floor((posY - canvasRect.top) / (squareSize + spaceSize));
    indexY = clamp(indexY, 0, mazeHeight-1);

    return new Index(indexX, indexY);
}

function drawMaze() {

    ctx.beginPath();
    ctx.moveTo(0, 0);

    for (let i = 0; i < mazeWidth; i++) {
        for (let j = 0; j < mazeHeight; j++) {

            switch (mazeMatrix[i][j]) {
                case " ":
                    ctx.fillStyle = "white";
                    break;
                case "X":
                    ctx.fillStyle = "black";
                    break;
                case "S":
                    ctx.fillStyle = "red";
                    break;
                case "E":
                    ctx.fillStyle = "green";
                    break;
                default:
                    break;
            }
                
            ctx.fillRect((squareSize+spaceSize)*i + 1, (squareSize+spaceSize)*j + 1, squareSize, squareSize);
        }
    }
}

function updateSquare(index) {

    switch (currentSquareMode) {
        case squareModes.WALL:
            mazeMatrix[index.i][index.j] = "X";
            break;

        case squareModes.EMPTY:
            mazeMatrix[index.i][index.j] = " ";
            break;

        case squareModes.START:
            if (startSquare)
                mazeMatrix[startSquare.i][startSquare.j] = " ";
            
            mazeMatrix[index.i][index.j] = "S";
            startSquare = new Index(index.i, index.j);
            break;

        case squareModes.END:
            if (endSquare)
                mazeMatrix[endSquare.i][endSquare.j] = " ";
            
            mazeMatrix[index.i][index.j] = "E";
            endSquare = new Index(index.i, index.j);
            break;

        default:
            break;
    }
    drawMaze();
}

function initializeMaze() {
    canvas.width = mazeWidth*squareSize + (mazeWidth-1)*spaceSize + 2;
    canvas.height = mazeHeight*squareSize + (mazeHeight-1)*spaceSize + 2;

    for (let i = 0; i < mazeWidth; i++) {
        let mazeMatrixRow = [];
        for (let j = 0; j < mazeHeight; j++) {
            mazeMatrixRow.push(" ");
        }
        mazeMatrix.push(mazeMatrixRow);
    }

    drawMaze();

    // console.log(mazeMatrix);

    // setTimeout(drawBoard, 500);
}

canvas.addEventListener("mousedown", function(event) {
    mousedown = true;
    let clickIndex = clickPositionToIndex(event.pageX, event.pageY);  
    updateSquare(clickIndex);
});

document.addEventListener("mouseup", function() {
    mousedown = false;
});

canvas.addEventListener("mousemove", function(event) {
    let clickIndex = clickPositionToIndex(event.pageX, event.pageY);

    if (mousedown)
        updateSquare(clickIndex);
});

document.addEventListener("keypress", function(event) {
    switch (event.key) {
        case "1":
            currentSquareMode = squareModes.WALL;
            break;
        case "2":
            currentSquareMode = squareModes.EMPTY;
            break;
        case "3":
            currentSquareMode = squareModes.START;
            break;
        case "4":
            currentSquareMode = squareModes.END;
            break;    
        case "p":
            console.log(mazeMatrix);
        default:
            break;
    }
});

initializeMaze();

