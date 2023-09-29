// mysql module
// const mysql = require(__dirname + "/js/modules/mysql.js");
const mysql = require("./public/js/modules/mysql.js");
// check database connection
mysql.check_connection();
// call connection variable
const connection = mysql.connection;

// express
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;

// multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.static("public"));

// for adding inventory items to database
app.post("/upload_item_image", upload.single("foodimg"), (req, res) => {
	if (!req.file) {
		return res.json({ success: false });
	}

	const { fooditem, fooddesc, foodprice } = req.body;
	const body = JSON.stringify(req.body, null, 2);
	console.log(body);
	console.log(req.file.buffer);

	// Insert the image into the database
	connection.query("INSERT INTO manage_db.menu_items (item_name, item_desc, item_image, item_price) VALUES (?, ?, ?, ?)",
		[fooditem, fooddesc, req.file.buffer, foodprice], (err) => {
			if (err) {
				console.error("Error inserting data into MySQL:", err);
				return res.json({ success: false });
			}
			// return res.json({ success: true });
		}
	);
});

// practice shit
app.get("/shitty-images",
	(request, response) => {
		const query = "SELECT * from manage_db.practice_table";
		connection.query(query, function(err, result) {
			if (err) {
				console.error(err);
				return response.status(500).json({ error: "Internal Server Error" });
			}

			if (result.length === 0) {
				return response.status(404).json({ error: "No images found" });
			}

			// Create an array to store image data URLs
			const imageDataUrls = [];

			// Loop through the result set and convert each image to a data URL
			for (const row of result) {
				const imageDataUrl = `data:image/jpeg;base64,${row.image.toString("base64")}`;
				imageDataUrls.push(imageDataUrl);
			}

			// Send the array of image data URLs as a JSON response
			response.status(200).json({ images: imageDataUrls });
			request_message_format("GET", "shitty-images", request.ip);
		});
	}
);

// format get request message
function request_message_format(request_protocol, api_endpoint, ip_requested) {
	const currentDate = new Date();
	const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()} ${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
	return console.log(`${request_protocol} request for ${api_endpoint} from ${ip_requested} ${formattedDate}`);
}

// for the Order application to display menu items
app.get("/menu_items",
	// request (incoming data)
	// response (outgoing data)
	(request, response) => {
		const query = "SELECT * from manage_db.menu_items";
		connection.query(query, function(err, result) {
			if (err) throw err;

			request_message_format("GET", "menu_items", request.ip);

			result = JSON.stringify(result, null, 2);
			response.status(200).send(result);
		})
	}
);

app.get("/registered_employees",
	// request (incoming data)
	// response (outgoing data)
	(request, response) => {
		const query = "SELECT * from manage_db.registered_employees";
		connection.query(query, function(err, result) {
			if (err) throw err;

			request_message_format("GET", "registered_employees", request.ip);
			response.status(200).send(result);
		})
	}
);

// to be displayed in the order-qeue.html
app.get("/orders",
	(request, response) => {
		const orderQueueQuery = "SELECT * FROM manage_db.order_queue";
		const itemsOrderedQuery = "SELECT * FROM manage_db.items_ordered";

		// Execute the order_queue query
		connection.query(orderQueueQuery, function(err, orderQueueResult) {
			if (err) throw err;

			// Execute the items_ordered query
			connection.query(itemsOrderedQuery, function(err, itemsOrderedResult) {
				if (err) throw err;

				request_message_format("GET", "orders", request.ip);

				// Organize the data into the desired nested structure
				const nestedData = orderQueueResult.map(order => {
					// Find items_ordered entries with matching order_id
					const matchedItems = itemsOrderedResult.filter(item => item.order_id === order.order_id);

					// Create a new object with the order_queue data and nested items_ordered
					return {
						...order,
						items_ordered: matchedItems
					};
				});

				// Format the result as JSON with 2 spaces indentation
				const result = JSON.stringify(nestedData, null, 2);
				response.status(200).send(result);
			});
		});
	}
);

app.listen(
	PORT,
	() => console.log(`API Port:${PORT}`)
)
