document.addEventListener("DOMContentLoaded", function() {
	// put something if needed
});

// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js");
// create database connection
const connection = mysql.connection;
// check database connection
mysql.check_connection();



// open modal dialog based on element id
function dialog_open(element_id) {
    const fav_dialog = document.getElementById(element_id);

    fav_dialog.showModal();
}

// close modal dialog based on element id
function dialog_close(element_id) {
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.close();
}