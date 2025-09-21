// === GAME VARIABLES ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Table settings
const TABLE_WIDTH = canvas.width;
const TABLE_HEIGHT = canvas.height;
const POCKET_RADIUS = 25;

// Ball settings
const BALL_RADIUS = 10;
const BALL_FRICTION = 0.985;

// Cue settings
let isDragging = false;
let shotPower = 0;
const MAX_POWER = 100;
let cueAngle = 0;
const CUE_LENGTH = 120;
let ballInHand = false;
let isShiftPressed = false;

// Mouse tracking
let mouse = { x: 0, y: 0 };

// Player settings
let currentPlayer = 1;
let playerGroups = { 1: null, 2: null };
let gameOver = false;

// Scores
let score = { 1: 0, 2: 0 };

// DOM Elements
const turnText = document.getElementById("turn-text");
const scoreP1 = document.getElementById("score-p1");
const scoreP2 = document.getElementById("score-p2");
const resetBtn = document.getElementById("reset-btn");
const powerBar = document.getElementById("power-level");
const messageBox = document.getElementById("message-box");

// Track first ball hit and pocketed balls per turn
let firstBallHit = null;
let anyBallPocketedThisTurn = false;

// Pockets
const pockets = [
    { x: 0, y: 0 }, { x: TABLE_WIDTH / 2, y: 0 }, { x: TABLE_WIDTH, y: 0 },
    { x: 0, y: TABLE_HEIGHT }, { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT }, { x: TABLE_WIDTH, y: TABLE_HEIGHT }
];

// Ball colors (1-7 solids, 9-15 stripes, 8 black)
const BALL_COLORS = [
    "#FF0000", "#0000FF", "#FFA500", "#008000", "#800080", "#8B4513", "#FFD700",
    "#000000", "#FF6666", "#6666FF", "#FFB84D", "#66CC66", "#C266C2", "#A0522D", "#FFF380"
];

let balls = [];

// === INITIALIZE BALLS ===
function initBalls() {
    balls = [];

    // Cue ball
    balls.push({
        x: TABLE_WIDTH * 0.25,
        y: TABLE_HEIGHT / 2,
        radius: BALL_RADIUS,
        color: "#FFFFFF",
        dx: 0,
        dy: 0,
        pocketed: false,
        isCue: true
    });

    // Triangle rack
    const startX = TABLE_WIDTH * 0.75;
    const startY = TABLE_HEIGHT / 2;
    let ballIndex = 0;

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            let x = startX + row * (BALL_RADIUS * 2 + 1.5);
            let y = startY - row * BALL_RADIUS + col * BALL_RADIUS * 2;
            balls.push({
                x, y, radius: BALL_RADIUS,
                color: BALL_COLORS[ballIndex],
                dx: 0, dy: 0,
                pocketed: false,
                isCue: false
            });
            ballIndex++;
        }
    }
}

// === DRAW FUNCTIONS ===
function drawTable() {
    ctx.fillStyle = "#2f5e2f";
    ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

    ctx.strokeStyle = "#6e4b2a";
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

    pockets.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
    });
}

function drawBalls() {
    balls.forEach(ball => {
        if (ball.pocketed) return;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();

        const idx = BALL_COLORS.indexOf(ball.color) + 1;
        if (idx >= 9 && idx <= 15) {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();
        }
    });
}

// Draw cue stick
function drawCueStick() {
    const cueBall = balls[0];
    if (cueBall.pocketed) return;

    if (ballInHand || (Math.abs(cueBall.dx) < 0.05 && Math.abs(cueBall.dy) < 0.05)) {
        const dx = mouse.x - cueBall.x;
        const dy = mouse.y - cueBall.y;
        cueAngle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(cueBall.x, cueBall.y);
        ctx.rotate(cueAngle);

        let cueLength = CUE_LENGTH + shotPower;
        if (isShiftPressed) cueLength *= 1.5; // x4 visual cue

        ctx.beginPath();
        ctx.rect(-cueLength, -3, CUE_LENGTH, 6);
        ctx.fillStyle = isShiftPressed ? "#FFD700" : "#b5651d";
        ctx.fill();
        ctx.restore();
    }
}

