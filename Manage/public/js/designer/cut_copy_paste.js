//NOTE:
// "canvas" is located in designer.js

let _clipboard = null;
function copy_selected_objects() {
	if (!canvas) return;
	console.log("called copy_selected_objects()");

	canvas.getActiveObject().clone(function(cloned) {
		_clipboard = cloned;
		// Log the copied object or objects
		if (cloned.type === 'activeSelection') {
			// Iterate through each object in the active selection
			cloned.forEachObject(function(obj) {
				console.log(`Copied object - Type: ${obj.type}, Object ID: ${obj.object_id}`);
			});
		}
		else {
			// Log the single copied object
			console.log(`Copied object - Type: ${cloned.type}, Object ID: ${cloned.object_id}`);
		}
	});
}

function cut_selected_objects() {
	if (!canvas) return;
	console.log("called cut_selected_objects()");
	canvas.getActiveObject().clone(function(cloned) {
		_clipboard = cloned;
		if (cloned.type === 'activeSelection') {
			// Iterate through each object in the active selection
			cloned.forEachObject(function(obj) {
				console.log(`Cutted object - Type: ${obj.type}, Object ID: ${obj.object_id}`);
			});
		}
		else {
			// Log the single cutted object
			console.log(`Cutted object - Type: ${cloned.type}, Object ID: ${cloned.object_id}`);
		}

		// remove active objects
		const selected_objects = canvas.getActiveObjects();
		selected_objects.forEach(obj => {
			canvas.remove(obj);
		});
		canvas.discardActiveObject();
		canvas.requestRenderAll();
	});
}

function paste_copied_objects() {
	if (!canvas) return;
	console.log("called paste_copied_objects()");

	// clone again, so you can do multiple copies.
	_clipboard.clone(function(clonedObj) {
		canvas.discardActiveObject();
		clonedObj.set({
			left: clonedObj.left + 10,
			top: clonedObj.top + 10,
			evented: true,
		});
		if (clonedObj.type === 'activeSelection') {
			// active selection needs a reference to the canvas.
			clonedObj.canvas = canvas;
			clonedObj.forEachObject(function(obj) {
				canvas.add(obj);
				console.log(`Pasted object - Type: ${obj.type}, Object ID: ${obj.object_id}`);
			});
			// this should solve the unselectability
			clonedObj.setCoords();
		}
		else {
			canvas.add(clonedObj);
			console.log(`Pasted object - Type: ${clonedObj.type}, Object ID: ${clonedObj.object_id}`);
		}
		_clipboard.top += 10;
		_clipboard.left += 10;
		canvas.setActiveObject(clonedObj);
		canvas.requestRenderAll();
	});
}

