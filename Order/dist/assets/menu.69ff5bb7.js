import { C as CapacitorHttp } from "./index.c62c6e15.js";
console.log("Server IP: ", sessionStorage.getItem("server_IP"));
console.log("Server Token: ", sessionStorage.getItem("server_api_token"));
const server_url = `http://${sessionStorage.getItem("server_IP")}`;
const server_token = sessionStorage.getItem("server_api_token");
const server_port = 8080;
let menu_items_data = [];
function get_request_menu_items() {
  console.log("called get_request_menu_items()");
  return new Promise((resolve, reject) => {
    CapacitorHttp.get({
      url: `${server_url}:${server_port}/menu_items?api_token=${server_token}`
    }).then((response) => {
      menu_items_data = response.data;
      resolve();
    }).catch((error) => {
      console.error(error);
      const table = document.getElementById("menu_items");
      table.textContent = `Failed to establishment connection to
${server_url}`;
      reject(error);
    });
  });
}
function display_menu_items() {
  console.log("called display_menu_items()");
  let placeholder = document.querySelector("#menu_items");
  let out = "";
  for (let row of menu_items_data) {
    out += `
			<tr class="">
				<td class="hidden">${row.item_id}</td>
				<td class="">${row.item_name}</td>
				<td class="">${row.item_desc}</td>
				<td><img src="${row.item_image}" alt="Item Image"></td>
				<td class="">${row.item_price}</td>
			</tr>
		`;
  }
  placeholder.innerHTML = out;
}
get_request_menu_items().then(() => {
  display_menu_items();
}).catch((error) => {
  console.log(error);
});
const pullToRefresh = document.querySelector(".pull-to-refresh");
let touchstartY = 0;
document.addEventListener("touchstart", (e) => {
  touchstartY = e.touches[0].clientY;
});
document.addEventListener("touchmove", (e) => {
  const touchY = e.touches[0].clientY;
  const touchDiff = touchY - touchstartY;
  if (touchDiff > 0 && window.scrollY === 0) {
    pullToRefresh.classList.add("visible");
    e.preventDefault();
  }
});
document.addEventListener("touchend", (e) => {
  if (pullToRefresh.classList.contains("visible")) {
    pullToRefresh.classList.remove("visible");
    location.reload();
  }
});
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
      console.log("Order Reset Button clicked");
    });
  }
  row_click();
});
function row_click() {
  const table = document.getElementById("menu_items_table");
  if (table) {
    table.addEventListener("click", (event) => {
      console.log("table row is clicked");
      const clickedRow = event.target.closest("tr");
      if (clickedRow) {
        const cells = clickedRow.querySelectorAll("td");
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
function order_send() {
  console.log("called order_send()");
}
