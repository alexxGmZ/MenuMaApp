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
								<li><textarea disabled class="h-56 pl-2 bg-white rounded-lg" style="resize: none;">${removed_comma}</textarea></li>
							</ul>
						</td>
						</tr>
						<tr>
						<td>Customer: ${orders.customer_name}</td>
						</tr>
						<tr>
						<td style="padding-top: 5px; padding-bottom: 5px;">Total: ₱${orders.total_price}</td>
						</table>
						<table>
						<ul>
							<li>
							<center><button onclick="location.reload()" class="font-bold rounded-full bg-green-500 mt-2 py-2 px-2 hover:text-zinc-50 hover:drop-shadow-lg w-3/4 flex items-center justify-center">
								<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span class="mx-2"> DONE </span>
							</button></center>
							</li>
							<li>
							<center><button onclick="location.reload()" class="font-bold rounded-full bg-red-500 mt-2 py-2 px-2 hover:text-zinc-50 hover:drop-shadow-lg w-3/4 flex items-center justify-center">
								<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span class="mx-2"> CANCEL </span>
							</button></center>
							</li>
						</ul>
						</table>
					</td>
				`;
				document.querySelector("#order-list").insertAdjacentHTML('beforeend', markup);
			})
		})
		.catch(error => console.log(error));
}

