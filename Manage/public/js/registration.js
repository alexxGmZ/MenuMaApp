document.addEventListener("DOMContentLoaded", function() {
	list_registered_employees();
});

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

	// insert registered user
	const query = "INSERT INTO registered_employees (name, password_hash, design_priv, inventory_priv, view_reports_priv) VALUES (?, ?, ?, ?, ?);";
	connection.query(query, [name, hash_password, design_priv, inventory_priv, report_priv], (error, results) => {
		if (error) {
			alert(error);
			results.status(500).send('Error insert!!!!!')
		}
		else {
			alert(name + " is registered");
			//refresh page after insert
			location.reload();
		}
	});
}

function list_registered_employees() {
	connection.query("SELECT * FROM registered_employees", function(err, result, fields) {
		if (err) throw err;
		console.log(result);

		let placeholder = document.querySelector("#registered_employees");
		let out = "";

		for (let row of result) {

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
					<td>${row.employee_id}</td>
					<td>${row.name}</td>
					<td>${row.design_priv}</td>
					<td>${row.inventory_priv}</td>
					<td>${row.view_reports_priv}</td>
					<td>
						<span class="action-btn">
							<a href="#" onclick="showDialog()">Edit</button>
							<a href="#" onclick="delete_employee()">Remove</a>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

// TABLE CLICK FUNCTION //
function rowClick()
{
	let design_privilege = document.getElementById("design_priv_2");
	let inventory_privilege = document.getElementById("inventory_priv_2");
	let report_privilege = document.getElementById("report_priv_2");

	var table = document.getElementById("employee_table");
	var rows = table.getElementsByTagName("tr");
	for(i = 0; i < rows.length; i++)
	{
		var currentRow = table.rows[i];
		var clickHandle =
			function(row)
			{
				return function()
				{
					var employee_id = row.getElementsByTagName("td")[0];
					var id = employee_id.innerHTML;

					var employee_name = row.getElementsByTagName("td")[1];
					var name = employee_name.innerHTML;

					var design_priv = row.getElementsByTagName("td")[2];
					var design = design_priv.innerHTML;

					var inventory_priv = row.getElementsByTagName("td")[3];
					var inventory = inventory_priv.innerHTML;

					var reports_priv = row.getElementsByTagName("td")[4];
					var reports = reports_priv.innerHTML;

					document.getElementById("id").value = id;
					document.getElementById("name_2").value = name;

					if (design == "Yes")
						design_privilege.checked = true;
					else
						design_privilege.checked = false;

					if (inventory == "Yes")
						inventory_privilege.checked = true;
					else
						inventory_privilege.checked = false;

					if (reports == "Yes")
						report_privilege.checked = true;
					else
						report_privilege.checked = false;

				};
			};

		currentRow.onclick = clickHandle(currentRow);
	}
}
// END OF TABLE CLICK FUNCTION //

// UPDATE EMPLOYEE FUNCTION
function update_employee()
{
	// hidden item input for id
	var id = document.getElementById("id").value;

	// variables from register.html
	var name = document.getElementById("name_2").value.trim();
	// cancel if input box is empty
	if (name.length == 0 || name.trim() === "")
		return alert("Name is empty");

	// privilege variables
	// assign 1 if the corresponding checkbox id is checked
	var design_priv = 0;
	if (document.querySelector("#design_priv_2").checked == true)
		design_priv = 1;

	var inventory_priv = 0;
	if (document.querySelector("#inventory_priv_2").checked == true)
		inventory_priv = 1;

	var report_priv = 0;
	if (document.querySelector("#report_priv_2").checked == true)
		report_priv = 1;

	const query = `UPDATE registered_employees SET name = "${name}", design_priv = "${design_priv}", inventory_priv = "${inventory_priv}", view_reports_priv = "${report_priv}" WHERE employee_id = "${id}"`;
	connection.query(query, function(error, results) {
		if(error)
		{
			alert("Some fields are empty");
			console.log(error);
		}
		else
		{
			alert("Employee updated!!");
			location.reload();
		}
	});

}
// END OF UPDATE EMPLOYEE FUNCTION //

// DELETE EMPLOYEE FUNCTION
function delete_employee()
{

	var table = document.getElementById("employee_table");
	var rows = table.getElementsByTagName("tr");
	for(i = 0; i < rows.length; i++)
	{
		var currentRow = table.rows[i];
		var clickHandle =
			function(row)
			{
				return function()
				{
					var employee_id = row.getElementsByTagName("td")[0];
					var id = employee_id.innerHTML;

					document.getElementById("id").value = id;

					// hidden item input for id
					var employeeid = document.getElementById("id").value;
					if (id.length == 0)
						return alert("Select a employee first!");

					connection.connect(function (err) {
						const query = `DELETE FROM registered_employees WHERE employee_id = "${employeeid}"`;
						connection.query(query, function(error, results) {
							if(error)
							{
								alert("Select an item first!")
								console.log(error)
							}
							else
							{
								alert('Employee has been removed!')
								location.reload();
							}
						})
					})


				};
			};

		currentRow.onclick = clickHandle(currentRow);
	}
}
// END OF UPDATE EMPLOYEE FUNCTION //
