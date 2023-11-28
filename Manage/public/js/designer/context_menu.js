// NOTE: undeclared variables are located in designer.js
// canvas

let pointer_x, pointer_y;
function get_selected_objects() {
	if (!canvas) return;
	console.log("called get_selected_objects()");

	canvas.on('mouse:up', function(event) {
		console.log("canvas mouse:up event");
		const selected_objects = canvas.getActiveObjects();
		const { x, y } = canvas.getPointer();
		pointer_x = x;
		pointer_y = y;
		// console.log("mouse position: ", pointer_x, pointer_y);

		// if canvas is clicked
		if (selected_objects.length == 0) {
			// hide context menu when left-clicked in any place of canvas
			if (event.button === 1) context_menu("hide");

			// show context menu when right-clicked in any place of canvas
			if (event.button === 3) context_menu("show");
		}

		// if objects are clieked
		else {
			// log left-clicked objects
			selected_objects.forEach(object => {
				console.log(`Left clicked object - Type: ${object.type}, Object ID: ${object.object_id}`);
			})

			// show context menu on right click
			if (event.button === 3) {
				// log right-clicked objects
				selected_objects.forEach(object => {
					console.log(`Right clicked object - Type: ${object.type}, Object ID: ${object.object_id}`);
				});

				// show context menu on right-clicked objects
				context_menu("show");
			}
		}
	});

	canvas.on("mouse:down", function() {
		console.log("canvas mouse:down event");
		// hide context menu when the mouse is pressed down
		context_menu("hide");
	})
}


function context_menu(display_style) {
	if (!canvas) return;
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
		// console.log("selected_objects.length:", selected_objects.length)

		document.getElementById("layer_bring_to_front").style.display = "none";
		document.getElementById("layer_bring_forward").style.display = "none";
		document.getElementById("layer_send_backward").style.display = "none";
		document.getElementById("layer_send_to_back").style.display = "none";
		document.getElementById("context_menu_properties").style.display = "none";

		if (selected_objects.length > 0) {
			document.getElementById("layer_bring_to_front").style.display = "flex";
			document.getElementById("layer_bring_forward").style.display = "flex";
			document.getElementById("layer_send_backward").style.display = "flex";
			document.getElementById("layer_send_to_back").style.display = "flex";
		}

		// show context menu properties if there's only one object selected
		if (selected_objects.length == 1)
			document.getElementById("context_menu_properties").style.display = "flex";
	}
}

function object_properties(display_style) {
	if (!canvas) return;
	console.log(`called object_properties(${display_style})`);
	const properties_element = document.getElementById("object_properties");
	const selected_object = canvas.getActiveObjects()[0];

	if (display_style === "hide") {
		// remove event listeners when object properties window is hidden or closed
		if (change_text_font_listener)
			document.getElementById("text_font").removeEventListener("input", change_text_font_listener);
		if (change_text_font_size_listener)
			document.getElementById("text_font").removeEventListener("input", change_text_font_size_listener);

		// hide object properties window
		properties_element.style.display = "none";
	}

	else if (display_style === "show") {
		context_menu("hide");

		// render object properties window
		properties_element.style.display = 'block';
		properties_element.style.left = (pointer_x + 80) + 'px';
		properties_element.style.top = (pointer_y + 90) + 'px';
		properties_window_drag_event();

		// console.log(selected_object);

		const object_type = selected_object.type;
		const object_group_id = selected_object.group_id;
		const object_id = selected_object.object_id;

		document.getElementById("object_properties_object_type").innerHTML = object_type;
		document.getElementById("object_properties_group_id").innerHTML = object_group_id;
		document.getElementById("object_properties_object_id").innerHTML = object_id;

		document.getElementById("object_properties_text").style.display = "none";
		document.getElementById("object_properties_img").style.display = "none";
		document.getElementById("object_properties_rect").style.display = "none";
		document.getElementById("object_properties_circ").style.display = "none";
		document.getElementById("object_properties_line").style.display = "none";

		const object_properties_map = {
			"text": object_properties_text,
			"i-text": object_properties_text,
			"rect": rect_object_properties,
			"circle": circ_object_properties,
			"image": img_object_properties,
			"line": line_object_properties,
		};

		const selected_object_function = object_properties_map[object_type];

		// use appropriate properties element to each individual object type
		if (selected_object_function)
			selected_object_function(selected_object);
	}
	else console.log("Use 'hide' or 'show' as arguments");

}

