console.log("Directory: " + __dirname);

const crypto = require("crypto");

//
// Mysql Database
//
// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js");
// create database connection
const connection = mysql.connection;
// check database connection
mysql.check_connection();


function register_employee() {
	// variables from register.html
	var name = document.getElementById("name").value.trim();
	// cancel if input box is empty
	if (name.length == 0 || name.trim() === "")
		return alert("Name is empty");

	var password = document.getElementById("password").value;
	// cancel if input box is empty
	if (password.length == 0 || password.trim() === "")
		return alert("Password is empty");

	// hash password with sha256
	var hash_password = crypto.createHash("sha256").update(password).digest("hex");


	// privilege variables
	// assign 1 if the corresponding checkbox id is checked
	var design_priv = 0;
	if (document.querySelector("#design_priv").checked == true)
		design_priv = 1;

	var inventory_priv = 0;
	if (document.querySelector("#inventory_priv").checked == true)
		inventory_priv = 1;

	var report_priv = 0;
	if (document.querySelector("#report_priv").checked == true)
		report_priv = 1;


	// debug purposes
	console.log(name);
	console.log(password);
	console.log(hash_password);
	console.log(design_priv, inventory_priv, report_priv);

	// insert employee to database
	connection.connect(function(err) {
		if (err) throw err;

		// insert registered user
		const query = "INSERT INTO registered_employees (name, password, design_priv, inventory_priv, view_reports_priv) VALUES (?, ?, ?, ?, ?);";
		connection.query(query, [name, hash_password, design_priv, inventory_priv, report_priv], (error, results) => {
			if(error) {
				alert(error);
				results.status(500).send('Error insert!!!!!')
			}
			else {
				alert(name + " is registered");
				//refresh page after insert
				location.reload();
			}
		});
	})
}

function list_registered_employees() {
	connection.query("SELECT * FROM registered_employees", function (err, result, fields){
		if (err) throw err;
		console.log(result);

		let placeholder = document.querySelector("#registered_employees");
		let out = "";

		for(let row of result){

			if (row.design_priv == 1)
				row.design_priv = "Yes";
			else
				row.design_priv = "No";

			if (row.inventory_priv == 1)
				row.inventory_priv = "Yes"
			else
				row.inventory_priv = "No";

			if (row.view_reports_priv == 1)
				row.view_reports_priv = "Yes"
			else
				row.view_reports_priv = "No";

			out += `
				<tr>
					<td>${row.name}</td>
					<td>${row.design_priv}</td>
					<td>${row.inventory_priv}</td>
					<td>${row.view_reports_priv}</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

module.exports = {
	list_registered_employees,
};
