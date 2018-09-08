var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');
var startBtn = document.getElementById('startBtn');
var helpBtn = document.getElementById('helpBtn');
var scoreBoard = document.getElementById('scoreBoard');
var audio = document.getElementById('bgm');

//canvas dimensions
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const FRAME_PER_SECOND = 50;

//player image dimensions
const PLAYER_WIDTH = 100;
const PLAYER_HEIGHT = 100;

//fruit image dimensions
const FRUIT_SIZE = {
  apple: [45, 57],
  grape: [65, 78],
  orange: [40, 46],
  pine: [50, 94]
}

//minimum distance for detecting player/fruit collision
const MIN_DISTANCE = 55;

//canvas boundries for player
const WIDTH_OFFSET = 15;
const BORDER_LEFT = PLAYER_WIDTH / 2 - WIDTH_OFFSET;
const BORDER_RIGHT = CANVAS_WIDTH - PLAYER_WIDTH / 2 + WIDTH_OFFSET;
const BORDER_TOP = PLAYER_HEIGHT / 2;
const BORDER_BOTTOM = CANVAS_HEIGHT - PLAYER_HEIGHT / 2;

//menu image dimensions
const MENU_WIDTH = 360;
const MENU_HEIGHT = 360;
const MENU_X = (CANVAS_WIDTH - MENU_WIDTH) / 2;
const MENU_Y = (CANVAS_HEIGHT - MENU_HEIGHT) / 2;

const GAME_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  GAME_OVER: 'GAME_OVER'
}

//global game variables
var frame, gameStatus, totalScore;

//player position, speed, direction etc.
var playerX, playerY, playerSpeed, playerDirection, playerImg, playerImgIdx;

const playerImgs = {
  up: ['b1', 'b2'],
  down: ['f1', 'f2'],
  left: ['l1', 'l2'],
  right: ['r1', 'r2'],
}

//vectors used to indicate player direction
const playerSpeedVector = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0]
}

//key used as image file name, value for image visibility
var showImgs = {
  background: true,
  apple: false,
  grape: false,
  orange: false,
  pine: false,
  home: true,
  help: false,
  end: false,
  player: false
}

//keep track of fruit location and score
var fruitData = {
  apple: {
    points: 150
  },
  grape: {
    points: 200
  },
  orange: {
    points: 100
  },
  pine: {
    points: 50
  }
};

function randomInt(min, max) {
  var val = Math.random() * (max - min) + min;
  return Math.floor(val);
}

//check if new fruit location is proper
function checkFruitLocation(fruit, x, y) {
  //new fruit should not be too close to player
  if(Math.abs((x - playerX) * (y - playerY)) < MIN_DISTANCE * MIN_DISTANCE ){
    return false;
  }
  //new fruit should not be too close to other fruits
  for(var key in fruitData) {
    if(key !== fruit) {
      // use condition a + b < 2 * c instead of a^2 + b^2 < c^2 to make fruits even farther from each other
      if(Math.abs(x - fruitData[key].x) + Math.abs(y - fruitData[key].y) < MIN_DISTANCE * 2 ) {
        return false;
      }
    }
  }
  return true;
}

//generate center fruit to a random location
function generateFruit(fruit) {
  var x, y;
  do {
    x = randomInt(BORDER_LEFT, BORDER_RIGHT);
    y = randomInt(BORDER_TOP, BORDER_BOTTOM);  
  } while(!checkFruitLocation(fruit, x, y));

  console.log('fruit ' + fruit + ' generated at', x, y);
  fruitData[fruit].x = x;
  fruitData[fruit].y = y;
}

function resize() {console.log('resizing...');
  //reset button position
  var box = canvas.getBoundingClientRect();
  var left = box.left + (CANVAS_WIDTH - MENU_WIDTH) / 2 + 30;
  startBtn.style.left = left + 'px';
  helpBtn.style.left = left + 100 + 'px';
}

function init() {
  frame = 0;
  gameStatus = GAME_STATUS.NOT_STARTED;
  playerX = CANVAS_WIDTH / 2;
  playerY = CANVAS_HEIGHT / 2;
  playerDirection = 'right';
  playerImg = playerImgs.left[0];
  playerImgIdx = 0;
  playerSpeed = 3;

  for(key in fruitData) {
    fruitData[key].score = 0;
    fruitData[key].count = 0;
  }
  totalScore = 0;
  scoreBoard.innerHTML = '';

  resize();
}

//start game
function startGame() {

  if(audio.paused) {
    audio.play();
  }

  if(gameStatus === GAME_STATUS.GAME_OVER) {
    init();
  }
  startBtn.style.visibility = 'hidden';
  helpBtn.style.visibility = 'hidden';
  showImgs.home = false;
  showImgs.help = false;
  showImgs.end = false;
  showImgs.player = true;
  showImgs.apple = true;
  showImgs.grape = true;
  showImgs.orange = true;
  showImgs.pine = true;

  gameStatus = GAME_STATUS.IN_PROGRESS;
  for(key in fruitData) {
    generateFruit(key);
  }
}

