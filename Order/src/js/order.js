import { CapacitorHttp } from '@capacitor/core';
import { fabric } from "fabric";
import { hideStatusBar } from './statusbar';
import { keepAwake } from './keep_awake';

console.log("Server IP: ", sessionStorage.getItem("server_IP"));
console.log("Server Token: ", sessionStorage.getItem("server_api_token"));

// const server_url = "http://192.168.254.115";
const server_url = `http://${sessionStorage.getItem("server_IP")}`;
const server_token = sessionStorage.getItem("server_api_token");
const server_port = 8080;

var canvas;
const canvas_css_classes = "border-b";

var menu_items;
var picked_items = [];

// forcse screen orientation to landscape
window.screen.orientation.lock('landscape');
window.addEventListener("DOMContentLoaded", () => {
	get_menu_design();
	hideStatusBar();
	keepAwake();
	toggle_sidebar();
	display_items_picked();
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
				// console.log(json_data);
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
							});
						});
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

// NOTE: this might serve as an item verification when ordering
// it is to make sure that the item exist in the Manage server
// it will use the menu_items_lite api endpoint to keep the data received light
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
				// console.log("menu_items:", menu_items);
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
		hideStatusBar();
		const selected_object = canvas.getActiveObject();
		// open quantity dialog when an opbject with group_id property is touched
		item_quantity_dialog(selected_object);
	});
}

var item_quantity_input_listener;
var item_quantity_minus_listener;
var item_quantity_plus_listener;
var item_pick_button_listener;
function item_quantity_dialog(selected_object) {
	if (selected_object && selected_object.group_id) {
		console.log(`Selected object - Type: ${selected_object.type}, Object ID: ${selected_object.object_id}`);

		// update menu_items
		get_menu_items();
		const object_group_id = selected_object.group_id;
		menu_items.forEach(item => {
			// codition to make sure that the object exists in the inventory
			if (item.item_id == object_group_id) {
				dialog_open("item_order_quantity_dialog");
				const item_name_span = document.getElementById("item_name");
				const item_price_span = document.getElementById("item_price");
				const item_cost_by_quantity_span = document.getElementById("item_cost_by_quantity");
				const item_quantity_count = document.getElementById("item_quantity_count");

				const item_quantity_range = document.getElementById("item_quantity_range");
				const item_quantity_range_min = parseInt(item_quantity_range.min);
				const item_quantity_range_max = parseInt(item_quantity_range.max);
				const item_quantity_range_step = parseInt(item_quantity_range.step);

				// initial values to be displayed after opening the dialog
				item_name_span.textContent = item.item_name;
				item_price_span.textContent = item.item_price;
				item_cost_by_quantity_span.textContent = item.item_price * parseInt(item_quantity_range.value);
				item_quantity_count.textContent = item_quantity_range.value;

				// handle quantity range input
				if (item_quantity_range) {
					if (item_quantity_input_listener) {
						item_quantity_range.removeEventListener("input", item_quantity_input_listener);
						item_quantity_count.textContent = 1
						item_quantity_range.value = 1;
						item_cost_by_quantity_span.textContent = item.item_price;
					}
					item_quantity_input_listener = function() {
						console.log("called item_quantity_input_listener()");
						item_cost_by_quantity_span.textContent = item.item_price * item_quantity_range.value;
						item_quantity_count.textContent = item_quantity_range.value;
					}
					item_quantity_range.addEventListener("input", item_quantity_input_listener);
				}

				// handle quantity minus button
				const item_quantity_minus = document.getElementById("item_quantity_minus");
				if (item_quantity_minus) {
					if (item_quantity_minus_listener) {
						item_quantity_minus.removeEventListener("click", item_quantity_minus_listener);
					}
					item_quantity_minus_listener = function() {
						if (parseInt(item_quantity_range.value) <= item_quantity_range_min) return;
						console.log("called item_quantity_minus_listener()");
						item_quantity_range.value = parseInt(item_quantity_range.value) - item_quantity_range_step;
						item_cost_by_quantity_span.textContent = item.item_price * item_quantity_range.value;
						item_quantity_count.textContent = item_quantity_range.value;
					}
					item_quantity_minus.addEventListener("click", item_quantity_minus_listener);
				}

				// handle quantity plus button
				const item_quantity_plus = document.getElementById("item_quantity_plus");
				if (item_quantity_plus) {
					if (item_quantity_plus_listener) {
						item_quantity_plus.removeEventListener("click", item_quantity_plus_listener);
					}
					item_quantity_plus_listener = function() {
						if (parseInt(item_quantity_range.value) >= item_quantity_range_max) return;
						console.log("called item_quantity_plus_listener()");
						item_quantity_range.value = parseInt(item_quantity_range.value) + item_quantity_range_step;
						item_cost_by_quantity_span.textContent = item.item_price * item_quantity_range.value;
						item_quantity_count.textContent = item_quantity_range.value;
					}
					item_quantity_plus.addEventListener("click", item_quantity_plus_listener);
				}

				// handle pick button
				const item_pick_button = document.getElementById("item_pick_button");
				if (item_pick_button) {
					if (item_pick_button_listener) {
						item_pick_button.removeEventListener("click", item_pick_button_listener);
					}
					// NOTE: needs to optimize the function especially when inserting objects
					// that are already in the picked_items
					item_pick_button_listener = function() {
						console.log("called item_pick_button_listener()");
						dialog_close("item_order_quantity_dialog");
						// console.log("item_picked:", item);
						let item_details = {
							"item_id": item.item_id,
							"item_name": item.item_name,
							"item_price": item.item_price,
							"item_cost": parseInt(item_cost_by_quantity_span.textContent),
							"item_quantity": parseInt(item_quantity_count.textContent)
						};
						// console.log(item_details);

						// if there's an identical item in picked items just increment the value of
						// item quantiy and item cost, if not then insert that item in picked items
						let item_found = false;
						picked_items.forEach(picked_item => {
							if (picked_item.item_id === item_details.item_id) {
								picked_item.item_quantity += item_details.item_quantity;
								picked_item.item_cost += item_details.item_cost;
								item_found = true;
							}
						})
						if (!item_found) picked_items.push(item_details);

						// display the total cost
						let total_cost = 0;
						picked_items.forEach(picked_item => {
							total_cost += picked_item.item_cost
						})
						const total_cost_span = document.getElementById("total_cost");
						total_cost_span.textContent = total_cost;

						// render the items picked table
						display_items_picked();
					}
					item_pick_button.addEventListener("click", item_pick_button_listener);
				}
			}
		})

		// cancel button
		const cancel_order_quantity_dialog_button = document.getElementById("cancel_order_quantity_dialog");
		if (cancel_order_quantity_dialog_button) {
			cancel_order_quantity_dialog_button.addEventListener("click", function() {
				dialog_close("item_order_quantity_dialog");
				canvas.discardActiveObject();
			})
		}
	}
}

