// NOTE: undeclared variables are located in designer.js
// canvas
// canvas_height
// canvas_width

var canvas_zoom = 1;

function canvas_scaler() {
	if (!canvas) {
		// disable canvas scaler inputs
		document.getElementById("canvas_scaler_minus").disabled = true;
		document.getElementById("canvas_scale_range_input").disabled = true;
		document.getElementById("canvas_scaler_plus").disabled = true;
		return;
	}
	console.log("called canvas_scaler()");

	// enable canvas scaler inputs
	document.getElementById("canvas_scaler_minus").disabled = false;
	document.getElementById("canvas_scale_range_input").disabled = false;
	document.getElementById("canvas_scaler_plus").disabled = false;

	const range_input = document.getElementById("canvas_scale_range_input");
	const range_step = parseFloat(range_input.step);
	const range_max = parseFloat(range_input.max);
	const range_min = parseFloat(range_input.min)
	document.getElementById("scale_multiplier_text").textContent = range_input.value + "x";

	// minus button is clicked
	document.getElementById("canvas_scaler_minus").addEventListener("click", function() {
		// stop the scale if range_min is reached
		if (parseFloat(range_input.value) <= range_min) return;
		range_input.value = parseFloat(range_input.value) - range_step;
		canvas.setHeight(canvas_height * parseFloat(range_input.value));
		canvas.setWidth(canvas_width * parseFloat(range_input.value));
		canvas.setZoom(parseFloat(range_input.value));
		document.getElementById("scale_multiplier_text").textContent = range_input.value + "x";

		// to be used for context menu and object properties coordinates
		canvas_zoom = parseFloat(range_input.value);
	});

	// plus button is clicked
	document.getElementById("canvas_scaler_plus").addEventListener("click", function() {
		// stop the scale if range_max is reached
		if (parseFloat(range_input.value) >= range_max) return;
		range_input.value = parseFloat(range_input.value) + range_step;
		canvas.setHeight(canvas_height * parseFloat(range_input.value));
		canvas.setWidth(canvas_width * parseFloat(range_input.value));
		canvas.setZoom(parseFloat(range_input.value));
		document.getElementById("scale_multiplier_text").textContent = range_input.value + "x";

		// to be used for context menu and object properties coordinates
		canvas_zoom = parseFloat(range_input.value);
	});

	// if the range input slider is used
	range_input.addEventListener("input", function() {
		document.getElementById("scale_multiplier_text").textContent = range_input.value + "x";
		canvas.setHeight(canvas_height * parseFloat(range_input.value));
		canvas.setWidth(canvas_width * parseFloat(range_input.value));
		canvas.setZoom(parseFloat(range_input.value));

		// to be used for context menu and object properties coordinates
		canvas_zoom = parseFloat(range_input.value);
	})
}

