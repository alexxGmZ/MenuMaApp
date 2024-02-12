document.addEventListener("DOMContentLoaded", function() {
	list_registered_employees();
	toggle_sort_employee_table();
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

// dialog module
const dialog = require(__dirname + "/js/modules/dialog.js");
const dialog_open = dialog.dialog_open;
const dialog_close = dialog.dialog_close;

function register_employee() {
	console.log("called register_employee()");
	// variables from register.html
	var name = document.getElementById("name").value.trim();
	// cancel if input box is empty
	if (name.length == 0 || name.trim() === "")
		return dialog_open('add_employee_name_error_dialog');

	var password = document.getElementById("password").value;
	// cancel if input box is empty
	if (password.length == 0 || password.trim() === "")
		return dialog_open('add_employee_password_error_dialog');

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

	var employee_priv = 0;
	if (document.querySelector("#employee_priv").checked == true)
		employee_priv = 1;

	var devices_priv = 0
	if (document.querySelector("#devices_priv").checked == true)
		devices_priv = 1;


	// debug purposes
	console.log(name);
	console.log(password);
	console.log(hash_password);
	console.log(design_priv, inventory_priv, report_priv, employee_priv, devices_priv);

	// insert registered user
	const query = "INSERT INTO registered_employees (name, password_hash, design_priv, inventory_priv, view_reports_priv, manage_employee_priv, manage_devices_priv) VALUES (?, ?, ?, ?, ?, ?, ?);";
	connection.query(query, [name, hash_password, design_priv, inventory_priv, report_priv, employee_priv, devices_priv], (error, results) => {
		if (error) {
			alert(error);
			results.status(500).send('Error insert!!!!!')
		}
		else {
			dialog_open("add_employee_successs_dialog");
			document.getElementById("add_employee_placeholder").innerHTML = document.getElementById("name").value;
		}
	});
}

function list_registered_employees() {
	console.log("called list_registered_employees()");
	connection.query("SELECT * FROM registered_employees", function(err, result, fields) {
		if (err) throw err;
		// console.log(result);

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

			if (row.manage_employee_priv == 1)
				row.manage_employee_priv = "Yes"
			else
				row.manage_employee_priv = "No";

			if (row.manage_devices_priv == 1)
				row.manage_devices_priv = "Yes"
			else
				row.manage_devices_priv = "No";


			out += `
				<tr>
					<td data-column="employee_id">${row.employee_id}</td>
					<td data-column="employee_name">${row.name}</td>
					<td data-column="employee_design_priv">${row.design_priv}</td>
					<td data-column="employee_inventory_priv">${row.inventory_priv}</td>
					<td data-column="employee_reports_priv">${row.view_reports_priv}</td>
					<td data-column="employee_manage_priv">${row.manage_employee_priv}</td>
					<td data-column="employee_devices_priv">${row.manage_devices_priv}</td>
					<td>
						<span class="action-btn">
							<button onclick="dialog_open('update_employee_dialog'); rowClick()" class="btn btn-outline-primary">
								<img src="assets/svg/pencil-alt.svg" class="">
							</button>
							<button onclick="delete_employee()" class="btn btn-danger">
								<img src="assets/svg/trash.svg" class="">
							</button>
						</span>
					</td>
				</tr>
			`;
		}
		placeholder.innerHTML = out;
	});
}

function refresh_employee_table() {
	console.log("called refresh_employee_table");

	// close all active dialogs with active-dialog class
	// NOTE: will execute if dialog_open() is executed
	const activeDialogs = document.querySelectorAll(".active-dialog");
	activeDialogs.forEach((dialog) => {
		dialog.close();
		dialog.classList.remove("active-dialog");
	});

	// empty the registered_devices table body
	const table_body = document.getElementById("registered_employees");
	table_body.innerHTML = "";

	// repopulate the registered_devices table body
	list_registered_employees();
}

function toggle_sort_employee_table() {
	// sort table columns when column name is clicked
	const sortOrders = {};
	const headers = document.querySelectorAll("#employee_table th[data-column]");

	headers.forEach((header) => {
		const column = header.getAttribute("data-column");
		sortOrders[column] = "asc"; // Set the initial sort order to ascending

		header.addEventListener("click", () => {
			// Toggle sort order on each click
			sortOrders[column] = sortOrders[column] === "asc" ? "desc" : "asc";
			sort_registered_employees(document.getElementById("employee_table"), column, sortOrders[column]);
		});
	});
}

function sort_registered_employees(table, column, sortOrder) {
	console.log(`called sort_registered_employees(${table}, ${column}, ${sortOrder})`);

	const tbody = table.querySelector("tbody");
	const rows = Array.from(tbody.querySelectorAll("tr"));

	rows.sort((a, b) => {
		const cell_a = a.querySelector(`td[data-column="${column}"]`);
		const cell_b = b.querySelector(`td[data-column="${column}"]`);
		if (cell_a && cell_b) {
			const comparison = cell_a.textContent.localeCompare(cell_b.textContent, undefined, { numeric: true });
			return sortOrder === "asc" ? comparison : -comparison;
		}
		return 0; // Default comparison when one or both cells are missing
	});

	rows.forEach((row) => {
		tbody.appendChild(row);
	});
}

// TABLE CLICK FUNCTION //
function rowClick() {
	console.log("called rowClick()");
	let design_privilege = document.getElementById("design_priv_2");
	let inventory_privilege = document.getElementById("inventory_priv_2");
	let report_privilege = document.getElementById("report_priv_2");
	let employee_privilege = document.getElementById("employee_priv_2");
	let devices_privilege = document.getElementById("devices_priv_2");

	var table = document.getElementById("employee_table");
	var rows = table.getElementsByTagName("tr");
	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle =
			function(row) {
				return function() {
					var employee_id = row.getElementsByTagName("td")[0];
					document.getElementById("id").value = employee_id.innerHTML;

					var employee_name = row.getElementsByTagName("td")[1];
					document.getElementById("name_2").value = employee_name.innerHTML;
					document.getElementById("removed_employee_placeholder").innerHTML = employee_name.innerHTML;

					var design_priv = row.getElementsByTagName("td")[2];
					var design = design_priv.innerHTML;

					var inventory_priv = row.getElementsByTagName("td")[3];
					var inventory = inventory_priv.innerHTML;

					var reports_priv = row.getElementsByTagName("td")[4];
					var reports = reports_priv.innerHTML;

					var employee_priv = row.getElementsByTagName("td")[5];
					var employees = employee_priv.innerHTML;

					var devices_priv = row.getElementsByTagName("td")[6];
					var devices = devices_priv.innerHTML;

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
					if (employees == "Yes")
						employee_privilege.checked = true;
					else
						employee_privilege.checked = false;
					if (devices == "Yes")
						devices_privilege.checked = true;
					else
						devices_privilege.checked = false;
				};
			};

		currentRow.onclick = clickHandle(currentRow);
	}
}
// END OF TABLE CLICK FUNCTION //