function display_items_picked() {
	console.log("called display_items_picked()");
	var placeholder = document.querySelector("#items_picked_list");
	var out = "";
	for (let item of picked_items) {
		// console.log(item);
		out += `
			<tr class="border-b">
				<td>
					<button class="">
						cancel
					</button>
				</td>
				<td data-column="" class="text-center">${item.item_name}</td>
				<td data-column="" class="text-center font-bold">${item.item_quantity}</td>
				<td data-column="" class="text-center">${item.item_price}</td>
				<td data-column="" class="text-center">${item.item_cost}</td>
			</tr>
		`
	}
	placeholder.innerHTML = out;
}

function toggle_sidebar() {
	const toggle_sidebar_full = document.getElementById("toggle_sidebar_full");
	if (toggle_sidebar_full) {
		toggle_sidebar_full.addEventListener("click", function() {
			document.getElementById("minimal_sidebar").classList.add("hidden");
			document.getElementById("full_sidebar").classList.remove("hidden");
			document.getElementById("full_sidebar").classList.add("grid");
		})
	}

	const toggle_sidebar_min = document.getElementById("toggle_sidebar_min");
	if (toggle_sidebar_min) {
		toggle_sidebar_min.addEventListener("click", function() {
			document.getElementById("minimal_sidebar").classList.remove("hidden");
			document.getElementById("full_sidebar").classList.add("hidden");
		})
	}
}

function dialog_open(element_id) {
	console.log(`called dialog_open(${element_id})`);
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.classList.add("active-dialog");
	fav_dialog.classList.remove("hidden");
	fav_dialog.showModal();
}

function dialog_close(element_id) {
	console.log(`called dialog_close(${element_id})`);
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.classList.remove("active-dialog");
	fav_dialog.classList.add("hidden");
	fav_dialog.close();
}

