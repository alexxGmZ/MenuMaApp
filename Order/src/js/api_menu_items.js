import { CapacitorHttp } from '@capacitor/core';

const server_url = "http://192.168.254.115";
const server_port = 8080;

function get_request_menu_items() {
	const table = document.getElementById("menu_items");

	const request_promise = CapacitorHttp.get(
		//options
		{
			url: `${server_url}:${server_port}/menu_items`,
		}
	).then(response => {
		console.log("Response Status: " + response.status);
		const data = response.data;
		// console.log(data);

		let placeholder = document.querySelector("#menu_items");
		let out = ""

		// iterate all data and display on a table
		for (let row of data) {
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
	}).catch((error, response) => {
		console.error(error);
		table.textContent = `Failed to establishment connection to\n${server_url}`;
	});
}

get_request_menu_items();
