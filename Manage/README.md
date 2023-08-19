# MenuMaApp: Manage Directory

<br>

**Dependencies:**

* Electron v25.2.0
   * [installation](https://releases.electronjs.org/release/v25.2.0)
   * [documentation](https://www.electronjs.org/docs/latest/)
* Node.js v18.16.1
   * [documentation](https://nodejs.org/dist/latest-v18.x/docs/api/documentation.html)
* Tailwind CSS v3.3.2
   * [documentation](https://tailwindcss.com/docs/installation)
* Mysql v8

<br>

<!--toc:start-->
## Table of Contents:
- [MenuMaApp: Manage Directory](#menumaapp-manage-directory)
  - [Directory and File Structure](#directory-and-file-structure)
  - [Environment Setup](#environment-setup)
    - [Packages or Dependencies Installation](#packages-or-dependencies-installation)
    - [MySql Database Setup](#mysql-database-setup)
  - [Custom Modules](#custom-modules)
    - [mysql.js](#mysqljs)
<!--toc:end-->

<br>

## Directory and File Structure

The structure is bound to change depending on the state of the development.

```
Manage/
   public/
      js/
         modules/
            *.js
         *.js
      style/
         *.css
   *.html
   src/
   main.js
```

```Manage/``` is the root folder, all code inside this folder is for the "Manage" application
only. This directory is intended for framework configurations.

```Manage/public/``` directory is for all of the html files.

```Manage/public/js``` directory is for all of the javascript files.

```Manage/public/js/modules``` directory is for all of the reusable javascript files.

```Manage/public/styles/``` directory is for all of the css files needed for the html
files.

```Manage/src/``` currently this is for the Tailwind CSS.

```main.js``` file is for Electron.js. This file is intended for all Electron scripts or
configs.

<br>

## Environment Setup

### Packages or Dependencies Installation

Install Electron and Tailwind CSS using npm inside the ```Manage/``` directory. Or just
run ```npm install``` since the [```package.json```](./package.json) is already established.
```bash
npm install
```

To make sure that all the required dependencies are installed, type
```bash
npm list
```

This should output Electron and Tailwind CSS like this

```bash
freezmenu-manage@1.0.0
├── electron@25.2.0
└── tailwindcss@3.3.2
```

That's it, just read the documentation links provided at the top for these tools.

<br>

### MySql Database Setup
Install MySql version 8.

> NOTE: this database setup query is subject to change. Prepare for change/s or improvements.

```sql
CREATE database manage_db;
use manage_db

CREATE TABLE registered_employees(
   employee_id INT AUTO_INCREMENT,
   name TEXT NOT NULL,
   password TEXT NOT NULL,
   design_priv INT NOT NULL,
   inventory_priv INT NOT NULL,
   view_reports_priv INT NOT NULL,
   PRIMARY KEY(employee_id)
);

-- create a default admin user (OPTIONAL)
-- name: admin
-- password: password
INSERT INTO registered_employees
   (employee_id, name, `password`, design_priv, inventory_priv, view_reports_priv)
VALUES
   (1, "admin", SHA2("password", 256), 1, 1, 1);

CREATE TABLE menu_items(
   item_id INT AUTO_INCREMENT,
   item_name TEXT NOT NULL,
   item_desc TEXT,
   item_image TEXT,
   item_price FLOAT NOT NULL,
   quantity_sold INT DEFAULT 0,
   revenue_generated FLOAT DEFAULT 0,
   PRIMARY KEY(item_id)
);

CREATE TABLE api_connected_devices(
   ip_address VARCHAR(30) NOT NULL,
   device_name TEXT not NULL,
   api_token TEXT NOT NULL,
   mac_address TEXT,
   PRIMARY KEY(ip_address)
);

CREATE TABLE order_queue(
   queue_number INT AUTO_INCREMENT,
   order_id INT NOT NULL,
   employee_id INT,
   customer_name TEXT,
   total_price FLOAT DEFAULT 0,
   transaction_date DATE NOT NULL,
   kiosk_ip_address VARCHAR(30) NOT NULL,
   PRIMARY KEY(queue_number),
   INDEX idx_transaction_date (transaction_date),
   INDEX idx_order_id (order_id),
   FOREIGN KEY (employee_id) REFERENCES registered_employees(employee_id),
   FOREIGN KEY (kiosk_ip_address) REFERENCES api_connected_devices(ip_address)
);

CREATE TABLE order_queue_history(
   order_id INT,
   queue_number INT,
   transaction_date DATE NOT NULL,
   customer_name TEXT,
   total_price FLOAT DEFAULT 0,
   kiosk_ip_address VARCHAR(30) NOT NULL,
   PRIMARY KEY(order_id),
   FOREIGN KEY (order_id) REFERENCES order_queue(order_id)
);

CREATE TABLE order_stats(
   transaction_date DATE,
   total_orders_taken INT DEFAULT 0,
   total_orders_done INT DEFAULT 0,
   total_orders_canceled INT DEFAULT 0,
   total_earnings float DEFAULT 0,
   PRIMARY KEY(transaction_date),
   FOREIGN KEY (transaction_date) REFERENCES order_queue(transaction_date)
);

CREATE TABLE items_ordered(
   items_ordered_id INT AUTO_INCREMENT,
   item_id INT NOT NULL,
   item_name TEXT,
   item_price FLOAT NOT NULL,
   quantity INT DEFAULT 0,
   quantity_times_price FLOAT DEFAULT 0,
   queue_number INT NOT NULL,
   order_id INT NOT NULL,
   PRIMARY KEY(items_ordered_id),
   FOREIGN KEY (item_id) REFERENCES menu_items(item_id),
   FOREIGN KEY (queue_number) REFERENCES order_queue(queue_number)
);

CREATE TABLE items_ordered_history(
   items_ordered_id INT,
   order_id INT NOT NULL,
   item_id INT NOT NULL,
   item_name TEXT,
   item_price FLOAT NOT NULL,
   quantity INT DEFAULT 0,
   quantity_times_price FLOAT DEFAULT 0,
   PRIMARY KEY(items_ordered_id),
   FOREIGN KEY (items_ordered_id) REFERENCES items_ordered(items_ordered_id)
);
```

<br>

## Custom Modules

The custom modules are located inside the [```./public/js/modules/```](./public/js/modules/)
directory.

<br>

### mysql.js

The [mysql.js](./public/js/modules/mysql.js) custom module uses the
[```mysql2```](https://www.npmjs.com/package/mysql2) package.

**How to utilize:**

Make sure to put your database username and password inside the ```connection```
variable of the ```mysql.js``` file.
> WARNING: Don't forget to **remove your username and password** in the ```connection```
variable before committing any changes. **It's for your own safety and it causes a minor
inconvenience for other developers**.

```javascript
// mysql.js

const connection = mysql.createConnection({
	host: "localhost",
	user: "",
	password: "",
	database: "manage_db"
})
```
Since all the JavaScript(*.js) files are inside the [```./public/js/```](./public/js/)
directory. The [mysql.js](./public/js/modules/mysql.js) can be required inside a JavaScript
file.

```javascript
// example_javascript.js

// call mysql module (adjust the module directory based on the current script directory)
const mysql = require(__dirname + "/js/modules/mysql.js");

// check database connection
mysql.check_connection()
```

To execute a MySql query, call the ```connection``` variable of the ```mysql.js``` module.

```javascript
// example_javascript.js

// call mysql module
const mysql = require(__dirname + "/js/modules/mysql.js");

// check database connection
mysql.check_connection();

// create database connection
const connection = mysql.connection;
```

After calling the ```connection``` variable, you can utilize any functions stated in the
[mysql2 package documentation](https://www.npmjs.com/package/mysql2?activeTab=readme).

```javascript
// example_javascript.js

// call mysql module
const mysql = require(__dirname + "/js/modules/mysql.js");

// check database connection
mysql.check_connection();

// create database connection
const connection = mysql.connection;

// simple query
connection.query(
   'SELECT * FROM `table` WHERE `name` = "Page" AND `age` > 45',
   function(err, results, fields) {
      console.log(results); // results contains rows returned by server
      console.log(fields); // fields contains extra meta data about results, if available
   }
);
```

For more information, read the [mysql2 package documentation](https://www.npmjs.com/package/mysql2?activeTab=readme).

<br>
