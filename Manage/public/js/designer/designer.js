const fs = require("fs");

// dialog module
const dialog = require(__dirname + "/js/modules/dialog.js");
const dialog_open = dialog.dialog_open;
const dialog_close = dialog.dialog_close;

// fabric.js stuff
const fabric = require("fabric").fabric;
// NOTE: custom toObject function for fabric.js
// from: https://github.com/fabricjs/fabric.js/wiki/How-to-set-additional-properties-in-all-fabric.Objects
const originalToObject = fabric.Object.prototype.toObject;
const myAdditional = ["group_id", "object_id"];
fabric.Object.prototype.toObject = function(additionalProperties) {
	return originalToObject.call(this, myAdditional.concat(additionalProperties));
}

// color picker library
const iro = require("@jaames/iro");

// default canvas variable values
let canvas;
console.log("canvas", canvas)
let canvas_filename = "untitled";
let canvas_height = 0;
let canvas_width = 0;
const canvas_element_id = "canvas"
// using tailwind css classes
const canvas_css_classes = "border-gray-200 border-2 rounded-lg dark:border-gray-700 mt-1 sm:order-1 sm:ml-0 sm:mr-4"
let canvas_bg_color = "rgb(255, 255, 255)"

function create_canvas() {
	console.log(`called create_canvas()`);

	const red = document.getElementById("rgb_r").value;
	const green = document.getElementById("rgb_g").value;
	const blue = document.getElementById("rgb_b").value;
	canvas_bg_color = `rgb(${red}, ${green}, ${blue})`;

	const input_custom_canvas_height = document.getElementById("custom_canvas_height").value;
	const input_custom_canvas_width = document.getElementById("custom_canvas_width").value;
	if (input_custom_canvas_height.trim() && input_custom_canvas_width.trim()) {
		canvas_height = input_custom_canvas_height.trim();
		canvas_width = input_custom_canvas_width.trim();
	}

	generate_canvas_area(canvas_height, canvas_width, function() {
		get_selected_objects();
		dialog_close('create_canvas_dialog');
	});
}

function create_canvas_color_picker() {
	console.log("create_canvas_color_picker()");
	var color_picker = new iro.ColorPicker("#canvas_color_picker", {
		// Set the size of the color picker
		width: 250,
		// Set the initial color to pure red
		color: "rgb(255, 255, 255)",
		layoutDirection: "horizontal",
		borderWidth: 2,
		borderColor: "#000000"
	});

	var red, green, blue;

	color_picker.on('color:init', function(color) {
		// Convert the initial color to RGBA
		red = color.rgb.r;
		green = color.rgb.g;
		blue = color.rgb.b;
		// updateColorPicker();
		document.getElementById("rgb_r").value = red;
		document.getElementById("rgb_g").value = green;
		document.getElementById("rgb_b").value = blue;
	});

	color_picker.on('color:change', function(color) {
		// log the current color as a HEX string
		red = color.rgb.r;
		green = color.rgb.g;
		blue = color.rgb.b;
		// updateColorPicker();
		document.getElementById("rgb_r").value = red;
		document.getElementById("rgb_g").value = green;
		document.getElementById("rgb_b").value = blue;
	});

	function updateColorPicker() {
		var newColor = `rgb(${red}, ${green}, ${blue})`;
		color_picker.color.set(newColor);
	}

	document.getElementById("rgb_r").addEventListener("input", function() {
		red = this.value;
		updateColorPicker();
	})
	document.getElementById("rgb_g").addEventListener("input", function() {
		green = this.value;
		updateColorPicker();
	})
	document.getElementById("rgb_b").addEventListener("input", function() {
		blue = this.value;
		updateColorPicker();
	})
}

function load_canvas_from_json() {
	console.log("called load_canvas_from_json()");
	const input_canvas = document.getElementById("input_canvas_json");

	// Trigger the file input dialog
	input_canvas.click();

	// Handle the selected file
	input_canvas.addEventListener("change", function(event) {
		const selectedFile = event.target.files[0];
		if (selectedFile) {
			// Read the selected JSON file
			const reader = new FileReader();

			reader.onload = function(event) {
				const json_data = event.target.result;
				const parsed_json = JSON.parse(json_data);
				canvas_filename = selectedFile.name;
				canvas_filename = canvas_filename.replace(/\.[^/.]+$/, "");
				canvas_height = parsed_json.canvas_height;
				canvas_width = parsed_json.canvas_width;

				generate_canvas_area(canvas_height, canvas_width, function() {
					get_selected_objects();

					canvas.loadFromJSON(parsed_json.canvas_objects, function() {
						// Callback function executed after the canvas is loaded
						// console.log("Canvas loaded from JSON.");
						canvas.renderAll(); // Render the canvas
					});
				});
			};

			reader.readAsText(selectedFile);
		}
	});
}

function load_current_synced_design() {
	console.log("called load_current_synced_design()");
	const current_design_file = __dirname + "/../current_design.json";
	fs.readFile(current_design_file, "utf8", (err, data) => {
		if (err) dialog_open("create_canvas_dialog");

		try {
			const parsed_data = JSON.parse(data);
			canvas_height = parsed_data.canvas_height;
			canvas_width = parsed_data.canvas_width;

			generate_canvas_area(canvas_height, canvas_width, function() {
				get_selected_objects();
				canvas.loadFromJSON(parsed_data.canvas_objects, function() {
					// Callback function executed after the canvas is loaded
					// console.log("Canvas loaded from JSON.");
					canvas.renderAll(); // Render the canvas
				});
				dialog_close("load_current_synced_design_dialog");
			});
		}
		catch (parse_error) {
			console.error('Error parsing JSON:', parse_error);
		}
	});
}

