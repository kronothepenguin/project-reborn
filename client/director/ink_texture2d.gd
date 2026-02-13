@tool
class_name InkTexture2D
extends ImageTexture

enum Ink {
	COPY_0, TRANSPARENT_1, REVERSE_2, GHOST_3, NOT_COPY_4, NOT_TRANSPARENT_5, 
	NOT_REVERSE_6, NOT_GHOST_7, MATTE_8, MASK_9, BLEND_32, ADD_PIN_33, ADD_34, 
	SUBTRACT_PIN_35, BACKGROUND_TRANSPARENT_36, LIGHTEST_37, SUBTRACT_38, 
	DARKEST_39, LIGHTEN_40, DARKEN_41
}

var _image: Image
@export var image: Image:
	set(value):
		value.convert(Image.FORMAT_RGBA8)
		_image = value
		_apply()
	get():
		return _image

var _ink: Ink
@export var ink: Ink:
	set(value):
		_ink = value
		_apply()
	get():
		return _ink

var _color_key: Color = Color.WHITE
@export var color_key: Color:
	set(value):
		_color_key = value
		_apply()
	get():
		return _color_key

func _init(image: Image = null, ink: Ink = Ink.COPY_0, color_key: Color = Color.WHITE):
	self._image = image
	self._ink = ink
	self._color_key = color_key
	self._apply()

func _apply():
	if not image:
		set_image(Image.create_empty(1, 1, false, Image.FORMAT_RGBA8))
		return
	
	match ink:
		Ink.MATTE_8:
			_ink8_matte()
		Ink.BACKGROUND_TRANSPARENT_36:
			_ink36_bg_transparent()
		Ink.DARKEN_41:
			_ink41_darken()
	
	set_image(image)

func _ink8_matte() -> void:
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

func _ink36_bg_transparent() -> void:
	var width := image.get_width()
	var height := image.get_height()
	
	for x in range(width):
		for y in range(height):
			var current := Vector2i(x, y)
			if image.get_pixelv(current).is_equal_approx(color_key):
				image.set_pixelv(current, Color(0, 0, 0, 0))

func _ink41_darken() -> void:
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
