document.addEventListener("DOMContentLoaded", function() {
	add_item();
});
// Const for file handling
const fs = require('fs');

//
// Mysql Database
//
// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js");
// create database connection

const connection = mysql.connection;

// check database connection
mysql.check_connection();

//----- Show Foods Function -----//
// Start Query Here
connection.connect(function(err) {
	if (err) throw err;
	//Select all foods and return the result object:
	connection.query("SELECT * FROM manage_db.menu_items", function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#menu_item_list");
		let out = "";

		for (let row of result) {
			// to read the blob data type
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
						<button onclick="dialog_open('update_item_dialog')" class="rounded-lg bg-sky-400 py-2 px-2 inline-flex hover:bg-sky-600 text-zinc-50 hover:drop-shadow-lg">
							<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
							<path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
							</svg>
						</button>
						<button onclick="dialog_open('remove_item_dialog')" class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-700 text-zinc-50 hover:drop-shadow-lg">
							<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
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

//----- End of Show Foods Function -----//

// -----ADD NEW FOODS FUNCTION----- //
function add_item() {
	const food_form = document.getElementById("add_item_form");
	fetch("http://localhost:8080/upload-item", {
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

	if(document.getElementById("fooditem").value.length == 0)
		return dialog_open("error_dialog");

	if(document.getElementById("fooddesc").value.length == 0)
		return dialog_open("error_dialog");

	if (document.getElementById("foodimg").files.length == 0)
		return dialog_open("error_dialog");

	if(document.getElementById("foodprice").value.length == 0)
		return dialog_open("error_dialog");

	dialog_open("add_item_success_dialog");
	
}
// -----END OF ADD NEW FOODS FUNCTION----- //


//----- TABLE CLICK EVENT ------//
function row_click() {
	var table = document.getElementById("food_table");
	var rows = table.getElementsByTagName("tr");
	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle = function(row) {
			return function() {
				var food_id = row.getElementsByTagName("td")[0];
				var food_name = row.getElementsByTagName("td")[1];
				var food_desc = row.getElementsByTagName("td")[2];
				var food_img = row.getElementsByTagName("td")[3];
				var food_price = row.getElementsByTagName("td")[4];
				var food_revenue = row.getElementsByTagName("td")[5];
				var id = food_id.innerHTML;
				var name = food_name.innerHTML;
				var desc = food_desc.innerHTML;
				var img = food_img.innerHTML;
				var price = food_price.innerHTML;
				var revenue = food_revenue.innerHTML;

				var imgElement = row.querySelector('img');
				var imgSrc = imgElement.getAttribute('src');

				//alert("id:" + id + " name: " + name + " desc: " + desc + " image: " + imgSrc+ " price: " + price);

				document.getElementById("foodidfield_2").value = id;
				document.getElementById("fooditem_2").value = name;
				document.getElementById("fooddesc_2").value = desc;
				document.getElementById("foodprice_2").value = price;
				document.getElementById("show_id").value = id;
				document.getElementById("show_name").innerHTML = name;
				document.getElementById("show_desc").innerHTML = desc;
				document.getElementById("show_food").src = imgSrc;
				document.getElementById("show_price").innerHTML = price;
				document.getElementById("show_revenue").innerHTML = revenue;

			};
		};
		currentRow.onclick = clickHandle(currentRow);
	}
}
//----- END OF TABLE CLICK EVENT -----//

// POP UP FUNCTION //
// END OF POPUP FUNCTION //

//----- UPDATE FUNCTION EVENT -----//
function update_item() {
	// CHECKS IF FILE INPUT IS EMPTY OR NOT
	if (document.getElementById("foodimg_2").files.length == 0) {
		dialog_open("error_dialog");
	}
	else {
		// VARIABLES FROM inventory.html
		var foodid = document.getElementById("foodidfield_2").value;
		var fooditem = document.getElementById("fooditem_2").value;
		var fooddesc = document.getElementById("fooddesc_2").value;
		var foodimg = document.getElementById("foodimg_2").value.split('fakepath\\');
		var withimg = ("./foods/" + foodimg[1])
		var foodprice = document.getElementById("foodprice_2").value;

		// IMAGE HANDLING
		var imgFileName = foodimg[1];

		const filePath = document.getElementById('foodimg_2').files[0].path;
		console.log(filePath);
		const filePathCopy = __dirname + '/foods/' + imgFileName;

		console.log(filePathCopy);

		fs.copyFile(filePath, filePathCopy, (err) => {
			if (err) throw err;

			console.log('File Copy Successfully.');
		})

		// QUERY USED TO UPDATE
		const query = `UPDATE menu_items SET item_name = "${fooditem}", item_desc = "${fooddesc}", item_image = "${withimg}", item_price = "${foodprice}" WHERE item_id = "${foodid}"`;
		connection.query(query, function(error, results) {
			if (error) {
				console.log(error);
				dialog_open("error_dialog");
			}
			else {
				dialog_open("update_item_success_dialog");
			}
		});
	}
}
//----- END OF UPDATE FUNCTION EVENT -----//

//----- DELETE FUNCTION EVENT -----//
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
	})
}
//----- END OF DELETE FUNCTION EVENT -----//

// MYSQL SEARCH FUNNCTION //
function search_via_id() {

	if (document.getElementById("search_item_box").value == "") {
		dialog_open('search_item_error_dialog');
	}
	else
	{
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
						<button onclick="dialog_open('update_item_dialog')" class="rounded-lg bg-sky-400 py-2 px-2 inline-flex hover:bg-sky-600 text-zinc-50 hover:drop-shadow-lg">
							<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
							<path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
							</svg>
						</button>
						<button onclick="dialog_open('remove_item_dialog')" class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-700 text-zinc-50 hover:drop-shadow-lg">
							<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
							</svg>
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
		document.getElementById("updated_item_placeholder").innerHTML = document.getElementById("fooditem_2").value;
	}
	if (element_id == "remove_item_success_dialog") {
		document.getElementById("removed_item_placeholder").innerHTML = document.getElementById("fooditem_2").value;
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

