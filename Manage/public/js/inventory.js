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

	// CHECKS IF FILE INPUT IS EMPTY OR NOT
	if(document.getElementById("foodimg").files.length == 0)
	{
		alert("Select a Image first!")
	}
	else
	{
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
					alert("Some input fields are empty!");
					console.log(error);
				} else {
					alert('Data Inserted Successfully!');
					//refresh page after insert
					location.reload();
				}
			});

		})
	}

}
// -----END OF ADD NEW FOODS FUNCTION----- //


//----- TABLE CLICK EVENT ------//
function rowClick()
{
	var table = document.getElementById("food_table");
	var rows = table.getElementsByTagName("tr");
	for(i = 0; i < rows.length; i++)
	{
		var currentRow = table.rows[i];
		var clickHandle = 
			function(row)
			{
				return function()
				{
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

					document.getElementById("foodidfield").value = id;
					document.getElementById("fooditem").value = name;
					document.getElementById("fooddesc").value = desc;
					document.getElementById("foodprice").value = price;

				};
			};

		currentRow.onclick = clickHandle(currentRow);
	}
}
//----- END OF TABLE CLICK EVENT -----//


//----- UPDATE FUNCTION EVENT -----//
function updateItems()
{

	// CHECKS IF FILE INPUT IS EMPTY OR NOT
	if(document.getElementById("foodimg").files.length == 0)
	{
		alert("Select a Image first!")
	}
	else
	{
		// FUNCTION TO UPDATE
		connection.connect(function(err) {
			if (err) throw err;

			// VARIABLES FROM inventory.html
			var foodid = document.getElementById("foodidfield").value;
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

			// QUERY USED TO UPDATE
			const query = `UPDATE menu_items SET item_name = "${fooditem}", item_desc = "${fooddesc}", item_image = "${withimg}", item_price = "${foodprice}" WHERE item_id = "${foodid}"`;
			connection.query(query, function(error, results) {
				if(error)
				{
					console.log(error);
					alert("Some input fields are empty!")
				}
				else
				{
					alert('Data Updated Successfully!');
					//refresh page after insert
					location.reload();
				}
			});

		})
	}

}
//----- END OF UPDATE FUNCTION EVENT -----//

//----- DELETE FUNCTION EVENT -----//
function deleteItems()
{
	// FUNCTION TO DELETE ITEMS
	connection.connect(function (err) {
		// VARIABLES FROM inventory.html
		var foodid = document.getElementById("foodidfield").value;

		const query = `DELETE FROM menu_items WHERE item_id = "${foodid}"`;
		connection.query(query, function(error, results) {
			if(error)
			{
				alert("Select an item first!")
				console.log(error)
			}
			else
			{
				alert('Data has been removed!')
				location.reload();
			}
		})
	})
}
//----- END OF DELETE FUNCTION EVENT -----//
