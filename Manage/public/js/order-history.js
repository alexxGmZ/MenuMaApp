document.addEventListener("DOMContentLoaded", function() {
	// put something if needed
	display_order_history();
});

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

// SHOW ITEMS ORDERED HISTORY
function display_order_history() {
	console.log("called display_order_history()");
	connection.connect(function(err) {
		if (err) throw err;

		//const queries
		const items_ordered_history_query = `SELECT * FROM manage_db.items_ordered_history`;
		const ordered_queue_history_query = `SELECT * FROM manage_db.order_queue_history ORDER BY transaction_date DESC`;

		//get all history from table "items_ordered_history"
		connection.query(items_ordered_history_query, function(err, items_history_result) {
			if (err) throw err;

			// get all history from table "ordered_queue_history"
			connection.query(ordered_queue_history_query, function(err, orders_history_result) {
				if (err) throw err;

				// Combined Result
				const combined = {
					items_history: items_history_result,
					order_history: orders_history_result
				};

				console.log(combined);

				//Organized Data
				const nestedData = orders_history_result.map(order => {
					const matchedItems = items_history_result.filter(item => item.order_id === order.order_id)

					return {
						...order,
						items_ordered: matchedItems
					};
				});

				console.log(nestedData);

				// For each loop
				nestedData.forEach((order_history, index) => {

					const food_items = order_history.items_ordered.map((item) => {
						return `${item.quantity} ${item.item_name}\n`;
					})
					const removed_comma = food_items.join('');

					// console.log("Order Number: " + order_history.queue_number);
					// console.log("Items Ordered: " + removed_comma);
					// console.log("Customer Name: " + order_history.customer_name);
					// console.log("Total Price: ₱" + order_history.total_price);
					// console.log("Transaction Date: " + order_history.transaction_date);
					// console.log("Status: " + order_history.order_status);

					var formattedDate = new Date(order_history.transaction_date).toLocaleString();

					// Design purposes for served or cancelled
					let statusClass = '';
					if (order_history.order_status === 'Served') {
						statusClass = 'text-green-700 bg-green-200';
					} else if (order_history.order_status === 'Cancelled') {
						statusClass = 'text-red-700 bg-red-200';
					}

					//Design purposes for changing color background per row
					const rowColors = index % 2 === 0 ? 'bg-white' : 'bg-zinc-50';

					const markup = `
						<tr class="bg-white border-b dark:border-gray-700 border-r border-l ${rowColors}">
							<td class="px-2">${order_history.order_id}</td>
							<td class="px-2">Order #${order_history.queue_number}</td>
							<td class="">${order_history.customer_name}</td>
							<td class="whitespace-pre py-3">${removed_comma}</td>
							<td class="">₱${order_history.total_price}</td>
							<td class="">${formattedDate}</td>
							<td class="text-center"><p class="rounded-full font-bold py-2 mx-4 ${statusClass}">${order_history.order_status}</p></td>
							<td>
								<span class="action-btn">
									<center><button onclick="dialog_open('remove_item_dialog'); row_click()" class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-300 text-zinc-50 hover:drop-shadow-lg">
										<img src="assets/svg/trash.svg" class="hover:text-zinc-50">
									</button></center>
								</span>
							</td>
						</tr>
					`;
					document.querySelector("#order_history_list").insertAdjacentHTML('beforeend', markup);

				})


				// for(let row of orders_history_result) {

				// 	console.log("Order Number: " + row.queue_number);
				// 	// console.log("Items Ordered: " + nestedData);
				// 	console.log("Customer Name: " + row.customer_name);
				// }

			})

		});

	})
}

function row_click() {
	console.log("called row_click()");
	// Find the clicked Row
	var table = document.getElementById("order_history_table");
	var rows = table.getElementsByTagName("tr");

	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle = function(row) {
			return function() {
				var history_id = row.getElementsByTagName("td")[0];
				var history_num_id = history_id.innerHTML;

				var queue_num = row.getElementsByTagName("td")[1];
				var queue_order_num = queue_num.innerHTML;

				var customer_name = row.getElementsByTagName("td")[2];
				var customers = customer_name.innerHTML;

				var items_ordered = row.getElementsByTagName("td")[3];
				var items = items_ordered.innerHTML;

				var total_price = row.getElementsByTagName("td")[4];
				var prices = total_price.innerHTML;

				var transaction_Date = row.getElementsByTagName("td")[5];
				var t_date = transaction_Date.innerHTML;

				var history_status = row.getElementsByTagName("td")[6];
				var status = history_status.innerHTML;

				//console.log("Here the history clicked:")
				//console.log(history_num_id + "\n" + queue_order_num + "\n" + customers + "\n" + items + "\n" + prices + "\n" + t_date + "\n" + status)

				document.getElementById('history_id').value = history_num_id;
				document.getElementById('history_queue_number').value = queue_order_num;
				document.getElementById('history_customer').value = customers;
				document.getElementById('history_items').value = items;
				document.getElementById('history_price').value = prices;
				document.getElementById('history_date').value = t_date;
				document.getElementById('history_status').innerHTML = status;
			};
		};
		currentRow.onclick = clickHandle(currentRow);
	}
}

function remove_history() {
	console.log("called remove_history()");

	var history_id = document.getElementById('history_id').value;
	console.log(history_id);

	// queries fro deleting history
	const items_ordered_query = `DELETE FROM items_ordered_history WHERE order_id = "${history_id}"`;
	const ordered_num_query = `DELETE FROM order_queue_history WHERE order_id = "${history_id}"`;

	connection.query(ordered_num_query, error => {
		if (error) {
			console.log(error);
		} else {
			console.log("Removed Success from order_queue_history");

			connection.query(items_ordered_query, error => {
				if (error) {
					console.log(error);
				} else {
					console.log("Removed Success from items_ordered-history");
					dialog_open('history_remove_success_dialog');
					document.getElementById("history_id_remove_placeholder").innerHTML = document.getElementById('history_id').value;
				}
			})
		}
	})
}

