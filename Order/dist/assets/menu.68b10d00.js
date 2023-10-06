import { C as CapacitorHttp } from "./network_status.120cfa29.js";
const server_url = "http://192.168.254.115";
const server_port = 8080;
let menu_items_data = [];
function get_request_menu_items() {
  return new Promise((resolve, reject) => {
    CapacitorHttp.get({
      url: `${server_url}:${server_port}/menu_items`
    }).then((response) => {
      console.log("Response Status: " + response.status);
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
  let placeholder = document.querySelector("#menu_items");
  let out = "";
  for (let row of menu_items_data) {
    out += `
			<tr class="">
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
