const crypto = require("crypto")

function login_dialog_open(redirect_site) {
	console.log(`called login_dialog_open(${redirect_site})`)

	const fav_dialog = document.getElementById("login_dialog");
	fav_dialog.classList.add("active-dialog");
	fav_dialog.classList.remove("hidden");

	document.getElementById("login_redirect_site").textContent = redirect_site;

	if (redirect_site === "inventory.html")
		document.getElementById("login_dialog_header").innerHTML = "Manage Menu Inventory";

	fav_dialog.showModal();
}

function login() {
	console.log("called login()");
	const redirect_site = document.getElementById("login_redirect_site").textContent;

	const login_username = document.getElementById("login_username").value.trim();
	const login_password = document.getElementById("login_password").value;
	const login_password_hash = crypto.createHash('sha256').update(login_password).digest('hex');

	const feature_privilege_map = {
		"inventory.html": "inventory_priv",
	}
	let feature_privilege = feature_privilege_map[redirect_site];

	const query = `SELECT name, password_hash, ${feature_privilege} FROM registered_employees WHERE name = "${login_username}"`;
	connection.query(query, (error, result) => {
		if (error) throw error;

		const user_data = result;

		// Error function if the username didn't exists
		if (user_data.length === 0) {
			dialog_open('login_invalid_username_dialog');
		}

		if (user_data.length > 0) {
			const user_row = user_data[0];
			const password = user_row.password_hash;
			const converted_hash_password = Buffer.from(password).toString('utf8');
			const feature_priv_status = user_row[feature_privilege];

			if (converted_hash_password === login_password_hash) {
				if (feature_priv_status === 1) {
					location.replace(redirect_site);
				}
				else {
					dialog_open('lack_access_privilege_dialog');
					// clear password input box
					document.getElementById("login_password").value = ""
				}
			}
			else {
				dialog_open('login_invalid_password_dialog');
				// clear password input box
				document.getElementById("login_password").value = ""
			}
		}
	});
}
