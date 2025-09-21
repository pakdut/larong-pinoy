# API & Functions in Code

Main functions in `game.js`:

1. **initBalls()** - Initialize the cue ball and rack of 15 balls
2. **drawTable()** - Draws billiard table, pockets, and borders
3. **drawBalls()** - Draws all balls that are not pocketed
4. **drawCueStick()** - Draws the cue stick when ball is stationary or in-hand
5. **updatePowerBar()** - Updates the width of the power bar
6. **shootCueBall()** - Applies velocity to cue ball based on shot power and angle
7. **updateBalls()** - Updates ball positions with friction and wall collisions
8. **handleCollisions()** - Handles ball-to-ball collisions with realistic physics
9. **checkFoul()** - Checks if the first ball hit is wrong
10. **handleBallPocketed(ball)** - Handles ball pocketing and scoring logic
11. **resetCueBall()** - Resets cue ball to starting position
12. **switchPlayer()** - Changes current player and updates UI
13. **updateScoreboard()** - Updates the HTML scoreboard
14. **resetGame()** - Resets all game variables and balls
15. **showMessage(msg, duration)** - Displays temporary messages on the screen
16. **gameLoop()** - Main loop, calls draw and update functions, handles game physics
