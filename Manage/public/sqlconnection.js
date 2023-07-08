document.getElementById("btn").addEventListener("click", () => {

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: 1234,
        database: "manage_db"
    });

    connection.connect((err) => {
        if (err) {
            return console.log(err.stack);
        }
        console.log("Connection Success");
    });

    // Queries Will be executed
    // 

    connection.end(() => {
        console.log("Connection Closed");
    });

}, false);