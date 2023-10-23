// const { document } = require("postcss");

window.addEventListener("DOMContentLoaded", () => {
	const connect_button = document.getElementById("connect_button");
	if (connect_button) {
		connect_button.addEventListener("click", () => {
			set_server_connection();
		});
	}
})

function set_server_connection() {
	console.log("called set_server_connection()");
	const input_server_ip = document.getElementById("server_ip").value.trim();
	const input_api_token = document.getElementById("api_token").value.trim();

	// warning if the input box is empty
	if (!is_valid_ipv4(input_server_ip))
		return alert("Invalid Local IP Address");

	if (input_api_token == 0)
		return alert("Enter Server Connection Token");


	if (navigator.onLine) {
		const url = `http://${input_server_ip}:8080/?api_token=${input_api_token}`;
		console.log("URL: " + url);
		fetch(url)
			.then(response => {
				if (response.status == 200) {
					console.log(`Server at ${url} is reachable`);
					sessionStorage.setItem("server_IP", input_server_ip);
					sessionStorage.setItem("server_api_token", input_api_token);
					window.location.href = "menu_items.html";
				}
				else {
					console.log(`Server at ${url} is unreachable`);
					alert(`Connection Failed: ${input_server_ip} is unreachable`);
				}
			})
			.catch(error => {
				console.error(`Error while reaching the server at ${url}: ${error}`);
				alert(`Connection Failed: ${input_server_ip} is unreachable`);
			})
	}
	else {
		console.error("You are currently offline. Check your network connection.");
		alert(`Connection Failed: You are currently offline. Check your network connection`);
	}
}

function is_valid_ipv4(ip) {
	console.log("called is_valid_ipv4()")
	const ipv4_pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
	return ipv4_pattern.test(ip);
}
