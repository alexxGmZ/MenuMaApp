import { CapacitorHttp } from '@capacitor/core';
import { fabric } from "fabric";
console.log("Server IP: ", sessionStorage.getItem("server_IP"));
console.log("Server Token: ", sessionStorage.getItem("server_api_token"));

// const server_url = "http://192.168.254.115";
const server_url = `http://${sessionStorage.getItem("server_IP")}`;
const server_token = sessionStorage.getItem("server_api_token");
const server_port = 8080;

let canvas;
const canvas_css_classes = "";

let menu_items;

window.addEventListener("DOMContentLoaded", () => {
	const cancel_order_quantity_dialog_button = document.getElementById("cancel_order_quantity_dialog");
	if (cancel_order_quantity_dialog_button) {
		cancel_order_quantity_dialog_button.addEventListener("click", function() {
			dialog_close("item_order_quantity_dialog");
			canvas.discardActiveObject();
		})
	}
})

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
					canvas.loadFromJSON(json_data.canvas_objects, function() {
						canvas.renderAll(); // Render the canvas
						const canvas_objects = canvas.getObjects();
						canvas_objects.forEach(object => {
							// lock the objects
							object.set({
								lockMovementX: true,
								lockMovementY: true,
								editable: false,
								resizable: false,
								hasBorders: false,
								hasControls: false
							})
						})
					});

					// scale the canvas in the android screen
					// NOTE: if there are scaling problems then this might be the culprit
					const scale = Math.min(window.innerWidth / json_data.canvas_width, window.innerHeight / json_data.canvas_height);
					canvas.setZoom(scale);

					get_selected_objects();
					get_menu_items();
				});

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
				console.log("menu_items:", menu_items);
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
		const selected_object = canvas.getActiveObject();
		console.log(`Selected object - Type: ${selected_object.type}, Object ID: ${selected_object.object_id}`);
		item_quantity_dialog(selected_object);
	});
}

var item_quantity_input_listener;
function item_quantity_dialog(selected_object) {
	if (selected_object && selected_object.group_id) {
		dialog_open("item_order_quantity_dialog");
		// update menu_items
		get_menu_items();

		const object_group_id = selected_object.group_id;
		menu_items.forEach(item => {
			if (item.item_id == object_group_id) {
				const item_name_span = document.getElementById("item_name");
				const item_price_span = document.getElementById("item_price");
				const item_cost_by_quantity_span = document.getElementById("item_cost_by_quantity");
				const item_quantity_select = document.getElementById("item_quantity");

				item_name_span.textContent = item.item_name;
				item_price_span.textContent = item.item_price;
				item_cost_by_quantity_span.textContent = item.item_price * item_quantity_select.value

				if (item_quantity_input_listener) {
					item_quantity_select.removeEventListener("change", item_quantity_input_listener);
					item_quantity_select.value = 1;
					item_cost_by_quantity_span.textContent = item.item_price;
				}
				item_quantity_input_listener = function() {
					item_cost_by_quantity_span.textContent = item.item_price * item_quantity_select.value
				}
				item_quantity_select.addEventListener("change", item_quantity_input_listener);

			}
		})
	}
}

function dialog_open(element_id) {
	console.log(`called dialog_open(${element_id})`);
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.classList.add("active-dialog");
	fav_dialog.showModal();
}

function dialog_close(element_id) {
	console.log(`called dialog_close(${element_id})`);
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.classList.remove("active-dialog");
	fav_dialog.close();
}

get_menu_design();
