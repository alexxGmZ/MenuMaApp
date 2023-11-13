import { CapacitorHttp } from '@capacitor/core';
import { fabric } from "fabric";
console.log("Server IP: ", sessionStorage.getItem("server_IP"));
console.log("Server Token: ", sessionStorage.getItem("server_api_token"));

// const server_url = "http://192.168.254.115";
const server_url = `http://${sessionStorage.getItem("server_IP")}`;
const server_token = sessionStorage.getItem("server_api_token");
const server_port = 8080;

let canvas;
const canvas_css_classes = "border-gray-200 border-2 rounded-lg dark:border-gray-700 mt-6 sm:order-1 sm:ml-0 sm:mr-4";

function get_menu_design() {
	console.log("called get_menu_design");
	return new Promise((resolve, reject) => {
		const request_promise = CapacitorHttp.get({
			url: `${server_url}:${server_port}/menu_design?api_token=${server_token}`,
		})
			.then(response => {
				// console.log("Response Status: " + response.status);
				const json_data = response.data;
				console.log(json_data);

				const canvas_element = document.createElement("canvas");
				canvas_element.id = "canvas";
				canvas_element.className = canvas_css_classes;
				canvas_element.width = json_data.canvas_width;
				canvas_element.height = json_data.canvas_height;

				// Append the canvas element to the container div
				const canvas_placeholder = document.querySelector("#canvas_area");
				canvas_placeholder.innerHTML = "";
				canvas_placeholder.appendChild(canvas_element);

				canvas = new fabric.Canvas("canvas");
				if (canvas) {
					canvas.loadFromJSON(json_data.canvas_objects, function() {
						// Callback function executed after the canvas is loaded
						// console.log("Canvas loaded from JSON.");
						canvas.renderAll(); // Render the canvas
					});
				}
				resolve();
			})
			.catch((error) => {
				console.error(error);
				reject(error);
			});
	})
}

get_menu_design();
