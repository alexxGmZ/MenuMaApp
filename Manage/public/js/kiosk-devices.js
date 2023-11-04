document.addEventListener("DOMContentLoaded", function() {
	list_available_devices();
	list_registered_devices();
	toggle_sort_devices_table();
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
	// NOTE: make the networkPrefix more dynamic
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

	// console.log(devices);

	// place all the scanned devices inside a table body with a local_devices id
	let placeholder = document.querySelector("#local_devices");
	let out = "";

	for (let row of devices) {
		out += `
			<tr class="border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
				<td>${row.deviceName}</td>
				<td>${row.ip}</td>
			</tr>
		`;
	}

	placeholder.innerHTML = out;

	console.log('Network Scan completed.');
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
				<tr class="border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
					<td data-column="ip_address">${row.ip_address}</td>
					<td data-column="device_name">${row.device_name}</td>
					<td data-column="api_token">${row.api_token}</td>
					<td data-column="mac_address">${row.mac_address}</td>
					<td data-column="timestamp_column">${formatted_timestamp}</td>
					<td>
						<span class="">
							<button class="rounded-lg bg-sky-500 py-2 px-2 inline-flex hover:bg-sky-300 text-zinc-50 hover:drop-shadow-lg" onclick="dialog_open('update_device_dialog')">
								<img src="assets/svg/pencil-alt.svg" class="hover:text-zinc-50">
							</button>
							<button class="rounded-lg bg-rose-500 py-2 px-2 inline-flex hover:bg-rose-300 text-zinc-50 hover:drop-shadow-lg" onclick="dialog_open('delete_device_dialog')">
								<img src="assets/svg/trash.svg" class="">
							</button>
						</span>
					</td>
				</tr>
			`;
		}

		// display output in document/kiosk-devices.html
		placeholder.innerHTML = out;
	})
}

function toggle_sort_devices_table() {
	console.log("called toggle_sort_devices_table()");
	// Add click event listeners to table headers for sorting
	const sortOrders = {};
	const headers = document.querySelectorAll("#registered_devices_table th[data-column]");

	headers.forEach((header) => {
		const column = header.getAttribute("data-column");
		sortOrders[column] = "asc"; // Set the initial sort order to ascending

		header.addEventListener("click", () => {
			// Toggle sort order on each click
			sortOrders[column] = sortOrders[column] === "asc" ? "desc" : "asc";
			sort_registered_devices(document.getElementById("registered_devices_table"), column, sortOrders[column]);
		});
	});
}

function refresh_registered_devices_table() {
	console.log("called refresh_registered_devices_table()");

	// close all active dialogs with active-dialog class
	// NOTE: will execute if dialog_open() is executed
	const activeDialogs = document.querySelectorAll(".active-dialog");
	activeDialogs.forEach((dialog) => {
		dialog.close();
		dialog.classList.remove("active-dialog");
	});

	// empty the registered_devices table body
	const table_body = document.getElementById("registered_devices");
	table_body.innerHTML = "";

	// repopulate the registered_devices table body
	list_registered_devices();
}

function register_device() {
	console.log("called register_device()")

	// validate ip address
	const device_ip = document.getElementById("device_ip").value.trim();
	if (!is_valid_ipv4(device_ip))
		return dialog_open("invalid_ipv4_dialog");

	// validate mac address
	const device_mac_address = document.getElementById("device_mac_address").value.trim();
	if (device_mac_address !== null && device_mac_address !== "" && !is_valid_mac_address(device_mac_address))
		return dialog_open("invalid_mac_address_dialog");

	const device_name = document.getElementById("device_name").value.trim();

	connection.query(
		"SELECT COUNT(*) AS count FROM api_connected_devices WHERE ip_address = ?",
		[device_ip],
		(ipError, ipResults) => {
			if (ipError) alert(ipError);
			else {
				const existing_ip_record_count = ipResults[0].count;
				if (existing_ip_record_count > 0) {
					dialog_open("ipv4_already_exist_dialog");
				}
				else {
					// Check if MAC address is blank or null
					if (!device_mac_address || device_mac_address.trim() === "") {
						// Proceed to insertion if MAC address is blank
						const api_token = generate_api_token(device_ip, get_current_timestamp());
						document.getElementById("success_device_api_token").innerHTML = api_token;
						connection.query(
							"INSERT INTO api_connected_devices (ip_address, device_name, api_token, mac_address) VALUES (?, ?, ?, ?)",
							[device_ip, device_name, api_token, device_mac_address],
							(insertError) => {
								if (insertError) alert(insertError);
								else {
									console.log("IP: " + device_ip);
									console.log("Name: " + device_name);
									console.log("Mac: " + device_mac_address);
									console.log("Token: " + api_token);
									console.log("Timestamp: " + get_current_timestamp());
									dialog_open("device_register_success_dialog");
								}
							}
						);
					}
					else {
						// If the MAC address is not blank, proceed to MAC address validation
						connection.query(
							"SELECT COUNT(*) AS count FROM api_connected_devices WHERE mac_address = ?",
							[device_mac_address],
							(error, results) => {
								if (error) alert(error);
								else {
									const existing_record_count = results[0].count;
									if (existing_record_count > 0) {
										dialog_open("mac_address_already_exist_dialog");
									}
									else {
										// Insert the new record if neither IP nor MAC address exists
										const api_token = generate_api_token(device_ip, get_current_timestamp());
										document.getElementById("success_device_api_token").innerHTML = api_token;
										connection.query(
											"INSERT INTO api_connected_devices (ip_address, device_name, api_token, mac_address) VALUES (?, ?, ?, ?)",
											[device_ip, device_name, api_token, device_mac_address],
											(insertError) => {
												if (insertError) alert(insertError);
												else {
													console.log("IP: " + device_ip);
													console.log("Name: " + device_name);
													console.log("Mac: " + device_mac_address);
													console.log("Token: " + api_token);
													console.log("Timestamp: " + get_current_timestamp());
													dialog_open("device_register_success_dialog");
												}
											}
										);
									}
								}
							}
						);
					}
				}
			}
		}
	);
}

function delete_device() {
	console.log("called delete_device()");
	var ip = document.getElementById("delete_device_ip").textContent;

	const query = `DELETE FROM api_connected_devices WHERE ip_address = "${ip}"`;
	connection.query(query, error => {
		if (error) {
			alert(error);
			console.log(error);
		}
		else {
			dialog_open('delete_device_success_dialog');
			console.log(ip + " deleted");
		}
	});
}

function update_device() {
	console.log("called update_device()");
	const ip = document.getElementById("update_device_ip").textContent;

	const mac_address = document.getElementById("update_device_mac_address").value.trim();
	if (mac_address !== null && mac_address !== "" && !is_valid_mac_address(mac_address))
		return alert("Invalid Mac address");

	const device_name = document.getElementById("update_device_name").value;
	const api_token = document.getElementById("update_device_api_token").innerHTML;
	const timestamp = get_current_timestamp();

	console.log("IP: " + ip);
	console.log("MAC: " + mac_address);
	console.log("Name: " + device_name);
	console.log("Token: " + api_token);
	console.log("Timestamp: " + timestamp);

	connection.query(
		"UPDATE api_connected_devices SET device_name = ?, api_token = ?, mac_address = ?, timestamp_column = ? WHERE ip_address = ?",
		[device_name, api_token, mac_address, timestamp, ip],
		error => {
			if (error) {
				console.log(error);
				return alert(error);
			}
			else {
				dialog_open("update_device_success_dialog");
				console.log(ip + " updated");
			}
		}
	);
}

function sort_registered_devices(table, column, sortOrder) {
	console.log(`called sort_registered_devices(${table}, ${column}, ${sortOrder})`);

	const tbody = table.querySelector("tbody");
	const rows = Array.from(tbody.querySelectorAll("tr"));

	rows.sort((a, b) => {
		const cell_a = a.querySelector(`td[data-column="${column}"]`);
		const cell_b = b.querySelector(`td[data-column="${column}"]`);
		if (cell_a && cell_b) {
			const comparison = cell_a.textContent.localeCompare(cell_b.textContent, undefined, { numeric: true });
			return sortOrder === "asc" ? comparison : -comparison;
		}
		return 0; // Default comparison when one or both cells are missing
	});

	rows.forEach((row) => {
		tbody.appendChild(row);
	});
}

// update an existing api token if the button is clicked
document.getElementById("update_device_gen_token_button").addEventListener(
	"click",
	function() {
		const device_ip = document.getElementById("update_device_ip").innerHTML;
		const timestamp = get_current_timestamp();
		const api_token = generate_api_token(device_ip, timestamp)

		document.getElementById("update_device_api_token").innerHTML = api_token;
	}
);

function dialog_open(element_id) {
	console.log(`called dialog_open(${element_id})`)
	const fav_dialog = document.getElementById(element_id);

	// add active-dialog class in all current active dialogs
	fav_dialog.classList.add("active-dialog");

	// any dialog element id specific statements
	if (element_id == "device_register_success_dialog") {
		const device_ip = document.getElementById("device_ip").value;
		document.getElementById("success_device_ip").innerHTML = device_ip;
		document.getElementById("success_device_name").innerHTML = document.getElementById("device_name").value;
		document.getElementById("success_device_mac").innerHTML = document.getElementById("device_mac_address").value;
	}

	if (element_id == "ipv4_already_exist_dialog")
		document.getElementById("existing_ip").innerHTML = document.getElementById("device_ip").value;

	if (element_id == "mac_address_already_exist_dialog")
		document.getElementById("existing_mac_address").innerHTML = document.getElementById("device_mac_address").value;

	if (element_id == "invalid_ipv4_dialog")
		document.getElementById("invalid_ip").innerHTML = document.getElementById("device_ip").value;

	if (element_id == "invalid_mac_address_dialog")
		document.getElementById("invalid_mac_address").innerHTML = document.getElementById("device_mac_address").value;

	if (element_id == "delete_device_dialog")
		row_click();

	if (element_id == "delete_device_success_dialog")
		document.getElementById("delete_device_success_ip").innerHTML = document.getElementById("delete_device_ip").innerHTML;

	if (element_id == "update_device_dialog")
		row_click();

	if (element_id == "update_device_success_dialog")
		document.getElementById("update_device_success_ip").innerHTML = document.getElementById("update_device_ip").innerHTML;

	fav_dialog.showModal();
}

function dialog_close(element_id) {
	console.log(`called dialog_close(${element_id})`)
	const fav_dialog = document.getElementById(element_id);

	// remove the active-dialog class when the dialog is closed
	fav_dialog.classList.remove("active-dialog");
	fav_dialog.close();
}

function row_click() {
	console.log("called row_click()");

	const table = document.getElementById("registered_devices");
	const rows = table.getElementsByTagName("tr");

	for (let i = 0; i < rows.length; i++) {
		let current_row = table.rows[i];
		let click_handle = function(row) {
			return function() {
				var device_ip = row.getElementsByTagName("td")[0].innerHTML;
				var device_name = row.getElementsByTagName("td")[1].innerHTML;
				var api_token = row.getElementsByTagName("td")[2].innerHTML;
				var mac_address = row.getElementsByTagName("td")[3].innerHTML;

				console.log(device_ip);
				console.log(device_name);
				console.log(api_token);
				console.log(mac_address);

				// for deleting device
				document.getElementById("delete_device_ip").innerHTML = device_ip;
				document.getElementById("delete_device_name").innerHTML = device_name;
				document.getElementById("delete_device_api_token").innerHTML = api_token;
				document.getElementById("delete_device_mac_address").innerHTML = mac_address;

				// for updating device
				document.getElementById("update_device_ip").innerHTML = device_ip;
				document.getElementById("update_device_name").value = device_name;
				document.getElementById("update_device_api_token").innerHTML = api_token;
				document.getElementById("update_device_mac_address").value = mac_address;
			}
		}
		current_row.onclick = click_handle(current_row);
	}
}

function generate_api_token(device_ip, timestamp) {
	console.log(`called generate_api_token(${device_ip}, ${timestamp})`);
	const salt = device_ip + timestamp;
	const hash = crypto.createHash("sha256").update(salt).digest("hex");
	const api_token = hash.slice(0, 10);
	return api_token;
}

function get_current_timestamp() {
	console.log("called get_current_timestamp()");
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
	console.log(`called is_valid_ipv4(${ip})`)
	const ipv4_pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
	return ipv4_pattern.test(ip);
}

function is_valid_mac_address(mac) {
	console.log(`called is_valid_mac_address(${mac})`)
	const mac_pattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
	return mac_pattern.test(mac);
}
