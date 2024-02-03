// TODO: create a login session and a logout functionality

function login_dialog_open(redirect_site) {
	console.log(`called login_dialog_open(${redirect_site})`)

	const employee_name = sessionStorage.getItem("employee_name");

	// check if an employee is logged in
	if (!employee_name || employee_name === "") {
		console.log("not logged in");
		// dialog_open("login_dialog");
		const fav_dialog = document.getElementById("login_dialog");
		fav_dialog.classList.add("active-dialog");
		fav_dialog.classList.remove("hidden");

		document.getElementById("login_redirect_site").textContent = redirect_site;

		if (redirect_site === "inventory.html")
			document.getElementById("login_dialog_header").innerHTML = "Manage Menu Items";
		if (redirect_site === "registration.html")
			document.getElementById("login_dialog_header").innerHTML = "Manage Users/Employee";
		if (redirect_site === "kiosk-devices.html")
			document.getElementById("login_dialog_header").innerHTML = "Manage Kiosk Devices";
		if (redirect_site === "order-history.html")
			document.getElementById("login_dialog_header").innerHTML = "Order History and Statistics";
		if (redirect_site === "designer.html")
			document.getElementById("login_dialog_header").innerHTML = "Menu/Kiosk Designer";

		fav_dialog.showModal();
	}
	else {
		console.log("logged in");
		location.replace(redirect_site);
	}
}

function login_user() {
	console.log("called login_user()");

	const login_username = document.getElementById("login_username").value.trim();
	const login_password = document.getElementById("login_password").value;
	const login_password_hash = crypto.createHash('sha256').update(login_password).digest('hex');
	// console.log(login_username, login_password, login_password_hash);

	const redirect_site = document.getElementById("login_redirect_site").textContent;
	console.log("redirect_site", redirect_site);
	const feature_privilege_map = {
		"inventory.html": "inventory_priv",
		"registration.html": "manage_employee_priv",
		"kiosk-devices.html": "manage_devices_priv",
		"order-history.html": "view_reports_priv",
		"designer.html": "design_priv",
	}
	let feature_privilege = feature_privilege_map[redirect_site];
	console.log("feature_privilege", feature_privilege);

	let query = `SELECT name, password_hash, ${feature_privilege} FROM registered_employees WHERE name = "${login_username}"`;
	if (!feature_privilege || feature_privilege === "")
		query = `SELECT name, password_hash FROM registered_employees WHERE name = "${login_username}"`;

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
					console.log("logged in");
					location.replace(redirect_site);
				}
				else {
					if (!redirect_site || redirect_site === "") {
						console.log("logged in");
						location.replace(window.location.href);
					}
					else {
						console.log("not logged in");
						dialog_open('lack_access_privilege_dialog');
					}
					// clear password input box
					document.getElementById("login_password").value = "";
				}
			}
			else {
				dialog_open('login_invalid_password_dialog');
				// clear password input box
				document.getElementById("login_password").value = "";
			}
		}
	});
}

function logout_user() {

}
