const mysql = require("mysql2");

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

function list_available_devices() {

}

function list_registered_devices() {

}
