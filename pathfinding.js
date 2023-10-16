console.clear();

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("start");
const endBtn = document.getElementById("end");
const buildBtn = document.getElementById("build");
const eraseBtn = document.getElementById("erase");
const runBtn = document.getElementById("run");

const COLORS = {
    start: "#e80000",
    end: "#00bc19",
    block: "#001b52",
    selection: "rgba(0, 0, 0, 0.4)",
};

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;
    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }
    return arr;
}

const s = 512; // Canvas Size
const gridS = 16; // Grid Size
const sS = s / gridS; // Square Size
const hSS = sS / 2; // Half Square Size

// 0 : Void
// 1 : Block
// 2 : Start
// 3 : End
let map = createArray(gridS, gridS);

canvas.addEventListener("contextmenu", (e) => e.preventDefault());

let pixelRatio = 0;

let selection = undefined;

function resizeCanvas() {
    pixelRatio = Math.ceil(window.devicePixelRatio || 1); // Pixel Ratio
    canvas.style.width = s + "px";
    canvas.style.height = s + "px";
    canvas.width = s * pixelRatio;
    canvas.height = s * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);
}

resizeCanvas();

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: parseInt(e.clientX - rect.left),
        y: parseInt(e.clientY - rect.top),
    };
}

function checkArray(array, data) {
    return array.some((element) => {
        return (
            element.length === data.length &&
            element.every((value, index) => {
                return value === data[index];
            })
        );
    });
}

function removeArrayElement(array, data) {
    const index = array.findIndex((element) => {
        return (
            element.length === data.length &&
            element.every((value, index) => {
                return value === data[index];
            })
        );
    });
    if (index !== -1) {
        array.splice(index, 1);
        return true;
    }
    return false;
}

function areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

const blockList = [];

function drawGrid() {
    for (let x = 0; x < gridS; x++) {
        for (let y = 0; y < gridS; y++) {
            if ((x + y) % 2 === 0) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            } else ctx.fillStyle = "rgba(0, 0, 0, 0)";
            fillBlock(x, y);
        }
    }
}

function fillBlock(x, y) {
    ctx.fillRect(sS * x, sS * y, sS, sS);
}
function fillCircle(x, y) {
    ctx.beginPath();
    ctx.arc(x * sS + hSS, y * sS + hSS, hSS * (80 / 100), 0, 2 * Math.PI);
    ctx.fill();
}

function drawCircle(color, pos) {
    ctx.fillStyle = color;
    fillCircle(pos[0], pos[1]);
}

function updateDraw() {
    clear();
    drawGrid();
    drawBlocks();
    drawSelection();
}

function drawBlocks() {
    for (let x = 0; x < map.length; x++) {
        for (let y = 0; y < map[x].length; y++) {
            switch (map[x][y]) {
                case 1:
                    drawBlock(x, y);
                    break;
                case 2:
                    ctx.fillStyle = "rgba(255,255,255,0.5)";
                    drawCircle(COLORS.start, [x, y]);
                    break;
                case 3:
                    drawCircle(COLORS.end, [x, y]);
                    break;
                default:
                    break;
            }
        }
    }
}
function drawBlock(x, y) {
    ctx.fillStyle = COLORS.block;
    ctx.fillRect(x * sS, y * sS, sS, sS);
}

function drawSelection() {
    if (selection !== undefined) {
        ctx.fillStyle = COLORS.selection;
        fillBlock(selection[0], selection[1]);
    }
}

// 0 Start Pos // [0, 0]
// 1 End Pos // [0, 0]
// 2 Build, 2.1 = Rect, 2.2 = Draw
// 3 Erase
let mode = undefined;

// Generate random number from 0 to "max"
// getRandomInt
function gRI(max) {
    return Math.floor(Math.random() * (max + 1));
}
// ----------------------------------------------------------------

// Set the start and end positions to a random position different from each other
// The position can be set to "undefined"
let startPos = [gRI(gridS - 1), gRI(gridS - 1)]; // || undefined
map[startPos[0]][startPos[1]] = 2;
let endPos = [gRI(gridS - 1), gRI(gridS - 1)]; // || undefined
while (endPos === startPos) {
    endPos = [gRI(gridS - 1), gRI(gridS - 1)];
}
map[endPos[0]][endPos[1]] = 3;
// ----------------------------------------------------------------

function roundPos(position) {
    return Math.floor(position / sS) * sS;
}

canvas.addEventListener("click", (e) => {
    const mousePos = getMousePos(e);
    const rX = roundPos(mousePos.x) / sS;
    const rY = roundPos(mousePos.y) / sS;
    const rPos = [rX, rY];

    if (mode === 0 && startPos != rPos) {
        if (map[rX][rY] === undefined || map[rX][rY] === 0) {
            map[startPos[0]][startPos[1]] = 0;
            map[rX][rY] = 2;
            startPos = rPos;
            updateDraw();
            return;
        }
    }
    if (mode === 1 && endPos != rPos) {
        if (map[rX][rY] === undefined || map[rX][rY] === 0) {
            map[endPos[0]][endPos[1]] = 0;
            map[rX][rY] = 3;
            endPos = rPos;
            updateDraw();
            return;
        }
    }
});

