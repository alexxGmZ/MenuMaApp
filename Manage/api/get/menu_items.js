const connection = require("../../public/js/modules/mysql.js").connection;
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function menu_items(request, response) {
	const query = "SELECT * from manage_db.menu_items";
	connection.query(query, function(err, result) {
		if (err) throw err;

		// Convert image data to base64-encoded strings
		for (const row of result) {
			if (row.item_image) {
				row.item_image = `data:image/jpeg;base64,${row.item_image.toString("base64")}`;
			}
		}

		endpoint_log("GET", "menu_items", request.ip);
		response.status(200).json(result);
	})
}

module.exports = {
	menu_items
}
