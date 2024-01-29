const connection = require("../../public/js/modules/mysql.js").connection;
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function upload_item(request, response) {
	const { name, description, price } = request.body;
	// const body = JSON.stringify(req.body, null, 2);
	// console.log(body);
	// console.log(req.file);

	var sql_query = "INSERT INTO manage_db.menu_items (item_name, item_desc, item_price) VALUES (?, ?, ?)";
	var sql_parameters = [name, description, price];
	// if there is an image
	if (request.file) {
		sql_query = "INSERT INTO manage_db.menu_items (item_name, item_desc, item_image, item_price) VALUES (?, ?, ?, ?)";
		sql_parameters = [name, description, request.file.buffer, price];
	}

	// Insert the image into the database
	connection.query(sql_query, sql_parameters, (err) => {
		if (err) {
			console.error("Error inserting data into MySQL:", err);
			return response.json({ success: false });
		}
		endpoint_log("POST", "upload_item", request.ip);
		return response.json({ success: true });
	});
}

module.exports = {
	upload_item
}
