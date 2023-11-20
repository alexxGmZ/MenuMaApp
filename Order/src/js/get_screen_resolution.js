var screenWidth = window.screen.width;
var screenHeight = window.screen.height;

// Get the device pixel ratio
var devicePixelRatio = window.devicePixelRatio || 1;

// Calculate the actual screen resolution
var actualScreenWidth = screenWidth * devicePixelRatio;
var actualScreenHeight = screenHeight * devicePixelRatio;

console.log("Screen Width: " + actualScreenWidth);
console.log("Screen Height: " + actualScreenHeight);

document.getElementById("screen_width").textContent = actualScreenWidth;
document.getElementById("screen_height").textContent = actualScreenHeight;
