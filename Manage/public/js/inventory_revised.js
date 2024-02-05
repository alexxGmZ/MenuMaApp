document.addEventListener("DOMContentLoaded", function() {
	display_menu_items();
	//toggle_sort_items_table();
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
                    <div class="col-sm">
					<tr class="card" style="width: 18rem;">
						<td><img src="${image_src}" class="card-img-top"></td>
                        <td data-column="item_id" class="card-title fs-3">${row.item_id}</td>
						<td data-column="item_name" class="card-text">${row.item_name}</td>
						<td data-column="item_description">${row.item_desc}</td>
						<td data-column="item_price">${row.item_price}</td>
						<td data-column="item_quantity_sold">${row.quantity_sold}</td>
						<td data-column="item_revenue">₱${row.revenue_generated}</td>
						<td class="pb-3">
							<span class="action-btn">
							<button onclick="dialog_open('update_item_dialog'); row_click()" class="btn btn-outline-primary d-flex">
								Edit item details
							</button>
							</span>
						</td>
					</tr>
                    </div>
				`;
            }
            placeholder.innerHTML = out;
        });


    })

}