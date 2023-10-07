document.addEventListener("DOMContentLoaded", function() {
	display_orders();
});

function display_orders() {
	fetch('http://localhost:8080/orders')
		.then(res => {
			return res.json();
		})
		.then(data => {
			console.log(data)
			data.forEach(orders => {

				const food_items = orders.items_ordered.map((item) => {
					return `${item.quantity} ${item.item_name}\n`;
				})
				console.log(food_items);

				const removed_comma = food_items.join('');
				console.log(removed_comma);

				const markup = `
					<tr class="bg-amber-200 border-b dark:border-gray-700 hover:bg-gray-300">
						<td class="text-center">${orders.queue_number}</td>
						<td class="text-center bg-slate-50 rounded-lg">${removed_comma}</td>
						<td class="text-center">${orders.customer_name}</td>
						<td class="text-center">${orders.total_price}</td>
						<td>
							<center>
								<button onclick="location.reload()" class="font-bold rounded-full bg-green-500 mt-2 py-2 px-2 hover:text-zinc-50 hover:drop-shadow-lg w-3/4 flex items-center justify-center">
									<img src="assets/svg/check-circle.svg" class="hover:text-zinc-50">
									<span class="mx-2"> DONE </span>
								</button>
							</center>
							<center>
								<button onclick="dialog_open('cancel_order_dialog')" class="font-bold rounded-full bg-red-500 mt-2 py-2 px-2 hover:text-zinc-50 hover:drop-shadow-lg w-3/4 flex items-center justify-center">
									<img src="assets/svg/x-circle.svg" class="hover:text-zinc-50">
									<span class="mx-2"> CANCEL </span>
								</button>
							</center>
						</td>
					</tr>
				`;
				document.querySelector("#order-list").insertAdjacentHTML('beforeend', markup);
			})
		})
		.catch(error => console.log(error));
}

// Get data from table
function row_click() {
	// find the clicked row
	var table = document.getElementById("order_table");
	var rows = table.getElementsByTagName("tr");

	for (let i = 0; i < rows.length; i++) {
		var currentRow = table.rows[i];
		var clickHandle = function(row) {
			return function() {
				var ordered_number = row.getElementsByTagName("td")[0];
				var order = ordered_number.innerHTML;

				var ordered_items = row.getElementsByTagName("td")[1];
				var items = ordered_items.innerHTML;

				var ordered_cutomer_name = row.getElementsByTagName("td")[2];
				var customers = ordered_cutomer_name.innerHTML;

				var ordered_total_price = row.getElementsByTagName("td")[3];
				var total_price = ordered_total_price.innerHTML;

				console.log(order + " " + items + " " + customers + " " + total_price);
			};
		};
		currentRow.onclick = clickHandle(currentRow);
	}
}

// Open Dialog
function dialog_open(element_id) {
	const fav_dialog = document.getElementById(element_id);



	fav_dialog.showModal();
}

// Close Dialog
function dialog_close(element_id) {
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.close();
}

function order_done() {

}

function order_cancel() {

}
