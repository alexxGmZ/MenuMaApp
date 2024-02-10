// TODO:
// (/) create a login session and a logout functionality.
// (/) create a proper page redirection when an employee is successfully logged in
//     based on the page clicked and their corresponding access rights.

const login_button = document.getElementById("login_button");
const user_span = document.getElementById("user_span");
const user_name = document.getElementById("user_name");
const logout_button = document.getElementById("logout_button");

// if a user is still logged in then show logout button, else show login button
if (sessionStorage.getItem("employee_name")) {
	login_button.classList.add("d-none");
	logout_button.classList.remove("d-none");

	// set navbar username
	user_span.classList.remove("d-none");
	user_name.textContent = sessionStorage.getItem("employee_name");
}

function login_dialog_open(redirect_site) {
	console.log(`called login_dialog_open(${redirect_site})`);

	const employee_name = sessionStorage.getItem("employee_name");
	const login_dialog = document.getElementById("login_dialog");

	if (!employee_name || employee_name === "") {
		console.log("not logged in");
		login_dialog.classList.add("active-dialog");
		login_dialog.classList.remove("d-none");

		document.getElementById("login_redirect_site").textContent = redirect_site;

		const login_dialog_header = document.getElementById("login_dialog_header");
		const siteHeaders = {
			"inventory_revised.html": "Manage Menu Items",
			"registration_revised.html": "Manage Users/Employee",
			"kiosk-devices.html": "Manage Kiosk Devices",
			"order-history-revised.html": "Order History and Statistics",
			"designer_revised.html": "Menu/Kiosk Designer"
		};

		login_dialog_header.innerHTML = siteHeaders[redirect_site] || "";
		login_dialog.showModal();
	}
	else {
		// console.log("logged in");
		process_site_access_rights(redirect_site);
		login_button.classList.add("d-none");
		logout_button.classList.remove("d-none");
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
			toggle_warn_banner("user");
			// clear password input box
			document.getElementById("login_password").value = "";
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
				// console.log("employee_rights", employee_rights);

				// store employee credentials to session variables
				sessionStorage.setItem("employee_name", employee_row.name);
				sessionStorage.setItem("employee_rights", JSON.stringify(employee_rights));
				// location.replace(redirect_site);
				process_site_access_rights(redirect_site);

				// hide login button, show logout button
				login_button.classList.add("d-none");
				logout_button.classList.remove("d-none");

				// set navbar username
				user_span.classList.remove("d-none");
				user_name.textContent = sessionStorage.getItem("employee_name");
			}
			else {
				toggle_warn_banner("password");
				// clear password input box
				document.getElementById("login_password").value = "";
			}
		}
	});
}

function process_site_access_rights(site) {
	console.log(`called process_site_access_rights(${site})`);
	const employee_rights = JSON.parse(sessionStorage.getItem("employee_rights"));
	// console.log("employee_rights", employee_rights);

	const site_access_rights_map = {
		"designer_revised.html": "designer",
		"inventory_revised.html": "menu_items",
		"order-history-revised.html": "reports",
		"registration_revised.html": "manage_users",
		"kiosk-devices.html": "manage_devices",
	};

	const required_site_rights = site_access_rights_map[site];

	if (required_site_rights && employee_rights[required_site_rights] === 1) {
		// console.log(`redirect to ${site}`);
		location.replace(site);
	}
	// if the navbar login button is clicked then redirect to main_revised.html
	else if (site === "")
		location.replace("main_revised.html");
	else {
		dialog_close("login_dialog")
		dialog_open("lack_access_privilege_dialog");
	}
}

function logout_user() {
	console.log("called logout_user()");
	sessionStorage.removeItem("employee_name");
	sessionStorage.removeItem("employee_rights");
	location.replace("main_revised.html");

	// hide login button, show logout button
	login_button.classList.remove("d-none");
	logout_button.classList.add("d-none");

	// hide navbar user name
	user_span.classList.add("d-none");
	user_name.textContent = "";
}

function toggle_warn_banner(warning) {
	console.log(`called toggle_warn_banner(${warning})`)
	const warning_banner = document.getElementById("login_dialog_warn_banner");
	const warning_user = document.getElementById("login_dialog_warn_user");
	const warning_password = document.getElementById("login_dialog_warn_password");
	const warning_access = document.getElementById("login_dialog_warn_access");

	warning_banner.classList.add("d-none");
	warning_user.classList.add("d-none");
	warning_password.classList.add("d-none");
	warning_access.classList.add("d-none");

	if (warning === "user") {
		warning_banner.classList.remove("d-none");
		warning_user.classList.remove("d-none");
	}
	else if (warning === "password") {
		warning_banner.classList.remove("d-none");
		warning_password.classList.remove("d-none");
	}
	else {
		console.log("Parameters: user, password");
	}
}

