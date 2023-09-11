console.log("Directory: " + __dirname);

const url = '192.168.254.115:8080/menu_items';

fetch(url)
	.then((response) => {
		response.json();
		response.status;
	})
	.then((data) => {
		console.log(data);
	});
