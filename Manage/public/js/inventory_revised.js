document.addEventListener("DOMContentLoaded", function() {
	display_menu_items();
	//toggle_sort_items_table();
	const employee_name = sessionStorage.getItem("employee_name");
	document.getElementById("used_account").innerHTML = "User: " + employee_name;

	// for add item dialog error shower and success
	const error_div = document.getElementById("error_placeholder")
	error_div.style.display = "none"
	const success_div = document.getElementById("success_placeholder")
	success_div.style.display = "none"

	// for update item dialog error shower and success
	const error_div_update = document.getElementById("error_placeholder_update")
	error_div_update.style.display = "none"
	const success_div_update = document.getElementById("success_placeholder_update")
	success_div_update.style.display = "none"

});

const fs = require('fs');

// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js");
// create database connection
const connection = mysql.connection;
// check database connection
mysql.check_connection();

// dialog module
const dialog = require(__dirname + "/js/modules/dialog.js");
const dialog_open = dialog.dialog_open;
const dialog_close = dialog.dialog_close;

function display_menu_items() {
	console.log("called display_menu_items()")

	connection.connect(function(err) {
		if (err) throw err;
		//Select all foods and return the result object:
		connection.query("SELECT * FROM manage_db.menu_items", function(err, result) {
			if (err) throw err;

			let placeholder = document.querySelector("#menu_items_list");
			let out = "";

			for (let row of result) {
				// to read the blob data type
				let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
				out += `
					<tr>
                        <td data-column="item_id">${row.item_id}</td>
						<td data-column="item_name">${row.item_name}</td>
						<td data-column="item_description">${row.item_desc}</td>
						<td><img src="${image_src}" width="300"></td>
						<td data-column="item_price">${row.item_price}</td>
						<td data-column="item_quantity_sold">${row.quantity_sold}</td>
						<td data-column="item_revenue">₱${row.revenue_generated}</td>
						<td data-column="item_category">${row.item_category}</td>
						<td class="pb-3">
							<span class="action-btn">
							<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
								<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
									<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
									<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
								</svg>
							</button>
							</span>
						</td>
					</tr>
				`;
			}
			placeholder.innerHTML = out;
		});
	})
}

function refresh_menu_items() {
	console.log("called refresh_menu_items()");

	// close all active dialogs with active-dialog class
	// NOTE: will execute if dialog_open() is executed
	const activeDialogs = document.querySelectorAll(".active-dialog");
	activeDialogs.forEach((dialog) => {
		dialog.close();
		dialog.classList.remove("active-dialog");
	});

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	// repopulate the registered_devices table body
	display_menu_items();

}

function add_item() {
	console.log("called add_item()");

	const item_name = document.getElementById("add_item_name").value.trim();
	const item_desc = document.getElementById("add_item_desc").value.trim();
	const item_img = document.getElementById("add_item_img");
	const item_price = document.getElementById("add_item_price").value.trim();
	const item_category = document.getElementById("add_item_category").value.trim();

	if (!item_price) {
		console.log("Not a Number!")

		const error_div = document.getElementById("error_placeholder")
		const error_text = document.getElementById("error_text_placeholder")
		error_div.style.display = "block"
		error_text.innerHTML = "Input field for price is empty!"

	} else if (item_img.files.length > 0) {
		//insert items

		//to convert the image
		const item_img_input = document.getElementById("add_item_img").files[0].path;
		const image_file = fs.readFileSync(item_img_input);

		console.log(image_file)

		const query = "INSERT INTO menu_items (item_name, item_desc, item_image, item_price, item_category) VALUES (?, ?, ?, ?, ?);";
		connection.query(query, [item_name, item_desc, image_file, item_price, item_category], (error, results) => {
			if (error) {
				console.log(error)
			} else {
				console.log("Success!")
			}
		})

		// to hide the error
		const error_div = document.getElementById("error_placeholder")
		error_div.style.display = "none"

		// to show success
		const success_div = document.getElementById("success_placeholder")
		const success_text = document.getElementById("success_text_placeholder")
		success_div.style.display = "block"
		success_text.innerHTML = "Successfully Added!, you may now refresh the items"

		// to change the button text
		const cancel_btn = document.getElementById("modal_close_button")
		cancel_btn.innerHTML = "Close"
		const confirm_btn = document.getElementById("modal_confirm_button")
		confirm_btn.style.display = "none"

	} else {

		// no image found error
		const error_div = document.getElementById("error_placeholder")
		const error_text = document.getElementById("error_text_placeholder")
		error_div.style.display = "block"
		error_text.innerHTML = "No image was found!"

	}

}

