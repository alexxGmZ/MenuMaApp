function dialog_open(element_id) {
	console.log(`called dialog_open(${element_id})`);
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.classList.add("active-dialog");
	fav_dialog.classList.remove("hidden");
	fav_dialog.showModal();
}

function dialog_close(element_id) {
	console.log(`called dialog_close(${element_id})`);
	const fav_dialog = document.getElementById(element_id);
	fav_dialog.classList.remove("active-dialog");
	fav_dialog.classList.add("hidden");
	fav_dialog.close();
}

module.exports = {
	dialog_open,
	dialog_close
}