// === POWER BAR ===
function updatePowerBar() {
    powerBar.style.width = `${(shotPower / MAX_POWER) * 100}%`;
}

// === SHOOTING ===
function shootCueBall() {
    const cueBall = balls[0];
    const powerMultiplier = isShiftPressed ? 4 : 1; // x4 power
    cueBall.dx = Math.cos(cueAngle) * (shotPower / 6) * powerMultiplier;
    cueBall.dy = Math.sin(cueAngle) * (shotPower / 6) * powerMultiplier;
    shotPower = 0;
    updatePowerBar();
    firstBallHit = null;
    isShiftPressed = false;
    ballInHand = false; // reset in-hand after shot
}

// === BALL PHYSICS ===
function updateBalls() {
    balls.forEach(ball => {
        if (ball.pocketed) return;
        ball.x += ball.dx;
        ball.y += ball.dy;
        ball.dx *= BALL_FRICTION;
        ball.dy *= BALL_FRICTION;
        if (Math.abs(ball.dx) < 0.05) ball.dx = 0;
        if (Math.abs(ball.dy) < 0.05) ball.dy = 0;

        // Wall collisions
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > TABLE_WIDTH) {
            ball.dx *= -1;
            ball.x = Math.max(ball.radius, Math.min(TABLE_WIDTH - ball.radius, ball.x));
        }
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > TABLE_HEIGHT) {
            ball.dy *= -1;
            ball.y = Math.max(ball.radius, Math.min(TABLE_HEIGHT - ball.radius, ball.y));
        }

        // Pocket detection
        pockets.forEach(pocket => {
            const dist = Math.hypot(ball.x - pocket.x, ball.y - pocket.y);
            if (dist < POCKET_RADIUS) {
                if (ball.isCue) {
                    ballInHand = true;
                    resetCueBall();
                    showMessage("Cue ball pocketed! Ball-in-hand for opponent.");
                    switchPlayer();
                } else {
                    handleBallPocketed(ball);
                }
            }
        });
    });
}

// === COLLISIONS & FIRST HIT TRACK ===
function handleCollisions() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const ballA = balls[i];
            const ballB = balls[j];
            if (ballA.pocketed || ballB.pocketed) continue;

            const dx = ballB.x - ballA.x;
            const dy = ballB.y - ballA.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < BALL_RADIUS * 2) {
                const angle = Math.atan2(dy, dx);
                const overlap = BALL_RADIUS * 2 - distance;

                ballA.x -= (overlap / 2) * Math.cos(angle);
                ballA.y -= (overlap / 2) * Math.sin(angle);
                ballB.x += (overlap / 2) * Math.cos(angle);
                ballB.y += (overlap / 2) * Math.sin(angle);

                const impactSpeed = ((ballA.dx - ballB.dx) * Math.cos(angle) + (ballA.dy - ballB.dy) * Math.sin(angle));
                const impulse = impactSpeed / 2;

                ballA.dx -= impulse * Math.cos(angle);
                ballA.dy -= impulse * Math.sin(angle);
                ballB.dx += impulse * Math.cos(angle);
                ballB.dy += impulse * Math.sin(angle);

                if (ballA.isCue && !firstBallHit) firstBallHit = ballB;
                if (ballB.isCue && !firstBallHit) firstBallHit = ballA;
            }
        }
    }
}

// === FOUL CHECK ===
function checkFoul() {
    if (!firstBallHit) return false;
    const idx = BALL_COLORS.indexOf(firstBallHit.color) + 1;
    const playerGroup = playerGroups[currentPlayer];
    if (playerGroup === "solids" && idx >= 9 && idx <= 15) return true;
    if (playerGroup === "stripes" && idx <= 7) return true;
    return false;
}

