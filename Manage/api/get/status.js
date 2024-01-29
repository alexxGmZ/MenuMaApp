const os = require("os");
const endpoint_log = require("../utils/endpoint_log.js").endpoint_log;

function server_status(request, response) {
	const server_ip = Object.values(os.networkInterfaces())
		.flat()
		.filter((iface) => iface.family === 'IPv4' && !iface.internal)
		.map((iface) => iface.address)[0];
	response.send(`Connected To MenuMaApp Manage Server: ${server_ip}`);
	endpoint_log("GET", "status", request.ip);
}

module.exports = {
	server_status
}
