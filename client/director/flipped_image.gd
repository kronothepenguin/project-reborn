@tool
class_name FlippedImage
extends Image

@export var base: Image:
	set(value):
		if Engine.is_editor_hint():
			value.convert(Image.FORMAT_RGBA8)
			base = value
			_flip_image()

@export var flip_h: bool = false:
	set(value):
		if Engine.is_editor_hint():
			flip_h = value
			_flip_image()

func _flip_image():
	if not base:
		return
	
	copy_from(base)
	if flip_h:
		flip_x()
