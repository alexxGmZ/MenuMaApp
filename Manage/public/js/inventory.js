document.addEventListener("DOMContentLoaded", function() {
	// add_item();
	display_menu_items();
});

const fs = require('fs');

// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js");
// create database connection
const connection = mysql.connection;
// check database connection
mysql.check_connection();

//----- Show Foods Function -----//
// Start Query Here
function display_menu_items() {
	connection.connect(function(err) {
		if (err) throw err;
		//Select all foods and return the result object:
		connection.query("SELECT * FROM manage_db.menu_items", function(err, result) {
			if (err) throw err;

			let placeholder = document.querySelector("#menu_item_list");
			let out = "";

			for (let row of result) {
				// to read the blob data type
				let image_src = row.item_image ? `data:image/jpeg;base64,${row.item_image.toString('base64')}` : '';
				out += `
					<tr class="bg-white border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
						<td class="text-center">${row.item_id}</td>
						<td class="text-center">${row.item_name}</td>
						<td class="text-center">${row.item_desc}</td>
						<td><img src="${image_src}" alt="Foods Image"></td>
						<td class="text-center">${row.item_price}</td>
						<td class="text-center">${row.quantity_sold}</td>
						<td class="text-center">${row.revenue_generated}</td>
						<td>
							<span class="action-btn">
							<button onclick="dialog_open('update_item_dialog')" class="rounded-lg bg-sky-400 py-2 px-2 inline-flex hover:bg-sky-300 text-zinc-50 hover:drop-shadow-lg">
								<img src="assets/svg/pencil-alt.svg" class="hover:text-zinc-50">
							</button>
							<button onclick="dialog_open('remove_item_dialog')" class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-300 text-zinc-50 hover:drop-shadow-lg">
								<img src="assets/svg/trash.svg" class="hover:text-zinc-50">
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

// add new menu item
function add_item() {
	const food_form = document.getElementById("add_item_form");
	fetch("http://localhost:8080/upload_item", {
		method: "POST",
		body: new FormData(food_form)
	})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if (data.success) {
				food_form.reset();
			}
		})
		.catch((error) => {
			console.log("Error: ", error);
		})
}

// For success dialog message after adding
function add_item_message() {

	if (document.getElementById("fooditem").value.length == 0)
		return dialog_open("error_dialog");

	if (document.getElementById("fooddesc").value.length == 0)
		return dialog_open("error_dialog");

	if (document.getElementById("foodimg").files.length == 0)
		return dialog_open("error_dialog");

	if (document.getElementById("foodprice").value.length == 0)
		return dialog_open("error_dialog");

	dialog_open("add_item_success_dialog");
}

// table row click, used for updating and deleting an item
function row_click() {
	var table = document.getElementById("food_table");
	var rows = table.getElementsByTagName("tr");
	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle = function(row) {
			return function() {
				var item_id = row.getElementsByTagName("td")[0];
				var item_name = row.getElementsByTagName("td")[1];
				var item_desc = row.getElementsByTagName("td")[2];
				var item_img = row.getElementsByTagName("td")[3];
				var item_price = row.getElementsByTagName("td")[4];
				var item_quantity_sold = row.getElementsByTagName("td")[5];
				var item_revenue = row.getElementsByTagName("td")[6];

				var id = item_id.innerHTML;
				var name = item_name.innerHTML;
				var desc = item_desc.innerHTML;
				var img = item_img.innerHTML;
				var price = item_price.innerHTML;
				var quantity_sold = item_quantity_sold.innerHTML;
				var revenue = item_revenue.innerHTML;

				var imgElement = row.querySelector('img');
				var imgSrc = imgElement.getAttribute('src');

				// for item update
				document.getElementById("update_item_id").value = id;
				document.getElementById("update_item_name").value = name;
				document.getElementById("update_item_desc").value = desc;
				document.getElementById("update_image_preview").src = imgSrc;
				document.getElementById("update_item_price").value = price;

				// used for item delete or remove
				document.getElementById("remove_item_id").value = id;
				document.getElementById("remove_item_name").innerHTML = name;
				document.getElementById("remove_item_desc").innerHTML = desc;
				document.getElementById("remove_item_image").src = imgSrc;
				document.getElementById("remove_item_price").innerHTML = price;
				document.getElementById("remove_item_quantity_sold").innerHTML = quantity_sold;
				document.getElementById("remove_item_revenue").innerHTML = revenue;
			};
		};
		currentRow.onclick = clickHandle(currentRow);
	}
}

// update an existing menu item
function update_item() {
	// values from row_click() function
	var item_id = document.getElementById("update_item_id").value;
	var item_name = document.getElementById("update_item_name").value;
	var item_desc = document.getElementById("update_item_desc").value;
	var item_new_img = document.getElementById("update_new_image");
	var item_price = document.getElementById("update_item_price").value;

	// check if a new image is selected
	var item_image = ""
	if (item_new_img.files.length > 0) {
		item_image = item_new_img.files[0];
	}

	console.log(item_id);
	console.log(item_name);
	console.log(item_desc);
	console.log(item_image);
	console.log(item_price);

	const form_data = new FormData();
	form_data.append("id", item_id);
	form_data.append("name", item_name);
	form_data.append("description", item_desc);
	form_data.append("image", item_image);
	form_data.append("price", item_price);

	// preview the contents for form_data
	// for (const pair of form_data.entries()) {
	// 	console.log(`${pair[0]}: ${pair[1]}`);
	// }

	// establish connection to server.js
	fetch("http://localhost:8080/update_item", {
		method: "POST",
		body: form_data,
	})
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			if (data.success) {
				// Item updated successfully
				console.log("Item updated successfully:", data.message);
				// dialog_close("update_item_dialog");
				dialog_open("update_item_success_dialog");
			} else {
				// Error occurred while updating
				console.error("Error updating item:", data.error);
			}
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}

// delete an item based on the item id
function delete_item() {
	var id = document.getElementById("show_id").value;

	const query = `DELETE FROM menu_items WHERE item_id = "${id}"`;
	connection.query(query, error => {
		if (error) {
			alert("Error!")
			console.log(error)
		}
		else {
			dialog_open("remove_item_success_dialog");
		}
	});
}

// search an item via id
function search_via_id() {
	if (document.getElementById("search_item_box").value == "") {
		dialog_open('search_item_error_dialog');
	}
	else {
		var food_id = document.getElementById("search_item_box").value;
		console.log(food_id);

		connection.query(`SELECT * FROM manage_db.menu_items WHERE item_id = "${food_id}"`, function(err, result) {
			if (err) throw err;

			let placeholder = document.querySelector("#menu_item_list");
			let out = "";

			for (let row of result) {
				let image_src = `data:image/jpeg;base64,${row.item_image.toString('base64')}`;
				out += `
				<tr class="bg-white border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
					<td class="text-center">${row.item_id}</td>
					<td class="text-center">${row.item_name}</td>
					<td class="text-center">${row.item_desc}</td>
					<td><img src="${image_src}" alt="Foods Image"></td>
					<td class="text-center">${row.item_price}</td>
					<td class="text-center">${row.quantity_sold}</td>
					<td class="text-center">${row.revenue_generated}</td>
					<td>
						<span class="action-btn">
						<button onclick="dialog_open('update_item_dialog')" class="rounded-lg bg-sky-400 py-2 px-2 inline-flex hover:bg-sky-300 text-zinc-50 hover:drop-shadow-lg">
							<img src="assets/svg/pencil-alt.svg" class="hover:text-zinc-50">
						</button>
						<button onclick="dialog_open('remove_item_dialog')" class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-300 text-zinc-50 hover:drop-shadow-lg">
							<img src="assets/svg/trash.svg" class="hover:text-zinc-50">
						</button>
						</span>
					</td>
				</tr>
			`;
			}
			placeholder.innerHTML = out;
		});
		dialog_close('search_item_dialog');
	}
}

// open modal dialog based on element id
function dialog_open(element_id) {
	const fav_dialog = document.getElementById(element_id);

	// any element id specific statements
	if (element_id == "add_item_success_dialog") {
		document.getElementById("item_name_placeholder").innerHTML = document.getElementById("fooditem").value;
	}
	if (element_id == "update_item_dialog") {
		row_click();
	}
	if (element_id == "update_item_success_dialog") {
		document.getElementById("updated_item_placeholder").innerHTML = document.getElementById("update_item_name").value;
	}
	if (element_id == "remove_item_success_dialog") {
		document.getElementById("removed_item_placeholder").innerHTML = document.getElementById("remove_item_name").value;
	}
	if (element_id == "remove_item_dialog") {
		row_click();
	}

	fav_dialog.showModal();
}

// close modal dialog based on element id
function dialog_close(element_id) {
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.close();
}