// UPDATE EMPLOYEE FUNCTION
function update_employee() {
	console.log("called update_employee()");
	// hidden item input for id
	var id = document.getElementById("id").value;

	// variables from register.html
	var name = document.getElementById("name_2").value.trim();
	// cancel if input box is empty
	if (name.length == 0 || name.trim() === "")
		return dialog_open('add_employee_name_error_dialog');

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

	var employee_priv = 0;
	if (document.querySelector("#employee_priv_2").checked == true)
		employee_priv = 1;

	var devices_priv = 0;
	if (document.querySelector("#devices_priv_2").checked == true)
		devices_priv = 1;

	const query = `UPDATE registered_employees SET name = "${name}", design_priv = "${design_priv}", inventory_priv = "${inventory_priv}", view_reports_priv = "${report_priv}", manage_employee_priv = "${employee_priv}", manage_devices_priv = "${devices_priv}" WHERE employee_id = "${id}"`;
	connection.query(query, error => {
		if (error) {
			alert("Some fields are empty");
			console.log(error);
		}
	});
}
// END OF UPDATE EMPLOYEE FUNCTION //

// DELETE EMPLOYEE FUNCTION
function delete_employee() {
	console.log("called delete_employee()");
	var table = document.getElementById("employee_table");
	var rows = table.getElementsByTagName("tr");
	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle =
			function(row) {
				return function() {
					var employee_id = row.getElementsByTagName("td")[0];
					var id = employee_id.innerHTML;

					var employee_name = row.getElementsByTagName("td")[1];
					var name = employee_name.innerHTML;
					document.getElementById("removed_employee_placeholder").innerHTML = employee_name.innerHTML;

					if (id.length == 0)
						return alert("Select a employee first!");

					const query = `DELETE FROM registered_employees WHERE employee_id = "${id}"`;
					connection.query(query, error => {
						if (error) {
							alert("Select an item first!");
							console.log(error);
						}
						else {
							dialog_open('remove_employee_success_dialog');
							rowClick();
						}
					})
				};
			};

		currentRow.onclick = clickHandle(currentRow);
	}
}
// END OF UPDATE EMPLOYEE FUNCTION //
