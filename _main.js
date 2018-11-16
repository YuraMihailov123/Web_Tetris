const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
var countDonePiece=0;
var arrayScore=[];
var tempDropInterval;

function arenaSweep() {
    let rowCount=1;
    outer: for(let y=arena.length -1;y>0;--y){
        for(let x = 0;x<arena[y].length;++x){
            if(arena[y][x]===0){
                continue outer;
            }
        }
        const row = arena.splice(y,1)[0].fill(0);
        arena.unshift(row);
        ++y;
        soundClickSpliceLine()
        player.score +=rowCount*10;
        rowCount*=2;
        if(player.score%20===0){
            player.level++;
            dropInterval-=500;
            updateLevel();
            //console.log(dropInterval);
        }
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            //console.log(o.y/20);
            if (m[y][x] !== 0 && (arena[y + (o.y / 20)] && arena[y + (o.y / 20)][x + (o.x / 20)]) !== 0) {
                return true;
            }
        }
    }
    return false;
}


function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function sortTableScore() {
    let x=0;
    var temp=[];
    var arrayParse=[];
    for(let x =0;x<sessionStorage.length;x++){
        arrayParse[x] = JSON.parse(sessionStorage.getItem(x.toString()));
    }

    while(x<(arrayParse.length-1)){
        if(arrayParse[x][1] < arrayParse[x+1][1]){
            temp = arrayParse[x];
            arrayParse[x] = arrayParse[x+1];
            arrayParse[x+1]=temp;
            sessionStorage.setItem(x.toString(),JSON.stringify(arrayParse[x]));
            sessionStorage.setItem((x+1).toString(),JSON.stringify(arrayParse[x+1]));
            x=0;
        }
        x++;
    }
}

function drawRecords() {
    let y_coord = 150;
    let size_table = 7;
    if(sessionStorage.length<size_table){
        size_table =sessionStorage.length;
    }
    sortTableScore();
    ctx.fillStyle = "white";
    ctx.font = "25px serif";
    ctx.fillText("Records",0,y_coord);
    for (let x=0;x<size_table;x++){
        y_coord+=25;
        ctx.fillText((x+1).toString()+". "+JSON.parse(sessionStorage.getItem(x.toString()))[0]+": "+JSON.parse(sessionStorage.getItem(x.toString()))[1],0,y_coord);
    }
}

function draw() {

    //ctx.clearRect()
    ctx.fillStyle = '#202028';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(300, 0, 242, 361);//main window - [300+240 ; 0+360]+12 + 18
    ctx.strokeRect(0, 0, 120, 120);//preview window

    drawRecords();

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
    drawNextPiece(player.nextMatrix);

}

function drawNextPiece(matrix) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.strokeStyle = "black";
                ctx.strokeRect(30+20 * x  ,
                    30+20 * y,
                    20, 20);
                ctx.fillStyle = colors[value];
                ctx.fillRect(30+20 * x  ,
                    30+20 * y,
                    20, 20);
            }
        });
    });
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.strokeStyle = "black";
                ctx.strokeRect(301 + 20 * x  + offset.x,
                    20 * y + offset.y,
                    20, 20);
                ctx.fillStyle = colors[value];
                ctx.fillRect(301 + 20 * x  + offset.x,
                    20 * y + offset.y,
                    20, 20);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + (player.pos.y / 20)][x + (player.pos.x / 20)] = value;
            }
        });
    });
}

function playerDrop() {
    soundClickDrop();
    player.pos.y += 20;
    //console.table(arena);
    if (collide(arena, player)) {
        //console.log(player.pos.x,player.pos.y);
        player.pos.y -= 20;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        //dropInterval=tempDropInterval;
    }
    dropCounter = 0;
}

function playerMove(dir) {
    soundClickDrop();
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function randomPiece() {
    const pieces = 'ILJOTSZ';
    return pieces[pieces.length * Math.random() | 0];
}

function soundClickSpliceLine() {
    var audio = new Audio();
    audio.src = 'soundClick.wav';
    audio.autoplay = true;
}

function soundClickDrop() {
    var audio = new Audio();
    audio.volume = 0.23;
    audio.src = 'soundFall.wav';
    audio.autoplay = true;

}

var audio = new Audio();
audio.src = 'soundBack.wav';
function soundClickBack() {

    audio.autoplay = true;
    audio.loop =true;
}

function playerReset() {

    if(countDonePiece===0) {
        player.matrix = createPiece(randomPiece());
        player.nextMatrix = createPiece(randomPiece());
    }else {
        player.matrix = player.nextMatrix;
        player.nextMatrix = createPiece(randomPiece());
    }
    countDonePiece++;
    player.pos.y = 0;
    player.pos.x = 20 * ((arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0));
    if (collide(arena, player)) {

        arrayScore.push(localStorage.getItem((localStorage.length-1).toString()),player.score);
        sessionStorage.setItem(sessionStorage.length.toString(),JSON.stringify(arrayScore));

        alert("Game over!\n Try again!");
        window.location = "_index.html";
        arena.forEach(row => row.fill(0));
        player.score =0;
        updateScore();

    }
}

function playerRotate(dir) {
    soundClickDrop();
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset * 20;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];

        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else matrix.reverse();
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {

        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function updateLevel() {
    document.getElementById("3").innerText = "Player:" + localStorage.getItem((localStorage.length-1).toString());

    document.getElementById("level").innerText = "Level: "+player.level;
}

function updateScore() {
    document.getElementById("score").innerText = "Score: "+player.score;
}

const colors = [
    null,
    'red',
    'blue',
    'violet',
    'green',
    'purple',
    'orange',
    'pink',
];

const arena = createMatrix(12, 18);

const player = {
    pos: {x: 0 * 20, y: 0 * 20},
    matrix: null,
    nextMatrix: null,
    score: 0,
    level: 1,
};

document.addEventListener('keydown', (event) => {
    const keyName = event.key;
    if (keyName === "ArrowLeft") {
        playerMove(-20);

    }
    if (keyName === "ArrowRight") {
        playerMove(20);
    }
    if (keyName === "ArrowDown") {
        playerDrop();
    }
    if (keyName === "ArrowUp") {
        playerRotate(-1)
    }
    if (keyName === " ") {
        //playerFastDrop();
        tempDropInterval = dropInterval;
        dropInterval=1;
        playerDrop();
    }
});
soundClickBack();
updateLevel();
updateScore();
playerReset();
update();
//drawNextPiece();



