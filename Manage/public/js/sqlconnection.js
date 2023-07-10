function testsql()
{

	var mysql = require('mysql2');

	var connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "1234",
		database: "manage_db"
	});

	connection.connect((err) => {
		if (err) {
			return console.log(err.stack);
		}
		console.log("Connection Success");
	});

	// Queries Will be executed //

	$queryString = 'SELECT * FROM manage_db.menu_item;';
	connection.query($queryString, (err, rows, fields) => {

		if(err) {
			return console.log(err.stack)
		}

		console.log(rows);

	});

	// ------------------------ //

	connection.end(() => {
		console.log("Connection Closed");
	});
}
