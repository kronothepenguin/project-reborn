@tool
class_name ComposeAtlasTexture
extends ImageTexture

var _parts: Array[ComposeAtlasImagePart] = []
@export var parts: Array[ComposeAtlasImagePart]:
	set(value):
		_parts = value
		_compose()
	get():
		return _parts

var _columns: int = 3
@export var columns: int:
	set(value):
		_columns = value
		_compose()
	get():
		return _columns

func _compose():
	var width := 0
	var height := 0
	
	var matrix := []
	
	var row: int = 0
	var col: int = 0
	for part in parts:
		col += 1
		if col >= _columns:
			row += 1
			col = 0
	
	for part in parts:
		var image := part.image
		# TODO: flip
		image.convert(Image.FORMAT_RGBA8)
		
		if row == 0:
			width += image.get_width()
			height = max(height, image.get_height())
		else:
			width = max(width, )
		
		col += 1
		if col >= _columns:
			row += 1
			col = 0
	
	var image := Image.create_empty(width, height, false, Image.FORMAT_RGBA8)
	var offset_x := 0
	for part in parts:
		image.blit_rect(
			part.image, 
			Rect2i(0, 0, part.image.get_width(), part.image.get_height()),
			Vector2i(offset_x, 0),
		)
		offset_x += part.image.get_width()
		
	set_image(image)
