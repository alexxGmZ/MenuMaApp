document.addEventListener("DOMContentLoaded", function() {
	display_orders();
	daily_order_stats();
});

const crypto = require("crypto");

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

// Global Data
var global_order_num = "";

function display_orders() {
	console.log("called display_orders()");
	fetch('http://localhost:8080/orders')
		.then(res => {
			return res.json();
		})
		.then(data => {
			data.forEach(orders => {
				const food_items = orders.items_ordered.map((item) => {
					return `${item.quantity} ${item.item_name}<br>`;
				})

				const removed_comma = food_items.join('');
				const markup = `
					<div class="shadow-sm mb-2 rounded-4 border border-2 p-3">
						<div class="row">
							<div class="col text-center fs-2">
								${orders.queue_number}
							</div>
							<div class="col text-center">
								${removed_comma}
							</div>
							<div class="col text-center">
								${orders.customer_name}
							</div>
							<div class="col text-center fs-2">
								${orders.total_price}
							</div>
							<div class="col text-center">
								<button onclick="dialog_open('cancel_order_dialog'); row_click('${encodeURIComponent(JSON.stringify(orders))}');" class="mb-1 btn btn-outline-danger shadow-sm w-50">
									<img src="assets/svg/x-circle.svg">
								</button>
								<br>
								<button onclick="order_done('${encodeURIComponent(JSON.stringify(orders))}')" class="mt-1 btn btn-outline-success shadow-sm w-50">
									<img src="assets/svg/check-circle.svg">
								</button>
							</div>
						</div>
					</div>
				`;
				document.querySelector("#order-list").insertAdjacentHTML('beforeend', markup);
			})
		})
		.catch(error => console.log(error));
}

