document.addEventListener("DOMContentLoaded", function() {
	display_orders();
});

// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js");
// create database connection
const connection = mysql.connection;
// check database connection
mysql.check_connection();

// Global Data
var global_order_num = "";

function display_orders() {
	fetch('http://localhost:8080/orders')
		.then(res => {
			return res.json();
		})
		.then(data => {
			console.log(data)
			data.forEach(orders => {

				const food_items = orders.items_ordered.map((item) => {
					return `${item.quantity} ${item.item_name}\n`;
				})

				console.log(food_items);

				const removed_comma = food_items.join('');
				//console.log(removed_comma);

				const markup = `
					<tr class="bg-sky-300 rounded-lg border-b dark:border-gray-700 py-3">
						<td class="text-center px-7 font-bold">${orders.queue_number}</td>
						<td class="text-center bg-slate-50 rounded-lg px-3 whitespace-pre w-32">${removed_comma}</td>
						<td class="text-center px-2">${orders.customer_name}</td>
						<td class="text-center">₱${orders.total_price}</td>
						<td class="px-3">
							<center>
								<button onclick="order_done()" class="font-bold rounded-full mt-2 py-2 px-2 bg-green-600 hover:text-zinc-50 hover:drop-shadow-lg w-11/12 flex items-center justify-center">
									<img src="assets/svg/check-circle.svg" class="hover:text-zinc-50">
									<span class="mx-2"> DONE </span>
								</button>
							</center>
							<center>
								<button onclick="dialog_open('cancel_order_dialog'); row_click();" class="font-bold rounded-full mt-2 py-2 px-2 bg-red-500 hover:text-zinc-50 hover:drop-shadow-lg w-11/12 flex items-center justify-center">
									<img src="assets/svg/x-circle.svg" class="hover:text-zinc-50">
									<span class="mx-2"> CANCEL </span>
								</button>
							</center>
						</td>
					</tr>
				`;
				document.querySelector("#order-list").insertAdjacentHTML('beforeend', markup);
			})
		})
		.catch(error => console.log(error));
}

// Get data from table
function row_click() {
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

				var ordered_cutomer_name = row.getElementsByTagName("td")[2];
				var customers = ordered_cutomer_name.innerHTML;

				var ordered_total_price = row.getElementsByTagName("td")[3];
				var total_price = ordered_total_price.innerHTML;

				console.log("These are the orders: \n" + order + "\n" + " " + items + " " + customers + " " + total_price);

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

// Open Dialog
function dialog_open(element_id) {
	const fav_dialog = document.getElementById(element_id);

	// any element id specific statements
	if(element_id == "cancel_order_success_dialog") {
		document.getElementById("cancel_order_num_placeholder").innerHTML = document.getElementById("order_num_cancel").value;
	}

	fav_dialog.showModal();
}

// Close Dialog
function dialog_close(element_id) {
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.close();
}

function order_done() {
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
								if (error) {
									console.log(error);
								} else {
									console.log("Successfully Added! (Order Queue)")
								}
							});
						}

						// Get Specific data when clicked for items ordered
						console.log("Here are the orders per row:")
						for (itemRow of items_ordered_data_result) {
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

						document.getElementById("order_num_cancel").value = order;
						// This will be the delete function after order is done or cancelled
						const items_ordered_query = `DELETE FROM items_ordered WHERE queue_number = "${order}"`;
						const ordered_num_query = `DELETE FROM order_queue WHERE queue_number = "${order}"`;

						connection.query(items_ordered_query, error => {
							if (error) {
								console.log(error);
							} else {
								console.log("Removed Success from items_ordered");
					
								connection.query(ordered_num_query, error => {
									if(error) {
										console.log(error);
									} else {
										console.log("Removed success from order_queue")
										dialog_open('cancel_order_success_dialog');
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
}

function order_cancel() {
// START SA ITEMS ORDERED BAGO ORDER QUEUE ang pag DELETE

	var queue_num = document.getElementById("order_num_cancel").value;
	console.log("Order Number:" + queue_num);

	const items_ordered_query = `DELETE FROM items_ordered WHERE queue_number = "${queue_num}"`;
	const ordered_num_query = `DELETE FROM order_queue WHERE queue_number = "${queue_num}"`;

	connection.query(items_ordered_query, error => {
		if (error) {
			console.log(error);
		} else {
			console.log("Removed Success from items_ordered");

			connection.query(ordered_num_query, error => {
				if(error) {
					console.log(error);
				} else {
					console.log("Removed success from order_queue")
					dialog_open('cancel_order_success_dialog');
				}
			});
		}
	});

}
