const connection = require("../../public/js/modules/mysql.js").connection;
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function registered_employees(request, response) {
	const query = "SELECT * from manage_db.registered_employees";
	connection.query(query, function(err, result) {
		if (err) throw err;
		endpoint_log("GET", "registered_employees", request.ip);
		response.status(200).send(result);
	})
}

module.exports = {
	registered_employees
}
