"use strict";
// SELECTOR
const cvs = document.getElementById("breakout");
const ctx = cvs.getContext("2d");
ctx.lineWidth = 3;
cvs.style.border = "2px solid black";
const BG_IMAGE = new Image();
BG_IMAGE.src = "./background.jpg";

// GAME VARIABLE AND CONSTANT
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 50;
const PADDLE_MARGIN_BOTTOM = 50;
let leftArrow = false;
let rightArrow = false;
let GAME_OVER = false;
const ball_radius = 15;
let bricks = [];
let life = 3;
let score = 0;
let level = 1;
let MAX_LEVEL = 3;

// ============== GAME SOUND ==============
const BRICK_HIT = new Audio();
BRICK_HIT.src = "brick_hit.mp3";

const PADDLE_HIT = new Audio();
PADDLE_HIT.src = "sounds/paddle_hit.mp3";

const WALL_HIT = new Audio();
WALL_HIT.src = "sounds/wall_hit.mp3";

const LIFE_LOST = new Audio();
LIFE_LOST.src = "sounds/life_lost.mp3";

const WIN_GAME = new Audio();
WIN_GAME.src = "sounds/win_game.mp3";

// =========== SHOW GAME STATUS ==========
const LIFE_IMG = new Image();
LIFE_IMG.src = "./hearts.png";

const LEVEL_IMG = new Image();
LEVEL_IMG.src = "./trophyss.png";

const SCORE_IMG = new Image();
SCORE_IMG.src = "./stars.png";

function showGame(text, textX, textY, img, imgX, imgY) {
  ctx.fillStyle = "#FFF";
  ctx.font = "25px Germania One";
  ctx.fillText(text, textX, textY);
  ctx.drawImage(img, imgX, imgY, 25, 25);
}

function drawStatus() {
  showGame(score, 35, 25, SCORE_IMG, 5, 5);
  showGame(level, 190, 25, LEVEL_IMG, 165, 5);
  showGame(life, 370, 25, LIFE_IMG, 335, 5);
}

// CREAT PADDLE
const paddle = {
  x: cvs.width / 2 - PADDLE_WIDTH / 2,
  y: cvs.height - PADDLE_HEIGHT - PADDLE_MARGIN_BOTTOM,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dx: 5,
};

// DRAW PADDLE
function drawPaddle() {
  ctx.fillStyle = "black";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.strokeStyle = "orange";
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Move paddle
document.addEventListener("keydown", function (event) {
  if (event.keyCode == 37) {
    leftArrow = true;
  } else if (event.keyCode == 39) {
    rightArrow = true;
  }
});

document.addEventListener("keyup", function (event) {
  if (event.keyCode == 37) {
    leftArrow = false;
  } else if (event.keyCode == 39) {
    rightArrow = false;
  }
});

function movePaddle() {
  if (rightArrow && paddle.x + paddle.width < cvs.width) {
    paddle.x += paddle.dx;
  } else if (leftArrow && paddle.x > 0) {
    paddle.x -= paddle.dx;
  }
}

// ====== CREAT BALL ========
const ball = {
  x: cvs.width / 2,
  y: paddle.y - ball_radius,
  radius: ball_radius,
  speed: 5,
  dx: 4,
  dy: -4,
};

// ======== draw ball ========
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "orange";
  ctx.fill();

  ctx.strokeStyle = "red";
  ctx.stroke();
  ctx.closePath();
}

// ========= Move Ball =========
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

// =========== Move ball ballWallCollision ===========
function ballWallCollision() {
  if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
    WALL_HIT.play();
  }
  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
    WALL_HIT.play();
  }
  if (ball.y + ball.radius > cvs.height) {
    LIFE_LOST.play();
    life--;

    resetBall();
  }
}

// ========== RESET BALL =========
function resetBall() {
  ball.x = cvs.width / 2;
  ball.y = paddle.y - ball.radius;
  ball.dx = 2 + (Math.random() + 2 - 1);
  ball.dy = -2;
}

// ======= Move ball ballPaddleCollision =======
function ballPaddleCollision() {
  if (
    ball.y > paddle.y &&
    ball.y < paddle.y + paddle.height &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    PADDLE_HIT.play();
    let collidePoint = ball.x - (paddle.x + paddle.width / 2);
    collidePoint = collidePoint / (paddle.width / 2);
    let angle = collidePoint * (Math.PI / 3);
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }
}

// // ====== CREAT BRICK =======
let brick = {
  row: 1,
  column: 5,
  width: 55,
  height: 20,
  offSetLeft: 20,
  offSetTop: 20,
  marginTop: 50,
  fillColor: "yellow",
  strokeColor: "black",
};

