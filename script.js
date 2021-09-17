let canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const paintModeButtons = document.getElementsByClassName("paint-mode-button");
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
	UP: 0,
	RIGHT: 1,
	DOWN: 2,
	LEFT: 3,
};

const squareModes = {
    WALL: "X",
    EMPTY: " ",
    START: "S",
    END: "E", 
    TRAVERSE: "T",
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
                case squareModes.WALL:
                    ctx.fillStyle = "black";
                    break;
                case squareModes.EMPTY:
                    ctx.fillStyle = "white";
                    break;
                case squareModes.START:
                    ctx.fillStyle = "red";
                    break;
                case squareModes.END:
                    ctx.fillStyle = "green";
                    break;
                case squareModes.TRAVERSE:
                    ctx.fillStyle = "blue";
                default:
                    break;
            }
                
            ctx.fillRect((squareSize+spaceSize)*i + 1, (squareSize+spaceSize)*j + 1, squareSize, squareSize);
        }
    }
}

function updateSquare(index) {

    switch (currentSquareMode) {
        case squareModes.START:
            if (startSquare)
                mazeMatrix[startSquare.i][startSquare.j] = " ";
            
            startSquare = new Index(index.i, index.j);
            break;
        case squareModes.END:
            if (endSquare)
                mazeMatrix[endSquare.i][endSquare.j] = " ";
            
            endSquare = new Index(index.i, index.j);
            break;
        case squareModes.TRAVERSE:
            return;
        default:
            break;
    }

    mazeMatrix[index.i][index.j] = currentSquareMode;

    if (currentSquareMode != squareModes.START && startSquare && index.i == startSquare.i && index.j == startSquare.j)
        startSquare = null;

    if (currentSquareMode != squareModes.END && endSquare && index.i == endSquare.i && index.j == endSquare.j)
        endSquare = null;

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

function changePaintMode(mode, button) {
    currentSquareMode = mode;

    for (let index = 0; index < paintModeButtons.length; index++)
        paintModeButtons[index].removeAttribute("disabled");   

    button.setAttribute("disabled", "");
}

function getAdjacentSquareIndexOf(index, direction) {
    
    let adjacentSquareIndex = null;

    switch (direction) {
        case directions.UP:
            adjacentSquareIndex = new Index(index.i, index.j-1);
            break;
        case directions.RIGHT:
            adjacentSquareIndex = new Index(index.i+1, index.j);
            break;
        case directions.DOWN:
            adjacentSquareIndex = new Index(index.i, index.j+1);
            break;
        case directions.LEFT:
            adjacentSquareIndex = new Index(index.i-1, index.j);
            break;
        default:
            break;
    }

    return adjacentSquareIndex;
}

function getAdjacentSquaresAvailability(index) {

    // Array of available adjacent squares (up, right, down, left)
    availability = [];

    for (let i = 0; i < 4; i++) {
        let adjacentSquare = getAdjacentSquareIndexOf(index, i);
        availability.push(adjacentSquare.i >= 0 && adjacentSquare.i < mazeHeight
                        && adjacentSquare.j >= 0 && adjacentSquare.j < mazeWidth
                        && (mazeMatrix[adjacentSquare.i][adjacentSquare.j] == squareModes.EMPTY
                            || mazeMatrix[adjacentSquare.i][adjacentSquare.j] == squareModes.END));
    }

    return availability;
}

function startSolvingMaze(button) {
    for (let index = 0; index < paintModeButtons.length; index++)
        paintModeButtons[index].setAttribute("disabled", "");

    button.setAttribute("disabled", "");

    currentSquareMode = squareModes.TRAVERSE;
    recursiveMazeSolver(startSquare);
}

function sleep(milliseconds) {
var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
        break;
        }
    }
}

function printMatrix(matrix) {
    for (let j = matrix.length-1; j >= 0; j--) {
        let string = "";
        for (let i = 0; i < matrix[j].length; i++) {
            string += matrix[i][j] + " ";
        }
        console.log(string);
    }
    console.log();
}

function recursiveMazeSolver(index) {
    // console.log(index.i + ", " + index.j);
    // console.log(mazeMatrix[index.i][index.j] + "\n");
    let tempMatrix = mazeMatrix.slice();

    if (mazeMatrix[index.i][index.j] == squareModes.END)
        return true;

    mazeMatrix[index.i][index.j] = squareModes.TRAVERSE;
    drawMaze();


    let availability = getAdjacentSquaresAvailability(index);
    // console.log(availability);

    for (let i = 0; i < availability.length; i++) {
        let adjacentSquare = getAdjacentSquareIndexOf(index, i);
        if (availability[i] && recursiveMazeSolver(adjacentSquare)) {
            return true;
        }
        mazeMatrix = tempMatrix.slice();
        drawMaze();
    }

    return false;
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


initializeMaze();


