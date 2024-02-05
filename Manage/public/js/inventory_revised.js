document.addEventListener("DOMContentLoaded", function() {
	display_menu_items();
	//toggle_sort_items_table();
	const employee_name = sessionStorage.getItem("employee_name");
	document.getElementById("used_account").innerHTML = "Current active user: " + employee_name;
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