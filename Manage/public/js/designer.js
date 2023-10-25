// mysql stuff
const mysql = require(__dirname + "/js/modules/mysql.js");
const connection = mysql.connection;
mysql.check_connection();

// fabric.js stuff
const fabric = require("fabric").fabric;
let canvas;

document.addEventListener("DOMContentLoaded", function() {
	// Initial zoom level
	// let zoom = 1;

	// Adjust the zoom sensitivity for smoother zooming
	// const zoom_sensitivity = 0.001; // Increase this value for less sensitivity

	// function update_canvas_dimension() {
	// 	canvas.setWidth(canvas_origial_width * zoom);
	// 	canvas.setHeight(canvas_origial_height * zoom);
	// 	canvas.renderAll();
	// }

	// Zoom
	// canvas.on('mouse:wheel', function(opt) {
	// 	const delta = opt.e.deltaY;
	// 	zoom = zoom * (1 + delta * zoom_sensitivity);
	//
	// 	// Limit zoom to a reasonable range
	// 	if (zoom > 20) zoom = 20;
	// 	if (zoom < 0.01) zoom = 0.01;
	//
	// 	const pointer = canvas.getPointer(opt.e);
	// 	canvas.zoomToPoint({ x: pointer.x, y: pointer.y }, zoom);
	// 	update_canvas_dimension();
	//
	// 	opt.e.preventDefault();
	// 	opt.e.stopPropagation();
	// });

	// Constant stroke width
	// canvas.on('object:scaling', function(options) {
	// 	const target = options.target;
	// 	target.set('strokeWidth', 2 / target.scaleX);
	// 	target.setCoords();
	// });
});

function generate_canvas(size) {
	console.log(`called generate_canvas(${size})`);
	let canvas_height = 0;
	let canvas_width = 0;

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

	console.log(`canvas size: ${canvas_height}x${canvas_width}`);

	// Create a new canvas element and set its attributes
	const canvas_element = document.createElement("canvas");
	canvas_element.id = "canvas";
	canvas_element.className = "border-gray-200 border-4 rounded-lg dark:border-gray-700 mt-6 sm:order-1 sm:ml-0 sm:mr-4";
	canvas_element.height = canvas_height;
	canvas_element.width = canvas_width;

	// Create an <h1> element to display the resolution
	const canvas_resolution_element = document.createElement("p");
	canvas_resolution_element.id = "canvas_resolution";
	canvas_resolution_element.className = "mt-14";
	canvas_resolution_element.textContent = `Canvas Resolution: ${canvas_height}x${canvas_width}`;

	// Append the canvas element to the container div
	const placeholder = document.querySelector("#canvas_area");
	placeholder.innerHTML = "";
	placeholder.appendChild(canvas_resolution_element);
	placeholder.appendChild(canvas_element);

	// Create the Fabric.js canvas
	canvas = new fabric.Canvas("canvas");

	// Now you can work with the Fabric.js canvas as needed

	dialog_close('create_canvas_dialog');
}

function sidebar_generate_rectangle() {
	console.log("called sidebar_generate_rectangle()")
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
	console.log("called sidebar_generate_circle()")
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

function sidebar_display_item_cards() {
	console.log("called sidebar_display_item_cards()")

}

function dialog_open(element_id) {
	console.log(`called dialog_open(${element_id})`);

	const fav_dialog = document.getElementById(element_id);
	fav_dialog.classList.add("active-dialog");
	fav_dialog.showModal();
}

function dialog_close(element_id) {
	console.log(`called dialog_close(${element_id})`);
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.classList.remove("active-dialog");
	fav_dialog.close();
}
