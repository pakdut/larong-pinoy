# Event-Function Mapping

| Event                 | Function Triggered        | Description |
|-----------------------|-------------------------|-------------|
| mousemove             | Updates `mouse.x`, `mouse.y` | Moves the cue stick for aiming |
| mousedown             | `isDragging = true` or ball-in-hand placement | Starts power build or places cue ball |
| mouseup               | `shootCueBall()`          | Executes the shot based on angle and power |
| keydown (Shift)       | `isShiftPressed = true`   | Multiplies shot power visually and functionally |
| keyup (Shift)         | `isShiftPressed = false`  | Returns power multiplier to normal |
| Reset Button Click    | `resetGame()`             | Resets game, scores, and ball positions |
