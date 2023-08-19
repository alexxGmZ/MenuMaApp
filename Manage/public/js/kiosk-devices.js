console.log("Directory: " + __dirname);

// const mysql = require("mysql2");
const ping = require("ping");
const dns = require("dns");

//
// Mysql Database
//
// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js")
// check database connection
mysql.check_connection()

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

	// place all the scanned devices inside a table body with a local_devices id
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
