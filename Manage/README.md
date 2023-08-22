# "Manage" Application Directory

<br>

**Dependencies:**

* Electron v25.2.0
   * [installation](https://releases.electronjs.org/release/v25.2.0)
   * [documentation](https://www.electronjs.org/docs/latest/)
* Node.js v18.16.1
   * [documentation](https://nodejs.org/dist/latest-v18.x/docs/api/documentation.html)
* Tailwind CSS v3.3.2
   * [documentation](https://tailwindcss.com/docs/installation)

<br>

## How to Setup

Install Electron and Tailwind CSS using npm inside the ```Manage/``` directory.

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

## Directory and File Structure

The structure is bound to change depending on the state of the development.

```
Manage/
   public/
      style/
         *.css
   *.html
   src/
   main.js
```

```Manage/``` is the root folder, all code inside this folder is for the "Manage" application
only. This directory is intended for framework configurations.

```Manage/public/``` directory is for all of the html files.

```Manage/public/styles/``` directory is for all of the css files needed for the html
files.

```Manage/src/``` currently this is for the Tailwind CSS.

```main.js``` file is for Electron.js. This file is intended for all Electron scripts.

<br>

## MySql Database Setup
> NOTE: this is subject to change. Prepare for change/s or improvements.

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

<<<<<<< HEAD
<<<<<<< HEAD
CREATE TABLE `menu_item` (
   `item_id` int NOT NULL AUTO_INCREMENT,
   `item_name` varchar(255) NOT NULL,
   `item_desc` varchar(255) NOT NULL,
   `item_image` blob,
   `item_price` double NOT NULL DEFAULT '0',
   `quantity_sold` int NOT NULL DEFAULT '0',
   `revenue_generated` double NOT NULL DEFAULT '0',
   PRIMARY KEY (`item_id`)
)

=======
=======
>>>>>>> testing
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
<<<<<<< HEAD
>>>>>>> testing
=======
>>>>>>> testing
```
