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
	connection.connect(function(err) {
		if (err) throw err;
		//Select all customers and return the result object:
		connection.query("SELECT * FROM manage_db.menu_items", function(err, result, fields) {
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
					</tr>
				`;
			}

			placeholder.innerHTML = out;

		});
	})
}
// End of Function for Refresh Item //

//----- Show Foods Function -----//
// Start Query Here
connection.connect(function(err) {
	if (err) throw err;
	//Select all foods and return the result object:
	connection.query("SELECT * FROM manage_db.menu_items", function(err, result, fields) {
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
				</tr>
			`;
		}

		placeholder.innerHTML = out;

	});
})

//----- End of Show Foods Function -----//

// -----ADD NEW FOODS FUNCTION----- //
function addItems() {

	// FUNCTION TO INSERT
	connection.connect(function(err) {
		if (err) throw err;

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
				alert(error);
			} else {
				alert('Data Inserted Successfully!');
				//refresh page after insert
				location.reload();
			}
		});

	})

}
// -----END OF ADD NEW FOODS FUNCTION----- //
