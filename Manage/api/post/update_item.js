const connection = require("../../public/js/modules/mysql.js").connection;
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function update_item(request, response) {
	const { id, name, description, price } = request.body;
	var sql_query = "";
	var sql_parameters = [];

	// check if there's an image buffer then adjust the query
	if (request.file) {
		sql_query = "UPDATE manage_db.menu_items SET item_name = ?, item_desc = ?, item_price = ?, item_image = ? WHERE item_id = ?";
		sql_parameters = [name, description, price, request.file.buffer, id];
	}
	else {
		sql_query = "UPDATE manage_db.menu_items SET item_name = ?, item_desc = ?, item_price = ? WHERE item_id = ?";
		sql_parameters = [name, description, price, id];
	}

	// Build and execute the SQL update query
	connection.query(sql_query, sql_parameters, (error, results) => {
		if (error) {
			console.error("Error updating item:", error);
			return response.status(500).json({ success: false, error: "Internal Server Error" });
		}

		// Check if any rows were affected
		if (results.affectedRows === 0) {
			return response.status(404).json({ success: false, error: "Item not found" });
		}

		// Item updated successfully
		endpoint_log("POST", "update_item", request.ip);
		return response.status(200).json({ success: true, message: "Item updated successfully" });
	});
}

module.exports = {
	update_item
}
