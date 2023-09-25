document.addEventListener("DOMContentLoaded", function() {
	display_images();
});

// call mysql database module
const mysql = require(__dirname + "/js/modules/mysql.js");
// create database connection
const connection = mysql.connection;
// check database connection
mysql.check_connection();

function upload_img() {
	const imgInput = document.getElementById("dummy_img");
	const statusDiv = document.getElementById("status");

	if (imgInput.files.length > 0) {
		const file = imgInput.files[0];

		// Create a FormData object to send the file to the server
		const formData = new FormData();
		formData.append("image", file);

		// Use Fetch API to send the image data to the server
		fetch("http://localhost:8080/upload-image", {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					statusDiv.innerHTML = "Image uploaded successfully.";
				} else {
					statusDiv.innerHTML = "Error uploading image.";
				}
			})
			.catch((error) => {
				console.error("Error:", error);
				statusDiv.innerHTML = "An error occurred.";
			});
	} else {
		statusDiv.innerHTML = "Please select an image to upload.";
	}
}

function display_images() {
	connection.connect(function(err) {
		if (err) throw err;
		//Select all foods and return the result object:
		connection.query("SELECT * FROM manage_db.practice_table", function(err, result) {
			if (err) throw err;
			console.log(result);

			let placeholder = document.querySelector("#img_table");
			let out = "";

			for (let row of result) {
				let imageSrc = `data:image/jpeg;base64,${row.image.toString('base64')}`;
				out += `
					<tr class="">
						<td class="text-center">${row.image_id}</td>
						<td><img src="${imageSrc}" alt="Foods Image"></td>
					</tr>
				`;
			}
			placeholder.innerHTML = out;
		});
	});
}
