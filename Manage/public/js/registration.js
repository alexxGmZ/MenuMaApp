const mysql = require('mysql2');

// create database connection
var connection = mysql.createConnection({
	host: "localhost",
	user: "",
	password: "",
	database: "manage_db"
});

// check database connection
connection.connect((err) => {
	if (err) {
		return console.log(err.stack);
	}
	console.log("Connection Success");
});

function register_employee() {
	// VARIABLES FROM register.html
	var name = document.getElementById("name").value;
	var password = document.getElementById("password").value;
	var design_priv = 0;
	var inventory_priv = 0;
	var report_priv = 0;

	// assign 1 if the corresponding checkbox id is checked
	if (document.querySelector("#design_priv").checked == true)
		design_priv = 1;

	if (document.querySelector("#inventory_priv").checked == true)
		inventory_priv = 1;

	if (document.querySelector("#report_priv").checked == true)
		report_priv = 1;

	// debug purposes
	console.log(name);
	console.log(password);
	console.log(design_priv);
	console.log(inventory_priv);
	console.log(report_priv);

	// insert employee to database
	connection.connect(function(err) {
		if (err) throw err;

		// insert registered user
		const query = "INSERT INTO registered_users (name, password, design_priv, inventory_priv, view_reports_priv) VALUES (?, ?, ?, ?, ?);";
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
