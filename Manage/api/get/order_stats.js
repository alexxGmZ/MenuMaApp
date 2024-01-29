const connection = require("../../public/js/modules/mysql.js").connection;
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function get_order_status(request, response) {
	const query = "SELECT * FROM manage_db.order_stats";
	connection.query(query, function(err, result) {
		if (err) throw err;
		endpoint_log("GET", "order_stats", request.ip);
		response.status(200).json(result);
	});
}

module.exports = {
	get_order_status
}
