console.log("Directory: " + __dirname);

const mysql = require("mysql2");
const ping = require("ping");
const dns = require("dns");
const config = require(__dirname + "/js/config.js");

// create database connection
var connection = mysql.createConnection({
	host: config.database.host,
	user: config.database.user,
	password: config.database.password,
	database: config.database.database
});

// check database connection
connection.connect((err) => {
	if (err) {
		return console.log(err.stack);
	}
	console.log("Connection Success");
});

function list_registered_devices() {

}

async function list_available_devices() {
	const networkPrefix = "192.168.254.";
	const startIP = 1;
	const endIP = 255;
	let devices = [];

	console.log('Scanning network...');

	const promises = [];

	for (let i = startIP; i <= endIP; i++) {
		const host = networkPrefix + i;
		const promise = ping.promise.probe(host);
		promises.push(promise);
	}

	const results = await Promise.all(promises);

	for (let i = 0; i < results.length; i++) {
		if (results[i].alive) {
			const ip = networkPrefix + (i + startIP);

			const deviceNamePromise = new Promise((resolve, reject) => {
				dns.reverse(ip, (err, hostnames) => {
					if (!err && hostnames && hostnames.length > 0) {
						resolve(hostnames[0]);
					} else {
						resolve("Unknown");
					}
				});
			});
			// Await the DNS lookup Promise
			const deviceName = await deviceNamePromise;

			// store ip and device name on devices
			devices.push({ ip, deviceName });
		}
	}

	console.log(devices);

	let placeholder = document.querySelector("#local_devices");
	let out = "";

	for(let row of devices) {
		out += `
			<tr>
				<td>${row.deviceName}</td>
				<td>${row.ip}</td>
			</tr>
		`;
	}

	placeholder.innerHTML = out;

	console.log('Scan completed.');
}
