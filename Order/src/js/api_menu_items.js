import { CapacitorHttp } from '@capacitor/core';

const server_url = "http://192.168.254.115";
const server_port = 8080;

function get_request_menu_items() {
	const json_container = document.getElementById("menu_items");

	const request_promise = CapacitorHttp.get(
		//options
		{
			url: `${server_url}:${server_port}/menu_items`,
		}
	).then(response => {
		console.log("Response Status: " + response.status);
		console.log(response.data);

		// display data in the html page
		// const display_data = JSON.stringify(response.data, null, 2)
		json_container.textContent = response.data;
	}).catch((error, response) => {
		console.error(error);
		json_container.textContent = `Failed to establishment connection to\n${server_url}`;
	});
}

get_request_menu_items();
