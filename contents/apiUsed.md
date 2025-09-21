# API / Browser Features Used

This project primarily uses **JavaScript built-in APIs** and browser features:

1. **Canvas API**
   - `getContext("2d")`
   - `fillRect`, `arc`, `fill`, `strokeRect`, `beginPath`
   - For drawing the table, balls, and cue stick

2. **Event Listeners**
   - `addEventListener("mousemove")` → Track mouse position for aiming
   - `addEventListener("mousedown")` → Begin shot power build
   - `addEventListener("mouseup")` → Shoot cue ball
   - `addEventListener("keydown")` & `keyup` → Detect Shift for x4 power

3. **DOM Manipulation**
   - `document.getElementById()` → Access scoreboard, power bar, messages, buttons
   - `.textContent` → Update player turn and scores
   - `.style.width` → Update power bar
   - `.classList.toggle()` → Switch active player UI
