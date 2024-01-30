# Server

The **Manage** application server is written using Node.js and Express.js. It handles the
connection between the **Manage** and **Order** application. The server runs in the
Port **8080**, it can be changed in the [server.js](../../Manage/server.js) via the PORT
variable if there is a PORT allotment conflict.

The server also handles the queue number of each order received.

<br>

# API endpoints.

**GET**
* [/menu_design](#menudesign)
* [/menu_items](#menuitems)
* [/menu_items_lite](#menuitemslite)
* [/orders](#orders)
* [/order_history](#orderhistory)
* [/order_stats](#orderstats)
* [/registered_employees](#registeredemployees)
* [/status](#status)

**POST**
* [/upload_item](#uploaditem)
* [/update_item](#updateitem)
* [/send_order](#sendorder)

<br>

# GET

<br>

**NOTE:** GET endpoints that requires a token can be accessed like this.
```bash
<serverIP>:8080/<endpoint>?api_token=<token>

# example using curl
curl "192.168.1.1:8080/menu_design?api_token=1688dfea"
```

<br>

## /menu_design
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

## /menu_items
The **menu_items** endpoints sends the data inside the menu_items table of the sql database.
```json
[
   {
      "item_id": 1,
      "item_name": "bulalo",
      "item_desc": "",
      "item_image": null,
      "item_price": 10,
      "quantity_sold": 21,
      "revenue_generated": 210,
      "item_status": 1
   },
   {
      "item_id": 2,
      "item_name": "kare kare",
      "item_desc": "",
      "item_image": null,
      "item_price": 12,
      "quantity_sold": 11,
      "revenue_generated": 132,
      "item_status": 1
   }
]
```

> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## /menu_items_lite
The **menu_items_lite** endpoint sends only a few selected columns of the menu_items
database table.
```json
[
   {
      "item_id": 1,
      "item_name": "bulalo",
      "item_price": 10
   },
   {
      "item_id": 2,
      "item_name": "kare kare",
      "item_price": 12
   }
]
```
> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## /orders
The **orders** endpoint sends a joined data of the **order_queue** and **items_ordered**
of the sql database table.

<br>

## /order_history
The **order_history** endpoint sends a joined data of the **order_queue_history** and
**items_ordered_history** of the sql database table.

> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## /order_stats
The **order_stats** endpoint sends the data of the **order_stats** table of the sql
database.

> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## /registered_employees
The **registered_employees** endpoint sends the data of the **registered_employees** table
of the sql database.
```json
[
   {
      "employee_id": 1,
      "name": "admin",
      "password_hash": {
         // password hash
      },
      "design_priv": 1,
      "inventory_priv": 1,
      "view_reports_priv": 1,
      "manage_employee_priv": 1,
      "manage_devices_priv": 1
   }
]
```

> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

## /status

This endpoint can be used to check the connection for the Manage Application.

> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.

<br>

# POST

<br>

## /upload_item
The **upload_item** endpoint inserts an item information to the menu_items table of the
database. This endpoint is used in the Inventory page of the Manage application. It
utilizes Multer to insert an image binary in the menu_items table as a blob object.

<br>

## /update_item
The **update_item** endpoint handles the insertion of the updated item information of a
menu item. It also utilizes Multer same as the upload_item endpoint for image binary
insertion as a blob object.

<br>

## /send_order
The **send_order** endpoint handles the insertion of the data received from the Order
application to the **order_queue** and **items_ordered** table of the sql database. A
successful order data received from the Order application returns a response which contains
the queue number for the next order that will be taken.

> NOTE: Any device that request a connection for this endpoint requires a device token
which will be registered inside the Manage application.
