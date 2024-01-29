const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;
const fs = require("fs");
const path = require("path");

function get_menu_design(request, response) {
	const design_file = path.join(__dirname, "../../current_design.json");
	fs.readFile(design_file, "utf8", (err, data) => {
		if (err) {
			console.log(`Error reading ${design_file}`);
			return response.status(500).json({ error: 'Internal Server Error' });
		}

		try {
			const json_data = JSON.parse(data);
			response.status(200).json(json_data);
			endpoint_log("GET", "menu_design", request.ip);
		}
		catch (parse_error) {
			console.error('Error parsing JSON:', parse_error);
			response.status(501).json({ error: 'Internal Server Error' });
		}
	})
}

module.exports = {
	get_menu_design
}
