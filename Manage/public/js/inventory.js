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

// Function for Refresh Items //
function refreshitems() {
	// Start Query Here
	connection.query("SELECT * FROM manage_db.menu_items", function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#data-output");
		let out = "";

		for (let row of result) {
			out += `
				<tr class="bg-white border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
					<td class="text-center">${row.item_id}</td>
					<td class="text-center">${row.item_name}</td>
					<td class="text-center">${row.item_desc}</td>
					<td><img src="${row.item_image}" alt="Foods Image"></td>
					<td class="text-center">${row.item_price}</td>
					<td class="text-center">${row.quantity_sold}</td>
					<td class="text-center">${row.revenue_generated}</td>
					<td>
						<span class="action-btn">
							<button class="rounded-lg bg-sky-400 py-2 px-2 inline-flex hover:bg-sky-600 text-zinc-50 hover:drop-shadow-lg" onclick="showDialog()">
								<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
								<path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
								</svg>
							</button>
							<button class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-700 text-zinc-50 hover:drop-shadow-lg" onclick="deleteItems()">
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
}
// End of Function for Refresh Item //

//----- Show Foods Function -----//
// Start Query Here
connection.connect(function(err) {
	if (err) throw err;
	//Select all foods and return the result object:
	connection.query("SELECT * FROM manage_db.menu_items", function(err, result) {
		if (err) throw err;

		let placeholder = document.querySelector("#data-output");
		let out = "";

		for (let row of result) {
			out += `
				<tr class="bg-white border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
					<td class="text-center">${row.item_id}</td>
					<td class="text-center">${row.item_name}</td>
					<td class="text-center">${row.item_desc}</td>
					<td><img src="${row.item_image}" alt="Foods Image"></td>
					<td class="text-center">${row.item_price}</td>
					<td class="text-center">${row.quantity_sold}</td>
					<td class="text-center">${row.revenue_generated}</td>
					<td>
						<span class="action-btn">
						<button class="rounded-lg bg-sky-400 py-2 px-2 inline-flex hover:bg-sky-600 text-zinc-50 hover:drop-shadow-lg" onclick="showDialog()">
							<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
							<path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
							</svg>
						</button>
						<button class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-700 text-zinc-50 hover:drop-shadow-lg" onclick="deleteItems()">
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
function addItems() {
	// CHECKS IF FILE INPUT IS EMPTY OR NOT
	if (document.getElementById("foodimg").files.length == 0) {
		errormodal();
	}
	else {
		// VARIABLES FROM inventory.html
		var fooditem = document.getElementById("fooditem").value;
		var fooddesc = document.getElementById("fooddesc").value;
		var foodimg = document.getElementById("foodimg").value.split('fakepath\\');
		var withimg = ("./foods/" + foodimg[1])
		var foodprice = document.getElementById("foodprice").value;

		// IMAGE HANDLING
		var imgFileName = foodimg[1];

		const filePath = document.querySelector('input[type=file').files[0].path;
		const filePathCopy = __dirname + '/foods/' + imgFileName;

		console.log(filePathCopy);

		fs.copyFile(filePath, filePathCopy, (err) => {
			if (err) throw err;

			console.log('File Copy Successfully.');
		})

		// THE QUERY USED TO INSERT
		const query = 'INSERT INTO menu_items (item_name, item_desc, item_image, item_price) VALUES (?, ?, ?, ?);';
		connection.query(query, [fooditem, fooddesc, withimg, foodprice], (error, results) => {
			if (error) {
				errormodal();
			} else {
				addsuccessmodal();
			}
		});
	}
}
// -----END OF ADD NEW FOODS FUNCTION----- //


//----- TABLE CLICK EVENT ------//
function rowClick() {
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
				var id = food_id.innerHTML;
				var name = food_name.innerHTML;
				var desc = food_desc.innerHTML;
				var img = food_img.innerHTML;
				var price = food_price.innerHTML;

				//alert("id:" + id + " name: " + name + " desc: " + desc + " image: " + img + " price: " + price);

				document.getElementById("foodidfield_2").value = id;
				document.getElementById("fooditem_2").value = name;
				document.getElementById("fooddesc_2").value = desc;
				document.getElementById("foodprice_2").value = price;

			};
		};

		currentRow.onclick = clickHandle(currentRow);
	}
}
//----- END OF TABLE CLICK EVENT -----//

// POP UP FUNCTION //
// END OF POPUP FUNCTION //

//----- UPDATE FUNCTION EVENT -----//
function updateItems() {
	// CHECKS IF FILE INPUT IS EMPTY OR NOT
	if (document.getElementById("foodimg_2").files.length == 0) {
		errormodal();
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
				errormodal();
			}
			else {
				// alert("Item Updated Successfully!");
				// //refresh page after insert
				// location.reload();
				updateitemsuccess();
			}
		});

	}

}
//----- END OF UPDATE FUNCTION EVENT -----//

//----- DELETE FUNCTION EVENT -----//
function deleteItems() {
	var table = document.getElementById("food_table");
	var rows = table.getElementsByTagName("tr");
	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle =
			function(row) {
				return function() {
					var food_id = row.getElementsByTagName("td")[0];
					var id = food_id.innerHTML;

					var food_name = row.getElementsByTagName("td")[1];
					var name = food_name.innerHTML;

					const query = `DELETE FROM menu_items WHERE item_id = "${id}"`;
					connection.query(query, error => {
						if (error) {
							alert("Select an item first!")
							console.log(error)
						}
						else {
							removesuccessopen();
						}
					})
				};
			};

		currentRow.onclick = clickHandle(currentRow);
	}
}
//----- END OF DELETE FUNCTION EVENT -----//

// edit modal
function showDialog() {
	const favDialog = document.getElementById("myModal");
	rowClick();
	favDialog.showModal();
}

// close edit modal
function closeModal() {
	const favDialog = document.getElementById("myModal");
	favDialog.close();
}

// add item modal (open, close, success and error)
function additemdialogopen() {
	const dialog = document.getElementById("addItemsModal");
	dialog.showModal();
}

function additemdialogclose() {
	const dialog = document.getElementById("addItemsModal");
	dialog.close();
}

function addsuccessmodal() {
	const dialog = document.getElementById("addsuccess");
	document.getElementById("item_name_placeholder").innerHTML = document.getElementById("fooditem").value;
	dialog.showModal();
}

function additemsuccessclose() {
	location.reload();
}

function errormodal() {
	const dialog = document.getElementById("errordialog");
	dialog.showModal();
}

function errorclose() {
	const dialog = document.getElementById("errordialog")
	dialog.close();
}

// update item modal (success and close)

function updateitemsuccess() {
	const dialog = document.getElementById("updatesuccess");
	document.getElementById("item_name_placeholder_3").innerHTML = document.getElementById("fooditem_2").value;
	dialog.showModal();
}

function updateitemsuccessclose() {
	location.reload();
}

// remove item modal (remove item)

function removesuccessopen() {
	const dialog = document.getElementById("removemodal");
	document.getElementById("item_name_placeholder_2").innerHTML = document.getElementById("fooditem_2").value;
	dialog.showModal();
}

function removesuccessclose() {
	location.reload();
}