function generate_canvas_area(canvas_height, canvas_width, callback) {
	console.log("called generate_canvas_area()");
	// Create a new canvas element
	const canvas_element = document.createElement("canvas");
	canvas_element.id = canvas_element_id;
	canvas_element.className = canvas_css_classes;
	// canvas_element.width = canvas_width
	// canvas_element.height = canvas_height

	// WARN: do not remove coz i don't know why but if this is removed there is no margin
	// bellow the canvas and tailwind css class like "mb" doesn't work
	const canvas_resolution_element = document.createElement("p");
	canvas_resolution_element.id = "canvas_padding";
	canvas_resolution_element.className = "mt-10";
	// canvas_resolution_element.textContent = `Canvas Resolution: ${canvas_width}x${canvas_height}`;

	document.getElementById("canvas_resolution").textContent = `${canvas_width}x${canvas_height}`;

	// Append the canvas element to the container div
	const canvas_placeholder = document.querySelector("#canvas_area");
	canvas_placeholder.innerHTML = "";
	canvas_placeholder.appendChild(canvas_resolution_element);
	canvas_placeholder.appendChild(canvas_element);

	canvas = new fabric.Canvas("canvas", {
		backgroundColor: canvas_bg_color,
		fireRightClick: true,
		preserveObjectStacking: true,
		height: canvas_height,
		width: canvas_width
	});

	if (canvas) {
		if (typeof callback === "function") callback();
		canvas_scaler();
		canvas_pointer_coordinates();
		// object_properties("hide");
	}
}

function save_canvas_to_json() {
	if (!canvas) return;
	console.log("called save_canvas_to_json()");

	// Create an object to store canvas data and resolution
	const canvas_data = {
		canvas_objects: canvas.toObject(),
		canvas_height: canvas_height,
		canvas_width: canvas_width,
	};

	// Serialize the object to JSON
	const jsoned_canvas = JSON.stringify(canvas_data, null, 2);
	// console.log(jsoned_canvas);

	// Create a Blob with the JSON data
	const blob = new Blob([jsoned_canvas], { type: 'application/json' });

	// Create a URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create an anchor element to trigger the download
	const a = document.createElement('a');
	a.href = url;
	a.download = `${canvas_filename}.json`; // Set the filename here

	// Simulate a click on the anchor to trigger the download
	a.click();

	// Clean up by revoking the URL
	URL.revokeObjectURL(url);
}

function save_canvas_to_svg() {
	// function will not work if canvas is empty or not generated yet
	if (!canvas) return;
	console.log("called save_canvas_to_svg()");

	// Get the SVG data from the canvas
	const svged_canvas = canvas.toSVG();
	console.log(svged_canvas);

	// Create a Blob with the SVG data
	const blob = new Blob([svged_canvas], { type: 'image/svg+xml' });

	// Create a URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create an anchor element to trigger the download
	const a = document.createElement('a');
	a.href = url;
	a.download = `${canvas_filename}.svg`; // Set the filename here

	// Simulate a click on the anchor to trigger the download
	a.click();

	// Clean up by revoking the URL
	URL.revokeObjectURL(url);
}

function save_canvas_to_jpeg() {
	if (!canvas) return;

	// Convert canvas to data URL with JPEG format
	const dataURL = canvas.toDataURL({
		format: 'jpeg',
	});

	// Create a link element
	const link = document.createElement('a');
	link.href = dataURL;
	link.download = `${canvas_filename}.jpg`;

	// Trigger a click on the link to start the download
	link.click();
}

function save_canvas_to_png() {
	if (!canvas) return;

	// Convert canvas to data URL with JPEG format
	const dataURL = canvas.toDataURL({
		format: 'png',
	});

	// Create a link element
	const link = document.createElement('a');
	link.href = dataURL;
	link.download = `${canvas_filename}.png`;

	// Trigger a click on the link to start the download
	link.click();
}

var import_image_input_listener;
function import_image() {
	if (!canvas) return;
	console.log("called import_image()");

	const import_image_input = document.getElementById("canvas_import_image");

	if (import_image_input_listener)
		import_image_input.removeEventListener("change", import_image_input_listener);

	import_image_input_listener = function(event) {
		const file = event.target.files[0];
		// console.log("file:", file);

		const reader = new FileReader();
		reader.onload = function(event) {
			const image_data_url = event.target.result;

			fabric.Image.fromURL(image_data_url, function(img) {
				img.set({ left: 100, top: 100 });
				canvas.add(img);
				canvas.renderAll();
			});
		};

		// Read the file as a data URL
		reader.readAsDataURL(file);
	}

	import_image_input.click()
	import_image_input.addEventListener("change", import_image_input_listener);
}

function delete_selected_objects() {
	if (!canvas) return;
	console.log("called delete_selected_objects()");

	const selected_objects = canvas.getActiveObjects();
	if (selected_objects.length > 0) {
		// Remove selected objects from the canvas
		selected_objects.forEach(obj => {
			canvas.remove(obj);
			console.log(`Deleted object - Type: ${obj.type}, Object ID: ${obj.object_id}`);
		});

		// Clear the selection
		canvas.discardActiveObject();
		canvas.requestRenderAll();
	}
}

function canvas_pointer_coordinates() {
	canvas.on("mouse:move", function(options) {
		var pointer = canvas.getPointer(options.e);
		var x = pointer.x.toFixed(3);
		var y = pointer.y.toFixed(3);

		document.getElementById("canvas_pointer_coordinates_x").textContent = x;
		document.getElementById("canvas_pointer_coordinates_y").textContent = y;
	})
}
