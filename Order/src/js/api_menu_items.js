import { CapacitorHttp } from '@capacitor/core';
console.log("Server IP: ", sessionStorage.getItem("server_IP"));

// const server_url = "http://192.168.254.115";
const server_url = `http://${sessionStorage.getItem("server_IP")}`;
const server_port = 8080;
let menu_items_data = [];

// fetch data from the server
function get_request_menu_items() {
	return new Promise((resolve, reject) => {
		const request_promise = CapacitorHttp.get({
			url: `${server_url}:${server_port}/menu_items`,
		})
			.then(response => {
				console.log("Response Status: " + response.status);
				menu_items_data = response.data;
				resolve();
			})
			.catch((error) => {
				console.error(error);
				const table = document.getElementById("menu_items");
				table.textContent = `Failed to establishment connection to\n${server_url}`;
				reject(error);
			});
	})
}

// display menu_items from the fetched data
function display_menu_items() {
	let placeholder = document.querySelector("#menu_items");
	let out = ""

	// iterate all data and display on a table
	for (let row of menu_items_data) {
		// console.log(row);
		out += `
			<tr class="">
				<td class="">${row.item_name}</td>
				<td class="">${row.item_desc}</td>
				<td><img src="${row.item_image}" alt="Item Image"></td>
				<td class="">${row.item_price}</td>
			</tr>
		`;
	}
	placeholder.innerHTML = out;
}

// call get_request_menu_items() and then display_menu_items()
get_request_menu_items()
	.then(() => {
		display_menu_items();
	})
	.catch(error => {
		console.log(error);
	});

