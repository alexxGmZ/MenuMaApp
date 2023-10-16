document.addEventListener("DOMContentLoaded", function() {
	display_orders();
});

// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js");
// create database connection
const connection = mysql.connection;
// check database connection
mysql.check_connection();

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
								<button onclick="order_done(); row_click();" class="font-bold rounded-full mt-2 py-2 px-2 bg-green-600 hover:text-zinc-50 hover:drop-shadow-lg w-11/12 flex items-center justify-center">
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

				// The Global variables
				

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
	console.log("Test results: ");



	// Queries for inserting order queue and items ordered
	const insert_queue_order_history = ``;

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
