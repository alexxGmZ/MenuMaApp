document.addEventListener("DOMContentLoaded", function() {
	// put something if needed
	display_order_stats();

	//chart purposes
	//load_chart();

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

// SHOW ORDER STATS
function display_order_stats() {
	console.log("called display_order_stats()");

	connection.query("SELECT * FROM order_stats", function(err, order_stats_result, fields) {
		if (err) throw err;
		console.log(order_stats_result);

		let placeholder = document.querySelector("#order_stats_list");
		let out = "";

		// For design purposes
		let rowNum = 1;

		for (let row of order_stats_result) {
			let sqlDate = row.transaction_date;
			let year = sqlDate.getFullYear();
			let month = String(sqlDate.getMonth() + 1).padStart(2, '0');
			let day = String(sqlDate.getDate()).padStart(2, '0');

			let formattedDate = `${year}-${month}-${day}`;

			// For design purposes
			let row_background_change = rowNum % 2 === 0 ? 'bg-zinc-50' : 'bg-white';

			out += `
				<tr class="${row_background_change} border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
					<td>${formattedDate}</td>
					<td class="font-bold text-center">${row.total_orders_taken}</td>
					<td class="font-bold text-center">${row.total_orders_done}</td>
					<td class="font-bold text-center">${row.total_orders_canceled}</td>
					<td class="font-bold text-center">₱${row.total_earnings}</td>
					<td class="py-2">
						<span class="action-btn">
							<center>
								<button onclick="dialog_open('order_stats_dialog'); row_click()" class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-300 text-zinc-50 hover:drop-shadow-lg">
								<img src="assets/svg/trash.svg" class="hover:text-zinc-50">
								</button>
							</center>
						</span>
					</td>
				</tr>
			`;
			// Design purposes
			rowNum++;
		}
		placeholder.innerHTML = out;
		all_earnings();
	});

}

//function to remove a data from sql
function remove_stats() {
	console.log("called remove_stats()");

	var transaction_date_value = document.getElementById('transaction_date_placeholder').value;
	console.log(transaction_date_value);

	//queries for deleting the order stats
	const orders_stats_query = `DELETE FROM order_stats WHERE transaction_date = "${transaction_date_value}"`;
	connection.query(orders_stats_query, error => {
		if (error) {
			console.log(error);
		} else {
			console.log("Removed Success from order_queue_history");
			dialog_open('order_stats_dialog_remove');
			document.getElementById("transaction_date_remove_placeholder").innerHTML = document.getElementById('transaction_date_placeholder').value;
		}
	})
}

// function to get all earnings
function all_earnings() {
	console.log("called all_earning()")
	var table = document.getElementById("order_stats_table");

	let total = 0;
	for (var i = 1, row; row = table.rows[i]; i++) {
		var earnings = row.cells[4];
		var earnings_data = earnings.innerHTML;
		var remove_currency = Number(earnings_data.replace(/[^0-9\.-]+/g, ""));

		total = total + remove_currency;
	}
	document.getElementById("total_earning_placeholder").value = "₱" + total;

}

// Row click function
function row_click() {
	console.log("called row_click()");
	var table = document.getElementById("order_stats_table");
	var rows = table.getElementsByTagName("tr");

	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle = function(row) {
			return function() {
				var transaction_date = row.getElementsByTagName("td")[0];
				var transaction = transaction_date.innerHTML;

				var total_orders_taken = row.getElementsByTagName("td")[1];
				var orders_taken = total_orders_taken.innerHTML;

				var total_orders_done = row.getElementsByTagName("td")[2];
				var orders_done = total_orders_done.innerHTML;

				var total_orders_canceled = row.getElementsByTagName("td")[3];
				var orders_canceled = total_orders_canceled.innerHTML;

				var total_earnings = row.getElementsByTagName("td")[4];
				var earnings = total_earnings.innerHTML;

				// console.log(transaction + " " + orders_taken + " " + orders_done + " " + orders_canceled + " " + earnings);

				document.getElementById('transaction_date_placeholder').value = transaction;
				document.getElementById('total_orders_taken_placeholder').value = orders_taken;
				document.getElementById('total_orders_done_placeholder').value = orders_done;
				document.getElementById('total_orders_canceled_placeholder').value = orders_canceled;
				document.getElementById('earnings_placeholder').value = earnings;

			};
		};
		currentRow.onclick = clickHandle(currentRow);
	}

}

// chart to load total_order_taken
function load_chart() {
console.log("called load_chart()")
// chart purposes
// var chart = c3.generate({
//     bindto: '#chart',
//     data: {
//       columns: [
//         ['Everyday_Earning', 52.75, 90, 175, 25.65, 46.10, 10]
//       ],
// 	  types: {
// 		Everyday_Earning: 'area-spline'
// 	  }
//     },
// 	axis: {
// 		y: {
// 			label: {
// 				text: 'Total Earnings',
// 				position: 'outer-middle'
// 			},
// 			tick: {
// 				format: function (d) {
// 					return '₱' + d3.format(',')(d);
// 				}
// 			}
// 		},
// 		x: {
// 			type: 'category',
// 			categories: ['2023-10-31', '2023-11-02', '2023-11-03', '2023-11-03', '2023-11-03', '2023-11-03',],
// 			label: {
// 				position: 'outer-center'
// 			}
// 		}
// 	}
// });

connection.query("SELECT * FROM order_stats", function(err, order_stats_result, fields) {
	if (err) throw err;
	console.log(order_stats_result)

	const columns = [['x'], ['Total Order Taken'], ['Total Order Done'], ['Total Order Canceled']];
	order_stats_result.forEach(row => {
		// Format the date
		let sqlDate = row.transaction_date;
		let year = sqlDate.getFullYear();
		let month = String(sqlDate.getMonth() + 1).padStart(2, '0');
		let day = String(sqlDate.getDate()).padStart(2, '0');
		let formattedDate = `${year}-${month}-${day}`;

		// The chart data based on Mysql query
		columns[0].push(formattedDate);			// x-axis name (the bottom text)
		columns[1].push(row.total_orders_taken);	// data name (the blue dots data)
		columns[2].push(row.total_orders_done);
		columns[3].push(row.total_orders_canceled)
	});

	const chart = c3.generate({
		bindto: '#chart2', // <div id="chart2"></div>
		size: {
			height: 520
		},
		data: {
			x: 'x',
			columns: columns,
			types: {
				'Total Order Taken': 'spline',
				'Total Order Done': 'spline',
				'Total Order Canceled': 'spline'
			}
		},
		axis: {
			x: {
				type:'category'
			},
			y: {
				label: {
					text: 'Total Orders',
					position: 'outer-middle'
				}
			}
		}
	});

})

	//variables for hiding tables and chart
	let element = document.getElementById("order_stats_table");
	let element2 = document.getElementById("chart2");
	let hidden = element.getAttribute("hidden");

	// hides & show the table
	if (hidden) {
		element.removeAttribute("hidden");
		element2.setAttribute("hidden", "hidden");
		document.getElementById("load_chart_btn").innerHTML = "SHOW GRAPH";
	} else {
		element.setAttribute("hidden", "hidden");
		element2.removeAttribute("hidden");
		document.getElementById("load_chart_btn").innerHTML = "SHOW TABLE";
	}

	// NOTE: THE CHART IS DIV which <div id="chart#"></div>
	// do note remove the div or elese chart will not load

}