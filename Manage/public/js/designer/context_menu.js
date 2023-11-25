function context_menu(display_style) {
	console.log(`called context_menu(${display_style})`)
	const context_menu = document.getElementById('context_menu');

	if (display_style === "hide")
		context_menu.style.display = "none";
	else if (display_style === "show") {
		// display context menu based on the mouse pointer position
		context_menu.style.display = 'block';
		context_menu.style.left = (pointer_x + 80) + 'px';
		context_menu.style.top = (pointer_y + 90) + 'px';

		const selected_objects = canvas.getActiveObjects();
		console.log("selected_objects.length:", selected_objects.length)
		if (selected_objects.length == 0) {
			// hide list elements
			document.getElementById("layer_bring_to_front").style.display = "none";
			document.getElementById("layer_bring_forward").style.display = "none";
			document.getElementById("layer_send_backward").style.display = "none";
			document.getElementById("layer_send_to_back").style.display = "none";
		}
		else {
			// unhide list elements
			document.getElementById("layer_bring_to_front").style.display = "flex";
			document.getElementById("layer_bring_forward").style.display = "flex";
			document.getElementById("layer_send_backward").style.display = "flex";
			document.getElementById("layer_send_to_back").style.display = "flex";
		}

		// show context menu properties if there's only one object selected
		if (selected_objects.length == 1)
			document.getElementById("context_menu_properties").style.display = "flex";
		else
			document.getElementById("context_menu_properties").style.display = "none";
	}
}

function object_properties(display_style) {
	if (!canvas) return;
	console.log(`called object_properties(${display_style})`);
	const properties_element = document.getElementById("object_properties");

	if (display_style === "hide")
		properties_element.style.display = "none";

	else if (display_style === "show") {
		context_menu("hide");

		properties_element.style.display = 'block';
		properties_element.style.left = (pointer_x + 80) + 'px';
		properties_element.style.top = (pointer_y + 90) + 'px';

		const selected_object = canvas.getActiveObjects()[0];
		console.log(selected_object);

		const object_type = selected_object.type;
		const object_group_id = selected_object.group_id;
		const object_id = selected_object.object_id;
		const object_bg_color = selected_object.backgroundColor;

		document.getElementById("object_properties_object_type").innerHTML = object_type;
		document.getElementById("object_properties_group_id").innerHTML = object_group_id;
		document.getElementById("object_properties_object_id").innerHTML = object_id;
		document.getElementById("object_properties_bg_color").innerHTML = object_bg_color;

		if (object_type === "text" || object_type === "i-text") {

		}

		var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
		if (document.getElementById("object_properties_header")) {
			// if present, the header is where you move the DIV from:
			document.getElementById("object_properties_header").onmousedown = dragMouseDown;
		} else {
			// otherwise, move the DIV from anywhere inside the DIV:
			properties_element.onmousedown = dragMouseDown;
		}

		function dragMouseDown(e) {
			e = e || window.event;
			e.preventDefault();
			// get the mouse cursor position at startup:
			pos3 = e.clientX;
			pos4 = e.clientY;
			document.onmouseup = closeDragElement;
			// call a function whenever the cursor moves:
			document.onmousemove = elementDrag;
		}

		function elementDrag(e) {
			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			pos1 = pos3 - e.clientX;
			pos2 = pos4 - e.clientY;
			pos3 = e.clientX;
			pos4 = e.clientY;
			// set the element's new position:
			properties_element.style.top = (properties_element.offsetTop - pos2) + "px";
			properties_element.style.left = (properties_element.offsetLeft - pos1) + "px";
		}

		function closeDragElement() {
			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}
}

function text_object_properties(object) {

}

function img_object_properties(object) {

}

function rect_object_properties(object) {

}

function circ_object_properties(object) {

}

function adjust_object_layer(order) {
	if (!canvas) return
	console.log(`called adjust_object_layer(${order})`);
	context_menu("hide");

	const selected_objects = canvas.getActiveObjects();
	selected_objects.forEach(object => {
		if (order === "bring_to_front") canvas.bringToFront(object);
		if (order === "bring_forward") canvas.bringForward(object);
		if (order === "send_backward") canvas.sendBackwards(object);
		if (order === "send_to_back") canvas.sendToBack(object);
	});
	canvas.requestRenderAll();
}
