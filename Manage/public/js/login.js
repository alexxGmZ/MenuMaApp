// TODO:
// (/) create a login session and a logout functionality.
// ( ) create a proper page redirection when an employee is successfully logged in
//     based on the page clicked and their corresponding access rights.

function login_dialog_open(redirect_site) {
	console.log(`called login_dialog_open(${redirect_site})`)

	const employee_name = sessionStorage.getItem("employee_name");

	// check if an employee is logged in
	if (!employee_name || employee_name === "") {
		console.log("not logged in");
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
		if (!redirect_site || redirect_site === "")
			location.replace("main.html");
		else
			location.replace(redirect_site);
	}
}

function login_user() {
	console.log("called login_user()");
	const login_username = document.getElementById("login_username").value.trim();
	const login_password = document.getElementById("login_password").value;
	const login_password_hash = crypto.createHash('sha256').update(login_password).digest('hex');
	const redirect_site = document.getElementById("login_redirect_site").textContent;

	const query = `select * from manage_db.registered_employees where name = "${login_username}"`;
	connection.query(query, (error, result) => {
		if (error) throw error;

		const employee_data = result;
		if (employee_data.length === 0) {
			dialog_open('login_invalid_username_dialog');
		}
		else {
			const employee_row = employee_data[0];
			const user_password_hash = Buffer.from(employee_row.password_hash).toString("utf8");
			if (user_password_hash === login_password_hash) {
				console.log("logged in");
				const employee_rights = {
					"designer": employee_row.design_priv,
					"menu_items": employee_row.inventory_priv,
					"reports": employee_row.view_reports_priv,
					"manage_users": employee_row.manage_employee_priv,
					"manage_devices": employee_row.manage_devices_priv
				}
				console.log("employee_rights", employee_rights);

				// store employee credentials to session variables
				sessionStorage.setItem("employee_name", employee_row.name);
				sessionStorage.setItem("employee_rights", JSON.stringify(employee_rights));
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
	console.log("called logout_user()");
	sessionStorage.removeItem("employee_name");
	sessionStorage.removeItem("employee_rights");
	location.replace("main.html");
}
