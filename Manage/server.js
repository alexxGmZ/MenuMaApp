// mysql module
// const mysql = require(__dirname + "/js/modules/mysql.js");
const mysql = require("./public/js/modules/mysql.js");
// check database connection
mysql.check_connection();
// call connection variable
const connection = mysql.connection;

const fs = require("fs");

// express
const express = require("express");
const cors = require("cors");
const body_parser = require("body-parser");
const app = express();
const PORT = 8080;

// multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(body_parser.json());
app.use(cors());
app.use(express.static("public"));

const os = require("os");
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./localStorage');

// format get request message
function request_message_format(request_protocol, api_endpoint, ip_requested) {
	const currentDate = new Date();
	const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
	return console.log(`${request_protocol} request for ${api_endpoint} from ${ip_requested} ${formattedDate}`);
}

function authenticate_api_connection(req, res, next) {
	// const ip = req.ip;
	let ip = extractIPv4(req.ip);
	const token = req.query.api_token;
	console.log(ip, token);

	// Query the database to check if the IP and token combination exists
	const query = `SELECT * FROM api_connected_devices WHERE ip_address = ? AND api_token = ?`;
	connection.query(
		query,
		[ip, token],
		(err, results) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: 'Internal Server Error' });
			}

			// If a valid combination is found, proceed to the next middleware
			if (results.length > 0) {
				next();
			}
			else {
				return res.status(401).json({ error: 'Unauthorized' });
			}
		}
	);
}

function extractIPv4(ip) {
	if (ip.startsWith('::ffff:')) {
		return ip.replace('::ffff:', ''); // Remove the '::ffff:' prefix
	}
	return ip;
}

function update_local_storage_date() {
	console.log("called update_local_storage_date()");
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed in JavaScript.
	const day = now.getDate().toString().padStart(2, '0');
	const current_date = `${year}-${month}-${day}`;

	const local_storage_date = localStorage.getItem("storage_date");
	if (local_storage_date !== current_date) {
		localStorage.setItem("storage_date", current_date);
		localStorage.setItem("storage_queue_number", 1);
	}

	const local_storage_queue_number = localStorage.getItem("storage_queue_number");
	if (!local_storage_queue_number) {
		localStorage.setItem("storage_queue_number", 1);
	}
}

// localStorage.setItem("storage_queue_number", 1);
update_local_storage_date();

// for the Order application to display menu items
app.get("/menu_items", authenticate_api_connection,
	(request, response) => {
		const query = "SELECT * from manage_db.menu_items";
		connection.query(query, function(err, result) {
			if (err) throw err;

			// Convert image data to base64-encoded strings
			for (const row of result) {
				if (row.item_image) {
					row.item_image = `data:image/jpeg;base64,${row.item_image.toString("base64")}`;
				}
			}

			request_message_format("GET", "menu_items", request.ip);
			response.status(200).json(result);
		})
	}
);

// no image to make it fast
app.get("/menu_items_lite", authenticate_api_connection,
	(request, response) => {
		const query = "SELECT item_id, item_name, item_price FROM manage_db.menu_items";
		connection.query(query, function(err, result) {
			if (err) throw err;
			request_message_format("GET", "menu_items_lite", request.ip);
			response.status(200).json(result);
		})
	}
);

app.get("/status", authenticate_api_connection,
	(request, response) => {
		const server_ip = Object.values(os.networkInterfaces())
			.flat()
			.filter((iface) => iface.family === 'IPv4' && !iface.internal)
			.map((iface) => iface.address)[0];
		response.send(`Connected To MenuMaApp Manage Server: ${server_ip}`);
		request_message_format("GET", "status", request.ip);
	});

// for adding inventory items to database
app.post("/upload_item", upload.single("image"), (req, res) => {
	if (!req.file) {
		return res.json({ success: false });
	}

	const { name, description, price } = req.body;
	const body = JSON.stringify(req.body, null, 2);
	console.log(body);
	console.log(req.file.buffer);

	// Insert the image into the database
	connection.query("INSERT INTO manage_db.menu_items (item_name, item_desc, item_image, item_price) VALUES (?, ?, ?, ?)",
		[name, description, req.file.buffer, price], (err) => {
			if (err) {
				console.error("Error inserting data into MySQL:", err);
				return res.json({ success: false });
			}
			request_message_format("POST", "upload_item", req.ip);
			return res.json({ success: true });
		}
	);
});

// for updating inventory items to database
app.post("/update_item", upload.single("image"), (req, res) => {
	// Extract data from the request body
	const { id, name, description, price } = req.body;
	const body = JSON.stringify(req.body, null, 2);
	// console.log(body);

	var sql_query = "";
	var sql_parameters = [];

	// check if there's an image buffer then adjust the query
	if (req.file) {
		sql_query = "UPDATE manage_db.menu_items SET item_name = ?, item_desc = ?, item_price = ?, item_image = ? WHERE item_id = ?";
		sql_parameters = [name, description, price, req.file.buffer, id];
		// console.log(req.file.buffer);
	}
	else {
		sql_query = "UPDATE manage_db.menu_items SET item_name = ?, item_desc = ?, item_price = ? WHERE item_id = ?";
		sql_parameters = [name, description, price, id];
	}

	// Build and execute the SQL update query
	connection.query(sql_query, sql_parameters, (error, results) => {
		if (error) {
			console.error("Error updating item:", error);
			return res.status(500).json({ success: false, error: "Internal Server Error" });
		}

		// Check if any rows were affected
		if (results.affectedRows === 0) {
			return res.status(404).json({ success: false, error: "Item not found" });
		}

		// Item updated successfully
		request_message_format("POST", "update_item", req.ip);
		return res.status(200).json({ success: true, message: "Item updated successfully" });
	});
});

