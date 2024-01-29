const connection = require("../../public/js/modules/mysql.js").connection;
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function get_order_history(request, response) {
	const items_ordered_history_query = `SELECT * FROM manage_db.items_ordered_history`;
	const ordered_queue_history_query = `SELECT * FROM manage_db.order_queue_history ORDER BY transaction_date DESC`;

	//get all history from table "items_ordered_history"
	connection.query(items_ordered_history_query, function(err, items_history_result) {
		if (err) throw err;

		// get all history from table "ordered_queue_history"
		connection.query(ordered_queue_history_query, function(err, orders_history_result) {
			if (err) throw err;

			endpoint_log("GET", "order_history", request.ip);
			//Organized Data
			const nestedData = orders_history_result.map(order => {
				const matchedItems = items_history_result.filter(item => item.order_id === order.order_id)

				return {
					...order,
					items_ordered: matchedItems
				};
			});

			response.status(200).send(nestedData);
		});
	});
}

module.exports = {
	get_order_history
}
