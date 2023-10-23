window.addEventListener("DOMContentLoaded", () => {
	const order_send_button = document.getElementById("order_send_button");
	if (order_send_button) {
		order_send_button.addEventListener("click", () => {
			order_send();
		});
	}

	const order_reset_button = document.getElementById("order_reset_button");
	if (order_reset_button) {
		order_reset_button.addEventListener("click", () => {
			console.log("Order Reset Button clicked")
		});
	}

	row_click();
})
let items_picked = [];

function row_click() {
	const table = document.getElementById("menu_items_table");

	if (table) {
		table.addEventListener("click", (event) => {
			console.log("table row is clicked");
			const clickedRow = event.target.closest("tr");

			if (clickedRow) {
				const cells = clickedRow.querySelectorAll("td");
				// console.log(cells);
				const item_id = cells[0].textContent;
				const item_name = cells[1].textContent;
				const item_price = cells[4].textContent;
				console.log("Item ID: " + item_id);
				console.log("Item Name: " + item_name);
				console.log("Item Price: " + item_price);
			}
		});
	}
}

function display_items_picked() {
	console.log("called display_items_picked()");
}

function order_send() {
	console.log("called order_send()");
}
