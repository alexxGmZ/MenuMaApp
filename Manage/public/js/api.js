//
// Mysql
//
// mysql module
// const mysql = require(__dirname + "/js/modules/mysql.js");
const mysql = require("./modules/mysql.js");
// check database connection
mysql.check_connection();
// call connection variable
const connection = mysql.connection;

// NOTE:
// GET (read)
// POST (create)
// PATCH (update)
// DELETE (destroy)

//
// EXPRESS practice from fireship
//
const express = require("express");
const app = express();
const PORT = 8080;

app.listen(
	PORT,
	() => console.log(`API Port:${PORT}`)
)

app.get("/menu_items",
	// request (incoming data)
	// response (outgoing data)
	(request, response) => {
		const query = "SELECT * from manage_db.menu_items";
		connection.query(query, function(err, result) {
			if (err) throw err;

			console.log("GET request for menu_items");
			response.status(200).send(result);
		})
	}
);

app.get("/registered_employees",
	// request (incoming data)
	// response (outgoing data)
	(request, response) => {
		const query = "SELECT * from manage_db.registered_employees";
		connection.query(query, function(err, result) {
			if (err) throw err;

			console.log("GET request for registered_employees");
			response.status(200).send(result);
		})
	}
);

app.get("/order_queue",
	// request (incoming data)
	// response (outgoing data)
	(request, response) => {
		const query = "SELECT * from manage_db.order_queue";
		connection.query(query, function(err, result) {
			if (err) throw err;

			console.log("GET request for order_queue");
			response.status(200).send(result);
		})
	}
);

app.get("/items_ordered",
	// request (incoming data)
	// response (outgoing data)
	(request, response) => {
		const query = "SELECT * from manage_db.items_ordered";
		connection.query(query, function(err, result) {
			if (err) throw err;

			console.log("GET request for items_ordered");
			response.status(200).send(result);
		})
	}
);
