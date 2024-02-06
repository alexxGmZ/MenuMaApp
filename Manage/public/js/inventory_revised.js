document.addEventListener("DOMContentLoaded", function() {
	display_menu_items();
	//toggle_sort_items_table();
	const employee_name = sessionStorage.getItem("employee_name");
	document.getElementById("used_account").innerHTML = "Current active user: " + employee_name;

	// for add item dialog error shower and success
	const error_div = document.getElementById("error_placeholder")
	error_div.style.display = "none"
	const success_div = document.getElementById("success_placeholder")
	success_div.style.display = "none"
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
							<button onclick="dialog_open('update_item_dialog'); row_click()" class="btn btn-outline-primary d-flex">
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