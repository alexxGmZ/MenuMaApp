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
				<tr>
					<td>${row.item_id}</td>
					<td>${row.item_name}</td>
					<td>${row.item_desc}</td>
					<td><img src="${row.item_image}" alt="Foods Image"></td>
					<td>${row.item_price}</td>
					<td>${row.quantity_sold}</td>
					<td>${row.revenue_generated}</td>
					<td>
					<span class="action-btn">
						<a href="#" onclick="showDialog()">Edit</button>
						<a href="#" onclick="deleteItems()">Remove</a>
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
				<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-r border-l hover:bg-gray-300">
					<td class="text-center">${row.item_id}</td>
					<td class="text-center">${row.item_name}</td>
					<td class="text-center">${row.item_desc}</td>
					<td><img src="${row.item_image}" alt="Foods Image"></td>
					<td class="text-center">${row.item_price}</td>
					<td class="text-center">${row.quantity_sold}</td>
					<td class="text-center">${row.revenue_generated}</td>
					<td>
						<span class="action-btn">
							<a onclick="showDialog()">Edit</button>
							<a onclick="deleteItems()">Remove</a>
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
		alert("Select a Image first!")
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
				alert("Some input fields are empty!");
				console.log(error);
			} else {
				alert(fooditem + " Inserted Successfully!");
				//refresh page after insert
				location.reload();
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
		alert("Select a Image first!")
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
				alert("Some input fields are empty!")
			}
			else {
				alert("Item Updated Successfully!");
				//refresh page after insert
				location.reload();
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
							alert(name + " has been removed!")
							location.reload();
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
