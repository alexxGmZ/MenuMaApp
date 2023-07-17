const mysql = require('mysql2');

var connection = mysql.createConnection({
	host: "localhost",
	user: "",
	password: "",
	database: "manage_db"
});

function register_employee() {
	// check database connection
	connection.connect((err) => {
		if (err) {
			return console.log(err.stack);
		}
		console.log("Connection Success");
	});

	// insert employee to database
	connection.connect(function(err) {
		if (err) throw err;

		// VARIABLES FROM inventory.html
		var name = document.getElementById("name").value;
		var password = document.getElementById("password").value;
		var design_priv = 0;
		var inventory_priv = 0;
		var report_priv = 0;

		// check if the checkboxes are checked
		var cb_design_priv = document.querySelector("#design_priv").checked
		var cb_inventory_priv = document.querySelector("#inventory_priv").checked
		var cb_report_priv = document.querySelector("#report_priv").checked

		// assign 1 if the corresponding checkboxes are checked
		if (cb_design_priv == true)
			design_priv = 1;

		if (cb_inventory_priv == true)
			inventory_priv = 1;

		if (cb_report_priv == true)
			report_priv = 1;

		// debug purposes
		console.log(name);
		console.log(password);
		console.log(design_priv);
		console.log(inventory_priv);
		console.log(report_priv);

		// insert registered users
		const query = 'INSERT INTO registered_users (name, password, design_priv, inventory_priv, view_reports_priv) VALUES (?, ?, ?, ?, ?);';
		connection.query(query, [name, password, design_priv, inventory_priv, report_priv], (error, results) => {
			if(error) {
				alert(error);
				res.status(500).send('Error insert!!!!!')
			}
			else {
				alert(name + " is registered");
			}
		});
	})
}
