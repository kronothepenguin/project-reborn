class_name Inker

enum Ink {
	COPY_0, TRANSPARENT_1, REVERSE_2, GHOST_3, NOT_COPY_4, NOT_TRANSPARENT_5, 
	NOT_REVERSE_6, NOT_GHOST_7, MATTE_8, MASK_9, BLEND_32, ADD_PIN_33, ADD_34, 
	SUBTRACT_PIN_35, BACKGROUND_TRANSPARENT_36, LIGHTEST_37, SUBTRACT_38, 
	DARKEST_39, LIGHTEN_40, DARKEN_41
}

static func apply_ink(image: Image, ink: Ink, color_key: Color):
	match ink:
		Ink.MATTE_8:
			_apply_ink8_matte(image, color_key)
		Ink.BACKGROUND_TRANSPARENT_36:
			_apply_ink36_bg_transparent(image, color_key)
		Ink.DARKEN_41:
			_apply_ink41_darken(image, color_key)

static func _apply_ink8_matte(image: Image, color_key: Color) -> void:
	var width := image.get_width()
	var height := image.get_height()
	
	var visited := []
	for i in range(width):
		visited.append([])
		for j in range(height):
			visited[i].append(false)
	
	var stack := []
	for x in range(width):
		stack.push_back(Vector2i(x, 0))
		stack.push_back(Vector2i(x, height - 1))
	for y in range(height):
		stack.push_back(Vector2i(0, y))
		stack.push_back(Vector2i(width - 1, y))
	
	while stack.size() > 0:
		var current: Vector2i = stack.pop_back()
		if current.x < 0 or current.x >= width or current.y < 0 or current.y >= height:
			continue
		if visited[current.x][current.y]:
			continue
		
		visited[current.x][current.y] = true
		
		if image.get_pixelv(current).is_equal_approx(color_key):
			image.set_pixelv(current, Color(0, 0, 0, 0))
			
			stack.push_back(current + Vector2i(1, 0))
			stack.push_back(current + Vector2i(-1, 0))
			stack.push_back(current + Vector2i(0, 1))
			stack.push_back(current + Vector2i(0, -1))

static func _apply_ink36_bg_transparent(image: Image, color_key: Color) -> void:
	var width := image.get_width()
	var height := image.get_height()
	
	for x in range(width):
		for y in range(height):
			var current := Vector2i(x, y)
			if image.get_pixelv(current).is_equal_approx(color_key):
				image.set_pixelv(current, Color(0, 0, 0, 0))

static func _apply_ink41_darken(image: Image, color_key: Color) -> void:
	var width := image.get_width()
	var height := image.get_height()
	
	for x in range(width):
		for y in range(height):
			var current := Vector2i(x, y)
			if image.get_pixelv(current).is_equal_approx(color_key):
				pass
				#image.set_pixelv(current, Color(0, 0, 0, 0))
			else:
				image.set_pixelv(current, image.get_pixelv(current).darkened(1))