// ========== CREAT BREAKS =========

function creatBricks() {
  for (let r = 0; r < brick.row; r++) {
    bricks[r] = [];
    for (let c = 0; c < brick.column; c++) {
      bricks[r][c] = {
        x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
        y:
          r * (brick.offSetTop + brick.height) +
          brick.offSetTop +
          brick.marginTop,
        status: true,
      };
    }
  }
}
creatBricks();

// // ========== DRAW BREAKS =========

function drawBricks() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      if (b.status) {
        ctx.fillStyle = "white";
        ctx.fillRect(b.x, b.y, brick.width, brick.height);

        ctx.strokeStyle = "red";
        ctx.fillRect(b.x, b.y, brick.width, brick.height);
        ctx.strokeRect(b.x, b.y, brick.width, brick.height);
      }
    }
  }
}

// ============ BALL AND BRICKS COLLISION ==========
function ballBrickCollision() {
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      let b = bricks[r][c];
      if (b.status) {
        if (
          ball.y - ball.radius < b.y + brick.height &&
          ball.y + ball.radius > b.y &&
          ball.x - ball.radius < b.x + brick.width &&
          ball.x + ball.radius > b.x
        ) {
          BRICK_HIT.play();
          b.status = false;
          ball.dy = -ball.dy;
          score++;
        }
      }
    }
  }
}

// check if game is over or not
function gameOver() {
  if (life <= 0) {
    gameLoseDisplay();
    GAME_OVER = true;
  }
}

// level up
function isLevelUp() {
  let isLevelDone = true;

  // check if all the bricks are broken
  for (let r = 0; r < brick.row; r++) {
    for (let c = 0; c < brick.column; c++) {
      isLevelDone = isLevelDone && !bricks[r][c].status;
    }
  }

  if (isLevelDone) {
    WIN_GAME.play();
    if (level >= MAX_LEVEL) {
      gameWinDisplay();
      GAME_OVER = true;
    }
    brick.row++; // increase row
    creatBricks(); // creat bricks
    ball.speed += 0.5; // increased speed
    resetBall(); // invoke reset ball
    level++; // increase level
  }
}

// DRAW
function draw() {
  drawPaddle();

  drawBall();

  drawBricks();

  drawStatus();
}

// update
function update() {
  movePaddle();

  moveBall();

  ballWallCollision();

  ballPaddleCollision();

  ballBrickCollision();

  gameOver();

  isLevelUp();
}

// ====== LOOPING FUNCTION =====
function loop() {
  //CLEAR CANVAS
  ctx.drawImage(BG_IMAGE, 0, 0);
  draw();

  update();

  if (!GAME_OVER) {
    requestAnimationFrame(loop);
  }
}
loop();

// =========== SOUND IMAGE =========
const soundElement = document.getElementById("sound_on");
soundElement.addEventListener("click", audioManager);

function audioManager() {
  let imgSrc = soundElement.getAttribute("src");
  // ========METHOD 1 TO CHANGE SOUND IMAGE=====
  // let soundImg =
  //   imgSrc == "./SOUND_ON.png" ? "./SOUND_OFF.png" : "./SOUND_ON.png";
  // soundElement.setAttribute("src", soundImg);

  //============ METHOD 2 TO CHANGE SOUND IMAGE===========

  if (imgSrc == "./SOUND_ON.png") {
    soundElement.setAttribute("src", "./SOUND_OFF.png");
  } else {
    soundElement.setAttribute("src", "./SOUND_ON.png");
  }

  // MUTE SOUND
  BRICK_HIT.muted = BRICK_HIT.muted ? false : true;
  WALL_HIT.muted = WALL_HIT.muted ? false : true;
  PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
  LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
  WIN_GAME.muted = WIN_GAME.muted ? false : true;
}

// ======== gameOver and gameWin image display ==========

const imggame = document.getElementById("imggame");
const gameOvers = document.getElementById("gameover");
const gameWins = document.getElementById("gamewin");
const playagain = document.getElementById("playagain");

// ========== RELOADING GAME AFTER LIFE OVER =========

playagain.addEventListener("click", function () {
  location.reload();
});

// ======== WHEN GAME IS OVER =============
function gameLoseDisplay() {
  imggame.style.display = "block";
  gameOvers.style.display = "block";
}
// ======== WHEN YOU WIN THE GAME =============
function gameWinDisplay() {
  imggame.style.display = "block";
  gameWins.style.display = "block";
}