function update_item() {
	console.log("called update_item()");

	const item_id = document.getElementById("update_item_id").innerHTML;
	const item_name = document.getElementById("update_item_name").value;
	const item_desc = document.getElementById("update_item_desc").value;
	const item_img = document.getElementById("update_item_img");
	const item_price = document.getElementById("update_item_price").value;
	const item_category = document.getElementById("update_item_category").value;

	// check if price input is 0 or empty
	if (document.getElementById("update_item_price").value == "" || document.getElementById("update_item_price").value == "0") {

		// for update item dialog error shower
		const error_div_update = document.getElementById("error_placeholder_update")
		error_div_update.style.display = "block"
		const error_text = document.getElementById("error_text_placeholder_update")
		error_text.innerHTML = "Price can't be empty! or 0"

	} else if (item_img.files.length > 0) {

		// will update the items if no img has been changed

		const item_img_input = document.getElementById("update_item_img").files[0].path;

		fs.readFile(item_img_input, (err, image_buffer) => {
			if (err) {
				console.error("Error reading image file:", err);
				return;
			}
			const query = `UPDATE menu_items SET item_name = ?, item_desc = ?, item_image = ?, item_price = ?, item_category = ? WHERE item_id = ?`;
			const assembledQuery = connection.format(query, [item_name, item_desc, image_buffer, item_price, item_category, item_id]);
			connection.query(assembledQuery, (error, results) => {
				if (error) {
					console.log("Error executing query:", error);
				} else {
					console.log("Success");
				}
			});
		});

		const success_div_update = document.getElementById("success_placeholder_update")
		const success_text_update = document.getElementById("success_text_placeholder_update")
		success_div_update.style.display = "block"
		success_text_update.innerHTML = "Successfully updated!"

		const update_btn = document.getElementById("confirm_update")
		update_btn.style.display = "none"

		const cancel_btn = document.getElementById("cancel_update")
		cancel_btn.innerHTML = "Close"

		const error_div_update = document.getElementById("error_placeholder_update")
		error_div_update.style.display = "none"

	} else {

		const query = `UPDATE menu_items SET item_name = "${item_name}", item_desc = "${item_desc}", item_price = "${item_price}", item_category = "${item_category}" WHERE item_id = "${item_id}"`;
		connection.query(query, error => {
			if (error) {
				console.log(error);
			} else {
				console.log("Success");
			}
		})

		const success_div_update = document.getElementById("success_placeholder_update")
		const success_text_update = document.getElementById("success_text_placeholder_update")
		success_div_update.style.display = "block"
		success_text_update.innerHTML = "Successfully updated!"

		const update_btn = document.getElementById("confirm_update")
		update_btn.style.display = "none"

		const cancel_btn = document.getElementById("cancel_update")
		cancel_btn.innerHTML = "Close"

		const error_div_update = document.getElementById("error_placeholder_update")
		error_div_update.style.display = "none"

	}

}

// to set the value of button and divs show error or confirm to defautl state
function default_value_btn() {
	console.log("called default_value_btn()");

	// to change the button text
	const cancel_btn = document.getElementById("modal_close_button")
	cancel_btn.innerHTML = "Cancel"
	const confirm_btn = document.getElementById("modal_confirm_button")
	confirm_btn.style.display = "block"

	// to hide success
	const success_div = document.getElementById("success_placeholder")
	success_div.style.display = "none"

	// to hide error
	const error_div = document.getElementById("error_placeholder")
	error_div.style.display = "none"

	// to remove the input values if added successfull or cancelled
	const item_name = document.getElementById("add_item_name").value = "";
	const item_desc = document.getElementById("add_item_desc").value = "";
	const item_img = document.getElementById("add_item_img");
	item_img.value = "";
	const item_price = document.getElementById("add_item_price").value = "";
	const item_category = document.getElementById("add_item_category").value = "";

}

function default_value_btn_update() {
	console.log("called default_value_btn_update()");

	const success_div_update = document.getElementById("success_placeholder_update")
	const success_text_update = document.getElementById("success_text_placeholder_update")
	success_div_update.style.display = "none"
	success_text_update.innerHTML = "Successfully updated!"

	const update_btn = document.getElementById("confirm_update")
	update_btn.style.display = "Block"

	const cancel_btn = document.getElementById("cancel_update")
	cancel_btn.innerHTML = "Cancel"

	const error_div_update = document.getElementById("error_placeholder_update")
	error_div_update.style.display = "none"

	const item_img = document.getElementById("update_item_img");
	item_img.value = "";

}


