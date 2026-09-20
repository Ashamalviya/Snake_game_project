const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const highscoreEl = document.querySelector('#highscore');
const overlay = document.querySelector('#overlay');
const overlayTitle = document.querySelector('#overlayTitle');
const overlayText = document.querySelector('#overlayText');
const startButton = document.querySelector('#startButton');


const cols = 30;
const rows = 20;
const cell = canvas.width / cols;
const storedBest = Number(localStorage.getItem('snakeBest') || 0);
let highscore = storedBest;
let snake, food, direction, nextDirection, score, gameState, timer;
highscoreEl.textContent = highscore;

function resetGame() {
  snake = [{ x: 14, y: 10 }, { x: 13, y: 10 }, { x: 12, y: 10 }];
  food = placeFood();
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  gameState = 'playing';
  overlay.classList.add('hidden');
  clearInterval(timer);
  timer = setInterval(tick, 105);
  draw();
}

function placeFood() {
  let candidate;
  do {
    candidate = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
  } while (snake?.some(part => part.x === candidate.x && part.y === candidate.y));
  return candidate;
}

function tick() {
  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const hitWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
  const hitSelf = snake.some(part => part.x === head.x && part.y === head.y);
  if (hitWall || hitSelf) return endGame();

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > highscore) {
      highscore = score;
      highscoreEl.textContent = highscore;
      localStorage.setItem('snakeBest', highscore);
    }
    food = placeFood();
  } else snake.pop();
  draw();
}

function endGame() {
  clearInterval(timer);
  gameState = 'over';
  overlayTitle.textContent = 'Game Over';
  overlayText.textContent = `Your score was ${score}. Press the button or Enter to play again.`;
  startButton.textContent = 'Play Again';
  overlay.classList.remove('hidden');
  draw();
}

function draw() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#153d29');
  gradient.addColorStop(1, '#0b2418');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#ffffff0b';
  ctx.lineWidth = 1;
  for (let x = 0; x <= cols; x++) { ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, canvas.height); ctx.stroke(); }
  for (let y = 0; y <= rows; y++) { ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(canvas.width, y * cell); ctx.stroke(); }

  drawCell(food, '#ef4444', true);
  snake.forEach((part, index) => drawCell(part, index === 0 ? '#bbf7d0' : '#4ade80'));
}

function drawCell(part, color, isFood = false) {
  const gap = isFood ? 5 : 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(part.x * cell + gap, part.y * cell + gap, cell - gap * 2, cell - gap * 2, isFood ? 50 : 6);
  ctx.fill();
  if (isFood) { ctx.fillStyle = '#fecaca'; ctx.beginPath(); ctx.arc(part.x * cell + cell * .38, part.y * cell + cell * .32, 3, 0, Math.PI * 2); ctx.fill(); }
}

function setDirection(x, y) {
  if (direction.x + x !== 0 || direction.y + y !== 0) nextDirection = { x, y };
}

const keys = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
document.addEventListener('keydown', event => {
  if (keys[event.key]) { event.preventDefault(); setDirection(...keys[event.key]); }
  if (event.key === 'Enter' && gameState !== 'playing') startGame();
  if (event.key.toLowerCase() === 'p' && gameState === 'playing') { clearInterval(timer); gameState = 'paused'; overlayTitle.textContent = 'Paused'; overlayText.textContent = 'Press P to continue.'; startButton.textContent = 'Continue'; overlay.classList.remove('hidden'); }
  else if (event.key.toLowerCase() === 'p' && gameState === 'paused') startGame();
});
document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => { const d = button.dataset.direction; setDirection({ up: 0, down: 0, left: -1, right: 1 }[d], { up: -1, down: 1, left: 0, right: 0 }[d]); }));
startButton.addEventListener('click', startGame);
function startGame() { resetGame(); overlayTitle.textContent = 'Snake'; startButton.textContent = 'Start Game'; }

resetGame();
clearInterval(timer);
gameState = 'ready';
overlayTitle.textContent = 'Snake';
overlayText.textContent = 'Eat the red food, grow longer, and avoid the walls and yourself.';
overlay.classList.remove('hidden');
draw();
