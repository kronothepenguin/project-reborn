@tool
extends Sprite2D

@export_tool_button("Execute") var ink_action = _ink_darken

@export var background: Color;

func _ink_darken() -> void:
	if not texture:
		push_warning("Not texture loaded")
		return
	
	var image := texture.get_image()
	image.convert(Image.FORMAT_RGBA8)
	
	var width := image.get_width()
	var height := image.get_height()
	
	for x in range(width):
		for y in range(height):
			var current := Vector2i(x, y)
			if image.get_pixelv(current).is_equal_approx(background):
				image.set_pixelv(current, Color(0, 0, 0, 0))
	
	texture = ImageTexture.create_from_image(image)