function order_done(encoded_order) {
	console.log("called order_done()");
	const order = JSON.parse(decodeURIComponent(encoded_order));

	// Queries for getting data from order queue and items ordered tables specific for orders / row click
	const items_ordered_data = `SELECT * FROM manage_db.items_ordered WHERE queue_number = "${order.queue_number}"`;
	const order_queue_data = `SELECT * FROM manage_db.order_queue WHERE queue_number = "${order.queue_number}"`;

	// get all data from items ordered table
	connection.query(items_ordered_data, function(err, items_ordered_data_result) {
		if (err) throw err;

		// get all data from order queue table
		connection.query(order_queue_data, function(err, order_queue_data_result) {
			if (err) throw err;

			const orderQueueResult = order_queue_data_result;

			// This will be the delete function after order is done or cancelled
			const items_ordered_query = `DELETE FROM items_ordered WHERE queue_number = "${order.queue_number}"`;
			const ordered_num_query = `DELETE FROM order_queue WHERE queue_number = "${order.queue_number}"`;
			connection.query(items_ordered_query, error => {
				if (error) console.log(error);
				else {
					console.log("Item removed from items_ordered");

					connection.query(ordered_num_query, error => {
						if (error) console.log(error);
						else {
							console.log("Order removed from order_queue");
							dialog_open('done_order_success_dialog');
							document.getElementById("done_order_queue_num").innerHTML = order.queue_number;
							document.getElementById("done_order_items").innerHTML = "";
							order.items_ordered.forEach(item => {
								const item_markup = `<span>${item.quantity} ${item.item_name}</span><br>`;
								document.getElementById("done_order_items").insertAdjacentHTML("beforeend", item_markup)
							})
							document.getElementById("done_order_customer_name").textContent = order.customer_name;
							document.getElementById("done_order_total_cost").textContent = order.total_price;
						}
					});

					// Get specific data when clicked for order queue
					if (orderQueueResult.length > 0) {
						const orderRow = orderQueueResult[0];
						var status = "Served";

						// Insertion Query
						const insert_order_queue_query = `INSERT INTO order_queue_history (order_id, queue_number, transaction_date, customer_name, total_price, kiosk_ip_address, order_status) VALUES (?, ?, ?, ?, ?, ?, ?)`
						// function of insert data into order_queue_history
						connection.query(insert_order_queue_query, [orderRow.order_id, orderRow.queue_number, orderRow.transaction_date, orderRow.customer_name, orderRow.total_price, orderRow.kiosk_ip_address, status], (error, results) => {
							if (error) console.log(error);
							else console.log("Order added to order_queue_history");
						});

						// this will be the order_stats function
						//Gets the date today
						const currentDate = new Date();
						let current_year = currentDate.getFullYear();
						let current_month = String(currentDate.getMonth() + 1).padStart(2, '0');
						let current_day = String(currentDate.getDate()).padStart(2, '0');
						let current_formatted_date = `${current_year}-${current_month}-${current_day}`;
						const update_order_stats = `UPDATE order_stats
							SET total_orders_taken = total_orders_taken + '1',
								total_orders_done = total_orders_done + '1',
								total_earnings = total_earnings + "${orderRow.total_price}"
							WHERE transaction_date = "${current_formatted_date}"`;
						connection.query(update_order_stats, error => {
							if (error) console.log(error);
							else console.log("order_stats updated");
						})

						// Get Specific data when clicked for items ordered
						for (let itemRow of items_ordered_data_result) {
							//Insertion query
							const insert_items_ordered_query = `INSERT INTO items_ordered_history (items_ordered_id, order_id, item_id, item_name, item_price, quantity, quantity_times_price, queue_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
							// functio nto insert data into items_ordered_history
							connection.query(insert_items_ordered_query, [itemRow.items_ordered_id, itemRow.order_id, itemRow.item_id, itemRow.item_name, itemRow.item_price, itemRow.quantity, itemRow.quantity_times_price, itemRow.queue_number], (error, results) => {
								if (error) console.log(error);
								else console.log("Item added to items_ordered_history");
							})

						}

						const update_revenue_query = `UPDATE menu_items AS m
							JOIN items_ordered AS i_o ON m.item_id = i_o.item_id
							SET m.revenue_generated = m.revenue_generated + i_o.quantity_times_price,
								m.quantity_sold = m.quantity_sold + i_o.quantity
							WHERE i_o.order_id = "${orderRow.order_id}"`;
						connection.query(update_revenue_query, error => {
							if (error) console.log(error);
							else console.log("Item revenue updated");
						});
					}
				}
			});
		});
	});
}

function order_cancel() {
	console.log("called order_cancel()");

	// START SA ITEMS ORDERED BAGO ORDER QUEUE ang pag DELETE
	const order = document.getElementById("cancel_order_queue_num").innerHTML;
	// console.log("The order num is : " + order)

	// Queries for getting data from order queue and items ordered
	const items_ordered_data = `SELECT * FROM manage_db.items_ordered WHERE queue_number = "${order}"`;
	const order_queue_data = `SELECT * FROM manage_db.order_queue WHERE queue_number = "${order}"`;

	// get all data from items ordered table
	connection.query(items_ordered_data, function(err, items_ordered_data_result) {
		if (err) throw err;

		// get all data from order queue table
		connection.query(order_queue_data, function(err, order_queue_data_result) {
			if (err) throw err;

			// This will be the delete function after order is done or cancelled
			const items_ordered_query = `DELETE FROM items_ordered WHERE queue_number = "${order}"`;
			const ordered_num_query = `DELETE FROM order_queue WHERE queue_number = "${order}"`;

			connection.query(items_ordered_query, error => {
				if (error) {
					console.log(error);
				} else {
					console.log("Removed Success from items_ordered");

					connection.query(ordered_num_query, error => {
						if (error) {
							console.log(error);
						} else {
							console.log("Removed success from order_queue")
							dialog_close("cancel_order_dialog");
							refresh_menu_items();
							document.getElementById("cancel_order_num_placeholder").innerHTML = order;
						}
					});

					// const itemsOrderedResult = items_ordered_data_result;
					const orderQueueResult = order_queue_data_result;

					// Get specific data when clicked for order queue
					if (orderQueueResult.length > 0) {
						const orderRow = orderQueueResult[0];
						var status = "Cancelled";

						// Insertion Query
						const insert_order_queue_query = `INSERT INTO order_queue_history (order_id, queue_number, transaction_date, customer_name, total_price, kiosk_ip_address, order_status) VALUES (?, ?, ?, ?, ?, ?, ?)`
						// function of insert data into order_queue_history
						connection.query(insert_order_queue_query, [orderRow.order_id, orderRow.queue_number, orderRow.transaction_date, orderRow.customer_name, orderRow.total_price, orderRow.kiosk_ip_address, status], (error, results) => {
							if (error) {
								console.log(error);
							} else {
								console.log("Successfully Added! (Order Queue)");
							}
						});

						// this will be the order_stats function
						//Gets the date today
						const currentDate = new Date();
						let current_year = currentDate.getFullYear();
						let current_month = String(currentDate.getMonth() + 1).padStart(2, '0');
						let current_day = String(currentDate.getDate()).padStart(2, '0');
						let current_formatted_date = `${current_year}-${current_month}-${current_day}`;
						console.log("Current date is: " + current_formatted_date);

						// SQL query to get the dates in table
						const update_order_stats = `UPDATE order_stats
							SET total_orders_taken = total_orders_taken + '1',
								total_orders_canceled = total_orders_canceled + '1'
							WHERE transaction_date = "${current_formatted_date}";
							`;
						connection.query(update_order_stats, error => {
							if (error) {
								console.log(error);
							} else {
								console.log("Order Stat cancel success");
							}
						});
					}

					// console.log("Here are the orders per row:")
					for (let itemRow of items_ordered_data_result) {
						//Insertion query
						const insert_items_ordered_query = `INSERT INTO items_ordered_history (items_ordered_id, order_id, item_id, item_name, item_price, quantity, quantity_times_price, queue_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

						// function to insert data into items_ordered_history
						connection.query(insert_items_ordered_query, [itemRow.items_ordered_id, itemRow.order_id, itemRow.item_id, itemRow.item_name, itemRow.item_price, itemRow.quantity, itemRow.quantity_times_price, itemRow.queue_number], (error, results) => {
							if (error) {
								console.log(error)
							} else {
								console.log("Successfully Added! (Items Ordered)")
							}
						});
					}
				}
			});
		});
	});
}

function row_click(encoded_order) {
	console.log("called row_click()");
	const order = JSON.parse(decodeURIComponent(encoded_order));
	document.getElementById("cancel_order_queue_num").textContent = order.queue_number;

	document.getElementById("cancel_order_items").innerHTML = ""
	order.items_ordered.forEach(item => {
		const item_markup = `<span>${item.quantity} ${item.item_name}</span><br>`;
		document.getElementById("cancel_order_items").insertAdjacentHTML("beforeend", item_markup)
	})

	document.getElementById("cancel_order_customer_name").textContent = order.customer_name;
	document.getElementById("cancel_order_total_cost").textContent = order.total_price;
}

function daily_order_stats() {
	console.log("called daily_order_stats()");

	//Gets the date today
	const currentDate = new Date();
	let current_year = currentDate.getFullYear();
	let current_month = String(currentDate.getMonth() + 1).padStart(2, '0');
	let current_day = String(currentDate.getDate()).padStart(2, '0');
	let current_formatted_date = `${current_year}-${current_month}-${current_day}`;
	console.log("Current date is: " + current_formatted_date);

	// SQL query to get the dates in table
	const get_date_data = `SELECT transaction_date FROM order_stats WHERE transaction_date = "${current_formatted_date}"`;
	connection.query(get_date_data, function(err, order_stats_data_result) {
		if (err) throw err;

		const orderStatsResult = order_stats_data_result;
		// console.log(orderStatsResult);

		// IF current date didnt exist execute this:
		if (orderStatsResult.length === 0) {
			console.log("No date found");

			const insert_current_date = `INSERT INTO order_stats (transaction_Date, total_orders_taken, total_orders_done, total_orders_canceled, total_earnings) VALUES (?, ?, ?, ?, ?)`;
			connection.query(insert_current_date, [current_formatted_date, 0, 0, 0, 0], (err, insert_result) => {
				if (err) {
					console.log(err)
				} else {
					console.log("The Date has been successfully added!")
				}
			})
		}
		// IF current date exists, execute this instead:
		if (orderStatsResult.length > 0) {
			const orderStatsRow = orderStatsResult[0];
			let sqlDate = orderStatsRow.transaction_date;

			let year = sqlDate.getFullYear();
			let month = String(sqlDate.getMonth() + 1).padStart(2, '0');
			let day = String(sqlDate.getDate()).padStart(2, '0');

			let formattedDate = `${year}-${month}-${day}`;
			// console.log("Sql date is: " + formattedDate);
		}
	})
}

function refresh_menu_items() {
	// empty the registered_devices table body
	const table_body = document.getElementById("order-list");
	table_body.innerHTML = "";

	// repopulate the registered_devices table body
	display_orders();
}
