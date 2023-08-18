const mysql = require("mysql2");

const connection = mysql.createConnection({
	host: "localhost",
	user: "algilbert",
	password: "Ilikefoods@123",
	database: "manage_db"
})

function check_connection(){
	connection.connect((err) => {
		if(err){
			return console.log(err.stack);
		}
		return console.log("MySql Connection Success");
	})
}

module.exports = {
	connection,
	check_connection
}
