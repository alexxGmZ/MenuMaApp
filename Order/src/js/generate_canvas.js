import { CapacitorHttp } from '@capacitor/core';
import { fabric } from "fabric";
console.log("Server IP: ", sessionStorage.getItem("server_IP"));
console.log("Server Token: ", sessionStorage.getItem("server_api_token"));

// const server_url = "http://192.168.254.115";
const server_url = `http://${sessionStorage.getItem("server_IP")}`;
const server_token = sessionStorage.getItem("server_api_token");
const server_port = 8080;

let canvas;
const canvas_css_classes = "border-gray-200 border-2 rounded-lg dark:border-gray-700";

let menu_items;

function get_menu_design() {
	console.log("called get_menu_design()");
	return new Promise((resolve, reject) => {
		const request_promise = CapacitorHttp.get({
			url: `${server_url}:${server_port}/menu_design?api_token=${server_token}`,
		})
			.then(response => {
				// console.log("Response Status: " + response.status);
				const json_data = response.data;
				console.log(json_data);

				generate_canvas_area(json_data.canvas_height, json_data.canvas_width, function() {
					get_selected_objects();
					get_menu_items();
				});
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

// this might serve as an item verification when ordering
// it is to make sure that the item exist in the Manage server
// it will use the menu_items_lite endpoint to keep the data received light
function get_menu_items() {
	console.log("called get_menu_items()");
	return new Promise((resolve, reject) => {
		const request_promise = CapacitorHttp.get({
			url: `${server_url}:${server_port}/menu_items_lite?api_token=${server_token}`,
		})
			.then(response => {
				// console.log("Response Status: " + response.status);
				const json_data = response.data;
				menu_items = json_data;
				console.log(menu_items);
				resolve();
			})
			.catch((error) => {
				console.error(error);
				reject(error);
			});
	})
}

function generate_canvas_area(canvas_height, canvas_width, callback) {
	console.log("called generate_canvas_area()");

	const canvas_element = document.createElement("canvas");
	canvas_element.id = "canvas";
	canvas_element.className = canvas_css_classes;
	// canvas_element.width = canvas_width;
	// canvas_element.height = canvas_height;

	// Append the canvas element to the container div
	const canvas_placeholder = document.querySelector("#canvas_area");
	canvas_placeholder.innerHTML = "";
	canvas_placeholder.appendChild(canvas_element);

	canvas = new fabric.Canvas("canvas", {
		preserveObjectStacking: true,
		height: canvas_height,
		width: canvas_width,
		selection: false,
	});

	if (canvas) {
		if (typeof callback === "function") callback();
	}
}

function get_selected_objects() {
	if (!canvas) return;
	console.log("called get_selected_objects()");

	canvas.on('mouse:up', function(event) {
		const selected_objects = canvas.getActiveObjects();

		if (selected_objects.length > 0) {
			// Objects were selected
			// console.log('Selected object/s:', selected_objects);
			selected_objects.forEach(object => {
				console.log(`Selected object - Type: ${object.type}, Object ID: ${object.object_id}`);
			})
		}
	});
}

get_menu_design();
