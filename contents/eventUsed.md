# Events Used

The game relies on these primary events:

- **Mouse Events**
  - `mousemove`: updates mouse coordinates for cue stick aiming
  - `mousedown`: starts shot power build or places ball in-hand
  - `mouseup`: executes shot when released

- **Keyboard Events**
  - `keydown` and `keyup` for detecting Shift key to multiply shot power by 4

- **Button Click**
  - Reset button triggers `resetGame()` function
