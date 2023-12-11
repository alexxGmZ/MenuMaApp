// NOTE: undeclared variables are located in designer.js
// canvas
// canvas_height
// canvas_width
// fs
// fabric
// dialog_close

// mysql stuff
const mysql = require(__dirname + "/js/modules/mysql.js");
mysql.check_connection();
const connection = mysql.connection;

function sync_design_to_order() {
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

function generate_rectangle() {
	if (!canvas) return;
	console.log("generate_rectangle()");
	const rect = new fabric.Rect({
		left: 100,
		top: 100,
		width: 50,
		height: 50,
		fill: "rgba(255, 255, 255, 0)",
		stroke: "rgba(0, 0, 0, 1)",
		strokeWidth: 2,
	});

	canvas.add(rect);
	canvas.setActiveObject(rect);
}

function generate_circle() {
	if (!canvas) return;
	console.log("called generate_circle()");
	const circle = new fabric.Circle({
		radius: 20,
		left: 100,
		top: 100,
		fill: "rgba(255, 255, 255, 0)",
		stroke: "rgba(0, 0, 0, 1)",
		strokeWidth: 2,
	})

	canvas.add(circle);
	canvas.setActiveObject(circle);
}

function generate_text() {
	if (!canvas) return;
	console.log("called generate_text()");
	const text = new fabric.IText("text", {
		left: 100,
		top: 100,
		fontSize: 30
	});
	canvas.add(text);
	canvas.setActiveObject(text);
}

function generate_line() {
	if (!canvas) return;
	console.log("called generate_line()");
	const line = new fabric.Line([10, 50, 100, 50], {
        stroke: "rgba(0, 0, 0, 1)",        // Line color
        strokeWidth: 2,       // Line width
    });
	canvas.add(line);
	canvas.setActiveObject(line);
}

function display_item_cards() {
	console.log("called display_item_cards()");

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

	item_id = parseInt(item_id);

	const name = new fabric.IText(item_name, {
		fontSize: 30,
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
		img.group_id = item_id;
		img.object_id = `${item_id}_img`;
		console.log("img.object_id: " + img.object_id);
		canvas.add(img);
		// canvas.renderAll();
	});

	const price = new fabric.Text(item_price, {
		fontSize: 29,
		group_id: item_id,
		object_id: `${item_id}_price`
	});

	canvas.add(name);
	canvas.add(description);
	canvas.add(price);
}