//toggle help menu
function helpGame() {
  showImgs.home = showImgs.help;
  helpBtn.textContent = showImgs.help ? 'Help' : 'Back';
  showImgs.help = !showImgs.help;
}

//show game over menu
function showGameOver() {
  gameStatus = GAME_STATUS.GAME_OVER;
  showImgs.end = true;
  startBtn.textContent = 'Restart';
  startBtn.style.visibility = 'visible';
  helpBtn.style.visibility = 'hidden';

  var box = canvas.getBoundingClientRect();
  var left = box.left + (CANVAS_WIDTH - MENU_WIDTH) / 2 + 240;
  scoreBoard.style.left = left + 'px';

  //show final score, e.g.
  // x 3<br>x 1<br>x 1<br>x 2<br>1200
  scoreBoard.innerHTML = 'x '+ fruitData.pine.count + '<br>x '+ 
    fruitData.apple.count + '<br>x ' +
    fruitData.grape.count + '<br>x ' +
    fruitData.orange.count + '<br>' + totalScore;
}

function drawImages(images) {
  for(var img in images) {
    switch(img) {
      case 'background':
        // ctx.drawImage(images.background, 0, 0); break;
        ctx.fillStyle = ctx.createPattern(images.background, 'repeat');
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        break;
      case 'player':
        ctx.drawImage(images.player, playerX - PLAYER_WIDTH/2, playerY - PLAYER_HEIGHT/2);
        break;
      case 'home':
      case 'help':
      case 'end':
        ctx.drawImage(images[img], MENU_X, MENU_Y);
        break;
      case 'apple':
      case 'grape':
      case 'orange':
      case 'pine':
        ctx.drawImage(images[img],
          fruitData[img].x - FRUIT_SIZE[img][0]/2,
          fruitData[img].y - FRUIT_SIZE[img][1]/2);
        break;
    }
  }
}

function loadImages (sources){
  var images = {};
  var loadImages = 0;
  var numImages = 0;
  
  //count number of visible images
  for(var src in sources) {
    if(showImgs[src] === true) {
      numImages++;
    }
  }
  //create all visible images, draw all them once last image is loaded
  for(var src in sources) {
    if(showImgs[src] === false) {
      continue;
    }
    images[src] = new Image ();
    images[src].onload = function(){
      if(++loadImages >= numImages){
        drawImages(images);
      }
    };
    if(src === 'player') {
      images[src].src = 'image/' + playerImg + '.png';
    } else {
      images[src].src = 'image/' + src + '.png';
    }
  }
}


function updatePlayer() {
  //move player
  playerX = playerX + playerSpeedVector[playerDirection][0] * playerSpeed;
  playerY = playerY + playerSpeedVector[playerDirection][1] * playerSpeed;

  //game over conditions
  if(playerX < BORDER_LEFT || playerX > BORDER_RIGHT ||
    playerY < BORDER_TOP || playerY > BORDER_BOTTOM) {
    gameStatus = GAME_STATUS.GAME_OVER;
  }

  //check if player can collect any fruit, if so reward points and re-generate fruit
  for(var key in fruitData) {
    if(Math.pow(fruitData[key].x - playerX, 2) + Math.pow(fruitData[key].y - playerY, 2) < MIN_DISTANCE * MIN_DISTANCE ) {
      fruitData[key].count++;
      totalScore += fruitData[key].points;
      generateFruit(key);
    }
  }

  //switch player image index between 0 and 1 to show animated player
  var framePerSwitch = Math.ceil(FRAME_PER_SECOND / 4);
  if(frame % framePerSwitch === 0) {
    playerImgIdx = 1 - playerImgIdx;
    playerImg = playerImgs[playerDirection][playerImgIdx];
  }

  //gradually increase player speed
  var framePerSpeedUp = FRAME_PER_SECOND;
  if(frame % framePerSpeedUp === 0) {
    playerSpeed += 0.2;
  }
}

function updateGameArea(){
  //load all images
  loadImages(showImgs);

  switch(gameStatus) {
    case GAME_STATUS.IN_PROGRESS:
      updatePlayer();
      frame++;
      break;
    case GAME_STATUS.GAME_OVER:
      showGameOver();
      break;
    case GAME_STATUS.NOT_STARTED:
    default:
  }
}

window.addEventListener ('keydown', function (e){
  if(gameStatus === GAME_STATUS.IN_PROGRESS) {
    switch(e.keyCode) {
      case 38:
        playerDirection = 'up'; break;
      case 40:
        playerDirection = 'down'; break
      case 37:
        playerDirection = 'left'; break;
      case 39:
        playerDirection = 'right'; break;
    }

    //set player image based on direction
    playerImg = playerImgs[playerDirection][playerImgIdx];
  }
})

init();
setInterval (updateGameArea, 1000 / FRAME_PER_SECOND);
document.getElementById('bgm').play();