// text or itext object input event listeners
let change_text_font_listener;
let change_text_font_size_listener;
let change_text_fill_listener;
let text_fill_color_picker;
function object_properties_text(object) {
	console.log(`called object_properties_text(${object})`);
	console.log(object);

	document.getElementById("object_properties_text").style.display = "initial";
	document.getElementById("text_font").value = object.fontFamily;
	document.getElementById("text_font_size").value = object.fontSize;


	if (change_text_font_listener)
		document.getElementById("text_font").removeEventListener("input", change_text_font_listener);
	change_text_font_listener = function() {
		console.log("called change_text_font_listener()")
		object.set({ fontFamily: this.value });
		canvas.renderAll();
	}
	document.getElementById("text_font").addEventListener("input", change_text_font_listener);

	if (change_text_font_size_listener)
		document.getElementById("text_font_size").removeEventListener("input", change_text_font_size_listener);
	change_text_font_size_listener = function() {
		console.log("called change_text_font_size_listener()")
		object.set({ fontSize: this.value })
		canvas.renderAll();
	}
	document.getElementById("text_font_size").addEventListener("input", change_text_font_size_listener);

	var text_fill_rgb_values = object.fill.match(/\d+/g);
	// console.log(text_fill_rgb_values);
	document.getElementById("text_fill_color_r").value = text_fill_rgb_values[0]
	document.getElementById("text_fill_color_g").value = text_fill_rgb_values[1]
	document.getElementById("text_fill_color_b").value = text_fill_rgb_values[2]

	// to prevent stacking up of color picker every time object properties is open
	if (text_fill_color_picker) {
		document.getElementById("text_fill_color_picker").innerHTML = "";
	}

	text_fill_color_picker = new iro.ColorPicker("#text_fill_color_picker", {
		// Set the size of the color picker
		width: 200,
		// set initial color to object's original fill
		color: object.fill,
		layoutDirection: "horizontal",
		borderWidth: 1,
		borderColor: "#000000"
	});

	let red, green, blue;

	text_fill_color_picker.on('color:change', function(color) {
		red = color.rgb.r;
		green = color.rgb.g;
		blue = color.rgb.b;
		document.getElementById("text_fill_color_r").value = red;
		document.getElementById("text_fill_color_g").value = green;
		document.getElementById("text_fill_color_b").value = blue;
	})

	function update_color_picker() {
		var new_color = `rgb(${red}, ${green}, ${blue})`
		text_fill_color_picker.color.set(new_color);
	}

	document.getElementById("text_fill_color_r").addEventListener("input", function() {
		red = this.value;
		update_color_picker();
	})
	document.getElementById("text_fill_color_g").addEventListener("input", function() {
		green = this.value;
		update_color_picker();
	})
	document.getElementById("text_fill_color_b").addEventListener("input", function() {
		blue = this.value;
		update_color_picker();
	})

	if (change_text_fill_listener)
		document.getElementById("text_fill_change").removeEventListener("click", change_text_fill_listener);
	change_text_fill_listener = function() {
		console.log("called change_text_fill_listener()");
		object.set({ fill: `rgb(${red}, ${green}, ${blue})` })
		canvas.renderAll();
	}
	document.getElementById("text_fill_change").addEventListener("click", change_text_fill_listener);
}

function img_object_properties(object) {
	console.log(`called img_object_properties()`);
	document.getElementById("object_properties_img").style.display = "flex";

}

function rect_object_properties(object) {
	console.log(`called rect_object_properties()`);
	document.getElementById("object_properties_rect").style.display = "flex";

}

function circ_object_properties(object) {
	console.log(`called circ_object_properties()`);
	document.getElementById("object_properties_circ").style.display = "flex";

}

function line_object_properties(object) {
	console.log(`called line_object_properties()`);
	document.getElementById("object_properties_line").style.display = "flex";

}

function canvas_properties() {

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

function properties_window_drag_event() {
	console.log("called properties_window_drag_event()");
	const properties_element = document.getElementById("object_properties");
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

function supported_font_checker() {
	const fontCheck = new Set([
		// Windows 10
		'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
		// macOS
		'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
	].sort());

	(async () => {
		await document.fonts.ready;

		const fontAvailable = new Set();

		for (const font of fontCheck.values()) {
			if (document.fonts.check(`12px "${font}"`)) {
				fontAvailable.add(font);
			}
		}

		console.log('Available Fonts:', [...fontAvailable.values()]);
	})();
}