updateDraw();

startBtn.addEventListener("click", () => {
    mode = 0;
});
endBtn.addEventListener("click", () => {
    mode = 1;
});
buildBtn.addEventListener("click", () => {
    mode = 2;
});
eraseBtn.addEventListener("click", () => {
    mode = 3;
});

let isDrawing = false;
let mouseFirstPos = undefined;

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    selection = undefined;
    const mousePos = getMousePos(e);
    const rX = roundPos(mousePos.x) / sS;
    const rY = roundPos(mousePos.y) / sS;

    const blockPos = [rX, rY];
    mouseFirstPos = blockPos;
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});

canvas.addEventListener("mouseout", (e) => {
    if (selection !== "wait") {
        selection = undefined;
        updateDraw();
    }
});

canvas.addEventListener("mousemove", (e) => {
    const mousePos = getMousePos(e);
    const rX = roundPos(mousePos.x) / sS;
    const rY = roundPos(mousePos.y) / sS;
    const blockPos = [rX, rY];

    if (selection !== "wait") {
        selection = blockPos;
    }

    if (isDrawing) {
        if (mode === 2) {
            if (!checkArray(blockList, blockPos) && !areArraysEqual(blockPos, startPos) && !areArraysEqual(blockPos, endPos)) {
                blockList.push(blockPos);
            }
        }
    }

    if (selection !== "wait") {
        updateDraw();
    }
});

runBtn.addEventListener("click", () => {});
/*




























*/
class Nodee {
    constructor(x, y, g = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.g = g; // Cost from start to this node
        this.h = h; // Heuristic (estimated) cost from this node to the end
        this.f = g + h; // The total cost (f = g + h)
        this.parent = null; // Parent node for reconstructing the path
    }
}
let openSet = [];
let closedSet = [];
function drawPath(path) {
    ctx.strokeStyle = "rgba(255, 255, 0, 0.6)";
    ctx.lineWidth = sS / 2;

    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        const x = path[i][0] * sS + hSS;
        const y = path[i][1] * sS + hSS;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}
function generateNeighbors(nodee) {
    const neighbors = [];
    const x = nodee.x;
    const y = nodee.y;

    // Define possible movements: up, down, left, right
    const movements = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ];

    for (let i = 0; i < movements.length; i++) {
        const dx = movements[i][0];
        const dy = movements[i][1];

        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < gridS && newY >= 0 && newY < gridS) {
            neighbors.push(new Nodee(newX, newY));
        }
    }

    return neighbors;
}

function heuristic(nodee, endNodee) {
    // Manhattan distance heuristic
    return Math.abs(nodee.x - endNodee.x) + Math.abs(nodee.y - endNodee.y);
}
runBtn.addEventListener("click", () => {
    // Initialize open and closed sets
    openSet.length = 0;
    closedSet.length = 0;

    // Create start and end nodees
    const startNodee = new Nodee(startPos[0], startPos[1]);
    const endNodee = new Nodee(endPos[0], endPos[1]);

    // Add the start nodee to the open set
    openSet.push(startNodee);

    // Perform A* algorithm
    while (openSet.length > 0) {
        // Find the nodee with the lowest f value in the open set
        let currentNodee = openSet[0];
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < currentNodee.f) {
                currentNodee = openSet[i];
            }
        }

        // Remove the current nodee from the open set
        openSet.splice(openSet.indexOf(currentNodee), 1);

        // Add the current nodee to the closed set
        closedSet.push(currentNodee);

        // If we've reached the end nodee, reconstruct the path and draw it
        if (currentNodee.x === endNodee.x && currentNodee.y === endNodee.y) {
            let path = [];
            let temp = currentNodee;
            while (temp) {
                path.push([temp.x, temp.y]);
                temp = temp.parent;
            }
            path.reverse();

            // Draw the path
            drawPath(path);
            return;
        }

        // Generate neighbors for the current nodee
        const neighbors = generateNeighbors(currentNodee);

        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];

            // Skip if the neighbor is in the closed set or is a block
            if (
                closedSet.some((nodee) => nodee.x === neighbor.x && nodee.y === neighbor.y) ||
                map[neighbor.x][neighbor.y] === 1
            ) {
                continue;
            }

            // Calculate the tentative g score
            let tentativeG = currentNodee.g + 1;

            // If this path is better than the previous one, store it
            if (!openSet.some((nodee) => nodee.x === neighbor.x && nodee.y === neighbor.y) || tentativeG < neighbor.g) {
                neighbor.parent = currentNodee;
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, endNodee);
                neighbor.f = neighbor.g + neighbor.h;

                if (!openSet.some((nodee) => nodee.x === neighbor.x && nodee.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        }
        selection = "wait";
    }

    console.log("No path found");
});
