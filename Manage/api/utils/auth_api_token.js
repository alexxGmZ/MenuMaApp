const connection = require("../../public/js/modules/mysql.js").connection;
const extract_ipv4 = require("../utils/extract_ipv4.js").extract_ipv4;

function auth_api_token(req, res, next) {
	// const ip = req.ip;
	let ip = extract_ipv4(req.ip);
	const token = req.query.api_token;
	console.log(ip, token);

	// Query the database to check if the IP and token combination exists
	const query = `SELECT * FROM api_connected_devices WHERE ip_address = ? AND api_token = ?`;
	connection.query(
		query,
		[ip, token],
		(err, results) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: 'Internal Server Error' });
			}

			// If a valid combination is found, proceed to the next middleware
			if (results.length > 0) {
				next();
			}
			else {
				return res.status(401).json({ error: 'Unauthorized' });
			}
		}
	);
}

module.exports = {
	auth_api_token
}
