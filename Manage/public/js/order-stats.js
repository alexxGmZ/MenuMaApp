document.addEventListener("DOMContentLoaded", function() {
	// put something if needed
	display_order_stats();
	hide_lines();
	//chart purposes
	//total_order_chart();

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

// chart variables
var chart2; //for total_order_chart(), total_order_daily_selected_date(), total_order_monthly_selected_date
			//and total_order_yearly_selected_date

var chart3; //for total_earnings_chart(), total_earning_daily_selected_date()

// chart to load total_order_taken
function total_order_chart() {
	console.log("called total_order_chart()")

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
			columns[2].push(row.total_orders_done);		// data name (the orange dots data)
			columns[3].push(row.total_orders_canceled)	// data name (the green dots data)
		});

		// Used chart2 to load the updated data based on date pick of the exisitng chart instead load a new chart
		chart2 = c3.generate({
			bindto: '#chart2', // <div id="chart2"></div>
			title: {
				text: 'TOTAL ORDERS TAKEN, SERVED & CANCELED'
			},
			padding: {
				top: 40
			},
			subchart: {
				show: true
			},
			legend: {
				position: 'inset',
				inset: {
					anchor: 'top-right',
					x: 15,
					y: -55,
					step: 3,
				}
			},
			zoom: {
				enabled: true
			},
			size: {
				height: 550
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
					type: 'category',
					tick: {
						rotate: 75,
						culling: true,
						multiline: false
					}
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

}

// chart to load total orders taken based on date selected (daily)
function total_order_daily_selected_date() {
	console.log("called total_order_chart_base_on_date_picker()")

	var date_input_start = document.getElementById("start_date");
	var date_start_value = date_input_start.value;

	var date_input_end = document.getElementById("end_date");
	var date_end_value = date_input_end.value;

	// console.log("The Date is: ", date_start_value, " and the end is: ", date_end_value);

	if (date_start_value === "") {
		console.log("Date is Empty!")
		dialog_open('date_selected_error_dialog_start');
		return;
	}

	if (date_end_value === "") {
		console.log("Date is Empty!")
		dialog_open('date_selected_error_dialog_end');
		return;
	}

	connection.query(`
		SELECT
			DATE_FORMAT(transaction_date, '%M %e, %Y') AS formatted_date,
			order_stats.total_orders_taken,
			order_stats.total_orders_done,
			order_stats.total_orders_canceled
		FROM
			order_stats
		WHERE
			transaction_date BETWEEN "${date_start_value}" AND "${date_end_value}";
	`, function(err, date_result, fields) {
		if (err) throw err;
		console.log("Date result is: ", date_result)

		const columns = [['x'], ['Total Order Taken'], ['Total Order Done'], ['Total Order Canceled']];
		date_result.forEach(row => {
			columns[0].push(row.formatted_date);
			columns[1].push(row.total_orders_taken);	
			columns[2].push(row.total_orders_done);		
			columns[3].push(row.total_orders_canceled);

		});

		// load the updated chart (total_order_chart())
		chart2.load({
			columns: columns,
			axis: {
				x: {
					culling: false
				}
			}
		})

	})

}

// chart to load total orders taken based on date selected (monthly)
function total_order_monthly_selected_date() {
	console.log("called total_order_monthly_selected_date()")

	var date_input_start = document.getElementById("start_date");
	var date_start_value = date_input_start.value;

	var date_input_end = document.getElementById("end_date");
	var date_end_value = date_input_end.value;

	// var start_month_value = date_start_value.substring(0, 7);
	// var end_month_value = date_end_value.substring(0, 7);

	// console.log("The Date is: ", date_start_value, " and the end is: ", date_end_value);

	if (date_start_value === "") {
		console.log("Date is Empty!")
		dialog_open('date_selected_error_dialog_start');
		return;
	}

	if (date_end_value === "") {
		console.log("Date is Empty!")
		dialog_open('date_selected_error_dialog_end');
		return;
	}

	connection.query(`
	SELECT
		CONCAT(MONTHNAME(transaction_date), ' ', YEAR(transaction_date)) AS month,
		SUM(total_orders_taken) AS total_taken,
		SUM(total_orders_done) AS total_done,
		SUM(total_orders_canceled) AS total_canceled
	FROM
		order_stats
	WHERE
		transaction_date BETWEEN "${date_start_value}" AND "${date_end_value}"
	GROUP BY
		MONTH(transaction_date), YEAR(transaction_date);
	`, function(err, month_result, fields) {
		if (err) throw err;
		console.log("Date result is: ", month_result)

		const columns = [['x'], ['Total Order Taken'], ['Total Order Done'], ['Total Order Canceled']];
		month_result.forEach(row => {
			columns[0].push(row.month);
			columns[1].push(row.total_taken);	
			columns[2].push(row.total_done);		
			columns[3].push(row.total_canceled);
		})

		// load the updated chart (total_order_chart())
		chart2.load({
			columns: columns,
			axis: {
				x: {
					culling: false
				}
			}
		})
	})
}

// chart to load total orders taken based on date selected (yearly)
function total_order_yearly_selected_date() {
	console.log("called total_order_yearly_selected_date()")

	var date_input_start = document.getElementById("start_date");
	var date_start_value = date_input_start.value;

	var date_input_end = document.getElementById("end_date");
	var date_end_value = date_input_end.value;

	var start_year_value = date_start_value.substring(0, 4);
	var end_year_value = date_end_value.substring(0, 4);

	// console.log("The Date is: ", start_year_value, " and the end is: ", end_year_value);

	if (date_start_value === "") {
		console.log("Date is Empty!")
		dialog_open('date_selected_error_dialog_start');
		return;
	}

	if (date_end_value === "") {
		console.log("Date is Empty!")
		dialog_open('date_selected_error_dialog_end');
		return;
	}

	connection.query(`
	SELECT
		YEAR(transaction_date) AS year,
		SUM(total_orders_taken) AS total_taken,
		SUM(total_orders_done) AS total_done,
		SUM(total_orders_canceled) AS total_canceled
	FROM
		order_stats
	WHERE
		YEAR(transaction_date) BETWEEN "${start_year_value}" AND "${end_year_value}"
	GROUP BY
		YEAR(transaction_date);
	`, function(err, year_result, fields) {
		if (err) throw err;
		console.log("Yearly is: ", year_result)

		const columns = [['x'], ['Total Order Taken'], ['Total Order Done'], ['Total Order Canceled']];
		year_result.forEach(row => {
			columns[0].push(row.year);
			columns[1].push(row.total_taken);	
			columns[2].push(row.total_done);		
			columns[3].push(row.total_canceled);
		})

		// load the updated chart (total_order_chart())
		chart2.load({
			columns: columns,
			axis: {
				x: {
					culling: false
				}
			}
		})

	})

}

// total earning chart everyday
function total_earnings_chart() {
	console.log("called total_earnings_chart()")

	connection.query("SELECT * FROM order_stats", function(err, order_stats_result, fields) {
		if (err) throw err;
		console.log(order_stats_result)

		const columns = [['x'], ['Total Earnings']];
		order_stats_result.forEach(row => {
			// Format the date
			let sqlDate = row.transaction_date;
			let year = sqlDate.getFullYear();
			let month = String(sqlDate.getMonth() + 1).padStart(2, '0');
			let day = String(sqlDate.getDate()).padStart(2, '0');
			let formattedDate = `${year}-${month}-${day}`;

			// The chart data based on Mysql query
			columns[0].push(formattedDate);			// x-axis name (the bottom text)
			columns[1].push(row.total_earnings);	// data name (the blue dots data)
		});

		const chart = c3.generate({
			bindto: '#chart3', // <div id="chart3"></div>
			title: {
				text: 'TOTAL EARNINGS (DAILY)'
			},
			legend: {
				position: 'inset',
				inset: {
					anchor: 'top-right',
					x: 25,
					y: 0,
					step: 1
				}
			},
			zoom: {
				enabled: true
			},
			subchart: {
				show: true
			},
			size: {
				height: 500
			},
			data: {
				x: 'x',
				columns: columns,
				types: {
					'Total Earnings': 'spline'
				}
			},
			axis: {
				x: {
					type: 'category',
					tick: {
						rotate: 75,
						multiline: false
					}
				},
				y: {
					label: {
						text: 'Total Earnings',
						position: 'outer-middle'
					},
					tick: {
						format: function(d) {
							return '₱' + d3.format(',')(d);
						}
					}
				}
			}
		});

	})

}

// monthly earning chart
function total_earning_monthly_chart() {
	console.log("called total_earning_monthly_chart()")

	connection.query(`SELECT DATE_FORMAT(transaction_Date, '%Y-%m') AS month,
						SUM(total_earnings) AS total_amount
					FROM manage_db.order_stats
					GROUP BY month
					ORDER BY month`, function(err, order_stats_result, fields) {
		if (err) throw err;
		console.log(order_stats_result)

		const columns = [['x'], ['Total Earnings']]
		order_stats_result.forEach(row => {

			// The chart data based on Mysql query
			columns[0].push(row.month);			// x-axis name (the bottom text)
			columns[1].push(row.total_amount);	// data name (the blue dots data)

		});

		const chart = c3.generate({
			bindto: '#chart4', // <div id="chart3"></div>
			title: {
				text: 'TOTAL EARNINGS (MONTHLY)'
			},
			legend: {
				position: 'inset',
				inset: {
					anchor: 'top-right',
					x: 25,
					y: 0,
					step: 1
				}
			},
			zoom: {
				enabled: true
			},
			subchart: {
				show: true
			},
			size: {
				height: 500
			},
			data: {
				x: 'x',
				columns: columns,
				types: {
					'Total Earnings': 'spline'
				}
			},
			axis: {
				x: {
					type: 'category',
					tick: {
						rotate: 75,
						multiline: false
					}
				},
				y: {
					label: {
						text: 'Total Earnings',
						position: 'outer-middle'
					},
					tick: {
						format: function(d) {
							return '₱' + d3.format(',')(d);
						}
					}
				}
			}
		});

	})

}

// chart to load best seller items
function best_seller_items() {
	console.log("called best_seller_items()")

	const dropProcedureQuery = 'DROP PROCEDURE IF EXISTS dynamic_query_procedure';

	connection.query(dropProcedureQuery, function(err, result, fields) {
		if (err) {
			console.error(err.message);
		} else {

			const createProcedureQuery = `
				CREATE PROCEDURE dynamic_query_procedure()
				BEGIN
					SELECT
						GROUP_CONCAT(
							DISTINCT CONCAT(
								'MAX(CASE WHEN i.item_name = ''',
								item_name,
								''' THEN i.quantity_times_price END) AS ',
								REPLACE(item_name, ' ', '_')
							)
						) INTO @columns
					FROM items_ordered_history;

					SET @query = CONCAT(
						'SELECT DATE_FORMAT(o.transaction_date, ''%Y-%m-%d'') as transaction_date, ', @columns,
						' FROM order_queue_history o ',
						' JOIN items_ordered_history i ON o.order_id = i.order_id ',
						' WHERE o.order_status = ''Served'' ',
						' GROUP BY DATE_FORMAT(o.transaction_date, ''%Y-%m-%d'')'
					);

					PREPARE final_query FROM @query;
					EXECUTE final_query;
					DEALLOCATE PREPARE final_query;
				END;
			`;

			const executeProcedureQuery = 'CALL dynamic_query_procedure()';

			connection.query(createProcedureQuery, function(err, result, fields) {
				if (err) {
					console.error(err.message);
				} else {
					connection.query(executeProcedureQuery, function(err, second_result, fields) {
						if (err) {
							console.error(err.message);
						} else {
							const order_stats_result = second_result[0];
							console.log(order_stats_result)
							
							// const json_data = JSON.stringify(order_stats_result, null, 2).replace(/"([^"]+)":/g, '$1:');
							const json_data = JSON.stringify(order_stats_result);
							console.log(json_data);
						
							console.log('Raw order_stats_result:', order_stats_result);
							const parsed_data = JSON.parse(json_data);
						
							console.log('Parsed data:', parsed_data);
						
							// Check if the data array is not empty and contains valid objects
							if (Array.isArray(parsed_data) && parsed_data.length > 0 && typeof parsed_data[0] === 'object') {
								// Extract column names dynamically
								var columns = Object.keys(parsed_data[0]);
						
								console.log('Columns:', columns);
						
								// Remove the 'transaction_date' from the list of columns if it is the X-axis
								var xColumnIndex = columns.indexOf('transaction_date');
								if (xColumnIndex !== -1) {
									columns.splice(xColumnIndex, 1);
								}
						
								var chart = c3.generate({
									bindto: '#chart5', //<div id="chart5"></div>
									title: {
										text: 'ITEMS BEST SELLER'
									},
									padding: {
										top: 40
									},
									legend: {
										position: 'inset',
										inset: {
											anchor: 'top-right',
											x: 15,
											y: -40,
											step: 2,
										}
									},
									zoom: {
										enabled: true
									},
									subchart: {
										show: true
									},
									size: {
										height: 500
									},
									data: {
										json: parsed_data,
										keys: {
											x: 'transaction_date',
											value: columns
										},
										type: 'spline'
									},
									axis: {
										x: {
											type: 'category',
											tick: {
												rotate: 75,
												multiline: false
											}
										},
										y: {
											label: {
												text: 'Total Earnings',
												position: 'outer-middle'
											},
											tick: {
												format: function(d) {
													return '₱' + d3.format(',')(d);
												}
											}
										}
									}
								});
							} else {
								console.error('Data array is empty or does not contain valid objects.');
							}
						}

					})
				}

			})
		}


	})

}

// chart to load items quantities sold
function item_quantity_sold() {
	console.log("called item_quantity_sold()")

	const drop_current_procedure = 'DROP PROCEDURE IF EXISTS item_quantity_sold_procedure';

	connection.query(drop_current_procedure, function(err, result, fields) {
		if (err) {
			console.log(err);
		} else {
			const create_procedure_query = `
				CREATE PROCEDURE item_quantity_sold_procedure()
				BEGIN
					SET @sql = NULL;
				
					SELECT
						GROUP_CONCAT(DISTINCT
							CONCAT(
								'SUM(CASE WHEN item_name = ''',
								item_name,
								''' THEN quantity END) AS ',
								REPLACE(item_name, ' ', '_')
							)
						) INTO @sql
					FROM items_ordered_history;
				
					SET @sql = CONCAT(
						'SELECT DATE_FORMAT(transaction_date, ''%Y-%m-%d'') AS transaction_date, ', @sql, '
						FROM (
							SELECT
								oqh.transaction_date,
								ioh.item_name,
								ioh.quantity
							FROM order_queue_history oqh
							JOIN items_ordered_history ioh ON oqh.order_id = ioh.order_id
							WHERE oqh.order_status = ''Served''
						) AS subquery
						GROUP BY DATE_FORMAT(transaction_date, ''%Y-%m-%d'')'
					);
				
					PREPARE statement FROM @sql;
					EXECUTE statement;
					DEALLOCATE PREPARE statement;
				END;
			`;

			const execute_procedure_query = 'CALL item_quantity_sold_procedure()';

			connection.query(create_procedure_query, function(err, result, fields) {
				if (err) {
					console.log(err);
				} else {
					connection.query(execute_procedure_query, function(err, second_result, fields) {
						if (err) {
							console.log(err);
						} else {
							const item_quantity_sold_result = second_result[0];
							console.log("Raw sql query result: ", item_quantity_sold_result);

							// to convert it into json
							const json_data = JSON.stringify(item_quantity_sold_result);
							console.log("The converted JSON: ", json_data);

							// to parse the JSON data
							const parsed_data = JSON.parse(json_data);
							console.log("Parse JSON data: ", parsed_data);

							// Check if data array is not empty and contains valid objects
							if (Array.isArray(parsed_data) && parsed_data.length > 0 && typeof parsed_data[0] === 'object') {
								
								// to extract column name dynamically
								var columns = Object.keys(parsed_data[0]);
								console.log("Columns: ", columns);

								// remove the transaction_date from the list of columns if it's the X-axis
								var xColumnIndex = columns.indexOf('transaction_date');
								if (xColumnIndex !== -1) {
									columns.splice(xColumnIndex, 1);
								}

								var chart = c3.generate({
									bindto: '#chart6', //<div id="chart6"></div>
									title: {
										text: `ITEM'S QUANTITY SOLD`
									},
									padding: {
										top: 40
									},
									legend: {
										position: 'inset',
										inset: {
											anchor: 'top-right',
											x: 15,
											y: -40,
											step: 2,
										}
									},
									zoom: {
										enabled: true
									},
									subchart: {
										show: true
									},
									size: {
										height: 500
									},
									data: {
										json: parsed_data,
										keys: {
											x: 'transaction_date',
											value: columns
										},
										type: 'spline'
									},
									axis: {
										x: {
											type: 'category',
											tick: {
												rotate: 75,
												culling: true,
												multiline: false
											}
										},
										y: {
											label: {
												text: 'Total Quantities Sold',
												position: 'outer-middle'
											}
										}
									}
								})

							} else {
								console.error('Data array is empty or does not contain valid objects.');
							}

						}
					})
				}
			})

		}
	})

}

// function for showing or hiding graph
function show_graph_or_table() {
	total_order_chart();
	total_earnings_chart();
	total_earning_monthly_chart();
	best_seller_items();
	item_quantity_sold();
	//variables for hiding tables and chart
	let element = document.getElementById("order_stats_table"); //<table>
	let div_hide_element2 = document.getElementById("chart2_placeholder") //<div placeholder for <div chart2>
	let element2 = document.getElementById("chart2"); //<div chart2>

	let div_hide_element3 = document.getElementById("chart3_placeholder") //<div placeholder for <div chart2>
	let element3 = document.getElementById("chart3"); //<div chart3>
	
	let div_hide_element4 = document.getElementById("chart4_placeholder") //<div placeholder for <div chart2>
	let element4 = document.getElementById("chart4"); //<div chart4>

	let div_hide_element5 = document.getElementById("chart5_placeholder") //<div placeholder for <div chart2>
	let element5 = document.getElementById("chart5"); //<div chart5>

	let hidden = element.getAttribute("hidden");

	// hides & show the table
	if (hidden) {
		element.removeAttribute("hidden");
		div_hide_element2.setAttribute("hidden", "hidden");
		element2.setAttribute("hidden", "hidden");

		div_hide_element3.setAttribute("hidden", "hidden");
		element3.setAttribute("hidden", "hidden");

		div_hide_element4.setAttribute("hidden", "hidden");
		element4.setAttribute("hidden", "hidden");

		div_hide_element5.setAttribute("hidden", "hidden");
		element5.setAttribute("hidden", "hidden");

		document.getElementById("load_chart_btn").innerHTML = "SHOW GRAPH";
	} else {
		element.setAttribute("hidden", "hidden");
		div_hide_element2.removeAttribute("hidden");
		element2.removeAttribute("hidden");

		div_hide_element3.removeAttribute("hidden");
		element3.removeAttribute("hidden");

		div_hide_element4.removeAttribute("hidden");
		element4.removeAttribute("hidden");

		div_hide_element5.removeAttribute("hidden");
		element5.removeAttribute("hidden");
		
		document.getElementById("load_chart_btn").innerHTML = "SHOW TABLE";
	}

	// NOTE: THE CHART IS DIV which <div id="chart#"></div>
	// do note remove the div or elese chart will not load
}

// to hide lines in order_stats even the graph is not visible
function hide_lines() {
	let elements = document.querySelectorAll("#chart2_placeholder, #chart3_placeholder, #chart4_placeholder, #chart5_placeholder");

	elements.forEach(function(element) {
		element.setAttribute("hidden", "hidden");
	});
}
