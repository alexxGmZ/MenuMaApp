document.addEventListener("DOMContentLoaded", function() {
	list_available_devices();
	list_registered_devices();
	display_wlan_ip_address();

	// to hide errors for adding new device if ip/mac address is empty or invalid input
	document.getElementById("invalid_ip_error_placeholder").style.display = "none";
	document.getElementById("invalid_ip_error_placeholder_exists").style.display = "none";
	document.getElementById("invalid_mac_error_placeholder").style.display = "none";
	document.getElementById("invalid_mac_error_placeholder_exists").style.display = "none";

});

console.log("Directory: " + __dirname);
console.log("Timestamp: " + get_current_timestamp());

const ping = require("ping");
const dns = require("dns");
const crypto = require("crypto");
const os = require("os");

// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js")
mysql.check_connection()
const connection = mysql.connection;

// dialog module
const dialog = require(__dirname + "/js/modules/dialog.js");
const dialog_open = dialog.dialog_open;
const dialog_close = dialog.dialog_close;

async function list_available_devices() {
	console.log("called list_available_devices()");
	console.log('Scanning network...');

	const network_prefix = await get_network_prefix() + ".";
	const startIP = 1;
	const endIP = 255;
	let devices = [];

	const promises = [];

	for (let i = startIP; i <= endIP; i++) {
		const host = network_prefix + i;
		const promise = ping.promise.probe(host);
		promises.push(promise);
	}

	const results = await Promise.all(promises);

	for (let i = 0; i < results.length; i++) {
		if (results[i].alive) {
			const ip = network_prefix + (i + startIP);
			const deviceNamePromise = new Promise((resolve, reject) => {
				dns.reverse(ip, (err, hostnames) => {
					if (!err && hostnames && hostnames.length > 0) {
						resolve(hostnames[0]);
					}
					else {
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

	// place all the scanned devices inside a table body with a local_devices id
	let placeholder = document.querySelector("#local_devices");
	let out = "";
	for (let row of devices) {
		/* out += `
			<tr class="border-b dark:border-gray-700 border-r border-l hover:bg-gray-300">
				<td>${row.deviceName}</td>
				<td>${row.ip}</td>
			</tr>
		`; */
		out += `
			<div class="row border border-b">
				<div class="col">${row.deviceName}</div>
				<div class="col">${row.ip}</div>
			</div>
		`;
	}
	placeholder.innerHTML = out;
}

function get_ethernet_ip_address() {
	console.log("called get_ethernet_ip_address()");
	return new Promise((resolve, reject) => {
		const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
		const pc = new RTCPeerConnection({ iceServers: [] });
		pc.createDataChannel("");
		pc.createOffer()
			.then(offer => pc.setLocalDescription(offer))
			.catch(error => reject(error));

		pc.onicecandidate = (event) => {
			if (event.candidate) {
				const ip_regex = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/;
				const ip_address = ip_regex.exec(event.candidate.candidate)[0];
				resolve(ip_address);
				pc.onicecandidate = null;
				pc.close();
			}
		};
	});
}

function display_wlan_ip_address() {
	console.log("called display_wlan_ip_address()");
	const interfaces = os.networkInterfaces();
	const wlan_interface = interfaces['Wi-Fi'];

	if (wlan_interface) {
		const ipv4_address = wlan_interface.find(alias => alias.family === 'IPv4');
		if (ipv4_address) {
			document.getElementById("wlan_ip_address").textContent = ipv4_address.address;
		}
	}
	else {
		document.getElementById("wlan_ip_address").textContent = "WLAN IP address not found";
	}
}

async function get_network_prefix() {
	console.log("called get_network_prefix()");
	const ethernet_ip_address = await get_ethernet_ip_address();
	document.getElementById("ethernet_ip_address").textContent = ethernet_ip_address;
	const ip_parts = ethernet_ip_address.split('.');
	const network_prefix = ip_parts.slice(0, 3).join('.');
	return network_prefix;
}

function list_registered_devices() {
	console.log("called list_registered_devices()");
	connection.query("SELECT * FROM api_connected_devices ORDER BY timestamp_column DESC", (err, result) => {
		if (err) throw err;
		let placeholder = document.querySelector("#registered_devices");
		let out = ""

		for (let row of result) {
			var formatted_timestamp = new Date(row.timestamp_column).toLocaleString();
			out += `
				<div class="shadow-sm mb-2 rounded-4 border border-2 p-3">
					<div class="row">
						<div class="col text-center fs-6">
							${row.ip_address}
						</div>
						<div class="col text-center fs-6">
							${row.device_name}
						</div>
						<div class="col text-center fs-6">
							${row.api_token}
						</div>
						<div class="col text-center fs-6">
							${row.mac_address}
						</div>
						<div class="col text-center fs-6">
							${formatted_timestamp}
						</div>
						<div class="col text-center">
							<button class="btn btn-outline-primary shadow-sm" onclick="dialog_open('update_device_dialog'); row_click(\`${encodeURIComponent(JSON.stringify(row))}\`);">
								<img src="assets/svg/pencil-fill.svg" class="hover:text-zinc-50">
							</button>
							<button class="btn btn-danger border-1 shadow-sm" onclick="dialog_open('delete_device_dialog'); row_click(\`${encodeURIComponent(JSON.stringify(row))}\`);">
								<img src="assets/svg/trash3-fill.svg" class="">
							</button>
						</div>
					</div>
				</div>


			`;
		}
		placeholder.innerHTML = out;
	})
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
	if (!is_valid_ipv4(device_ip)) {
		document.getElementById("invalid_ip").innerHTML = document.getElementById("device_ip").value;

		// if ip address is not valid or null, show error
		document.getElementById("invalid_ip_error_placeholder").style.display = "block";
		document.getElementById("invalid_ip_error_placeholder_exists").style.display = "none";
		return;
	}

	// validate mac address
	const device_mac_address = document.getElementById("device_mac_address").value.trim();
	if (device_mac_address !== null && device_mac_address !== "" && !is_valid_mac_address(device_mac_address)) {
		document.getElementById("invalid_mac_address").innerHTML = document.getElementById("device_mac_address").value;

		// if ip address is not null or valid, hide error
		document.getElementById("invalid_ip_error_placeholder").style.display = "none";
		document.getElementById("invalid_ip_error_placeholder_exists").style.display = "none";

		// if mac address is not valid, show error
		document.getElementById("invalid_mac_error_placeholder").style.display = "block";
		document.getElementById("invalid_mac_error_placeholder_exists").style.display = "none";
		// return dialog_open("invalid_mac_address_dialog");
		return;
	}

	const device_name = document.getElementById("device_name").value.trim();
	connection.query(
		"SELECT COUNT(*) AS count FROM api_connected_devices WHERE ip_address = ?",
		[device_ip],
		(ipError, ipResults) => {
			if (ipError) alert(ipError);
			else {
				const existing_ip_record_count = ipResults[0].count;
				if (existing_ip_record_count > 0) {
					document.getElementById("invalid_ip_error_placeholder_exists").style.display = "block";
					document.getElementById("invalid_ip_error_placeholder").style.display = "none";
					document.getElementById("invalid_mac_error_placeholder").style.display = "none";
					document.getElementById("existing_ip").innerHTML = document.getElementById("device_ip").value;
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
									dialog_open("device_register_success_dialog");
									document.getElementById("success_device_ip").innerHTML = device_ip;
									document.getElementById("success_device_name").innerHTML = document.getElementById("device_name").value;
									document.getElementById("success_device_mac").innerHTML = document.getElementById("device_mac_address").value;

									// hides the error if success
									document.getElementById("invalid_ip_error_placeholder").style.display = "none";
									document.getElementById("invalid_mac_error_placeholder").style.display = "none";
									document.getElementById("invalid_ip_error_placeholder_exists").style.display = "none";
									document.getElementById("invalid_mac_error_placeholder_exists").style.display = "none";

									// null the values if adding a new device success
									document.getElementById("device_ip").value = "";
									document.getElementById("device_name").value = "";
									document.getElementById("device_mac_address").value = "";

									// close the current dialog to prevent overlapping dialogs
									dialog_close("add_new_device_dialog");

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
										// dialog_open("mac_address_already_exist_dialog");
										document.getElementById("invalid_mac_error_placeholder").style.display = "none";
										document.getElementById("invalid_mac_error_placeholder_exists").style.display = "block";
										document.getElementById("existing_mac_address").innerHTML = document.getElementById("device_mac_address").value;

										// hides the error if ip is not same
										document.getElementById("invalid_ip_error_placeholder").style.display = "none";
										document.getElementById("invalid_ip_error_placeholder_exists").style.display = "none";

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
													dialog_open("device_register_success_dialog");
													document.getElementById("success_device_ip").innerHTML = device_ip;
													document.getElementById("success_device_name").innerHTML = document.getElementById("device_name").value;
													document.getElementById("success_device_mac").innerHTML = document.getElementById("device_mac_address").value;

													// hides the error if success
													document.getElementById("invalid_ip_error_placeholder").style.display = "none";
													document.getElementById("invalid_ip_error_placeholder_exists").style.display = "none";
													document.getElementById("invalid_mac_error_placeholder").style.display = "none";
													document.getElementById("invalid_mac_error_placeholder_exists").style.display = "none";

													// null the values if adding a new device success
													document.getElementById("device_ip").value = "";
													document.getElementById("device_name").value = "";
													document.getElementById("device_mac_address").value = "";

													// close the current dialog to prevent overlapping dialogs
													dialog_close("add_new_device_dialog");

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
			dialog_close('delete_device_dialog');
			document.getElementById("delete_device_success_ip").innerHTML = ip + " is successfully deleted";
		}
	});
}

function update_device() {
	console.log("called update_device()");
	const ip = document.getElementById("update_device_ip").textContent;

	const mac_address = document.getElementById("update_device_mac_address").value.trim();
	if (mac_address !== null && mac_address !== "" && !is_valid_mac_address(mac_address)) {
		document.getElementById("invalid_mac_error_placeholder_update").classList.remove("d-none");
		document.getElementById("invalid_mac_error_placeholder_update").classList.add("d-block");
		return;
	}

	const device_name = document.getElementById("update_device_name").value;
	const api_token = document.getElementById("update_device_api_token").innerHTML;
	const timestamp = get_current_timestamp();
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
				dialog_close("update_device_dialog");
				document.getElementById("update_device_success_ip").innerHTML = ip + " is successfully updated";
				document.getElementById("invalid_mac_error_placeholder_update").classList.add("d-none");
				document.getElementById("invalid_mac_error_placeholder_update").classList.remove("d-block");
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

function row_click(encoded_device) {
	console.log("called row_click()");

	const decoded_device = JSON.parse(decodeURIComponent(encoded_device));

	// for updating device
	document.getElementById("update_device_ip").innerHTML = decoded_device.ip_address;
	document.getElementById("update_device_name").value = decoded_device.device_name;
	document.getElementById("update_device_api_token").innerHTML = decoded_device.api_token;
	document.getElementById("update_device_mac_address").value = decoded_device.mac_address;

	// for deleting device
	document.getElementById("delete_device_ip").innerHTML = decoded_device.ip_address;
	document.getElementById("delete_device_name").innerHTML = decoded_device.device_name;
	document.getElementById("delete_device_api_token").innerHTML = decoded_device.api_token;
	document.getElementById("delete_device_mac_address").innerHTML = decoded_device.mac_address;
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

