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
    - [dialog.js](#dialogjs)
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

Use the [database_setup.sql](./database_setup.sql) file which contains the SQL script for
initializing the MySql database.

You can use the [dummy data](./dummy_data.sql) to as an initial data to fill up the
database.

<br>

## Custom Modules

The custom modules are located inside the [```./public/js/modules/```](./public/js/modules/)
directory.

<br>

### mysql.js

The [mysql.js](./public/js/modules/mysql.js) custom module uses the
[```mysql2```](https://www.npmjs.com/package/mysql2) package.

**How to utilize:**

Create the environment variables **DEV_MYSQL_USER** and **DEV_MYSQL_PASSWORD**, assign a value of
the mysql user and password that you will utilize in development.


```javascript
// mysql.js

const connection = mysql.createConnection({
   host: "localhost",
   user: process.env.DEV_MYSQL_USER,
   password: process.env.DEV_MYSQL_PASSWORD,
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

### dialog.js

The [dialog.js](./public/js/modules/dialog.js) opens and closes html dialogs using their
corresponding element id that are inside the current html page.

**Arguments:**

* element_id (string)

**How to use:**

Create a dialog element.

```html
<!-- file.html -->
<dialog id="dialog_id">
   <h1>This is a dialog</h1>
</dialog>
<script src="file.js"></script
```

```javascript
// file.js

// call the module
const dialog = require(__dirname + "/js/modules/dialog.js");

// opens the dialog
const dialog_open = dialog.dialog_open;
dialog_open("dialog_id");

// closes the dialog
const dialog_close = dialog.dialog_close;
dialog_close("dialog_id");
```
<br>

### disable_next_previous_key.js

The [disable_next_previous_key.js](./public/js/modules/disable_next_previous_key.js) disables
the thumb buttons of the mouse.

**How to use:**

Just call the script in the html body.

```html
<body>
   <h1>Hello World</h1>
   <script src="./js/modules/disable_next_previous_key.js"></script>
</body
```
