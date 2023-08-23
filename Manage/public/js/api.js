//
// Mysql
//
// mysql module
const mysql = require(__dirname + "/js/modules/mysql.js");
// check database connection
mysql.check_connection();
// call connection variable
connection = mysql.connection;

function api_menu_items() {
    const query = "SELECT * from manage_db.menu_items";
    connection.query(query, function(err, result) {
        if (err) throw err;

        // menu_items table data
        console.log(result);
    })
}

function api_order_queue() {
    const query = "SELECT * from manage_db.order_queue";
    connection.query(query, function(err, result) {
        if (err) throw err;

        // order_queue table data
        console.log(result);
    })
}

function api_items_ordered() {
    const query = "SELECT * from manage_db.items_ordered";
    connection.query(query, function(err, result) {
        if (err) throw err;

        // items_ordered table data
        console.log(result);
    })
}