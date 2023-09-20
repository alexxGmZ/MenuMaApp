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
					return `${item.quantity} ${item.item_name}`;
				})
				console.log(food_items);

				const markup = `
					<td>
						<table class="border-separate border-spacing-2 border border-slate-500 rounded-lg">
						<td><h1 style="padding-top: 5px; padding-bottom: 5px;">Order #${orders.queue_number}</h1></td>
						<tr>
						<td>
							<ul>
								<li>${food_items}</li>
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

