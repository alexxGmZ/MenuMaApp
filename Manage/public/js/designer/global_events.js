//
// EVENTS
//
document.addEventListener("DOMContentLoaded", function() {
	load_current_synced_design();
	create_canvas_color_picker();
	canvas_scaler();
	supported_font_checker();
	display_item_cards();
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