function row_click() {
	console.log("called row_click()");

	var table = document.getElementById("menu_items_table");
	var rows = table.getElementsByTagName("tr");

	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle = function(row) {
			return function() {
				// values from table
				var item_id = row.getElementsByTagName("td")[0];
				var item_name = row.getElementsByTagName("td")[1];
				var item_desc = row.getElementsByTagName("td")[2];
				var item_price = row.getElementsByTagName("td")[4];
				var item_category = row.getElementsByTagName("td")[7];

				var imgElement = row.querySelector('img');
				var imgSrc = imgElement.getAttribute('src');

				// to var object
				var id = item_id.innerHTML;
				var name = item_name.innerHTML;
				var desc = item_desc.innerHTML;
				var price = item_price.innerHTML;
				var category = item_category.innerHTML;

				// to deploy the var into innerhtml text inputs
				document.getElementById("update_item_id").innerHTML = id;
				document.getElementById("update_item_name").value = name;
				document.getElementById("update_item_desc").value = desc;
				document.getElementById("update_image_preview").src = imgSrc;
				document.getElementById("update_item_price").value = price;
				document.getElementById("update_item_category").value = category;

			};
		};
		currentRow.onclick = clickHandle(currentRow);
	}
}

// sorting drink table based on the category
function drink_sort_table() {
	console.log("called drink_sort_table()")

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	const drink_var = document.getElementById("drink_category_dropdown").innerHTML;

	connection.query(`SELECT * FROM manage_db.menu_items WHERE item_category = "${drink_var}"`, function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_items_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr>
					<td data-column="item_id">${row.item_id}</td>
					<td data-column="item_name">${row.item_name}</td>
					<td data-column="item_description">${row.item_desc}</td>
					<td><img src="${image_src}" width="300"></td>
					<td data-column="item_price">${row.item_price}</td>
					<td data-column="item_quantity_sold">${row.quantity_sold}</td>
					<td data-column="item_revenue">₱${row.revenue_generated}</td>
					<td data-column="item_category">${row.item_category}</td>
					<td class="pb-3">
						<span class="action-btn">
						<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
							<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
								<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
								<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
							</svg>
						</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

// sorting snacks table based on the category
function snacks_sort_table() {
	console.log("called snacks_sort_table()")

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	const snacks_var = document.getElementById("snacks_category_dropdown").innerHTML;

	connection.query(`SELECT * FROM manage_db.menu_items WHERE item_category = "${snacks_var}"`, function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_items_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr>
					<td data-column="item_id">${row.item_id}</td>
					<td data-column="item_name">${row.item_name}</td>
					<td data-column="item_description">${row.item_desc}</td>
					<td><img src="${image_src}" width="300"></td>
					<td data-column="item_price">${row.item_price}</td>
					<td data-column="item_quantity_sold">${row.quantity_sold}</td>
					<td data-column="item_revenue">₱${row.revenue_generated}</td>
					<td data-column="item_category">${row.item_category}</td>
					<td class="pb-3">
						<span class="action-btn">
						<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
							<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
								<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
								<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
							</svg>
						</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

// sorting add_day_silog table based on the category
function alldaysilog_sort_table() {
	console.log("called alldaysilog_sort_table()")

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	const alldaysilog_var = document.getElementById("alldaysilog_category_dropdown").innerHTML;

	connection.query(`SELECT * FROM manage_db.menu_items WHERE item_category = "${alldaysilog_var}"`, function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_items_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr>
					<td data-column="item_id">${row.item_id}</td>
					<td data-column="item_name">${row.item_name}</td>
					<td data-column="item_description">${row.item_desc}</td>
					<td><img src="${image_src}" width="300"></td>
					<td data-column="item_price">${row.item_price}</td>
					<td data-column="item_quantity_sold">${row.quantity_sold}</td>
					<td data-column="item_revenue">₱${row.revenue_generated}</td>
					<td data-column="item_category">${row.item_category}</td>
					<td class="pb-3">
						<span class="action-btn">
						<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
							<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
								<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
								<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
							</svg>
						</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

// sorting short_orders table based on the category
function shortorders_sort_table() {
	console.log("called shortorders_sort_table()")

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	const shortorders_var = document.getElementById("shortorders_category_dropdown").innerHTML;

	connection.query(`SELECT * FROM manage_db.menu_items WHERE item_category = "${shortorders_var}"`, function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_items_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr>
					<td data-column="item_id">${row.item_id}</td>
					<td data-column="item_name">${row.item_name}</td>
					<td data-column="item_description">${row.item_desc}</td>
					<td><img src="${image_src}" width="300"></td>
					<td data-column="item_price">${row.item_price}</td>
					<td data-column="item_quantity_sold">${row.quantity_sold}</td>
					<td data-column="item_revenue">₱${row.revenue_generated}</td>
					<td data-column="item_category">${row.item_category}</td>
					<td class="pb-3">
						<span class="action-btn">
						<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
							<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
								<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
								<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
							</svg>
						</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

// sorting freshly table based on the category
function freshly_sort_table() {
	console.log("called freshly_sort_table()")

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	const freshly_var = document.getElementById("freshly_category_dropdown").innerHTML;

	connection.query(`SELECT * FROM manage_db.menu_items WHERE item_category = "${freshly_var}"`, function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_items_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr>
					<td data-column="item_id">${row.item_id}</td>
					<td data-column="item_name">${row.item_name}</td>
					<td data-column="item_description">${row.item_desc}</td>
					<td><img src="${image_src}" width="300"></td>
					<td data-column="item_price">${row.item_price}</td>
					<td data-column="item_quantity_sold">${row.quantity_sold}</td>
					<td data-column="item_revenue">₱${row.revenue_generated}</td>
					<td data-column="item_category">${row.item_category}</td>
					<td class="pb-3">
						<span class="action-btn">
						<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
							<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
								<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
								<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
							</svg>
						</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

// sorting other_beverages table based on the category
function other_sort_table() {
	console.log("called other_sort_table()")

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	const other_var = document.getElementById("other_category_dropdown").innerHTML;

	connection.query(`SELECT * FROM manage_db.menu_items WHERE item_category = "${other_var}"`, function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_items_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr>
					<td data-column="item_id">${row.item_id}</td>
					<td data-column="item_name">${row.item_name}</td>
					<td data-column="item_description">${row.item_desc}</td>
					<td><img src="${image_src}" width="300"></td>
					<td data-column="item_price">${row.item_price}</td>
					<td data-column="item_quantity_sold">${row.quantity_sold}</td>
					<td data-column="item_revenue">₱${row.revenue_generated}</td>
					<td data-column="item_category">${row.item_category}</td>
					<td class="pb-3">
						<span class="action-btn">
						<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
							<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
								<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
								<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
							</svg>
						</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

// sorting beer table based on the category
function beer_sort_table() {
	console.log("called beer_sort_table()")

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	const beer_var = document.getElementById("beer_category_dropdown").innerHTML;

	connection.query(`SELECT * FROM manage_db.menu_items WHERE item_category = "${beer_var}"`, function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_items_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr>
					<td data-column="item_id">${row.item_id}</td>
					<td data-column="item_name">${row.item_name}</td>
					<td data-column="item_description">${row.item_desc}</td>
					<td><img src="${image_src}" width="300"></td>
					<td data-column="item_price">${row.item_price}</td>
					<td data-column="item_quantity_sold">${row.quantity_sold}</td>
					<td data-column="item_revenue">₱${row.revenue_generated}</td>
					<td data-column="item_category">${row.item_category}</td>
					<td class="pb-3">
						<span class="action-btn">
						<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
							<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
								<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
								<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
							</svg>
						</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

// sorting extras table based on the category
function extras_sort_table() {
	console.log("called extras_sort_table()")

	// empty the registered_devices table body
	const table_body = document.getElementById("menu_items_list");
	table_body.innerHTML = "";

	const extras_var = document.getElementById("extras_category_dropdown").innerHTML;

	connection.query(`SELECT * FROM manage_db.menu_items WHERE item_category = "${extras_var}"`, function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_items_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
			let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
			out += `
				<tr>
					<td data-column="item_id">${row.item_id}</td>
					<td data-column="item_name">${row.item_name}</td>
					<td data-column="item_description">${row.item_desc}</td>
					<td><img src="${image_src}" width="300"></td>
					<td data-column="item_price">${row.item_price}</td>
					<td data-column="item_quantity_sold">${row.quantity_sold}</td>
					<td data-column="item_revenue">₱${row.revenue_generated}</td>
					<td data-column="item_category">${row.item_category}</td>
					<td class="pb-3">
						<span class="action-btn">
						<button onclick="row_click()" class="btn btn-outline-primary d-flex" data-bs-toggle="modal" data-bs-target="#update_item_dialog">
							<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
								<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
								<path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
							</svg>
						</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}
