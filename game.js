// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 3;
let gameRunning = false;
let gamePaused = false;

// Paddle
const paddle = {
    width: 100,
    height: 15,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    speed: 8,
    dx: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 4,
    dx: 4,
    dy: -4
};

// Bricks
const brick = {
    rows: 5,
    cols: 9,
    width: 75,
    height: 25,
    padding: 10,
    offsetX: 35,
    offsetY: 60,
    visible: []
};

// Initialize bricks
function initBricks() {
    brick.visible = [];
    for (let row = 0; row < brick.rows; row++) {
        brick.visible[row] = [];
        for (let col = 0; col < brick.cols; col++) {
            brick.visible[row][col] = true;
        }
    }
}

// Draw paddle
function drawPaddle() {
    ctx.fillStyle = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff88';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0;
}

// Draw bricks
function drawBricks() {
    for (let row = 0; row < brick.rows; row++) {
        for (let col = 0; col < brick.cols; col++) {
            if (brick.visible[row][col]) {
                const brickX = col * (brick.width + brick.padding) + brick.offsetX;
                const brickY = row * (brick.height + brick.padding) + brick.offsetY;
                
                // Brick color gradient based on row
                const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ee5a6f'];
                ctx.fillStyle = colors[row];
                ctx.shadowBlur = 5;
                ctx.shadowColor = colors[row];
                ctx.fillRect(brickX, brickY, brick.width, brick.height);
                
                // Brick border
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(brickX, brickY, brick.width, brick.height);
                ctx.shadowBlur = 0;
            }
        }
    }
}

// Move paddle
function movePaddle() {
    paddle.x += paddle.dx;
    
    // Wall collision detection
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Move ball
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Wall collision (left and right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }
    
    // Wall collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }
    
    // Paddle collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        ball.dy *= -1;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 8;
    }
    
    // Bottom collision (lose life)
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateLives();
        
        if (lives <= 0) {
            gameOver(false);
        } else {
            resetBall();
        }
    }
}

// Brick collision detection
function brickCollision() {
    for (let row = 0; row < brick.rows; row++) {
        for (let col = 0; col < brick.cols; col++) {
            if (brick.visible[row][col]) {
                const brickX = col * (brick.width + brick.padding) + brick.offsetX;
                const brickY = row * (brick.height + brick.padding) + brick.offsetY;
                
                if (
                    ball.x + ball.radius > brickX &&
                    ball.x - ball.radius < brickX + brick.width &&
                    ball.y + ball.radius > brickY &&
                    ball.y - ball.radius < brickY + brick.height
                ) {
                    ball.dy *= -1;
                    brick.visible[row][col] = false;
                    score += 10;
                    updateScore();
                    
                    // Check win condition
                    if (score === brick.rows * brick.cols * 10) {
                        gameOver(true);
                    }
                }
            }
        }
    }
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
}

// Update lives display
function updateLives() {
    document.getElementById('lives').textContent = lives;
}

// Game over
function gameOver(won) {
    gameRunning = false;
    const message = document.getElementById('gameMessage');
    message.classList.remove('hidden');
    
    if (won) {
        message.textContent = '🎉 You Win! 🎉';
        message.classList.add('win');
        message.classList.remove('lose');
    } else {
        message.textContent = '💥 Game Over! 💥';
        message.classList.add('lose');
        message.classList.remove('win');
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawPaddle();
    drawBall();
}

// Update game state
function update() {
    if (gameRunning && !gamePaused) {
        movePaddle();
        moveBall();
        brickCollision();
    }
    
    draw();
    requestAnimationFrame(update);
}

// Keyboard controls
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        paddle.dx = -paddle.speed;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!gameRunning) {
            startGame();
        } else {
            gamePaused = !gamePaused;
        }
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) {
        paddle.dx = 0;
    }
}

// Mouse controls
function mouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    paddle.x = mouseX - paddle.width / 2;
    
    // Keep paddle within bounds
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Start game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    document.getElementById('gameMessage').classList.add('hidden');
}

// Restart game
function restartGame() {
    score = 0;
    lives = 3;
    gameRunning = false;
    gamePaused = false;
    
    updateScore();
    updateLives();
    
    paddle.x = canvas.width / 2 - paddle.width / 2;
    resetBall();
    initBricks();
    
    document.getElementById('gameMessage').classList.add('hidden');
    
    draw();
}

// Event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
canvas.addEventListener('mousemove', mouseMove);
document.getElementById('restartBtn').addEventListener('click', restartGame);

// Initialize game
initBricks();
draw();
