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
			// console.log(data)
			data.forEach(orders => {

				const food_items = orders.items_ordered.map((item) => {
					return `${item.quantity} ${item.item_name}<br>`;
				})

				// console.log(food_items);

				const removed_comma = food_items.join('');
				//console.log(removed_comma);

				// const markup = `
				// 	<tr class="shadow-sm rounded-4 border spacer">
				// 		<td class="text-center py-5">${orders.queue_number}</td>
				// 		<td class="w-25 align-middle flex-nowrap">${removed_comma}</td>
				// 		<td class="text-center align-middle">${orders.customer_name}</td>
				// 		<td class="text-center align-middle">₱${orders.total_price}</td>
				// 		<td class="text-center align-middle">
				// 			<button onclick="dialog_open('cancel_order_dialog'); row_click();" class="mb-1 btn border btn-outline-danger border-1 shadow-sm w-50">
				// 				<img src="assets/svg/x-circle.svg">
				// 			</button>
				// 			<br>
				// 			<button onclick="order_done()" class="mt-1 btn border btn-outline-success border-1 shadow-sm w-50">
				// 				<img src="assets/svg/check-circle.svg">
				// 			</button>
				// 		</td>
				// 	</tr>
				// `;
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
								<button onclick="dialog_open('cancel_order_dialog'); row_click();" class="mb-1 btn border btn-outline-danger border-1 shadow-sm w-50">
									<img src="assets/svg/x-circle.svg">
								</button>
								<br>
								<button onclick="order_done('${encodeURIComponent(JSON.stringify(orders))}')" class="mt-1 btn border btn-outline-success border-1 shadow-sm w-50">
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
	console.log("called order_done(encoded_order)");

	const order = JSON.parse(decodeURIComponent(encoded_order));
	/*
	console.log(order.queue_number);
	
	const food_items = order.items_ordered.map((item) => {
		return `${item.quantity} ${item.item_name}<br>`;
	})

	const foods_ordered = food_items.join('');

	console.log(foods_ordered.replace(/<br\s*\/?>/gi, "\n"));
	console.log(order.customer_name)
	console.log(order.total_price)
	console.log(order.transaction_date)
	*/

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
			
			// Get specific data when clicked for order queue
			if (orderQueueResult.length > 0) {
				const orderRow = orderQueueResult[0];
				// const order_num = orderRow.queue_number;
				// const order_id = orderRow.order_id;
				// const customer_names = orderRow.customer_name;
				// const overall_price = orderRow.total_price;
				// const kiosks = orderRow.kiosk_ip_address;
				var status = "Served";

				// Insertion Query
				const insert_order_queue_query = `INSERT INTO order_queue_history (order_id, queue_number, transaction_date, customer_name, total_price, kiosk_ip_address, order_status) VALUES (?, ?, ?, ?, ?, ?, ?)`
				// function of insert data into order_queue_history
				connection.query(insert_order_queue_query, [orderRow.order_id, orderRow.queue_number, orderRow.transaction_date, orderRow.customer_name, orderRow.total_price, orderRow.kiosk_ip_address, status], (error, results) => {
					if (error) console.log(error);
					else console.log("Successfully Added! (Order Queue)")
				});

				// this will be the order_stats function
				//Gets the date today
				const currentDate = new Date();
				let current_year = currentDate.getFullYear();
				let current_month = String(currentDate.getMonth() + 1).padStart(2, '0');
				let current_day = String(currentDate.getDate()).padStart(2, '0');
				let current_formatted_date = `${current_year}-${current_month}-${current_day}`;
				// console.log("Current date is: " + current_formatted_date);
				// console.log(current_formatted_date)

				const order_taken_count = 1;
				const order_done_count = 1;

				const update_order_stats = `UPDATE order_stats
											SET total_orders_taken = total_orders_taken + '1',
												total_orders_done = total_orders_done + '1',
												total_earnings = total_earnings + "${orderRow.total_price}"
											WHERE transaction_date = "${current_formatted_date}"`;
				connection.query(update_order_stats, error => {
					if (error) console.log(error);
					else console.log("Order Stat done success");
				})

				// Get Specific data when clicked for items ordered
				console.log("Here are the orders per row:")
				for (let itemRow of items_ordered_data_result) {
					
					//Insertion query
					const insert_items_ordered_query = `INSERT INTO items_ordered_history (items_ordered_id, order_id, item_id, item_name, item_price, quantity, quantity_times_price, queue_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
					// functio nto insert data into items_ordered_history
					connection.query(insert_items_ordered_query, [itemRow.items_ordered_id, itemRow.order_id, itemRow.item_id, itemRow.item_name, itemRow.item_price, itemRow.quantity, itemRow.quantity_times_price, itemRow.queue_number], (error, results) => {
						if (error) console.log(error)
						else console.log("Successfully Added! (Items Ordered)")
					})
					
				}

				// Update revenue everytime if the order is served
				if (orderQueueResult.length > 0) {
					const orderRow = orderQueueResult[0];
					console.log("Item Order is: " + orderRow.order_id);

					const update_revenue_query = `UPDATE menu_items AS m
					JOIN items_ordered AS i_o ON m.item_id = i_o.item_id
					SET m.revenue_generated = m.revenue_generated + i_o.quantity_times_price,
						m.quantity_sold = m.quantity_sold + i_o.quantity
					WHERE i_o.order_id = "${orderRow.order_id}"`;
					connection.query(update_revenue_query, error => {
						if (error) console.log(error);
						else console.log("The revenue has been updated!");
					});
				}

				// This will be the delete function after order is done or cancelled
				const items_ordered_query = `DELETE FROM items_ordered WHERE queue_number = "${order.queue_number}"`;
				const ordered_num_query = `DELETE FROM order_queue WHERE queue_number = "${order.queue_number}"`;

				connection.query(items_ordered_query, error => {
					if (error) console.log(error);
					else {
						console.log("Removed Success from items_ordered");

						connection.query(ordered_num_query, error => {
							if (error) console.log(error);

							else {
								console.log("Removed success from order_queue")
								dialog_open('done_order_success_dialog');
								document.getElementById("done_order_num_placeholder").innerHTML = order.queue_number;
							}
						});
					}
				});

			}
		});
	});
}

// Get data from table
function row_click() {
	console.log("called row_click()");
	// find the clicked row
	var table = document.getElementById("order_table");
	var rows = table.getElementsByTagName("tr");

	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle = function(row) {
			return function() {
				var ordered_number = row.getElementsByTagName("td")[0];
				var order = ordered_number.innerHTML;

				var ordered_items = row.getElementsByTagName("td")[1];
				var items = ordered_items.innerHTML;
				items = items.replace(/<br\s*\/?>/gi, "\n");

				var ordered_cutomer_name = row.getElementsByTagName("td")[2];
				var customers = ordered_cutomer_name.innerHTML;

				var ordered_total_price = row.getElementsByTagName("td")[3];
				var total_price = ordered_total_price.innerHTML;

				// console.log("These are the orders: \n" + order + "\n" + " " + items + " " + customers + " " + total_price);

				//for cancel item
				document.getElementById("order_num_cancel").value = order;
				document.getElementById("order_foods_cancel").value = items;
				document.getElementById("order_customer_name_cancel").value = customers;
				document.getElementById("order_price_cancel").value = total_price;
			};
		};
		currentRow.onclick = clickHandle(currentRow);
	}
}

/* function order_done() {
	console.log("called order_done()");
	// find the clicked row
	var table = document.getElementById("order_table");
	var rows = table.getElementsByTagName("tr");

	// For all loop
	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle = function(row) {
			return function() {
				var ordered_number = row.getElementsByTagName("td")[0];
				var order = ordered_number.innerHTML;

				// console.log("Test results: \n" + order);

				// Queries for getting data from order queue and items ordered tables specific for orders / row click
				const items_ordered_data = `SELECT * FROM manage_db.items_ordered WHERE queue_number = "${order}"`;
				const order_queue_data = `SELECT * FROM manage_db.order_queue WHERE queue_number = "${order}"`;

				// get all data from items ordered table
				connection.query(items_ordered_data, function(err, items_ordered_data_result) {
					if (err) throw err;

					// get all data from order queue table
					connection.query(order_queue_data, function(err, order_queue_data_result) {
						if (err) throw err;

						// const itemsOrderedResult = items_ordered_data_result;
						const orderQueueResult = order_queue_data_result;

						// Get specific data when clicked for order queue
						if (orderQueueResult.length > 0) {
							const orderRow = orderQueueResult[0];
							const order_num = orderRow.queue_number;
							const order_id = orderRow.order_id;
							const customer_names = orderRow.customer_name;
							const overall_price = orderRow.total_price;
							// console.log("The overall price is: ", orderRow.total_price)
							// // Formatted Date
							// var formattedDate = new Date (orderRow.transaction_date).toLocaleString();
							// // Removed comma on the Formatted Date
							// formattedDate = formattedDate.replace(/,/g, '');
							const kiosks = orderRow.kiosk_ip_address;
							var status = "Served";

							// console.log("Here are the order queue: \n" + order_num + "\n" + order_id + "\n" + customer_names + "\n" + overall_price + "\n" + formattedDate + "\n" + kiosks + "\n" + status);

							// Insertion Query
							const insert_order_queue_query = `INSERT INTO order_queue_history (order_id, queue_number, transaction_date, customer_name, total_price, kiosk_ip_address, order_status) VALUES (?, ?, ?, ?, ?, ?, ?)`
							// function of insert data into order_queue_history
							connection.query(insert_order_queue_query, [order_id, order_num, orderRow.transaction_date, customer_names, overall_price, kiosks, status], (error, results) => {
								if (error) console.log(error);
								else console.log("Successfully Added! (Order Queue)")
							});

							// this will be the order_stats function
							//Gets the date today
							const currentDate = new Date();
							let current_year = currentDate.getFullYear();
							let current_month = String(currentDate.getMonth() + 1).padStart(2, '0');
							let current_day = String(currentDate.getDate()).padStart(2, '0');
							let current_formatted_date = `${current_year}-${current_month}-${current_day}`;
							console.log("Current date is: " + current_formatted_date);
							console.log(current_formatted_date)

							const order_taken_count = 1;
							const order_done_count = 1;

							const update_order_stats = `UPDATE order_stats
											SET total_orders_taken = total_orders_taken + '1',
												total_orders_done = total_orders_done + '1',
												total_earnings = total_earnings + "${orderRow.total_price}"
											WHERE transaction_date = "${current_formatted_date}"`;
							connection.query(update_order_stats, error => {
								if (error) console.log(error);
								else console.log("Order Stat done success");
							})

						}

						// Get Specific data when clicked for items ordered
						console.log("Here are the orders per row:")
						for (let itemRow of items_ordered_data_result) {
							// console.log("Items ordered id: " + itemRow.items_ordered_id);
							// console.log("Item id: " + itemRow.item_id);
							// console.log("Item Name: " + itemRow.item_name);
							// console.log("Item Price: " + itemRow.item_price);
							// console.log("Item Quantity: " + itemRow.quantity);
							// console.log("Total price per quantity: " + itemRow.quantity_times_price);
							// console.log("Queue Number: " + itemRow.queue_number);
							// console.log("Order ID: " + itemRow.order_id);

							//Insertion query
							const insert_items_ordered_query = `INSERT INTO items_ordered_history (items_ordered_id, order_id, item_id, item_name, item_price, quantity, quantity_times_price, queue_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
							// functio nto insert data into items_ordered_history
							connection.query(insert_items_ordered_query, [itemRow.items_ordered_id, itemRow.order_id, itemRow.item_id, itemRow.item_name, itemRow.item_price, itemRow.quantity, itemRow.quantity_times_price, itemRow.queue_number], (error, results) => {
								if (error) console.log(error)
								else console.log("Successfully Added! (Items Ordered)")
							})
						}

						// Update revenue everytime if the order is served
						if (orderQueueResult.length > 0) {
							const orderRow = orderQueueResult[0];
							console.log("Item Order is: " + orderRow.order_id);

							const update_revenue_query = `UPDATE menu_items AS m
							JOIN items_ordered AS i_o ON m.item_id = i_o.item_id
							SET m.revenue_generated = m.revenue_generated + i_o.quantity_times_price,
								m.quantity_sold = m.quantity_sold + i_o.quantity
							WHERE i_o.order_id = "${orderRow.order_id}"`;
							connection.query(update_revenue_query, error => {
								if (error) console.log(error);
								else console.log("The revenue has been updated!");
							});
						}

						document.getElementById("order_num_cancel").value = order;
						// This will be the delete function after order is done or cancelled
						const items_ordered_query = `DELETE FROM items_ordered WHERE queue_number = "${order}"`;
						const ordered_num_query = `DELETE FROM order_queue WHERE queue_number = "${order}"`;

						connection.query(items_ordered_query, error => {
							if (error) console.log(error);
							else {
								console.log("Removed Success from items_ordered");

								connection.query(ordered_num_query, error => {
									if (error) console.log(error);

									else {
										console.log("Removed success from order_queue")
										dialog_open('done_order_success_dialog');
										document.getElementById("done_order_num_placeholder").innerHTML = document.getElementById("order_num_cancel").value;
									}
								});
							}
						});
					})
				})
			};
		};
		currentRow.onclick = clickHandle(currentRow);
	}
} */

