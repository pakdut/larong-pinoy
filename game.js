const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Table dimensions
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Ball properties
const ballRadius = 10;
let balls = [];

// Cue ball
let cueBall = {
  x: WIDTH / 4,
  y: HEIGHT / 2,
  vx: 0,
  vy: 0,
  color: "white"
};

// Target ball
let targetBall = {
  x: (WIDTH / 4) * 3,
  y: HEIGHT / 2,
  vx: 0,
  vy: 0,
  color: "red"
};

balls.push(cueBall, targetBall);

// Physics
const friction = 0.98; // slows balls down
const power = 5; // shooting strength

// Aiming
let mouse = { x: 0, y: 0, isDown: false };

// Listen for mouse events
canvas.addEventListener("mousedown", () => (mouse.isDown = true));
canvas.addEventListener("mouseup", () => {
  mouse.isDown = false;

  // Shoot the ball
  const dx = cueBall.x - mouse.x;
  const dy = cueBall.y - mouse.y;
  cueBall.vx = dx / power;
  cueBall.vy = dy / power;
});
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

// Update ball positions
function update() {
  balls.forEach(ball => {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Apply friction
    ball.vx *= friction;
    ball.vy *= friction;

    // Collision with table walls
    if (ball.x + ballRadius > WIDTH || ball.x - ballRadius < 0) {
      ball.vx *= -1;
    }
    if (ball.y + ballRadius > HEIGHT || ball.y - ballRadius < 0) {
      ball.vy *= -1;
    }
  });

  checkCollision(cueBall, targetBall);
}

// Check collision between two balls
function checkCollision(b1, b2) {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < ballRadius * 2) {
    // Swap velocities (simple collision)
    const tempVx = b1.vx;
    const tempVy = b1.vy;
    b1.vx = b2.vx;
    b1.vy = b2.vy;
    b2.vx = tempVx;
    b2.vy = tempVy;
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Draw balls
  balls.forEach(ball => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
  });

  // Draw aim line
  if (mouse.isDown) {
    ctx.beginPath();
    ctx.moveTo(cueBall.x, cueBall.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = "yellow";
    ctx.stroke();
  }
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
