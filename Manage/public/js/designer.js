// mysql stuff
const mysql = require(__dirname + "/js/modules/mysql.js");
mysql.check_connection();
const connection = mysql.connection;

// fabric.js stuff
const fabric = require("fabric").fabric;
let canvas;

document.addEventListener("DOMContentLoaded", function() {
	item_card_row_click();
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
	canvas_resolution_element.textContent = `Canvas Resolution: ${canvas_width}x${canvas_height}`;

	// Append the canvas element to the container div
	const canvas_placeholder = document.querySelector("#canvas_area");
	canvas_placeholder.innerHTML = "";
	canvas_placeholder.appendChild(canvas_resolution_element);
	canvas_placeholder.appendChild(canvas_element);

	// Create the Fabric.js canvas
	canvas = new fabric.Canvas("canvas");

	// Now you can work with the Fabric.js canvas as needed

	dialog_close('create_canvas_dialog');
}

function save_canvas_to_json() {
	console.log("called save_canvas_to_json()");
	console.log(canvas);

	// function will not work if canvas is empty or not generated yet
	if (!canvas) return;

	const jsoned_canvas = JSON.stringify(canvas, null, 2);
	console.log(jsoned_canvas);

	// Create a Blob with the JSON data
	const blob = new Blob([jsoned_canvas], { type: 'application/json' });

	// Create a URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create an anchor element to trigger the download
	const a = document.createElement('a');
	a.href = url;
	a.download = 'canvas.json'; // Set the filename here

	// Simulate a click on the anchor to trigger the download
	a.click();

	// Clean up by revoking the URL
	URL.revokeObjectURL(url);
}

function save_canvas_to_svg() {
	console.log("called save_canvas_to_svg()");
	console.log(canvas);

	// function will not work if canvas is empty or not generated yet
	if (!canvas) return;

	// Get the SVG data from the canvas
	const svged_canvas = canvas.toSVG();

	// Create a Blob with the SVG data
	const blob = new Blob([svged_canvas], { type: 'image/svg+xml' });

	// Create a URL for the Blob
	const url = URL.createObjectURL(blob);

	// Create an anchor element to trigger the download
	const a = document.createElement('a');
	a.href = url;
	a.download = 'canvas.svg'; // Set the filename here

	// Simulate a click on the anchor to trigger the download
	a.click();

	// Clean up by revoking the URL
	URL.revokeObjectURL(url);
}

function sidebar_generate_rectangle() {
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

function sidebar_generate_line() {
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
					<td class="hidden"><img src="${image_src}" alt="Foods Image" width="300"></td>
					<td data-column="item_price" class="">${row.item_price}</td>
					<td data-column="item_quantity_sold" class="hidden">${row.quantity_sold}</td>
					<td data-column="item_revenue" class="hidden">₱${row.revenue_generated}</td>
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
				const item_price = cells[3].textContent;
				console.log("Item ID: " + item_id);
				console.log("Item Name: " + item_name);
				console.log("Item Price: ₱" + item_price);
			}
		});
	}
}

function generate_item_card() {
	console.log("called generate_item_card");
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