function order_cancel() {
	console.log("called order_cancel()");
	// START SA ITEMS ORDERED BAGO ORDER QUEUE ang pag DELETE

	var order = document.getElementById("order_num_cancel").value;
	console.log("The order num is : " + order)

	// Queries for getting data from order queue and items ordered
	const items_ordered_data = `SELECT * FROM manage_db.items_ordered WHERE queue_number = "${order}"`;
	const order_queue_data = `SELECT * FROM manage_db.order_queue WHERE queue_number = "${order}"`;

	// get all data from items ordered table
	connection.query(items_ordered_data, function(err, items_ordered_data_result) {
		if (err) throw err;

		// get all data from order queue table
		connection.query(order_queue_data, function(err, order_queue_data_result) {
			if (err) throw err;

			// const itemsOrderedResult = items_ordered_data_result;
			const orderQueueResult = order_queue_data_result;

			// Get specific data when clicked for order queue
			if (orderQueueResult.length > 0) {
				const orderRow = orderQueueResult[0];
				const order_num = orderRow.queue_number;
				const order_id = orderRow.order_id;
				const customer_names = orderRow.customer_name;
				const overall_price = orderRow.total_price;
				// // Formatted Date
				// var formattedDate = new Date (orderRow.transaction_date).toLocaleString();
				// // Removed comma on the Formatted Date
				// formattedDate = formattedDate.replace(/,/g, '');
				const kiosks = orderRow.kiosk_ip_address;
				var status = "Cancelled";

				console.log("Here are the order queue: \n" + order_num + "\n" + order_id + "\n" + customer_names + "\n" + overall_price + "\n" + orderRow.transaction_date + "\n" + kiosks + "\n" + status);

				// Insertion Query
				const insert_order_queue_query = `INSERT INTO order_queue_history (order_id, queue_number, transaction_date, customer_name, total_price, kiosk_ip_address, order_status) VALUES (?, ?, ?, ?, ?, ?, ?)`
				// function of insert data into order_queue_history
				connection.query(insert_order_queue_query, [order_id, order_num, orderRow.transaction_date, customer_names, overall_price, kiosks, status], (error, results) => {
					if (error) {
						console.log(error);
					} else {
						console.log("Successfully Added! (Order Queue)")
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

				const order_taken_count = 1;
				const order_cancelled_count = 1;

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

			console.log("Here are the orders per row:")
			for (let itemRow of items_ordered_data_result) {
				// console.log("Items ordered id: " + itemRow.items_ordered_id);
				// console.log("Item id: " + itemRow.item_id);
				// console.log("Item Name: " + itemRow.item_name);
				// console.log("Item Price: " + itemRow.item_price);
				// console.log("Item Quantity: " + itemRow.quantity);
				// console.log("Total price per quantity: " + itemRow.quantity_times_price);
				// console.log("Queue Number: " + itemRow.queue_number);
				// console.log("Order ID: " + itemRow.order_id);

				//Insertion query
				const insert_items_ordered_query = `INSERT INTO items_ordered_history (items_ordered_id, order_id, item_id, item_name, item_price, quantity, quantity_times_price, queue_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
				// functio nto insert data into items_ordered_history
				connection.query(insert_items_ordered_query, [itemRow.items_ordered_id, itemRow.order_id, itemRow.item_id, itemRow.item_name, itemRow.item_price, itemRow.quantity, itemRow.quantity_times_price, itemRow.queue_number], (error, results) => {
					if (error) {
						console.log(error)
					} else {
						console.log("Successfully Added! (Items Ordered)")
					}
				})
			}

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
							dialog_open('cancel_order_success_dialog');
							document.getElementById("cancel_order_num_placeholder").innerHTML = document.getElementById("order_num_cancel").value;
						}
					});
				}
			});
		})
	})
}

/* function login_dialog_open(redirect_site) {
	console.log(`called login_dialog_open(${redirect_site})`)

	const fav_dialog = document.getElementById("login_dialog");
	fav_dialog.classList.add("active-dialog");
	fav_dialog.classList.remove("hidden");

	document.getElementById("login_redirect_site").textContent = redirect_site;

	if (redirect_site === "inventory.html")
		document.getElementById("login_dialog_header").innerHTML = "Manage Menu Inventory";
	if (redirect_site === "registration.html")
		document.getElementById("login_dialog_header").innerHTML = "Manage Users/Employee";
	if (redirect_site === "kiosk-devices.html")
		document.getElementById("login_dialog_header").innerHTML = "Manage Kiosk Devices";
	if (redirect_site === "order-history.html")
		document.getElementById("login_dialog_header").innerHTML = "Order History and Statistics";
	if (redirect_site === "designer.html")
		document.getElementById("login_dialog_header").innerHTML = "Menu/Kiosk Designer";

	fav_dialog.showModal();
}

function login() {
	console.log("called login()");
	const redirect_site = document.getElementById("login_redirect_site").textContent;

	const login_username = document.getElementById("login_username").value.trim();
	const login_password = document.getElementById("login_password").value;
	const login_password_hash = crypto.createHash('sha256').update(login_password).digest('hex');

	const feature_privilege_map = {
		"inventory.html": "inventory_priv",
		"registration.html": "manage_employee_priv",
		"kiosk-devices.html": "manage_devices_priv",
		"order-history.html": "view_reports_priv",
		"designer.html": "design_priv",
	}
	let feature_privilege = feature_privilege_map[redirect_site];

	const query = `SELECT name, password_hash, ${feature_privilege} FROM registered_employees WHERE name = "${login_username}"`;
	connection.query(query, (error, result) => {
		if (error) throw error;

		const user_data = result;

		// Error function if the username didn't exists
		if (user_data.length === 0) {
			dialog_open('login_invalid_username_dialog');
		}

		if (user_data.length > 0) {
			const user_row = user_data[0];
			const password = user_row.password_hash;
			const converted_hash_password = Buffer.from(password).toString('utf8');
			const feature_priv_status = user_row[feature_privilege];

			if (converted_hash_password === login_password_hash) {
				if (feature_priv_status === 1) {
					location.replace(redirect_site);
				}
				else {
					dialog_open('lack_access_privilege_dialog');
					// clear password input box
					document.getElementById("login_password").value = ""
				}
			}
			else {
				dialog_open('login_invalid_password_dialog');
				// clear password input box
				document.getElementById("login_password").value = ""
			}
		}
	});
} */

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
