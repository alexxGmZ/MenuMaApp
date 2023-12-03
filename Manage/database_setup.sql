CREATE database manage_db;
use manage_db;

CREATE TABLE registered_employees(
   employee_id INT AUTO_INCREMENT,
   name TEXT NOT NULL,
   password_hash BINARY(64) NOT NULL,
   design_priv INT DEFAULT 0,
   inventory_priv INT DEFAULT 0,
   view_reports_priv INT DEFAULT 0,
   manage_employee_priv INT DEFAULT 0,
   manage_devices_priv INT DEFAULT 0,
   PRIMARY KEY(employee_id)
);

-- create a default admin user (OPTIONAL)
-- name: admin
-- password: password
INSERT INTO registered_employees
   (employee_id, name, `password_hash`, design_priv, inventory_priv, view_reports_priv, manage_employee_priv, manage_devices_priv)
VALUES
   (1, "admin", SHA2("password", 256), 1, 1, 1, 1, 1);

CREATE TABLE menu_items(
   item_id INT AUTO_INCREMENT,
   item_name TEXT NOT NULL,
   item_desc TEXT,
   item_image LONGBLOB,
   item_price FLOAT NOT NULL,
   quantity_sold INT DEFAULT 0,
   revenue_generated FLOAT DEFAULT 0,
   item_status INT DEFAULT 1,
   PRIMARY KEY(item_id)
);

CREATE TABLE api_connected_devices(
   ip_address VARCHAR(30) NOT NULL,
   device_name TEXT,
   api_token TEXT NOT NULL,
   mac_address TEXT,
   timestamp_column TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY(ip_address)
);

CREATE TABLE order_queue(
   order_id INT AUTO_INCREMENT,
   queue_number INT NOT NULL,
   customer_name TEXT,
   total_price FLOAT DEFAULT 0,
   transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   kiosk_ip_address VARCHAR(30) NOT NULL,
   PRIMARY KEY(order_id)
);

CREATE TABLE items_ordered(
   items_ordered_id INT AUTO_INCREMENT,
   item_id INT NOT NULL,
   item_name TEXT,
   item_price FLOAT NOT NULL,
   quantity INT DEFAULT 0,
   quantity_times_price FLOAT DEFAULT 0,
   order_id INT NOT NULL,
   queue_number INT NOT NULL,
   PRIMARY KEY(items_ordered_id),
   FOREIGN KEY (item_id) REFERENCES menu_items(item_id),
   FOREIGN KEY (order_id) REFERENCES order_queue(order_id)
);

-- Independent tables
-- For logging or recording purposes
CREATE TABLE order_queue_history(
   order_queue_history_id INT AUTO_INCREMENT,
   order_id INT,
   queue_number INT,
   transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   customer_name TEXT,
   total_price FLOAT DEFAULT 0,
   kiosk_ip_address VARCHAR(30) NOT NULL,
   order_status TEXT,
   PRIMARY KEY(order_queue_history_id)
);

CREATE TABLE order_stats(
   transaction_date DATE,
   total_orders_taken INT DEFAULT 0,
   total_orders_done INT DEFAULT 0,
   total_orders_canceled INT DEFAULT 0,
   total_earnings float DEFAULT 0,
   PRIMARY KEY(transaction_date)
);

CREATE TABLE items_ordered_history(
   items_ordered_history_id INT AUTO_INCREMENT,
   items_ordered_id INT,
   order_id INT NOT NULL,
   item_id INT NOT NULL,
   item_name TEXT,
   item_price FLOAT NOT NULL,
   quantity INT DEFAULT 0,
   quantity_times_price FLOAT DEFAULT 0,
   queue_number INT DEFAULT NULL,
   PRIMARY KEY(items_ordered_history_id)
);
