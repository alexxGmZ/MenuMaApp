window.addEventListener("DOMContentLoaded", function() {
	toggle_info();
	screen_resolution();
})

function screen_resolution() {
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
}

function toggle_info() {
	const info_hidden_div = document.getElementById("info_hidden");
	const info_show_div = document.getElementById("info_show");

	const info_show_button = document.getElementById("info_show_button");
	if (info_show_button) {
		info_show_button.addEventListener("click", function() {
			info_hidden_div.classList.add("hidden");
			info_hidden_div.classList.remove("flex");
			info_show_div.classList.remove("hidden");
			info_show_div.classList.add("flex");
		})
	}

	const info_hide_button = document.getElementById("info_hide_button");
	if (info_hide_button) {
		info_hide_button.addEventListener("click", function() {
			info_hidden_div.classList.remove("hidden");
			info_hidden_div.classList.add("flex");
			info_show_div.classList.add("hidden");
			info_show_div.classList.remove("flex");
		})
	}
}
