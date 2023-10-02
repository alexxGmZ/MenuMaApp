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
					<td>
						<table class="border-separate border-spacing-2 border border-slate-500 rounded-lg bg-amber-200 rounded-lg">
						<td><center><h1 class="font-bold">Order #${orders.queue_number}</h1></center></td>
						<tr>
						<td>
							<ul>
								<li><textarea disabled class="h-48 pl-2 bg-white rounded-lg">${removed_comma}</textarea></li>
							</ul>
						</td>
						</tr>
						<tr>
						<td>Customer: ${orders.customer_name}</td>
						</tr>
						<tr>
						<td style="padding-top: 5px; padding-bottom: 5px;">Total: ₱${orders.total_price}</td>
						</table>
					</td>
				`;
				document.querySelector("#order-list").insertAdjacentHTML('beforeend', markup);
			})
		})
		.catch(error => console.log(error));
}

