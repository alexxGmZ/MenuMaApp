window.addEventListener("DOMContentLoaded", () => {
	const connect_button = document.getElementById("connect_button");
	if (connect_button) {
		connect_button.addEventListener("click", () => {
			set_server_IP();
		});
	}

	// set_server_IP();
})

document.addEventListener("DOMContentLoaded", () => {
	const connection_failed_dialog_cancel = document.getElementById("connection_failed_dialog_cancel");
	if (connection_failed_dialog_cancel) {
		connection_failed_dialog_cancel.addEventListener("click", () => {
			dialog_close("connection_failed_dialog");
		})
	}
})

window.server_IP = ""

function set_server_IP() {
	const input_element = document.getElementById("server_ip");
	if (input_element) {
		window.server_IP = input_element.value;
	}

	console.log(window.server_IP);

	if (navigator.onLine) {
		const url = `http://${window.server_IP}:8080/`;
		fetch(url)
			.then(response => {
				if (response.status == 200) {
					console.log(`Server at ${url} is reachable`);
					window.location.href = "menu_items.html";
				}
				else {
					console.log(`Server at ${url} is unreachable`);
					// dialog_open("connection_failed_dialog");
					alert("Connection Failed");
				}
			})
			.catch(error => {
				console.error(`Error while reaching the server at ${url}: ${error}`);
				// dialog_open("connection_failed_dialog");
				alert("Connection Failed");
			})
	}
	else {
		console.error("You are currently offline. Check your network connection.");
		// dialog_open("connection_failed_dialog");
		alert("Connection Failed");
	}
}

function dialog_open(element_id) {
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.showModal();
}

function dialog_close(element_id) {
	const fav_dialog = document.getElementById(element_id);
	if (fav_dialog)
		fav_dialog.close();
}
