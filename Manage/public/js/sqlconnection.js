// MYSQL Connection //

const mysql = require('mysql2');

var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "1234",
	database: "manage_db"
});

// SQL Connection Test
function testsql()
{
	connection.connect((err) => {
		if (err) {
			return console.log(err.stack);
		}
		console.log("Connection Success");
	});

	// Queries Will be executed //

	$queryString = 'SELECT * FROM manage_db.menu_item;';
	connection.query($queryString, (err, rows, fields) => {

		if(err) {
			return console.log(err.stack)
		}

		console.log(rows);

	});

	// ------------------------ //

	connection.end(() => {
		console.log("Connection Closed");
	});
}
// END OF SQL Connection Test

// Function for Refresh Items //
function refreshitems()
{
	connection.connect((err) => {
		if (err) {
			return console.log(err.stack);
		}
		console.log("Connection Success");
	});

	// Start Query Here
	connection.connect(function(err) {
		if (err) throw err;
  		//Select all customers and return the result object:
  		connection.query("SELECT * FROM manage_db.menu_item", function (err, result, fields) {
    		if (err) throw err;

			let placeholder = document.querySelector("#data-output");
			let out = "";

			for(let row of result) {
				out += `
					<tr>
						<td>${row.item_id}</td>
						<td>${row.item_name}</td>
						<td>${row.item_desc}</td>
						<td>${row.item_image}</td>
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

// END OF MYSQL FUNCTIONS //




//----- Show Foods Function -----//
connection.connect((err) => {
	if (err) {
		return console.log(err.stack);
	}
	console.log("Connection Success");
});

// Start Query Here
connection.connect(function(err) {
	if (err) throw err;
	//Select all foods and return the result object:
	connection.query("SELECT * FROM manage_db.menu_item", function (err, result, fields){
		if (err) throw err;

		let placeholder = document.querySelector("#data-output");
		let out = "";

		for(let row of result){
			out += `
				<tr>
					<td>${row.item_id}</td>
					<td>${row.item_name}</td>
					<td>${row.item_desc}</td>
					<td>${row.item_image}</td>
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