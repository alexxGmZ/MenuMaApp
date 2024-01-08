# Server

The **Manage** application server is written using Node.js and Express.js. It handles the
connection between the **Manage** and **Order** application. The server is runs in the
Port **8080**, it can be changed in the [server.js](../../Manage/server.js) via the PORT
variable if there is a conflict.

<br>

# API endpoints.

**GET**
* [/menu_design](#menudesign)
* [/menu_items](#menuitems)
* [/menu_items_lite](#menuitemslite)
* [/orders](#orders)
* [/registered_employees](#registeredemployees)
* [/status]()

**POST**
* [/upload_item](#uploaditem)
* [/update_item](#updateitem)
* [/send_order](#sendorder)

<br>

## menu_design
The **menu_design** endpoint sends the contents of the temporary file [**current_design.json**](../../Manage/current_design.json)
which contains the canvas objects such as shapes, texts, or images and the canvas resolution
that was designed and synced by the Designer Page of the Manage application.
```json
{
   "canvas_objects": {
      "version": "5.3.0",
         "objects": [
            // canvas objects
         ],
         "background": "rgb(255, 173, 211)"
   },
      "canvas_height": "720",
      "canvas_width": "1440"
}
```
> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## menu_items
The **menu_items** endpoints sends the data inside the menu_items table of the sql database.
```sql
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
```
> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## menu_items_lite
The **menu_items_lite** endpoint sends only a few selected columns of the menu_items
database table.
```
item_id
item_name
item_price
```
> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## orders
The **orders** endpoint sends a joined data of the **order_queue** and **items_ordered**
of the sql database table.
```sql
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
```

<br>

## registered_employees
The **registered_employees** endpoint sends the data of the **registered_employees** table
of the sql database.
```sql
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
```
> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## upload_item

<br>

## update_item

<br>

## send_order
