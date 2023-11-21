const fs = require("fs");

// mysql stuff
const mysql = require(__dirname + "/js/modules/mysql.js");
mysql.check_connection();
const connection = mysql.connection;

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

const iro = require("@jaames/iro");

// default canvas variable values
let canvas;
let canvas_filename = "untitled";
let canvas_height = 0;
let canvas_width = 0;
const canvas_element_id = "canvas"
// using tailwind css classes
const canvas_css_classes = "border-gray-200 border-2 rounded-lg dark:border-gray-700 mt-6 sm:order-1 sm:ml-0 sm:mr-4"
let canvas_bg_color = "rgb(255, 255, 255)"

function create_canvas(size) {
	console.log(`called create_canvas(${size})`);

	const red = document.getElementById("rgb_r").value;
	const green = document.getElementById("rgb_g").value;
	const blue = document.getElementById("rgb_b").value;
	canvas_bg_color = `rgb(${red}, ${green}, ${blue})`;
	console.log(canvas_bg_color);

	if (size === "custom") {
		const input_custom_canvas_height = document.getElementById("custom_canvas_height").value;
		const input_custom_canvas_width = document.getElementById("custom_canvas_width").value;

		if (input_custom_canvas_height.trim() && input_custom_canvas_width.trim()) {
			canvas_height = input_custom_canvas_height.trim();
			canvas_width = input_custom_canvas_width.trim();
		}
	}
	else if (size === "mobile") {
		canvas_height = 720;
		canvas_width = 1280;
	}
	else if (size === "tablet") {
		canvas_height = 800;
		canvas_width = 1280;
	}

	generate_canvas_area(canvas_height, canvas_width, function() {
		get_selected_objects();
		dialog_close('create_canvas_dialog');
	});
}

