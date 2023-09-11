import { CapacitorHttp } from '@capacitor/core';

function get_request_menu_items() {
	const request_promise = CapacitorHttp.get(
		{
			url: "http://192.168.254.115:8080/menu_items",
		}
	).then(response => {
		console.log("Response Status: " + response.status);
		console.log(response.data);

		// display data in the html page
		const display_data = JSON.stringify(response.data, null, 2)
		const json_container = document.getElementById("menu_items");
		json_container.textContent = display_data;
	}).catch(error => {
		console.error("An error occurred: ", error)
	});
}

get_request_menu_items();
