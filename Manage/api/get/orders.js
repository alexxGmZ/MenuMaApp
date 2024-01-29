const connection = require("../../public/js/modules/mysql.js").connection;
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function get_orders(request, response) {
	const orderQueueQuery = "SELECT * FROM manage_db.order_queue";
	const itemsOrderedQuery = "SELECT * FROM manage_db.items_ordered";

	// Execute the order_queue query
	connection.query(orderQueueQuery, function(err, orderQueueResult) {
		if (err) throw err;

		// Execute the items_ordered query
		connection.query(itemsOrderedQuery, function(err, itemsOrderedResult) {
			if (err) throw err;

			endpoint_log("GET", "orders", request.ip);
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

module.exports = {
	get_orders
}
