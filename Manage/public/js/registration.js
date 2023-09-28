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
			dialog_open("add_employee_successs_dialog");
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
				<tr class="bg-white border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
					<td class="text-center">${row.employee_id}</td>
					<td class="text-center">${row.name}</td>
					<td class="text-center">${row.design_priv}</td>
					<td class="text-center">${row.inventory_priv}</td>
					<td class="text-center">${row.view_reports_priv}</td>
					<td class="text-center">
						<span class="action-btn">
							<button class="rounded-lg bg-sky-400 my-4 py-2 px-2 inline-flex hover:bg-sky-600 text-zinc-50 hover:drop-shadow-lg" onclick="showDialog()">
								<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
								<path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
								</svg>
							</button>
							<button class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-700 text-zinc-50 hover:drop-shadow-lg" onclick="delete_employee()">
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

// TABLE CLICK FUNCTION //
function rowClick() {
	let design_privilege = document.getElementById("design_priv_2");
	let inventory_privilege = document.getElementById("inventory_priv_2");
	let report_privilege = document.getElementById("report_priv_2");

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
function update_employee() {
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

	const query = `UPDATE registered_employees SET name = "${name}", design_priv = "${design_priv}", inventory_priv = "${inventory_priv}", view_reports_priv = "${report_priv}" WHERE employee_id = "${id}"`;
	connection.query(query, error => {
		if (error) {
			alert("Some fields are empty");
			console.log(error);
		}
		else {
			dialog_open('update_employee_successs_dialog');
		}
	});

}
// END OF UPDATE EMPLOYEE FUNCTION //

// DELETE EMPLOYEE FUNCTION
function delete_employee() {
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
						}
					})
				};
			};

		currentRow.onclick = clickHandle(currentRow);
	}
}
// END OF UPDATE EMPLOYEE FUNCTION //

function showDialog() {
	const favDialog = document.getElementById("myModal");
	rowClick();
	favDialog.showModal();
}

function closeModal() {
	const favDialog = document.getElementById("myModal");
	favDialog.close();
}

// open modal dialog based on element id
function dialog_open(element_id) {
	const fav_dialog = document.getElementById(element_id)

	// any element id specific statements
	if(element_id == "remove_employee_success_dialog") {
		rowClick();
	}
	if(element_id == "add_employee_successs_dialog") {
		document.getElementById("add_employee_placeholder").innerHTML = document.getElementById("name").value;
	}
	if(element_id == "update_employee_successs_dialog") {
		document.getElementById("update_employee_placeholder").innerHTML = document.getElementById("name_2").value;
	}

	fav_dialog.showModal();
}

// close the modal
function dialog_close(element_id) {
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.close();
}


