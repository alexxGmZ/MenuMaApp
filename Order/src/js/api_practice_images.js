import { CapacitorHttp } from '@capacitor/core';

const server_url = "http://192.168.254.115";
const server_port = 8080;

function get_request_shitty_images() {
	// const json_container = document.getElementById("shitty_images");
	const image_container = document.getElementById("shitty_images");

	const request_promise = CapacitorHttp.get(
		//options
		{
			url: `${server_url}:${server_port}/shitty-images`,
		}
	).then(response => {
		console.log("Response Status: " + response.status);
		console.log(response.data);
		const imageDataUrls = response.data.images;

		// Clear existing content in the imageContainer
		image_container.innerHTML = '';

		// Loop through the array of image data URLs and create img elements
		for (const imageDataUrl of imageDataUrls) {
			const img = document.createElement('img');
			img.src = imageDataUrl;
			img.alt = 'Shitty Image';

			// Append each image to the imageContainer
			image_container.appendChild(img);
		}

		// display data in the html page
		// const display_data = JSON.stringify(response.data, null, 2)
		// json_container.innerHTML = response.data;
	}).catch((error, response) => {
		console.error(error);
		// json_container.textContent = `Failed to establishment connection to\n${server_url}`;
	});
}

get_request_shitty_images();
