const connection = require("../../public/js/modules/mysql.js").connection;
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function menu_items_lite(request, response) {
	const query = "SELECT item_id, item_name, item_price FROM manage_db.menu_items";
	connection.query(query, function(err, result) {
		if (err) throw err;
		endpoint_log("GET", "menu_items_lite", request.ip);
		response.status(200).json(result);
	})
}

module.exports = {
	menu_items_lite
}
