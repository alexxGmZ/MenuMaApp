//
// EVENTS
//
document.addEventListener("DOMContentLoaded", function() {
	item_card_row_click();
	load_current_synced_design();
	create_canvas_color_picker();
	canvas_scaler();
});

document.addEventListener("keydown", function(event) {
	if (event.key === "Delete")
		delete_selected_objects();

	// ctrl + c
	if (event.ctrlKey && event.key.toLowerCase() === "c")
		copy_selected_objects();

	// ctrl + x
	if (event.ctrlKey && event.key.toLowerCase() === "x")
		cut_selected_objects();

	// ctrl + v
	if (event.ctrlKey && event.key.toLowerCase() === "v")
		paste_copied_objects();

	// ctrl + s
	if (event.ctrlKey && event.key.toLowerCase() === "s")
		save_canvas_to_json();
});

