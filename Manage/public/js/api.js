console.log("Directory: " + __dirname);
//
// Mysql
//
// mysql module
const mysql = require(__dirname + "/js/modules/mysql.js");
// check database connection
mysql.check_connection();
// call connection variable
const connection = mysql.connection;

document.addEventListener("DOMContentLoaded", function() {
	// Call your API function or any other JavaScript code here
	api_menu_items();
	api_order_queue();
	api_items_ordered();
	api_registered_employees();
});

function api_menu_items() {
	const query = "SELECT * from manage_db.menu_items";
	connection.query(query, function(err, result) {
		if (err) throw err;

		// menu_items table data
		// console.log(result);
		const result_json = JSON.stringify(result, null, 2);
		console.log(result_json);
		const json_container = document.getElementById("menu_items");
		json_container.textContent = result_json;
	})
}

function api_order_queue() {
	const query = "SELECT * from manage_db.order_queue";
	connection.query(query, function(err, result) {
		if (err) throw err;

		// order_queue table data
		// console.log(result);
		const result_json = JSON.stringify(result, null, 2);
		console.log(result_json);
		const json_container = document.getElementById("order_queue");
		json_container.textContent = result_json;
	})
}

function api_items_ordered() {
	const query = "SELECT * from manage_db.items_ordered";
	connection.query(query, function(err, result) {
		if (err) throw err;

		// items_ordered table data
		// console.log(result);
		const result_json = JSON.stringify(result, null, 2);
		console.log(result_json);
		const json_container = document.getElementById("items_ordered");
		json_container.textContent = result_json;
	})
}

function api_registered_employees() {
	const query = "SELECT * from manage_db.registered_employees";
	connection.query(query, function(err, result) {
		if (err) throw err;

		// items_ordered table data
		// console.log(result);
		const result_json = JSON.stringify(result, null, 2);
		console.log(result_json);
		const json_container = document.getElementById("registered_employees");
		json_container.textContent = result_json;
	})
}

