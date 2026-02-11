@tool
extends Image

enum Ink {
	COPY_0, TRANSPARENT_1, REVERSE_2, GHOST_3, NOT_COPY_4, NOT_TRANSPARENT_5, 
	NOT_REVERSE_6, NOT_GHOST_7, MATTE_8, MASK_9, BLEND_32, ADD_PIN_33, ADD_34, 
	SUBTRACT_PIN_35, BACKGROUND_TRANSPARENT_36, LIGHTEST_37, SUBTRACT_38, 
	DARKEST_39, LIGHTEN_40, DARKEN_41
}

@export var texture: Texture2D:
	set(value):
		if texture == value:
			return
		texture = value
		_apply()

@export var ink: Ink:
	set(value):
		if ink == value:
			return
		ink = value
		_apply()

@export var background: Color:
	set(value):
		if background == value:
			return
		background = value
		_apply()

func _init() -> void:
	self.fill(Color.BLACK)

#print(get_script().get_script_property_list())
#func _get_property_list() -> Array[Dictionary]:
	#var props: Array[Dictionary] = [{
		#"name": "texture",
		#"type": TYPE_OBJECT
	#}]
	#
	#return props

func _apply() -> void:
	if not texture:
		return
	
	var image := texture.get_image()
	if not image:
		return
	
	match ink:
		Ink.MATTE_8:
			_ink8_matte(image)
		Ink.BACKGROUND_TRANSPARENT_36:
			_ink36_bg_transparent(image)
		Ink.DARKEN_41:
			_ink41_darken(image)
			
	self.set_data(
		image.get_width(), 
		image.get_height(), 
		image.get_mipmap_count(),
		image.get_format(),
		image.get_data(),
	)

func _ink8_matte(image: Image) -> void:
	image.convert(Image.FORMAT_RGBA8)
	
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
		
		if image.get_pixelv(current).is_equal_approx(background):
			image.set_pixelv(current, Color(0, 0, 0, 0))
			
			stack.push_back(current + Vector2i(1, 0))
			stack.push_back(current + Vector2i(-1, 0))
			stack.push_back(current + Vector2i(0, 1))
			stack.push_back(current + Vector2i(0, -1))

func _ink36_bg_transparent(image: Image) -> void:	
	image.convert(Image.FORMAT_RGBA8)
	
	var width := image.get_width()
	var height := image.get_height()
	
	for x in range(width):
		for y in range(height):
			var current := Vector2i(x, y)
			if image.get_pixelv(current).is_equal_approx(background):
				image.set_pixelv(current, Color(0, 0, 0, 0))

func _ink41_darken(image: Image) -> void:	
	image.convert(Image.FORMAT_RGBA8)
	
	var width := image.get_width()
	var height := image.get_height()
	
	for x in range(width):
		for y in range(height):
			var current := Vector2i(x, y)
			if image.get_pixelv(current).is_equal_approx(background):
				image.set_pixelv(current, Color(0, 0, 0, 0))