app.get("/registered_employees", authenticate_api_connection,
	(request, response) => {
		const query = "SELECT * from manage_db.registered_employees";
		connection.query(query, function(err, result) {
			if (err) throw err;

			request_message_format("GET", "registered_employees", request.ip);
			response.status(200).send(result);
		})
	}
);

// to be displayed in the order-qeue.html
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

				request_message_format("GET", "orders", request.ip);

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
				response.status(200).send(nestedData);
			});
		});
	}
);

app.get("/menu_design", authenticate_api_connection,
	(request, response) => {
		const design_file = "./current_design.json";
		fs.readFile(design_file, "utf8", (err, data) => {
			if (err) {
				console.log(`Error reading ${design_file}`);
				return response.status(500).json({ error: 'Internal Server Error' });
			}

			try {
				const json_data = JSON.parse(data);
				response.status(200).json(json_data);
				request_message_format("GET", "menu_design", request.ip);
			}
			catch (parse_error) {
				console.error('Error parsing JSON:', parse_error);
				response.status(500).json({ error: 'Internal Server Error' });
			}
		})
	}
);

app.post("/send_order", authenticate_api_connection,
	(request, response) => {
		let queue_number = parseInt(localStorage.getItem("storage_queue_number"));
		console.log("queue_number", queue_number);
		console.log("request.body", request.body);

		request_message_format("POST", "send_order", request.ip);
		response.status(200).json({
			message: "Order received successfully",
			queue_number: queue_number
		});

		// The const to get the data
		const json_data = request.body
		// console.log("The JSON DATA",json_data)

		// to access the order_details
		const json_order_details = json_data.order_details;
		// console.log("The JSON DATA (order_details)", json_order_details);

		//to acces the items_ordered
		const json_item_ordered = json_data.item_ordered;
		// console.log("The JSON DATA (item_ordered)", json_item_ordered);

		//to insert the order_details into const
		const customerName = json_order_details[0].customer_name;
		const totalPrice = json_order_details[0].total_price;
		const transactioDate = json_order_details[0].transaction_date;
		const ipAddress =  extractIPv4(request.ip);

		// console.log("Customer queue number is: ", queue_number);
		// console.log("Customer name is: ", customerName);
		// console.log("Customer total price is: ", totalPrice);
		// console.log("Customer transaction date is: ", transactioDate);
		// console.log("Customer ip address used is: ", ipAddress);

		const temp_current_queue = queue_number

		const order_details_query = "INSERT INTO order_queue (queue_number, customer_name, total_price, transaction_date, kiosk_ip_address) VALUES (?, ?, ?, ?, ?)";
		connection.query(order_details_query, [queue_number, customerName, totalPrice, transactioDate, ipAddress], (error, results) => {
			if(error) {
				console.log(error);
				result.status(500).send("ERROR INSERTING IT!")
			} else {
				// console.log("SUCCESSFULLY INSERTED!")
				console.log("Order QUEUE CHecker: ", temp_current_queue)
			}
		});

		connection.query(`SELECT order_id FROM order_queue WHERE queue_number = '${queue_number}'`, function(err, order_result, fields) {
			if (err) {
				console.log("DIDN'T FIND THE ORDER ID NUMBER")
			} else {
				// console.log("HERE THE EXISTING ORDER ID: ",order_result);
				const orderId = order_result[0].order_id;
				// console.log("ID is: ", orderId)

				json_item_ordered.forEach((item, index) => {
					// console.log(`Item ${index + 1}:`);
					// console.log("Item ID:", item.item_id);
					// console.log("Item Name:", item.item_name);
					// console.log("Item Price:", item.item_price);
					// console.log("Item Quantity:", item.item_quantity);
					// console.log("Item Cost:", item.item_cost);
					// console.log("Item Queue#: ", temp_current_queue);

					const item_ordered_query = "INSERT INTO items_ordered (item_id, item_name, item_price, quantity, quantity_times_price, order_id, queue_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
					connection.query(item_ordered_query, [item.item_id, item.item_name, item.item_price, item.item_price, item.item_cost, orderId, temp_current_queue], (err, results) => {
						if (err) {
							result.status(500).send("ERROR INSERTING IT!")
						} else {
							// console.log("SUCCESSFULLY INSERTED!")
							console.log("NEXT QUEUE CHeck will be: ", queue_number)
						}
					})

				})
			}
		})

		queue_number += 1;
		localStorage.setItem("storage_queue_number", queue_number);
	}
);

app.listen(
	PORT,
	() => console.log(`API Port:${PORT}`)
);
