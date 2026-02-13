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
	var matrix := []
	
	var row: int = 0
	var col: int = 0
	for part in parts:
		if matrix.get(row) == null:
			matrix.append([])
			matrix[row] = []
		
		matrix[row].append(part)
		col += 1
		
		if col >= _columns:
			col = 0
			row += 1
	
	var width := 0
	var height := 0
	for parts in matrix:
		var row_width := 0
		var row_height := 0
		for part in parts:
			row_width += part.image.get_width()
			row_height = max(row_height, part.image.get_height())
		width = max(width, row_width)
		height += row_height
	
	var image := Image.create_empty(width, height, false, Image.FORMAT_RGBA8)
	var offset_y := 0
	for parts in matrix:
		var offset_x := 0
		var row_height := 0
		for part in parts:
			row_height = max(row_height, part.image.get_height())
			image.blit_rect(
				part.image, 
				Rect2i(0, 0, part.image.get_width(), part.image.get_height()),
				Vector2i(offset_x, offset_y),
			)
			offset_x += part.image.get_width()
		offset_y += row_height
		
	set_image(image)
