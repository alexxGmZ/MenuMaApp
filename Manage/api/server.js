const PORT = 8080;

// mysql
const mysql = require("../public/js/modules/mysql.js");
mysql.check_connection();
const connection = mysql.connection;

// express
const express = require("express");
const cors = require("cors");
const body_parser = require("body-parser");
const app = express();
app.use(body_parser.json());
app.use(cors());
app.use(express.static("public"));

// multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// utilities
const endpoint_log = require("./utils/endpoint_log.js").endpoint_log;
const extract_ipv4 = require("./utils/extract_ipv4.js").extract_ipv4;
const auth_api_token = require("./utils/auth_api_token.js").auth_api_token;

const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./localStorage');
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

update_local_storage_date();

// GET endpoint controllers
const menu_design_controller = require("./get/menu_design.js").get_menu_design;
const menu_items_controller = require("./get/menu_items.js").menu_items;
const menu_items_lite_controller = require("./get/menu_items_lite.js").menu_items_lite;
const orders_controller = require("./get/orders.js").get_orders;
const order_history_controller = require("./get/order_history.js").get_order_history;
const order_stats_controller = require("./get/order_stats.js").get_order_status;
const server_status_controller = require("./get/status.js").server_status;
const registered_employees_controller = require("./get/registered_employees.js").registered_employees;

app.get("/menu_design", auth_api_token, menu_design_controller);
app.get("/menu_items", auth_api_token, menu_items_controller);
app.get("/menu_items_lite", auth_api_token, menu_items_lite_controller);
app.get("/orders", orders_controller);
app.get("/order_history", auth_api_token, order_history_controller);
app.get("/order_stats", auth_api_token, order_stats_controller);
app.get("/registered_employees", auth_api_token, registered_employees_controller);
app.get("/status", auth_api_token, server_status_controller);

// POST endpoint controllers
const update_item_controller = require("./post/update_item.js").update_item;
const upload_item_controller = require("./post/upload_item.js").upload_item;

app.post("/update_item", upload.single("image"), update_item_controller);
app.post("/upload_item", upload.single("image"), upload_item_controller);
app.post("/send_order", auth_api_token,
	(request, response) => {
		let queue_number = parseInt(localStorage.getItem("storage_queue_number"));
		console.log("queue_number", queue_number);
		console.log("request.body", request.body);

		endpoint_log("POST", "send_order", request.ip);
		response.status(200).json({
			message: "Order received successfully",
			queue_number: queue_number
		});

		// The const to get the data
		const json_data = request.body;
		// to access the order_details
		const json_order_details = json_data.order_details;
		//to acces the items_ordered
		const json_item_ordered = json_data.item_ordered;
		//to insert the order_details into const
		const customerName = json_order_details[0].customer_name;
		const totalPrice = json_order_details[0].total_price;
		const transactioDate = json_order_details[0].transaction_date;
		const ipAddress = extract_ipv4(request.ip);
		const temp_current_queue = queue_number;
		const order_details_query = "INSERT INTO order_queue (queue_number, customer_name, total_price, transaction_date, kiosk_ip_address) VALUES (?, ?, ?, ?, ?)";
		connection.query(order_details_query, [queue_number, customerName, totalPrice, transactioDate, ipAddress], (error) => {
			if (error) {
				console.log(error);
				response.status(500).send("ERROR INSERTING IT!");
			}
		});

		connection.query(`SELECT order_id FROM order_queue WHERE queue_number = '${queue_number}'`, function(err, order_result) {
			if (err) {
				console.log("DIDN'T FIND THE ORDER ID NUMBER");
				throw err;
			}
			else {
				const orderId = order_result[0].order_id;
				json_item_ordered.forEach((item, index) => {
					const item_ordered_query = "INSERT INTO items_ordered (item_id, item_name, item_price, quantity, quantity_times_price, order_id, queue_number) VALUES (?, ?, ?, ?, ?, ?, ?)";
					connection.query(item_ordered_query, [item.item_id, item.item_name, item.item_price, item.item_quantity, item.item_cost, orderId, temp_current_queue], (err, results) => {
						if (err) {
							response.status(500).send("ERROR INSERTING IT!")
							throw err;
						}
					});
				});
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
