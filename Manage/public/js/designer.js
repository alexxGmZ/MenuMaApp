// mysql stuff
const mysql = require(__dirname + "/js/modules/mysql.js");
const connection = mysql.connection;
mysql.check_connection();

// fabric.js stuff
const fabric = require("fabric").fabric
let canvas;
const canvas_origial_height = 500;
const canvas_origial_width = 900;

document.addEventListener("DOMContentLoaded", function() {
	canvas = new fabric.Canvas("canvas_area");
	canvas.setHeight(canvas_origial_height);
	canvas.setWidth(canvas_origial_width);

	// Initial zoom level
	let zoom = 1;

	// Adjust the zoom sensitivity for smoother zooming
	const zoom_sensitivity = 0.001; // Increase this value for less sensitivity

	function update_canvas_dimension() {
		canvas.setWidth(canvas_origial_width * zoom);
		canvas.setHeight(canvas_origial_height * zoom);
		canvas.renderAll();
	}

	// Zoom
	canvas.on('mouse:wheel', function(opt) {
		const delta = opt.e.deltaY;
		zoom = zoom * (1 + delta * zoom_sensitivity);

		// Limit zoom to a reasonable range
		if (zoom > 20) zoom = 20;
		if (zoom < 0.01) zoom = 0.01;

		const pointer = canvas.getPointer(opt.e);
		canvas.zoomToPoint({ x: pointer.x, y: pointer.y }, zoom);
		update_canvas_dimension();

		opt.e.preventDefault();
		opt.e.stopPropagation();
	});

	// Constant stroke width
	canvas.on('object:scaling', function(options) {
		const target = options.target;
		target.set('strokeWidth', 2 / target.scaleX);
		target.setCoords();
	});
});

function sidebar_generate_rectangle() {
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

}
