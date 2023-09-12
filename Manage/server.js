//
// Mysql
//
// mysql module
// const mysql = require(__dirname + "/js/modules/mysql.js");
const mysql = require("./public/js/modules/mysql.js");
// check database connection
mysql.check_connection();
// call connection variable
const connection = mysql.connection;

//
// EXPRESS practice from fireship
//
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;

app.use(cors());
app.listen(
	PORT,
	() => console.log(`API Port:${PORT}`)
)

// format get request message
function get_request_message(api_endpoint, ip_requested) {
	const currentDate = new Date();
	const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
	return console.log(`GET request for ${api_endpoint} from ${ip_requested} ${formattedDate}`);
}

app.get("/menu_items",
	// request (incoming data)
	// response (outgoing data)
	(request, response) => {
		const query = "SELECT * from manage_db.menu_items";
		connection.query(query, function(err, result) {
			if (err) throw err;

			get_request_message("menu_items", request.ip);
			result = JSON.stringify(result, null, 2);
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

			get_request_message("registered_employees", request.ip);
			response.status(200).send(result);
		})
	}
);

app.get("/orders",
	(request, response) => {
		const orderQueueQuery = "SELECT * FROM manage_db.order_queue";
		const itemsOrderedQuery = "SELECT * FROM manage_db.items_ordered";

		// Execute the order_queue query
		connection.query(orderQueueQuery, function(err, orderQueueResult) {
			if (err) throw err;

			// Execute the items_ordered query
			connection.query(itemsOrderedQuery, function(err, itemsOrderedResult) {
				if (err) throw err;

				get_request_message("orders", request.ip);

				// Organize the data into the desired nested structure
				const nestedData = orderQueueResult.map(order => {
					// Find items_ordered entries with matching order_id
					const matchedItems = itemsOrderedResult.filter(item => item.order_id === order.order_id);

					// Create a new object with the order_queue data and nested items_ordered
					return {
						...order,
						items_ordered: matchedItems
					};
				});

				// Format the result as JSON with 2 spaces indentation
				const result = JSON.stringify(nestedData, null, 2);
				response.status(200).send(result);
			});
		});
	}
);