// === HANDLE BALL POCKETED ===
function handleBallPocketed(ball) {
    ball.pocketed = true;
    anyBallPocketedThisTurn = true;

    const idx = BALL_COLORS.indexOf(ball.color) + 1;

    // Assign groups if not yet
    if (!playerGroups[1] && !playerGroups[2] && idx !== 8) {
        if (idx <= 7) {
            playerGroups[currentPlayer] = "solids";
            playerGroups[currentPlayer === 1 ? 2 : 1] = "stripes";
        } else {
            playerGroups[currentPlayer] = "stripes";
            playerGroups[currentPlayer === 1 ? 2 : 1] = "solids";
        }
    }

    // Scoring
    const playerGroup = playerGroups[currentPlayer];
    if ((playerGroup === "solids" && idx <= 7) || (playerGroup === "stripes" && idx >= 9 && idx <= 15)) {
        score[currentPlayer]++;
    }

    // Black ball rules
    if (idx === 8) {
        const group = playerGroups[currentPlayer];
        if ((group === "solids" && score[currentPlayer] === 7) || (group === "stripes" && score[currentPlayer] === 7)) {
            showMessage(`Player ${currentPlayer} wins!`);
        } else {
            showMessage(`Player ${currentPlayer} loses! Pocketed 8-ball too early.`);
        }
        resetGame();
    }

    updateScoreboard();
}

// === RESET CUE BALL ===
function resetCueBall() {
    const cueBall = balls[0];
    cueBall.x = TABLE_WIDTH * 0.25;
    cueBall.y = TABLE_HEIGHT / 2;
    cueBall.dx = 0;
    cueBall.dy = 0;
    cueBall.pocketed = false;
}

// === SWITCH PLAYER ===
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    document.getElementById("player1").classList.toggle("active");
    document.getElementById("player2").classList.toggle("active");
    turnText.textContent = `Player ${currentPlayer}'s Turn`;
}

// === SCOREBOARD ===
function updateScoreboard() {
    scoreP1.textContent = score[1];
    scoreP2.textContent = score[2];
}

// === RESET GAME ===
function resetGame() {
    score = { 1: 0, 2: 0 };
    playerGroups = { 1: null, 2: null };
    ballInHand = false;
    firstBallHit = null;
    anyBallPocketedThisTurn = false;
    currentPlayer = 1;
    gameOver = false;
    initBalls();
    updateScoreboard();
    turnText.textContent = "Player 1's Turn";
}

// === SHOW MESSAGE ===
function showMessage(msg, duration = 2000) {
    messageBox.textContent = msg;
    messageBox.style.display = "block";
    setTimeout(() => { messageBox.style.display = "none"; }, duration);
}

// === MOUSE EVENTS ===
canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", () => {
    if (ballInHand) {
        balls[0].x = mouse.x;
        balls[0].y = mouse.y;
        ballInHand = false;
        return;
    }
    isDragging = true;
});

canvas.addEventListener("mouseup", () => {
    if (isDragging) shootCueBall();
    isDragging = false;
});

resetBtn.addEventListener("click", resetGame);

// === KEY EVENTS FOR x4 POWER ===
document.addEventListener("keydown", e => {
    if (e.key === "Shift") isShiftPressed = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "Shift") isShiftPressed = false;
});

// === GAME LOOP ===
function gameLoop() {
    ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);
    drawTable();
    drawBalls();

    const ballsMoving = balls.some(ball => Math.abs(ball.dx) > 0 || Math.abs(ball.dy) > 0);

    updateBalls();
    handleCollisions();
    updatePowerBar();

    if (isDragging && shotPower < MAX_POWER) {
        shotPower += 2;
    }

    // Handle turns and fouls
    if (!ballsMoving && !isDragging) {
        if (checkFoul()) {
            showMessage(`Player ${currentPlayer} committed a foul! Ball-in-hand for opponent.`);
            ballInHand = true; 
            switchPlayer();
        } else if (!anyBallPocketedThisTurn) {
            switchPlayer();
        }
        firstBallHit = null;
        anyBallPocketedThisTurn = false;
    }

    drawCueStick(); // draw cue if allowed
    
    requestAnimationFrame(gameLoop);
}

// === START GAME ===
initBalls();
gameLoop();
