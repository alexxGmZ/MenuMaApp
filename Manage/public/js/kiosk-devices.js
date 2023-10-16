document.addEventListener("DOMContentLoaded", function() {
	list_available_devices();
	list_registered_devices();
});

console.log("Directory: " + __dirname);
console.log("Timestamp: " + get_current_timestamp());

const ping = require("ping");
const dns = require("dns");
const crypto = require("crypto");

//
// Mysql Database
//
// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js")
mysql.check_connection()
const connection = mysql.connection;

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

	for (let row of devices) {
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

function list_registered_devices() {
	connection.query("SELECT * FROM api_connected_devices ORDER BY timestamp_column DESC", (err, result) => {
		if (err) throw err;
		// console.log(result);

		let placeholder = document.querySelector("#registered_devices");
		let out = ""

		for (let row of result) {
			var formatted_timestamp = new Date(row.timestamp_column).toLocaleString();
			out += `
				<tr>
					<td>${row.ip_address}</td>
					<td>${row.device_name}</td>
					<td>${row.api_token}</td>
					<td>${row.mac_address}</td>
					<td>${formatted_timestamp}</td>
				</tr>
			`;
		}

		// display output in document/kiosk-devices.html
		placeholder.innerHTML = out;
	})
}

function register_device() {
	console.log("call register_device()")

	// validate ip address
	const device_ip = document.getElementById("device_ip").value.trim();
	if (!is_valid_ipv4(device_ip))
		return alert("Invalid IPV4 address");

	// validate mac address
	const device_mac_address = document.getElementById("device_mac_address").value.trim();
	if (device_mac_address !== null && device_mac_address !== "" && !is_valid_mac_address(device_mac_address))
		return alert("Invalid Mac address");

	const device_name = document.getElementById("device_name").value.trim();
	const timestamp = get_current_timestamp();
	const api_token = generate_api_token(device_ip, timestamp);

	console.log(`"${device_ip}"`);
	console.log(`"${device_name}"`);
	console.log(`"${device_mac_address}"`);
	console.log(`${timestamp}`);
	console.log(`${api_token}`);

	connection.query(
		"insert into api_connected_devices (ip_address, device_name, api_token, mac_address) values (?, ?, ?, ?)",
		[device_ip, device_name, api_token, device_mac_address],
		(error) => {
			if (error)
				alert(error);
			else
				alert("Device Successfully Registered");
		}
	);
}

function generate_api_token(device_ip, timestamp) {
	const salt = device_ip + timestamp;
	const hash = crypto.createHash("sha256").update(salt).digest("hex");
	const api_token = hash.slice(0, 10);
	return api_token;
}

function get_current_timestamp() {
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed in JavaScript.
	const day = now.getDate().toString().padStart(2, '0');
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');

	const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

	return timestamp;
}

function is_valid_ipv4(ip) {
	const ipv4_pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
	return ipv4_pattern.test(ip);
}

function is_valid_mac_address(mac) {
	const mac_pattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
	return mac_pattern.test(mac);
}