function create_canvas_color_picker() {
	console.log("create_canvas_color_picker()");
	var color_picker = new iro.ColorPicker("#color_picker", {
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
				});
				if (canvas) {
					canvas.loadFromJSON(parsed_json.canvas_objects, function() {
						// Callback function executed after the canvas is loaded
						// console.log("Canvas loaded from JSON.");
						canvas.renderAll(); // Render the canvas
					});
				}
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
			});
			if (canvas) {
				canvas.loadFromJSON(parsed_data.canvas_objects, function() {
					// Callback function executed after the canvas is loaded
					// console.log("Canvas loaded from JSON.");
					canvas.renderAll(); // Render the canvas
				});
			}
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
	canvas_element.width = canvas_width
	canvas_element.height = canvas_height

	// Display canvas resolution element
	const canvas_resolution_element = document.createElement("p");
	canvas_resolution_element.id = "canvas_resolution";
	canvas_resolution_element.className = "mt-14";
	canvas_resolution_element.textContent = `Canvas Resolution: ${canvas_width}x${canvas_height}`;

	// Append the canvas element to the container div
	const canvas_placeholder = document.querySelector("#canvas_area");
	canvas_placeholder.innerHTML = "";
	canvas_placeholder.appendChild(canvas_resolution_element);
	canvas_placeholder.appendChild(canvas_element);

	canvas = new fabric.Canvas("canvas", {
		backgroundColor: canvas_bg_color,
		fireRightClick: true,
	});

	if (canvas) {
		if (typeof callback === "function") callback();
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

function sidebar_sync_design_to_order() {
	if (!canvas) return;
	console.log("called sync_design_to_order()");

	const canvas_data = {
		canvas_objects: canvas.toObject(),
		canvas_height: canvas_height,
		canvas_width: canvas_width,
	};

	const jsoned_canvas_data = JSON.stringify(canvas_data, null, 2);
	const filepath = __dirname + "/../current_design.json";

	fs.writeFile(filepath, jsoned_canvas_data, (error) => {
		if (error) alert(error);
		else dialog_close("sync_design_dialog");
	})
}

function sidebar_generate_rectangle() {
	if (!canvas) return;
	console.log("called sidebar_generate_rectangle()");
	const rect = new fabric.Rect({
		left: 100,
		top: 100,
		width: 50,
		height: 50,
		fill: "rgba(255, 255, 255, 0)",
		stroke: "black",
		strokeWidth: 2,
	});

	canvas.add(rect);
}

function sidebar_generate_circle() {
	if (!canvas) return;
	console.log("called sidebar_generate_circle()");
	const circle = new fabric.Circle({
		radius: 20,
		left: 100,
		top: 100,
		fill: "rgba(255, 255, 255, 0)",
		stroke: "black",
		strokeWidth: 2,
	})

	canvas.add(circle);
}

function sidebar_generate_text() {
	if (!canvas) return;
	console.log("called sidebar_generate_text()");
	const text = new fabric.IText("text", {
		fontSize: 20
	});
	canvas.add(text);
}

function sidebar_generate_line() {
	if (!canvas) return;
	console.log("called sidebar_generate_line()");
	const line = new fabric.Line([10, 10, 100, 100], {
		fill: "black",          // Line color
		stroke: "black",        // Line color
		strokeWidth: 2,       // Line width
	});
	canvas.add(line);
}

function sidebar_display_item_cards() {
	console.log("called sidebar_display_item_cards()");

	//Select all foods and return the result object:
	connection.query("SELECT * FROM manage_db.menu_items", function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#item_card_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr class="">
					<td data-column="item_id" class="">${row.item_id}</td>
					<td data-column="item_name" class="">${row.item_name}</td>
					<td data-column="item_desc" class="hidden">${row.item_desc}</td>
					<td class="hidden"><img src="${image_src}" alt="Foods Image" width="300"></td>
					<td data-column="item_price" class="">${row.item_price}</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

function item_card_row_click() {
	console.log("called item_card_row_click()");

	const table = document.getElementById("item_card_table");

	if (table) {
		table.addEventListener("click", (event) => {
			console.log("table row is clicked");
			const clickedRow = event.target.closest("tr");

			if (clickedRow) {
				const cells = clickedRow.querySelectorAll("td");
				// console.log(cells);
				const item_id = cells[0].textContent;
				const item_name = cells[1].textContent;
				const item_desc = cells[2].textContent;
				const item_image = cells[3].querySelector("img").src;
				const item_price = cells[4].textContent;

				generate_item_card(item_id, item_name, item_desc, item_image, item_price);
			}
		});
	}
}

function generate_item_card(item_id, item_name, item_desc, item_image, item_price) {
	if (!canvas) return;
	console.log(`called generate_item_card(${item_id}, ${item_name}, ${item_desc}, ${item_image.slice(0, 30) + "..."}, ${item_price})`);

	const name = new fabric.IText(item_name, {
		fontSize: 20,
		group_id: item_id,
		object_id: `${item_id}_name`
	});

	const description = new fabric.IText(item_desc, {
		fontSize: 18,
		group_id: item_id,
		object_id: `${item_id}_desc`
	});

	const image = new fabric.Image.fromURL(item_image, (img) => {
		img.scale(0.3);
		img.group_id = item_id,
			img.object_id = `${item_id}_img`;
		console.log("img.object_id: " + img.object_id);
		canvas.add(img);
		// canvas.renderAll();
	});

	const price = new fabric.Text(item_price, {
		fontSize: 19,
		group_id: item_id,
		object_id: `${item_id}_price`
	});

	console.log(`group_id: ${item_id}`)
	console.log(`name.object_id: ${name.object_id}`)
	console.log(`description.object_id: ${description.object_id}`)
	console.log(`price.object_id: ${price.object_id}`)

	canvas.add(name);
	canvas.add(description);
	canvas.add(price);
}

function get_selected_objects() {
	if (!canvas) return;
	console.log("called get_selected_objects()");

	const context_menu = document.getElementById('context_menu');
	canvas.on('mouse:up', function(event, options) {
		console.log("canvas mouse:up event");
		const selected_objects = canvas.getActiveObjects();

		// hide context menu of no object/s are selected
		if (selected_objects.length == 0) {
			context_menu.style.display = "none";
		}
		else {
			selected_objects.forEach(object => {
				console.log(`Left clicked object - Type: ${object.type}, Object ID: ${object.object_id}`);
			})

			// right click
			if (event.button === 3) {
				selected_objects.forEach(object => {
					console.log(`Right clicked object - Type: ${object.type}, Object ID: ${object.object_id}`);
				});

				// mouse or pointer position
				const { x, y } = canvas.getPointer(event.e);

				// display context menu based on the mouse pointer position
				context_menu.style.display = 'block';
				context_menu.style.left = (x + 100) + 'px';
				context_menu.style.top = (y + 100) + 'px';
			}
			// else context_menu.style.display = "none";
		}
	});

	canvas.on("mouse:down", function() {
		// hide context menu when the mouse is pressed down
		context_menu.style.display = "none";
	})
}

function context_menu_option1() {
	if (!canvas) return;
	console.log("called context_menu_option1()");
	const selected_objects = canvas.getActiveObjects();
	console.log(selected_objects);
}

function context_menu_option2() {
	if (!canvas) return;
	console.log("called context_menu_option2()");
	const selected_objects = canvas.getActiveObjects();
	console.log(selected_objects);
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

let _clipboard = null;
function copy_selected_objects() {
	if (!canvas) return;
	console.log("called copy_selected_objects()");

	canvas.getActiveObject().clone(function(cloned) {
		_clipboard = cloned;
		// Log the copied object or objects
		if (cloned.type === 'activeSelection') {
			// Iterate through each object in the active selection
			cloned.forEachObject(function(obj) {
				console.log(`Copied object - Type: ${obj.type}, Object ID: ${obj.object_id}`);
			});
		}
		else {
			// Log the single copied object
			console.log(`Copied object - Type: ${cloned.type}, Object ID: ${cloned.object_id}`);
		}
	});
}

function cut_selected_objects() {
	if (!canvas) return;
	console.log("called cut_selected_objects()");
	canvas.getActiveObject().clone(function(cloned) {
		_clipboard = cloned;
		if (cloned.type === 'activeSelection') {
			// Iterate through each object in the active selection
			cloned.forEachObject(function(obj) {
				console.log(`Cutted object - Type: ${obj.type}, Object ID: ${obj.object_id}`);
			});
		}
		else {
			// Log the single cutted object
			console.log(`Cutted object - Type: ${cloned.type}, Object ID: ${cloned.object_id}`);
		}
		//remove after cloned to clipboard
		canvas.remove(canvas.getActiveObject());
	});
}

function paste_copied_objects() {
	if (!canvas) return;
	console.log("called paste_copied_objects()");

	// clone again, so you can do multiple copies.
	_clipboard.clone(function(clonedObj) {
		canvas.discardActiveObject();
		clonedObj.set({
			left: clonedObj.left + 10,
			top: clonedObj.top + 10,
			evented: true,
		});
		if (clonedObj.type === 'activeSelection') {
			// active selection needs a reference to the canvas.
			clonedObj.canvas = canvas;
			clonedObj.forEachObject(function(obj) {
				canvas.add(obj);
				console.log(`Pasted object - Type: ${obj.type}, Object ID: ${obj.object_id}`);
			});
			// this should solve the unselectability
			clonedObj.setCoords();
		}
		else {
			canvas.add(clonedObj);
			console.log(`Pasted object - Type: ${clonedObj.type}, Object ID: ${clonedObj.object_id}`);
		}
		_clipboard.top += 10;
		_clipboard.left += 10;
		canvas.setActiveObject(clonedObj);
		canvas.requestRenderAll();
	});
}

