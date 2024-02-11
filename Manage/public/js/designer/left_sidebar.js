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
		strokeUniform: true
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
		strokeUniform: true
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
				<tr class="border-bottom text-center">
					<td data-column="item_id" class="px-2">${row.item_id}</td>
					<td data-column="item_name" class="px-2">${row.item_name}</td>
					<td data-column="item_desc" class="d-none">${row.item_desc}</td>
					<td data-column="item_img" class="d-none"><img src="${image_src}" alt="Foods Image" width="300"></td>
					<td data-column="item_price" class="border-end px-2">${row.item_price}</td>
					<td data-column="item_name_checkbox" class="">
						<input type="checkbox">
					</td>
					<td data-column="item_price_checkbox" class="">
						<input type="checkbox">
					</td>
					<td data-column="item_desc_checkbox" class="">
						<input type="checkbox">
					</td>
					<td data-column="item_img_checkbox" class="">
						<input type="checkbox">
					</td>
					<td data-column="" class="">
						<button onclick="item_card_row_click(this)" class="border rounded-pill">Generate</button>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

function item_card_row_click(button) {
	console.log("called item_card_row_click()");
	dialog_close("generate_item_objects_dialog");
	if (!button) return;

	// const table = document.getElementById("item_card_table");
	const row = button.closest('tr');
	if (!row) return;

	const item_id = row.querySelector('[data-column="item_id"]').textContent;
	const item_name = row.querySelector('[data-column="item_name"]').textContent;
	const item_desc = row.querySelector('[data-column="item_desc"]').textContent;
	const item_img = row.querySelector('[data-column="item_img"]').querySelector("img").src;
	const item_price = row.querySelector('[data-column="item_price"]').textContent;

	// checkbox
	const item_name_checkbox = row.querySelector('[data-column="item_name_checkbox"]').querySelector("input").checked;
	const item_price_checkbox = row.querySelector('[data-column="item_price_checkbox"]').querySelector("input").checked;
	const item_desc_checkbox = row.querySelector('[data-column="item_desc_checkbox"]').querySelector("input").checked;
	const item_img_checkbox = row.querySelector('[data-column="item_img_checkbox"]').querySelector("input").checked;

	const checkboxes = {
		"name": item_name_checkbox,
		"price": item_price_checkbox,
		"desc": item_desc_checkbox,
		"img": item_img_checkbox,
	}

	generate_item_objects(item_id, item_name, item_desc, item_img, item_price, checkboxes);
}

function generate_item_objects(item_id, item_name, item_desc, item_image, item_price, checkboxes) {
	if (!canvas) return;
	console.log(`called generate_item_card(${item_id}, ${item_name}, ${item_desc}, ${item_image.slice(0, 30) + "..."}, ${item_price}, ${checkboxes})`);

	item_id = parseInt(item_id);
	const centerX = window.innerWidth / 2;
	const centerY = window.innerHeight / 2;
	console.log(centerX, centerY);

	if (checkboxes.name) {
		const name = new fabric.IText(item_name, {
			fontSize: 30,
			group_id: item_id,
			object_id: `${item_id}_name`,
			left: 100,
			top: 100,
		});
		canvas.add(name);
	}

	if (checkboxes.desc && item_desc.trim() !== "") {
		const description = new fabric.IText(item_desc, {
			fontSize: 28,
			group_id: item_id,
			object_id: `${item_id}_desc`,
			left: 100,
			top: 100,
		});
		canvas.add(description);
	}

	if (checkboxes.img) {
		const image = new fabric.Image.fromURL(item_image, (img) => {
			img.scale(0.3);
			img.group_id = item_id;
			img.object_id = `${item_id}_img`;
			img.left = 100;
			img.top = 100;
			console.log("img.object_id: " + img.object_id);
			canvas.add(img);
			canvas.renderAll();
		});
	}

	if (checkboxes.price) {
		const price = new fabric.Text(item_price, {
			fontSize: 29,
			group_id: item_id,
			object_id: `${item_id}_price`,
			left: 100,
			top: 100,
		});
		canvas.add(price);
	}
}

